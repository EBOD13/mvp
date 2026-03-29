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


class PostUpdate(BaseModel):
    """Input model for editing a post. All fields optional — only send what changed."""
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None


class PostResponse(BaseModel):
    """Output model returned by the API. Includes everything the frontend needs to render a PostCard."""
    id: UUID
    author_id: UUID
    passion_id: Optional[UUID]
    content: str
    media_urls: List[str]
    like_count: int
    comment_count: int
    save_count: int
    is_liked: bool = False      # Did the requesting user like this post?
    is_saved: bool = False      # Did the requesting user save this post?
    created_at: datetime
    updated_at: datetime

    class Config:
        # Lets Pydantic read data from ORM-style objects, not just dicts
        from_attributes = True
