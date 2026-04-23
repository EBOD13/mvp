from uuid import UUID
from typing import List

from lib.supabase_client import supabase
from lib.exceptions import ForbiddenError, NotFoundError
from schemas.message_schema import MessageResponse, ConversationSummary


async def send_dm(sender_id: UUID, recipient_id: UUID, content: str) -> MessageResponse:
    # Check phriend relationship with two queries (avoids .or_() cold-start fragility)
    as_req = supabase.table("phriendships").select("id").eq(
        "status", "accepted"
    ).eq("requester_id", str(sender_id)).eq("addressee_id", str(recipient_id)).execute()

    as_addr = supabase.table("phriendships").select("id").eq(
        "status", "accepted"
    ).eq("requester_id", str(recipient_id)).eq("addressee_id", str(sender_id)).execute()

    if not (as_req.data or as_addr.data):
        raise ForbiddenError("You must be phriends to send direct messages")

    response = supabase.table("messages").insert({
        "sender_id": str(sender_id),
        "recipient_id": str(recipient_id),
        "subchannel_id": None,
        "content": content,
    }).execute()

    if not response.data:
        raise Exception("Failed to send message")

    return MessageResponse(**response.data[0])


async def get_dm_conversation(
    user_id: UUID, other_user_id: UUID, offset: int = 0, limit: int = 50
) -> List[MessageResponse]:
    # Split .or_() into two queries to avoid cold-start failures
    sent = supabase.table("messages").select("*").eq(
        "sender_id", str(user_id)
    ).eq("recipient_id", str(other_user_id)).execute()

    received = supabase.table("messages").select("*").eq(
        "sender_id", str(other_user_id)
    ).eq("recipient_id", str(user_id)).execute()

    all_msgs = sorted(
        (sent.data or []) + (received.data or []),
        key=lambda x: x["created_at"],
    )
    paginated = all_msgs[offset: offset + limit]
    return [MessageResponse(**msg) for msg in paginated]


async def get_dm_list(user_id: UUID) -> List[ConversationSummary]:
    # Fetch recent DMs in both directions (limit to avoid unbounded scans)
    sent = supabase.table("messages").select("*").eq(
        "sender_id", str(user_id)
    ).not_.is_("recipient_id", "null").order("created_at", desc=True).limit(500).execute()

    received = supabase.table("messages").select("*").eq(
        "recipient_id", str(user_id)
    ).order("created_at", desc=True).limit(500).execute()

    all_messages = sorted(
        (sent.data or []) + (received.data or []),
        key=lambda x: x["created_at"],
        reverse=True,
    )

    if not all_messages:
        return []

    # Build conversation map: partner_id → most recent message
    conversations: dict = {}
    for msg in all_messages:
        other = msg["recipient_id"] if msg["sender_id"] == str(user_id) else msg["sender_id"]
        if other not in conversations:
            conversations[other] = msg

    if not conversations:
        return []

    partner_ids = list(conversations.keys())

    # Batch: single query for all partner profiles instead of one per partner
    users_result = supabase.table("users").select("id, username, avatar_url").in_(
        "id", partner_ids
    ).execute()
    users_by_id = {u["id"]: u for u in users_result.data or []}

    # Batch: single query for all unread messages, then group in Python
    unread_result = supabase.table("messages").select("sender_id").in_(
        "sender_id", partner_ids
    ).eq("recipient_id", str(user_id)).eq("is_read", False).execute()

    unread_by_partner: dict[str, int] = {}
    for row in unread_result.data or []:
        pid = row["sender_id"]
        unread_by_partner[pid] = unread_by_partner.get(pid, 0) + 1

    summaries = []
    for other_user_id, last_msg in conversations.items():
        partner = users_by_id.get(other_user_id)
        if not partner:
            continue
        summaries.append(ConversationSummary(
            other_user_id=UUID(other_user_id),
            other_user_username=partner["username"],
            other_user_avatar=partner.get("avatar_url"),
            last_message=last_msg["content"][:50],
            last_message_at=last_msg["created_at"],
            unread_count=unread_by_partner.get(other_user_id, 0),
        ))

    return summaries


def _is_passion_member(passion_id: str, user_id: str) -> bool:
    """True if user is in passion_members OR is the passion owner."""
    member = supabase.table("passion_members").select("user_id").eq(
        "passion_id", passion_id
    ).eq("user_id", user_id).execute()
    if member.data:
        return True
    owner = supabase.table("passions").select("id").eq(
        "id", passion_id
    ).eq("owner_id", user_id).execute()
    return bool(owner.data)


async def send_channel_message(sender_id: UUID, subchannel_id: UUID, content: str) -> MessageResponse:
    subchannel = supabase.table("subchannels").select("passion_id").eq(
        "id", str(subchannel_id)
    ).limit(1).execute()

    if not subchannel.data:
        raise NotFoundError("Subchannel not found")

    passion_id = subchannel.data[0]["passion_id"]

    if not _is_passion_member(passion_id, str(sender_id)):
        raise ForbiddenError("You must be a member of this passion to post in its channels")

    response = supabase.table("messages").insert({
        "sender_id": str(sender_id),
        "recipient_id": None,
        "subchannel_id": str(subchannel_id),
        "content": content,
    }).execute()

    if not response.data:
        raise Exception("Failed to send message")

    row = response.data[0]
    user = supabase.table("users").select("username").eq("id", str(sender_id)).limit(1).execute()
    sender_username = user.data[0]["username"] if user.data else None
    return MessageResponse(**{**row, "sender_username": sender_username})


async def get_channel_messages(
    subchannel_id: UUID, user_id: UUID, offset: int = 0, limit: int = 50
) -> List[MessageResponse]:
    subchannel = supabase.table("subchannels").select("passion_id").eq(
        "id", str(subchannel_id)
    ).limit(1).execute()

    if not subchannel.data:
        raise NotFoundError("Subchannel not found")

    passion_id = subchannel.data[0]["passion_id"]

    if not _is_passion_member(passion_id, str(user_id)):
        raise ForbiddenError("You must be a member of this passion to view its channels")

    response = supabase.table("messages").select("*").eq(
        "subchannel_id", str(subchannel_id)
    ).order("created_at", desc=False).range(offset, offset + limit - 1).execute()

    rows = response.data or []
    if not rows:
        return []

    sender_ids = list({r["sender_id"] for r in rows})
    users = supabase.table("users").select("id, username").in_("id", sender_ids).execute()
    username_by_id = {u["id"]: u["username"] for u in users.data or []}

    return [
        MessageResponse(**{**row, "sender_username": username_by_id.get(row["sender_id"])})
        for row in rows
    ]
