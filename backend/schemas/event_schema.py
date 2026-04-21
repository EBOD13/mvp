from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

# Schema for creating a new event (POST)
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    starts_at: datetime
    ends_at: Optional[datetime] = None
    passion_id: Optional[UUID] = None
    max_attendees: Optional[int] = None

# Schema for updating an existing event (PATCH)
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    max_attendees: Optional[int] = None

# Schema for returning event data to the client
class EventResponse(BaseModel):
    id: UUID
    organizer_id: UUID
    passion_id: Optional[UUID]
    title: str
    description: Optional[str]
    location: Optional[str]
    starts_at: datetime
    ends_at: Optional[datetime]
    attendee_count: int
    max_attendees: Optional[int]
    is_rsvped: bool = False 
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True