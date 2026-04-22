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
from typing import Literal
from uuid import UUID
from schemas.post_schema import PostCreate, PostUpdate, PostResponse, CommentCreate, CommentResponse
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
async def get_feed(
    filter: Literal["phriends", "passions"] = "phriends",
    offset: int = 0,
    limit: int = 20,
    current_user=Depends(get_current_user),
):
    """Get a paginated feed of posts, newest first."""
    return await post_service.get_feed(current_user.id, filter, offset, limit)


# ── Comments (registered before /{post_id} wildcard) ────────────────────────
@router.get("/{post_id}/comments", response_model=list[CommentResponse])
async def get_comments(post_id: UUID, current_user=Depends(get_current_user)):
    return await post_service.get_comments(post_id, current_user.id)


@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: UUID, data: CommentCreate, current_user=Depends(get_current_user)):
    return await post_service.create_comment(post_id, current_user.id, data)


@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
async def delete_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await post_service.delete_comment(comment_id, current_user.id)


@router.post("/{post_id}/comments/{comment_id}/like", status_code=204)
async def like_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await post_service.like_comment(comment_id, current_user.id)


# ── Like / Unlike ────────────────────────────
@router.post("/{post_id}/like", status_code=204)
async def like_post(post_id: UUID, current_user=Depends(get_current_user)):
    await post_service.like_post(post_id, current_user.id)


@router.delete("/{post_id}/like", status_code=204)
async def unlike_post(post_id: UUID, current_user=Depends(get_current_user)):
    await post_service.unlike_post(post_id, current_user.id)


# ── Save / Unsave (Bookmarks) ───────────────
@router.post("/{post_id}/save", status_code=204)
async def save_post(post_id: UUID, current_user=Depends(get_current_user)):
    await post_service.save_post(post_id, current_user.id)


@router.delete("/{post_id}/save", status_code=204)
async def unsave_post(post_id: UUID, current_user=Depends(get_current_user)):
    await post_service.unsave_post(post_id, current_user.id)


# ── Read (Single Post) ──────────────────────
@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: UUID, current_user=Depends(get_current_user)):
    return await post_service.get_post(post_id, current_user.id)


# ── Update ───────────────────────────────────
@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(post_id: UUID, data: PostUpdate, current_user=Depends(get_current_user)):
    return await post_service.update_post(post_id, current_user.id, data)


# ── Delete ───────────────────────────────────
@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: UUID, current_user=Depends(get_current_user)):
    await post_service.delete_post(post_id, current_user.id)
