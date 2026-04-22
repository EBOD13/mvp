from lib.supabase_client import supabase
from schemas.user_schema import UserProfile, UpdateProfileRequest


async def get_me(user_id: str) -> UserProfile:
    result = supabase.table("users").select(
        "id, username, display_name, bio, avatar_url, is_verified, created_at"
    ).eq("id", user_id).single().execute()

    phriends = supabase.table("phriendships").select(
        "id", count="exact"
    ).eq("status", "accepted").or_(
        f"requester_id.eq.{user_id},addressee_id.eq.{user_id}"
    ).execute()

    data = result.data
    data["phriends_count"] = phriends.count or 0
    return UserProfile(**data)


async def update_me(user_id: str, data: UpdateProfileRequest) -> UserProfile:
    updates = data.model_dump(exclude_none=True)
    if not updates:
        return await get_me(user_id)
    supabase.table("users").update(updates).eq("id", user_id).execute()
    return await get_me(user_id)
