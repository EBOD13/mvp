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
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError
from schemas.post_schema import PostCreate, PostUpdate, PostResponse


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
        })
        .execute()
    )
    post = row.data[0]
    # New post — nobody has liked or saved it yet
    post["is_liked"] = False
    post["is_saved"] = False
    return PostResponse(**post)


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

    post = row.data[0]

    # Check if this user liked the post
    like_check = (
        supabase.table("post_likes")
        .select("user_id")
        .eq("post_id", str(post_id))
        .eq("user_id", str(requesting_user_id))
        .execute()
    )
    post["is_liked"] = len(like_check.data) > 0

    # Check if this user saved the post
    save_check = (
        supabase.table("post_saves")
        .select("user_id")
        .eq("post_id", str(post_id))
        .eq("user_id", str(requesting_user_id))
        .execute()
    )
    post["is_saved"] = len(save_check.data) > 0

    return PostResponse(**post)


async def get_feed(user_id: UUID, offset: int = 0, limit: int = 20) -> list[PostResponse]:
    """
    Return a paginated list of posts, newest first.
    For now this returns ALL posts (global feed).
    Later we'll add passion-based and phriends-only filtering.
    """
    row = (
        supabase.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    posts = []
    for post in row.data:
        # Check like/save status for each post
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
        post["is_liked"] = len(like_check.data) > 0
        post["is_saved"] = len(save_check.data) > 0
        posts.append(PostResponse(**post))

    return posts


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

    post = row.data[0]
    post["is_liked"] = False
    post["is_saved"] = False
    return PostResponse(**post)


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
    """
    Like a post. Inserts a row into post_likes and bumps the cached like_count.
    If the user already liked it, Supabase will reject the duplicate (PRIMARY KEY).
    """
    supabase.table("post_likes").insert({
        "user_id": str(user_id),
        "post_id": str(post_id),
    }).execute()

    # Increment the cached counter on the posts table
    # This avoids a slow COUNT query every time we load the feed
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
    """Bookmark a post. Same pattern as liking."""
    supabase.table("post_saves").insert({
        "user_id": str(user_id),
        "post_id": str(post_id),
    }).execute()

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
