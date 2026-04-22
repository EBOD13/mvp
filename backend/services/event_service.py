from uuid import UUID
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError
from schemas.event_schema import EventCreate, EventUpdate, EventResponse
from datetime import datetime, timezone

# Create a new event for the authenticated user
async def create_event(user_id: UUID, data: EventCreate) -> EventResponse:
    # Insert the event into the database and attach the organizers user id
    result = supabase.table("events").insert({
        **data.model_dump(mode="json"),
        "organizer_id": str(user_id),
    }).execute()
    
    # Raise error if the insert failed
    if not result.data:
        raise NotFoundError("Failed to create event")
    
    row = result.data[0]

    # Return EventResponse for the created event
    return EventResponse(
        id=row["id"],
        organizer_id=row["organizer_id"],
        passion_id=row.get("passion_id"),
        title=row["title"],
        description=row.get("description"),
        location=row.get("location"),
        starts_at=row["starts_at"],
        ends_at=row.get("ends_at"),
        attendee_count=row.get("attendee_count", 0),
        max_attendees=row.get("max_attendees"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
        is_rsvped=False,
    )

# Get a single event by ID and include RSVP status for the requesting user
async def get_event(event_id: UUID, requesting_user_id: UUID) -> EventResponse:

    # Fetch event from the database
    result = supabase.table("events").select("*").eq("id", str(event_id)).single().execute()

    # Raise NotFoundError if not found
    if not result.data:
        raise NotFoundError("Event not found")
    
    row = result.data
    
    # Check if the user has RSVP'd
    rsvp_result = (
        supabase.table("event_rsvps")
        .select("*")
        .eq("event_id", str(event_id))
        .eq("user_id", str(requesting_user_id))
        .execute()
    )
    is_rsvped = bool(rsvp_result.data)

     # Return EventResponse with event details and RSVP status
    return EventResponse(
        id=row["id"],
        organizer_id=row["organizer_id"],
        passion_id=row.get("passion_id"),
        title=row["title"],
        description=row.get("description"),
        location=row.get("location"),
        starts_at=row["starts_at"],
        ends_at=row.get("ends_at"),
        attendee_count=row.get("attendee_count", 0),
        max_attendees=row.get("max_attendees"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
        is_rsvped=is_rsvped,
    )

# Return list of events
async def get_events_board(user_id: UUID, offset: int = 0, limit: int = 20) -> list[EventResponse]:

    # Only return events that start now or later
    now = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.table("events")
        .select("*")
        .gte("starts_at", now)
        .order("starts_at", desc=False)
        .range(offset, offset + limit - 1)
        .execute()
    )
    rows = result.data or []
    events = []

    # Build list and include RSVP status for each event
    for row in rows:
        rsvp_result = (
            supabase.table("event_rsvps")
            .select("*")
            .eq("event_id", row["id"])
            .eq("user_id", str(user_id))
            .execute()
        )
        is_rsvped = bool(rsvp_result.data)

        events.append(
            EventResponse(
                id=row["id"],
                organizer_id=row["organizer_id"],
                passion_id=row.get("passion_id"),
                title=row["title"],
                description=row.get("description"),
                location=row.get("location"),
                starts_at=row["starts_at"],
                ends_at=row.get("ends_at"),
                attendee_count=row.get("attendee_count", 0),
                max_attendees=row.get("max_attendees"),
                created_at=row.get("created_at"),
                updated_at=row.get("updated_at"),
                is_rsvped=is_rsvped,
            )
        )
    return events

# Update an event (only if the user is the organizer)
async def update_event(event_id: UUID, user_id: UUID, data: EventUpdate) -> EventResponse:
    # Fetch current event data
    existing = (
        supabase.table("events")
        .select("*")
        .eq("id", str(event_id))
        .single()
        .execute()
    )
    # Raise NotFoundError if event doesn't exist
    if not existing.data:
        raise NotFoundError("Event not found")
    
    row = existing.data
    # Only organizer allowed to update
    if row["organizer_id"] != str(user_id):
        raise ForbiddenError("You are not allowed to update this event")
    # Only update provided fields
    updates = data.model_dump(exclude_unset=True)
    updates["updated_at"]=datetime.now(timezone.utc).isoformat()

    result = (
        supabase.table("events")
        .update(updates)
        .eq("id", str(event_id))
        .execute()
    )

    updated_row = result.data[0]
    # Get RSVP status for current user
    rsvp_result = (
        supabase.table("event_rsvps")
        .select("*")
        .eq("event_id", str(event_id))
        .eq("user_id", str(user_id))
        .execute()
    )

    is_rsvped = bool(rsvp_result.data)

    # Return EventResponse with updated event details
    return EventResponse(
                id=updated_row["id"],
                organizer_id=updated_row["organizer_id"],
                passion_id=updated_row.get("passion_id"),
                title=updated_row["title"],
                description=updated_row.get("description"),
                location=updated_row.get("location"),
                starts_at=updated_row["starts_at"],
                ends_at=updated_row.get("ends_at"),
                attendee_count=updated_row.get("attendee_count", 0),
                max_attendees=updated_row.get("max_attendees"),
                created_at=updated_row.get("created_at"),
                updated_at=updated_row.get("updated_at"),
                is_rsvped=is_rsvped,
            )

# Delete an event (only if the user is the organizer)
async def delete_event(event_id: UUID, user_id: UUID) -> None:
    # Fetch event
    result = (
        supabase.table("events")
        .select("*")
        .eq("id", str(event_id))
        .single()
        .execute()
    )
    # Raise NotFoundError if event doesn't exist
    if not result.data:
        raise NotFoundError("Event not found")
    
    row = result.data
    # Only the organizer is allowed to delete event
    if row["organizer_id"] != str(user_id):
        raise ForbiddenError("You are not allowed to delete this event")
    # Delete event
    supabase.table("events").delete().eq("id", str(event_id)).execute()

# RSVP to an event and increase attendee count
async def rsvp_event(event_id: UUID, user_id: UUID) -> None:
    # fetch event
    event_result = (
        supabase.table("events")
        .select("*")
        .eq("id", str(event_id))
        .single()
        .execute()
    )
    # Raise NotFoundError if event doesn't exist
    if not event_result.data:
        raise NotFoundError("Event not found")
    
    event = event_result.data
    # Check if user already RSVP'd
    existing_rsvp = (
        supabase.table("event_rsvps")
        .select("*")
        .eq("event_id", str(event_id))
        .eq("user_id", str(user_id))
        .execute()
    )
    # If already RSVP'd, do nothing
    if existing_rsvp.data:
        return
    
    attendee_count = event.get("attendee_count", 0)
    max_attendees = event.get("max_attendees")
    # Prevent new RSVP's if the number of attendees already hit max capacity
    if max_attendees is not None and attendee_count >= max_attendees:
        raise ForbiddenError("This event is full")
    # Insert RSVP record for user
    supabase.table("event_rsvps").insert({
        "event_id": str(event_id),
        "user_id": str(user_id),
    }).execute()
    # Increase attendee count for event
    supabase.table("events").update({
        "attendee_count": attendee_count + 1,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", str(event_id)).execute()

# Remove users RSVP for an event and decrease attendee count
async def unrsvp_event(event_id: UUID, user_id: UUID) -> None:
    # Fetch event
    event_result = (
        supabase.table("events")
        .select("*")
        .eq("id", str(event_id))
        .single()
        .execute()
    )
    # Raise NotFoundError if event doesn't exist
    if not event_result.data:
        raise NotFoundError("Event not found")
    
    event = event_result.data
    # Check if user is RSVP'd
    existing_rsvp = (
        supabase.table("event_rsvps")
        .select("*")
        .eq("event_id", str(event_id))
        .eq("user_id", str(user_id))
        .execute()
    )
    # If no RSVP exists, do nothing
    if not existing_rsvp.data:
        return
    # Remove the RSVP record for user
    supabase.table("event_rsvps").delete().eq("event_id", str(event_id)).eq("user_id", str(user_id)).execute()
    # Decrease attendee count, but do not let it get below 0
    attendee_count = max(event.get("attendee_count", 0) - 1, 0)
    # Update table
    supabase.table("events").update({
        "attendee_count": attendee_count,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", str(event_id)).execute()