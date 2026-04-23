from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserProfile(BaseModel):
    id: UUID
    username: str
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool
    phriends_count: int = 0
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserSearchResult(BaseModel):
    id: UUID
    username: str
    display_name: str
    avatar_url: Optional[str] = None
