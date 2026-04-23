from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class MessageCreate(BaseModel):
    """Input model for creating a message (DM or channel)."""
    content: str = Field(..., min_length=1, max_length=2000)
    recipient_id: Optional[UUID] = None  # For DMs
    subchannel_id: Optional[UUID] = None  # For channel messages

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Output model for a message."""
    id: UUID
    sender_id: UUID
    recipient_id: Optional[UUID]
    subchannel_id: Optional[UUID]
    content: str
    image_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    """Summary of a DM conversation for the DM list."""
    other_user_id: UUID
    other_user_username: str
    other_user_avatar: Optional[str]
    last_message: str
    last_message_at: datetime
    unread_count: int

    class Config:
        from_attributes = True