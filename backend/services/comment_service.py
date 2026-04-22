from uuid import UUID
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError
from schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse

async def create_comment(post_id: UUID, author_id: UUID, data: CommentCreate) -> CommentResponse:
    # Fetch post
    post_row = (
        supabase.table("posts")
        .select("id, comments_enabled")
        .eq("id", str(post_id))
        .execute()
    )
    # Raise NotFoundError if post does not exist
    if not post_row.data:
        raise NotFoundError("Post not found")
    # Check if comments are disabled
    post = post_row.data[0]
    if not post["comments_enabled"]:
        raise ForbiddenError("Comments are disabled for this post")
    # Insert comment row
    row = (
        supabase.table("comments")
        .insert({
            "post_id": str(post_id),
            "author_id": str(author_id),
            "content": data.content,
        }).execute()
    )

    comment = row.data[0]
    comment["is_liked"] = False

    # Increment posts.comment_count
    supabase.rpc("increment_field", {
        "table_name": "posts",
        "field_name": "comment_count",
        "row_id": str(post_id),
    }).execute()

    # Return CommentResponse
    return CommentResponse(**comment)

async def get_comments(post_id: UUID, requesting_user_id: UUID, offset: int = 0, limit: int = 30) -> list[CommentResponse]:
    # Fetch post
    post_row = (
        supabase.table("posts")
        .select("id")
        .eq("id", str(post_id))
        .execute()
    )
    # Raise NotFoundError if post does not exist
    if not post_row.data:
        raise NotFoundError("Post not found")
    # Return comments for post ordered by created_at ASC
    row = (
        supabase.table("comments")
        .select("*")
        .eq("post_id", str(post_id))
        .order("created_at", desc=False)
        .range(offset, offset + limit - 1)
        .execute()
    )
    # Populate is_liked for requesting_user_id
    comments = []
    for comment in row.data:
        like_check = (
            supabase.table("comment_likes")
            .select("user_id")
            .eq("comment_id", comment["id"])
            .eq("user_id", str(requesting_user_id))
            .execute()
        )
        comment["is_liked"] = len(like_check.data) > 0
        comments.append(CommentResponse(**comment))
    # Return the comments
    return comments

async def update_comment(comment_id: UUID, user_id: UUID, data: CommentUpdate) -> CommentResponse:
    # Fetch comment
    existing = (
        supabase.table("comments")
        .select("*")
        .eq("id", str(comment_id))
        .execute()
    )
    # Raise NotFoundError if comment doesn't exist
    if not existing.data:
        raise NotFoundError("Comment not found")
    # Only author can edit — raise ForbiddenError otherwise
    comment = existing.data[0]
    if comment["author_id"] != str(user_id):
        raise ForbiddenError("You can only edit your own comments")
    # update only sent fields
    update_data = data.model_dump(exclude_unset=True)

    row = (
        supabase.table("comments")
        .update(update_data)
        .eq("id", str(comment_id))
        .execute()
    )

    updated = row.data[0]

    like_check = (
        supabase.table("comment_likes")
        .select("user_id")
        .eq("comment_id", str(comment_id))
        .eq("user_id", str(user_id))
        .execute()
    )
    updated["is_liked"] = len(like_check.data) > 0

    return CommentResponse(**updated)

async def delete_comment(comment_id: UUID, user_id: UUID) -> None:
     # Fetch comment
    existing = (
        supabase.table("comments")
        .select("id, post_id, author_id")
        .eq("id", str(comment_id))
        .execute()
    )
    # Raise NotFoundError if comment doesn't exist
    if not existing.data:
        raise NotFoundError("Comment not found")
    
    comment = existing.data[0]

    # Fetch the post to verify whether the current user is the post author
    post_row = (
        supabase.table("posts")
        .select("author_id")
        .eq("id", comment["post_id"])
        .execute()
    )
    # Raise NotFoundError if post doesn't exist
    if not post_row.data:
        raise NotFoundError("Post not found")
    # Author or post author can delete — raise ForbiddenError otherwise
    post_author_id = post_row.data[0]["author_id"]
    if comment["author_id"] != str(user_id) and post_author_id != str(user_id):
        raise ForbiddenError("You are not allowed to delete this comment")
    # Delete comment
    supabase.table("comments").delete().eq("id", str(comment_id)).execute()
    # Decrement posts.comment_count
    supabase.rpc("decrement_field", {
        "table_name": "posts",
        "field_name": "comment_count",
        "row_id": comment["post_id"],
    }).execute()

async def like_comment(comment_id: UUID, user_id: UUID) -> None:
    # Insert into comment_likes
    try:
        supabase.table("comment_likes").insert({
            "comment_id": str(comment_id),
            "user_id": str(user_id),
        }).execute()
    except Exception as e:
        if"23505" in str(e):
            return
        raise e
    #  Increment comment.like_count
    supabase.rpc("increment_field", {
        "table_name": "comments",
        "field_name": "like_count",
        "row_id": str(comment_id),
    }).execute()

async def unlike_comment(comment_id: UUID, user_id: UUID) -> None:
    # Check if like exists
    existing_like = (
        supabase.table("comment_likes")
        .select("comment_id")
        .eq("comment_id", str(comment_id))
        .eq("user_id", str(user_id))
        .execute()
    )
    if not existing_like.data:
        return
    # Delete from comment_likes
    supabase.table("comment_likes").delete().eq("comment_id", str(comment_id)).eq(
        "user_id", str(user_id)).execute()
    # Decrement comment.like_count
    supabase.rpc("decrement_field", {
        "table_name": "comments",
        "field_name": "like_count",
        "row_id": str(comment_id),
    }).execute()