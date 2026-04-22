from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class PhriendRequestCreate(BaseModel):
    addressee_id: UUID

class PhriendRequestResponse(BaseModel):
    id: UUID
    requester_id: UUID
    addressee_id: UUID
    status: str   # 'pending' | 'accepted' | 'declined'
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PhriendResponse(BaseModel):
    user_id: UUID
    username: str
    first_name: str
    last_name: str
    pronouns: Optional[str]
    profile_photo_url: Optional[str]