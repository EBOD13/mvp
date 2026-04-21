from fastapi import APIRouter, Depends
from uuid import UUID
from schemas.event_schema import EventCreate, EventUpdate, EventResponse
from services import event_service
from lib.auth import get_current_user

# Router for all event-related endpoints
router = APIRouter(prefix="/events", tags=["Events"])

# Create a new event (requires authenticated user)
@router.post("/", response_model=EventResponse, status_code=201)
async def create_event(data: EventCreate, current_user=Depends(get_current_user)):
    return await event_service.create_event(current_user.id, data)

# Get a list of events
@router.get("/board", response_model=list[EventResponse])
async def get_events_board(offset: int = 0, limit: int = 20, current_user=Depends(get_current_user)):
    return await event_service.get_events_board(current_user.id, offset, limit)

# Get a single event by id, including RSVP status for the current user
@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: UUID, current_user=Depends(get_current_user)):
    return await event_service.get_event(event_id, current_user.id)

# Update an existing event (only allowed for user that created the event)
@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(event_id: UUID, data: EventUpdate, current_user=Depends(get_current_user)):
    return await event_service.update_event(event_id, current_user.id, data)

# Delete an event (only allowed for user that created the event)
@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: UUID, current_user=Depends(get_current_user)):
    await event_service.delete_event(event_id, current_user.id)

# RSVP to an event (adds user to the attendee list)
@router.post("/{event_id}/rsvp", status_code=204)
async def rsvp_event(event_id: UUID, current_user=Depends(get_current_user)):
    await event_service.rsvp_event(event_id, current_user.id)

# Remove RSVP from an event (removes user from the attendee list)
@router.delete("/{event_id}/rsvp", status_code=204)
async def unrsvp_event(event_id: UUID, current_user=Depends(get_current_user)):
    await event_service.unrsvp_event(event_id, current_user.id)