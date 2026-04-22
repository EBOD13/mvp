from fastapi import APIRouter, Depends
from uuid import UUID
from lib.auth import get_current_user
from schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse
from services import comment_service

router = APIRouter(prefix="/posts", tags=["Comments"])

# Post comment
@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(post_id: UUID, data: CommentCreate, current_user=Depends(get_current_user)):
    return await comment_service.create_comment(post_id, current_user.id, data)
# Get comments
@router.get("/{post_id}/comments", response_model=list[CommentResponse])
async def get_comments(post_id: UUID, offset: int = 0, limit: int = 30, current_user=Depends(get_current_user)):
    return await comment_service.get_comments(post_id, current_user.id, offset, limit)
# Update comment
@router.patch("/{post_id}/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(post_id: UUID, comment_id: UUID, data: CommentUpdate, current_user=Depends(get_current_user)):
    return await comment_service.update_comment(comment_id, current_user.id, data)
# Delete comment
@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
async def delete_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await comment_service.delete_comment(comment_id, current_user.id)
# Like comment
@router.post("/{post_id}/comments/{comment_id}/like", status_code=204)
async def like_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await comment_service.like_comment(comment_id, current_user.id)
# Unlike comment
@router.delete("/{post_id}/comments/{comment_id}/like", status_code=204)
async def unlike_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await comment_service.unlike_comment(comment_id, current_user.id)