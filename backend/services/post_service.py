"""
post_service.py
---------------
Business logic for posts. Every function here:
  1. Receives typed parameters (no raw HTTP request objects)
  2. Talks to the database via the Supabase client
  3. Returns data or raises custom exceptions
  4. NEVER imports from routers/ or raises HTTPException
"""

from uuid import UUID
from typing import Literal
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError
from schemas.post_schema import PostCreate, PostUpdate, PostResponse, CommentCreate, CommentResponse


async def _hydrate_post(post: dict, user_id: UUID) -> PostResponse:
    author = (
        supabase.table("users")
        .select("display_name, username")
        .eq("id", post["author_id"])
        .single()
        .execute()
    )

    passion_name = None
    if post.get("passion_id"):
        passion = (
            supabase.table("passions")
            .select("name")
            .eq("id", post["passion_id"])
            .single()
            .execute()
        )
        passion_name = passion.data.get("name") if passion.data else None

    like_check = (
        supabase.table("post_likes")
        .select("user_id")
        .eq("post_id", post["id"])
        .eq("user_id", str(user_id))
        .execute()
    )
    save_check = (
        supabase.table("post_saves")
        .select("user_id")
        .eq("post_id", post["id"])
        .eq("user_id", str(user_id))
        .execute()
    )

    post["author_name"] = author.data.get("display_name") if author.data else "Unknown"
    post["author_username"] = f"@{author.data.get('username')}" if author.data else "@unknown"
    post["passion_name"] = passion_name
    post["visibility"] = post.get("visibility") or "public"
    post["comments_enabled"] = post.get("comments_enabled", True)
    post["is_review"] = post.get("is_review", False)
    post["rating"] = post.get("rating")
    post["media_urls"] = post.get("media_urls") or []
    post["is_liked"] = len(like_check.data) > 0
    post["is_saved"] = len(save_check.data) > 0

    return PostResponse(**post)


# ──────────────────────────────────────────────
# CRUD Operations
# ──────────────────────────────────────────────

async def create_post(user_id: UUID, data: PostCreate) -> PostResponse:
    """
    Insert a new post into the database.
    The user_id comes from the JWT (the logged-in user), so we know who the author is.
    """
    row = (
        supabase.table("posts")
        .insert({
            "author_id": str(user_id),
            "content": data.content,
            "passion_id": str(data.passion_id) if data.passion_id else None,
            "media_urls": data.media_urls or [],
            "visibility": data.visibility,
            "comments_enabled": data.comments_enabled,
            "is_review": data.is_review,
            "rating": data.rating if data.is_review else None,
        })
        .execute()
    )
    return await _hydrate_post(row.data[0], user_id)


async def get_post(post_id: UUID, requesting_user_id: UUID) -> PostResponse:
    """
    Fetch a single post by ID.
    Also checks whether the requesting user has liked/saved it,
    so the frontend can show the correct button states.
    """
    row = (
        supabase.table("posts")
        .select("*")
        .eq("id", str(post_id))
        .execute()
    )
    if not row.data:
        raise NotFoundError("Post not found")

    return await _hydrate_post(row.data[0], requesting_user_id)


async def get_feed(
    user_id: UUID,
    filter: Literal["phriends", "passions"] = "phriends",
    offset: int = 0,
    limit: int = 20,
) -> list[PostResponse]:
    """
    Return a paginated list of posts, newest first.
    For now this returns ALL posts (global feed).
    Later we'll add passion-based and phriends-only filtering.
    """
    user_id_str = str(user_id)

    if filter == "passions":
        passions = (
            supabase.table("passion_members")
            .select("passion_id")
            .eq("user_id", user_id_str)
            .execute()
        )
        passion_ids = [row["passion_id"] for row in passions.data]
        if not passion_ids:
            return []

        row = (
            supabase.table("posts")
            .select("*")
            .in_("passion_id", passion_ids)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
    else:
        phriends = (
            supabase.table("phriendships")
            .select("requester_id, addressee_id")
            .eq("status", "accepted")
            .or_(f"requester_id.eq.{user_id_str},addressee_id.eq.{user_id_str}")
            .execute()
        )

        author_ids = {user_id_str}
        for p in phriends.data:
            if p["requester_id"] == user_id_str:
                author_ids.add(p["addressee_id"])
            elif p["addressee_id"] == user_id_str:
                author_ids.add(p["requester_id"])

        row = (
            supabase.table("posts")
            .select("*")
            .in_("author_id", list(author_ids))
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

    visible_posts = [
        post for post in row.data
        if (post.get("visibility") or "public") == "public" or post["author_id"] == user_id_str
    ]

    hydrated: list[PostResponse] = []
    for post in visible_posts:
        hydrated.append(await _hydrate_post(post, user_id))
    return hydrated


async def update_post(post_id: UUID, user_id: UUID, data: PostUpdate) -> PostResponse:
    """
    Update a post. Only the original author is allowed to edit.
    We use `exclude_unset=True` so we only update fields the frontend actually sent.
    """
    # First, verify the post exists and belongs to this user
    existing = (
        supabase.table("posts")
        .select("*")
        .eq("id", str(post_id))
        .execute()
    )
    if not existing.data:
        raise NotFoundError("Post not found")
    if existing.data[0]["author_id"] != str(user_id):
        raise ForbiddenError("You can only edit your own posts")

    # Build the update payload — only include fields that were actually sent
    update_data = data.model_dump(exclude_unset=True)
    update_data["updated_at"] = "now()"  # Refresh the timestamp

    row = (
        supabase.table("posts")
        .update(update_data)
        .eq("id", str(post_id))
        .execute()
    )

    return await _hydrate_post(row.data[0], user_id)


async def delete_post(post_id: UUID, user_id: UUID) -> None:
    """
    Delete a post. Only the original author is allowed to delete.
    Supabase cascading deletes will automatically clean up likes and saves.
    """
    existing = (
        supabase.table("posts")
        .select("author_id")
        .eq("id", str(post_id))
        .execute()
    )
    if not existing.data:
        raise NotFoundError("Post not found")
    if existing.data[0]["author_id"] != str(user_id):
        raise ForbiddenError("You can only delete your own posts")

    supabase.table("posts").delete().eq("id", str(post_id)).execute()


# ──────────────────────────────────────────────
# Like / Unlike
# ──────────────────────────────────────────────

async def like_post(post_id: UUID, user_id: UUID) -> None:
    try:
        supabase.table("post_likes").insert({
            "user_id": str(user_id),
            "post_id": str(post_id),
        }).execute()
    except Exception as e:
        # Code 23505 means duplicate — user already liked this post, just ignore it
        if "23505" in str(e):
            return
        raise e  # Any other error, let it bubble up normally

    supabase.rpc("increment_field", {
        "table_name": "posts",
        "field_name": "like_count",
        "row_id": str(post_id),
    }).execute()

async def unlike_post(post_id: UUID, user_id: UUID) -> None:
    """Remove a like and decrement the cached counter."""
    supabase.table("post_likes").delete().eq(
        "user_id", str(user_id)
    ).eq(
        "post_id", str(post_id)
    ).execute()

    supabase.rpc("decrement_field", {
        "table_name": "posts",
        "field_name": "like_count",
        "row_id": str(post_id),
    }).execute()


# ──────────────────────────────────────────────
# Save / Unsave (Bookmarks)
# ──────────────────────────────────────────────

async def save_post(post_id: UUID, user_id: UUID) -> None:
    try:
        supabase.table("post_saves").insert({
            "user_id": str(user_id),
            "post_id": str(post_id),
        }).execute()
    except Exception as e:
        # Already saved, just ignore it
        if "23505" in str(e):
            return
        raise e

    supabase.rpc("increment_field", {
        "table_name": "posts",
        "field_name": "save_count",
        "row_id": str(post_id),
    }).execute()


async def unsave_post(post_id: UUID, user_id: UUID) -> None:
    """Remove a bookmark and decrement the cached counter."""
    supabase.table("post_saves").delete().eq(
        "user_id", str(user_id)
    ).eq(
        "post_id", str(post_id)
    ).execute()

    supabase.rpc("decrement_field", {
        "table_name": "posts",
        "field_name": "save_count",
        "row_id": str(post_id),
    }).execute()


# ──────────────────────────────────────────────
# Comments
# ──────────────────────────────────────────────

async def _hydrate_comment(comment: dict, user_id: UUID) -> CommentResponse:
    author = (
        supabase.table("users")
        .select("display_name, username")
        .eq("id", comment["author_id"])
        .single()
        .execute()
    )
    like_check = (
        supabase.table("comment_likes")
        .select("user_id")
        .eq("comment_id", comment["id"])
        .eq("user_id", str(user_id))
        .execute()
    )
    comment["author_name"] = author.data.get("display_name", "") if author.data else ""
    comment["author_username"] = f"@{author.data.get('username', '')}" if author.data else ""
    comment["is_liked"] = len(like_check.data) > 0
    return CommentResponse(**comment)


async def get_comments(post_id: UUID, user_id: UUID) -> list[CommentResponse]:
    rows = (
        supabase.table("comments")
        .select("*")
        .eq("post_id", str(post_id))
        .order("created_at", desc=False)
        .execute()
    )
    return [await _hydrate_comment(row, user_id) for row in rows.data]


async def create_comment(post_id: UUID, user_id: UUID, data: CommentCreate) -> CommentResponse:
    row = (
        supabase.table("comments")
        .insert({
            "post_id": str(post_id),
            "author_id": str(user_id),
            "content": data.content,
        })
        .select()
        .execute()
    )
    supabase.rpc("increment_field", {
        "table_name": "posts",
        "field_name": "comment_count",
        "row_id": str(post_id),
    }).execute()
    return await _hydrate_comment(row.data[0], user_id)


async def delete_comment(comment_id: UUID, user_id: UUID) -> None:
    existing = (
        supabase.table("comments")
        .select("author_id, post_id")
        .eq("id", str(comment_id))
        .execute()
    )
    if not existing.data:
        raise NotFoundError("Comment not found")
    if existing.data[0]["author_id"] != str(user_id):
        raise ForbiddenError("You can only delete your own comments")
    post_id = existing.data[0]["post_id"]
    supabase.table("comments").delete().eq("id", str(comment_id)).execute()
    supabase.rpc("decrement_field", {
        "table_name": "posts",
        "field_name": "comment_count",
        "row_id": post_id,
    }).execute()


async def like_comment(comment_id: UUID, user_id: UUID) -> None:
    try:
        supabase.table("comment_likes").insert({
            "user_id": str(user_id),
            "comment_id": str(comment_id),
        }).execute()
    except Exception as e:
        if "23505" in str(e):
            return
        raise
    supabase.rpc("increment_field", {
        "table_name": "comments",
        "field_name": "like_count",
        "row_id": str(comment_id),
    }).execute()
