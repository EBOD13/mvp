from fastapi import APIRouter, Depends
from uuid import UUID

from lib.auth import get_current_user
from schemas.comment_schema import CommentCreate, CommentResponse
from services import comment_service


router = APIRouter(prefix='/posts/{post_id}/comments', tags=['Comments'])


@router.get('', response_model=list[CommentResponse])
async def get_comments(post_id: UUID, current_user=Depends(get_current_user)):
    return await comment_service.get_comments(post_id, current_user.id)


@router.post('', response_model=CommentResponse)
async def create_comment(post_id: UUID, data: CommentCreate, current_user=Depends(get_current_user)):
    return await comment_service.create_comment(post_id, current_user.id, data)


@router.delete('/{comment_id}', status_code=204)
async def delete_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await comment_service.delete_comment(post_id, comment_id, current_user.id)


@router.post('/{comment_id}/like', status_code=204)
async def like_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await comment_service.like_comment(post_id, comment_id, current_user.id)


@router.delete('/{comment_id}/like', status_code=204)
async def unlike_comment(post_id: UUID, comment_id: UUID, current_user=Depends(get_current_user)):
    await comment_service.unlike_comment(post_id, comment_id, current_user.id)
