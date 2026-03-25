"""
post_router.py
--------------
API endpoints for posts. This file is intentionally thin:
  - Authenticate the user (via Depends)
  - Pass the request to post_service
  - Return the response

NO business logic here. NO database calls here.
"""

from fastapi import APIRouter, Depends
from uuid import UUID
from schemas.post_schema import PostCreate, PostUpdate, PostResponse
from services import post_service
from lib.auth import get_current_user

# prefix="/posts" means all routes here start with /posts
# tags=["Posts"] groups them together in the Swagger docs at /docs
router = APIRouter(prefix="/posts", tags=["Posts"])


# ── Create ────────────────────────────────────
@router.post("/", response_model=PostResponse)
async def create_post(data: PostCreate, current_user=Depends(get_current_user)):
    """Create a new post. The author is automatically set from the JWT."""
    return await post_service.create_post(current_user.id, data)


# ── Read (Feed) ──────────────────────────────
@router.get("/feed", response_model=list[PostResponse])
async def get_feed(offset: int = 0, limit: int = 20, current_user=Depends(get_current_user)):
    """Get a paginated feed of posts, newest first."""
    return await post_service.get_feed(current_user.id, offset, limit)


# ── Read (Single Post) ──────────────────────
@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: UUID, current_user=Depends(get_current_user)):
    """Get a single post by ID. Includes is_liked and is_saved for the current user."""
    return await post_service.get_post(post_id, current_user.id)


# ── Update ───────────────────────────────────
@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(post_id: UUID, data: PostUpdate, current_user=Depends(get_current_user)):
    """Edit a post. Only the author can do this."""
    return await post_service.update_post(post_id, current_user.id, data)


# ── Delete ───────────────────────────────────
@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: UUID, current_user=Depends(get_current_user)):
    """Delete a post. Only the author can do this. Returns no content (204)."""
    await post_service.delete_post(post_id, current_user.id)


# ── Like / Unlike ────────────────────────────
@router.post("/{post_id}/like", status_code=204)
async def like_post(post_id: UUID, current_user=Depends(get_current_user)):
    """Like a post. Idempotent — liking twice won't crash, but the DB will reject the duplicate."""
    await post_service.like_post(post_id, current_user.id)


@router.delete("/{post_id}/like", status_code=204)
async def unlike_post(post_id: UUID, current_user=Depends(get_current_user)):
    """Remove a like from a post."""
    await post_service.unlike_post(post_id, current_user.id)


# ── Save / Unsave (Bookmarks) ───────────────
@router.post("/{post_id}/save", status_code=204)
async def save_post(post_id: UUID, current_user=Depends(get_current_user)):
    """Bookmark a post for later."""
    await post_service.save_post(post_id, current_user.id)


@router.delete("/{post_id}/save", status_code=204)
async def unsave_post(post_id: UUID, current_user=Depends(get_current_user)):
    """Remove a bookmark."""
    await post_service.unsave_post(post_id, current_user.id)
