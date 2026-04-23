from uuid import UUID
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError
from schemas.event_schema import EventCreate, EventUpdate, EventResponse
from datetime import datetime, timezone


def _row_to_response(row: dict, is_rsvped: bool) -> EventResponse:
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


def _fetch_event_row(event_id: str) -> dict:
    result = (
        supabase.table("events")
        .select("*")
        .eq("id", event_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise NotFoundError("Event not found")
    return result.data[0]


def _is_rsvped(event_id: str, user_id: str) -> bool:
    result = (
        supabase.table("event_rsvps")
        .select("*")
        .eq("event_id", event_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(result.data)


async def create_event(user_id: UUID, data: EventCreate) -> EventResponse:
    result = supabase.table("events").insert({
        **data.model_dump(mode="json"),
        "organizer_id": str(user_id),
    }).execute()

    if not result.data:
        raise NotFoundError("Failed to create event")

    row = result.data[0]
    return _row_to_response(row, is_rsvped=False)


async def get_event(event_id: UUID, requesting_user_id: UUID) -> EventResponse:
    row = _fetch_event_row(str(event_id))
    is_rsvped = _is_rsvped(str(event_id), str(requesting_user_id))
    return _row_to_response(row, is_rsvped)


async def get_events_board(user_id: UUID, offset: int = 0, limit: int = 20) -> list[EventResponse]:
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
    for row in rows:
        is_rsvped = _is_rsvped(row["id"], str(user_id))
        events.append(_row_to_response(row, is_rsvped))
    return events


async def update_event(event_id: UUID, user_id: UUID, data: EventUpdate) -> EventResponse:
    row = _fetch_event_row(str(event_id))

    if row["organizer_id"] != str(user_id):
        raise ForbiddenError("You are not allowed to update this event")

    updates = data.model_dump(exclude_unset=True)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    supabase.table("events").update(updates).eq("id", str(event_id)).execute()

    return await get_event(event_id, user_id)


async def delete_event(event_id: UUID, user_id: UUID) -> None:
    row = _fetch_event_row(str(event_id))

    if row["organizer_id"] != str(user_id):
        raise ForbiddenError("You are not allowed to delete this event")

    supabase.table("events").delete().eq("id", str(event_id)).execute()


async def rsvp_event(event_id: UUID, user_id: UUID) -> None:
    event = _fetch_event_row(str(event_id))

    if _is_rsvped(str(event_id), str(user_id)):
        return

    attendee_count = event.get("attendee_count", 0)
    max_attendees = event.get("max_attendees")
    if max_attendees is not None and attendee_count >= max_attendees:
        raise ForbiddenError("This event is full")

    supabase.table("event_rsvps").insert({
        "event_id": str(event_id),
        "user_id": str(user_id),
    }).execute()

    supabase.table("events").update({
        "attendee_count": attendee_count + 1,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", str(event_id)).execute()


async def unrsvp_event(event_id: UUID, user_id: UUID) -> None:
    event = _fetch_event_row(str(event_id))

    if not _is_rsvped(str(event_id), str(user_id)):
        return

    supabase.table("event_rsvps").delete().eq(
        "event_id", str(event_id)
    ).eq("user_id", str(user_id)).execute()

    attendee_count = max(event.get("attendee_count", 0) - 1, 0)
    supabase.table("events").update({
        "attendee_count": attendee_count,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", str(event_id)).execute()
