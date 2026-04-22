from uuid import UUID
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError, DuplicateError
from schemas.phriendship_schema import PhriendRequestResponse, PhriendResponse

async def send_request(requester_id: UUID, addressee_id: UUID) -> PhriendRequestResponse:
    # Make sure requester cant send phriend request to themselves
    if requester_id == addressee_id:
        raise ForbiddenError("You cannot send a phriend request to yourself")
    # Check if a phriendship between both users exist
    existing = (
        supabase.table("phriendships")
        .select("*")
        .or_(
            f"and(requester_id.eq.{requester_id},addressee_id.eq.{addressee_id}),"
            f"and(requester_id.eq.{addressee_id},addressee_id.eq.{requester_id})"
        ).execute()
    )
    # Check no existing pending/accepted relationship — raise DuplicateError if so
    if existing.data:
        for row in existing.data:
            if row["status"] in ["pending", "accepted"]:
                raise DuplicateError("A phriendship or pending request already exists")
    # Insert into phriendships with status='pending'
    row = (
        supabase.table("phriendships")
        .insert({
            "requester_id": str(requester_id),
            "addressee_id": str(addressee_id),
            "status": "pending",
        }).execute()
    )
    # Return PhriendRequestResponse
    return PhriendRequestResponse(**row.data[0])

async def accept_request(request_id: UUID, current_user_id: UUID) -> PhriendRequestResponse:
    # Fetch phriend request
    existing = (
        supabase.table("phriendships")
        .select("*")
        .eq("id", str(request_id))
        .execute()
    )
    # Raise NotFoundError if no phriend request exists
    if not existing.data:
        raise NotFoundError("Phriend request not found")
    # Only the addressee can accept — raise ForbiddenError otherwise
    request = existing.data[0]
    if request["addressee_id"] != str(current_user_id):
        raise ForbiddenError("Only the addressee can accept this request")
    # Update status to 'accepted'
    row = (
        supabase.table("phriendships")
        .update({
            "status": "accepted",
        }).eq("id", str(request_id)).execute()
    )
    return PhriendRequestResponse(**row.data[0])

async def decline_request(request_id: UUID, current_user_id: UUID) -> None:
    # Fetch phriend request
    existing = (
        supabase.table("phriendships")
        .select("*")
        .eq("id", str(request_id))
        .execute()
    )
    # Raise NotFoundError if no phriend request exists
    if not existing.data:
        raise NotFoundError("Phriend request not found")
    # Only the addressee can decline — raise ForbiddenError otherwise
    request = existing.data[0]
    if request["addressee_id"] != str(current_user_id):
        raise ForbiddenError("Only the addressee can decline this request")
    # Update status to 'declined'
    supabase.table("phriendships").update({
        "status": "declined",
    }).eq("id", str(request_id)).execute()

async def remove_phriend(current_user_id: UUID, other_user_id: UUID) -> None:
    # Check if an accepted phriendship between both users in either direction exist
    existing = (
        supabase.table("phriendships")
        .select("*")
        .eq("status", "accepted")
        .or_(
            f"and(requester_id.eq.{current_user_id},addressee_id.eq.{other_user_id}),"
            f"and(requester_id.eq.{other_user_id},addressee_id.eq.{current_user_id})"
        ).execute()
    )
    # If no accepted phriendship raise NotFoundError
    if not existing.data:
        raise NotFoundError("Phriendship not found")
    # Delete the accepted phriendship row in either direction
    supabase.table("phriendships").delete().eq("id", existing.data[0]["id"]).execute()

async def get_phriends(user_id: UUID) -> list[PhriendResponse]:
    # Get accepted phriendship rows when user is either requester or addressee
    rows = (
        supabase.table("phriendships")
        .select("*")
        .eq("status", "accepted")
        .or_(f"(requester_id.eq.{user_id},addressee_id.eq.{user_id})")
        .execute()
    )
    # Return all accepted phriends with their public profile fields
    phriends = []

    for row in rows.data:
        other_user_id = row["addressee_id"] if row["requester_id"] == str(user_id) else row["requester_id"]

        user_row = (
            supabase.table("users")
            .select("id, username, display_name, avatar_url")
            .eq("id", other_user_id)
            .execute()
        )

        if user_row.data:
            user = user_row.data[0]
            phriends.append(
                PhriendResponse(
                    user_id=user["id"],
                    username=user["username"],
                    first_name=user["display_name"],
                    last_name="",
                    pronouns=None,
                    profile_photo_url=user.get("avatar_url"),
                )
            )
    # Return phriends
    return phriends

async def get_pending_requests(user_id: UUID) -> list[PhriendRequestResponse]:
    # Return all pending requests where addressee_id = user_id
    rows = (
        supabase.table("phriendships")
        .select("*")
        .eq("addressee_id", str(user_id))
        .eq("status", "pending")
        .order("created_at", desc=False)
        .execute()
    )
    return [PhriendRequestResponse(**row) for row in rows.data]

async def get_phriendship_status(current_user_id: UUID, other_user_id: UUID) -> str:
    # Fetch phriendships
    rows = (
        supabase.table("phriendships")
        .select("*")
        .or_(
            f"and(requester_id.eq.{current_user_id},addressee_id.eq.{other_user_id}),"
            f"and(requester_id.eq.{other_user_id},addressee_id.eq.{current_user_id})"
        ).execute()
    )
    # If there are no phriendships, return none
    if not rows.data:
        return "none"
    # Returns 'none' | 'pending_sent' | 'pending_received' | 'accepted'
    # Used by OtherUserScreen to show the correct button state
    row = rows.data[0]

    if row["status"] == "accepted":
        return "accepted"
    if row["status"] == "pending":
        if row["requester_id"] == str(current_user_id):
            return "pending_sent"
        else:
            return "pending_received"
    return "none"
