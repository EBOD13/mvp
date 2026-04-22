from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    author_id: UUID
    author_name: str
    author_username: str
    content: str
    like_count: int
    is_liked: bool = False
    created_at: datetime
