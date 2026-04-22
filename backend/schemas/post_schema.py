"""
post_schema.py
--------------
Pydantic models that define the shape of post data going in and out of the API.

- PostCreate:   what the frontend sends when making a new post
- PostUpdate:   what the frontend sends when editing a post (all fields optional)
- PostResponse: what the API sends back (includes computed fields like is_liked)
"""

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class PostCreate(BaseModel):
    """Input model for creating a new post."""
    content: str
    passion_id: Optional[UUID] = None
    media_urls: Optional[List[str]] = []
    visibility: str = "public"
    comments_enabled: bool = True
    is_review: bool = False
    rating: Optional[int] = None


class PostUpdate(BaseModel):
    """Input model for editing a post. All fields optional — only send what changed."""
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    passion_id: Optional[UUID] = None
    visibility: Optional[str] = None
    comments_enabled: Optional[bool] = None
    is_review: Optional[bool] = None
    rating: Optional[int] = None


class PostResponse(BaseModel):
    """Output model returned by the API. Includes everything the frontend needs to render a PostCard."""
    id: UUID
    author_id: UUID
    author_name: str
    author_username: str
    passion_id: Optional[UUID]
    passion_name: Optional[str] = None
    content: str
    media_urls: List[str]
    visibility: str = "public"
    comments_enabled: bool = True
    is_review: bool = False
    rating: Optional[int] = None
    like_count: int
    comment_count: int
    save_count: int
    is_liked: bool = False
    is_saved: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    author_id: UUID
    author_name: str = ""
    author_username: str = ""
    content: str
    like_count: int = 0
    is_liked: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
