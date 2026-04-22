from uuid import UUID
from datetime import datetime
from typing import List

from lib.supabase_client import supabase
from lib.exceptions import ForbiddenError, NotFoundError
from schemas.message_schema import MessageCreate, MessageResponse, ConversationSummary


async def send_dm(sender_id: UUID, recipient_id: UUID, content: str) -> MessageResponse:
    # Check if users are phriends
    phriend_check = supabase.table("phriendships").select("*").eq("status", "accepted").or_(
        f"and(requester_id.eq.{sender_id},addressee_id.eq.{recipient_id}),and(requester_id.eq.{recipient_id},addressee_id.eq.{sender_id})"
    ).execute()

    if not phriend_check.data:
        raise ForbiddenError("You must be phriends to send direct messages")

    message_data = {
        "sender_id": str(sender_id),
        "recipient_id": str(recipient_id),
        "subchannel_id": None,
        "content": content,
    }

    response = supabase.table("messages").insert(message_data).execute()

    if not response.data:
        raise Exception("Failed to send message")

    return MessageResponse(**response.data[0])

async def get_dm_conversation(
    user_id: UUID, other_user_id: UUID, offset: int = 0, limit: int = 50
) -> List[MessageResponse]:
    response = supabase.table("messages").select("*").or_(
        f"and(sender_id.eq.{user_id},recipient_id.eq.{other_user_id}),and(sender_id.eq.{other_user_id},recipient_id.eq.{user_id})"
    ).order("created_at", desc=False).range(offset, offset + limit - 1).execute()

    return [MessageResponse(**msg) for msg in response.data]


async def get_dm_list(user_id: UUID) -> List[ConversationSummary]:
    # Get messages where user is sender
    sent = supabase.table("messages").select("*").eq("sender_id", str(user_id)).not_.is_("recipient_id", "null").order("created_at", desc=True).execute()

    # Get messages where user is recipient
    received = supabase.table("messages").select("*").eq("recipient_id", str(user_id)).order("created_at", desc=True).execute()

    # Combine and sort by created_at
    all_messages = (sent.data or []) + (received.data or [])
    all_messages.sort(key=lambda x: x["created_at"], reverse=True)

    if not all_messages:
        return []

    # Build conversation map: partner_id -> most recent message
    conversations = {}
    for msg in all_messages:
        other_user_id = msg["recipient_id"] if msg["sender_id"] == str(user_id) else msg["sender_id"]
        if other_user_id not in conversations:
            conversations[other_user_id] = msg

    summaries = []
    for other_user_id, last_msg in conversations.items():
        user_info = supabase.table("users").select("id, username, avatar_url").eq("id", other_user_id).execute()
        if not user_info.data:
            continue
        partner = user_info.data[0]

        unread = supabase.table("messages").select("id", count="exact").eq("sender_id", other_user_id).eq("recipient_id", str(user_id)).eq("is_read", False).execute()

        summaries.append(ConversationSummary(
            other_user_id=UUID(other_user_id),
            other_user_username=partner["username"],
            other_user_avatar=partner.get("avatar_url"),
            last_message=last_msg["content"][:50],
            last_message_at=last_msg["created_at"],
            unread_count=unread.count or 0,
        ))

    return summaries

async def send_channel_message(sender_id: UUID, subchannel_id: UUID, content: str) -> MessageResponse:
    """
    Send a message to a subchannel.
    Sender must be a member of the parent passion.
    """
    # Get the subchannel to find the parent passion
    subchannel = supabase.table("subchannels").select("passion_id").eq("id", str(subchannel_id)).execute()

    if not subchannel.data:
        raise NotFoundError("Subchannel not found")

    passion_id = subchannel.data[0]["passion_id"]

    # Check if sender is a member of the passion
    member_check = supabase.table("passion_members").select("*").eq("passion_id", passion_id).eq("user_id",
                                                                                                 str(sender_id)).execute()

    if not member_check.data:
        raise ForbiddenError("You must be a member of this passion to post in its channels")

    # Insert message
    message_data = {
        "sender_id": str(sender_id),
        "recipient_id": None,
        "subchannel_id": str(subchannel_id),
        "content": content,
    }

    response = supabase.table("messages").insert(message_data).execute()

    if not response.data:
        raise Exception("Failed to send message")

    return MessageResponse(**response.data[0])


async def get_channel_messages(
        subchannel_id: UUID, user_id: UUID, offset: int = 0, limit: int = 50
) -> List[MessageResponse]:
    """
    Fetch all messages in a subchannel, ordered by created_at ASC (oldest first).
    User must be a member of the parent passion.
    """
    # Get the subchannel and its parent passion
    subchannel = supabase.table("subchannels").select("passion_id").eq("id", str(subchannel_id)).execute()

    if not subchannel.data:
        raise NotFoundError("Subchannel not found")

    passion_id = subchannel.data[0]["passion_id"]

    # Check if user is a member of the passion
    member_check = supabase.table("passion_members").select("*").eq("passion_id", passion_id).eq("user_id",
                                                                                                 str(user_id)).execute()

    if not member_check.data:
        raise ForbiddenError("You must be a member of this passion to view its channels")

    # Fetch messages
    response = supabase.table("messages").select("*").eq("subchannel_id", str(subchannel_id)).order("created_at",
                                                                                                    desc=False).range(
        offset, offset + limit - 1).execute()

    return [MessageResponse(**msg) for msg in response.data]