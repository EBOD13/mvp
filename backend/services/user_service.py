from lib.supabase_client import supabase
from schemas.user_schema import UserProfile, UpdateProfileRequest


async def get_me(user_id: str) -> UserProfile:
    result = supabase.table("users").select(
        "id, username, display_name, bio, avatar_url, is_verified, created_at"
    ).eq("id", user_id).limit(1).execute()

    # Count accepted phriendships via two simple queries (avoids .or_() cold-start issues)
    try:
        as_req = supabase.table("phriendships").select("id", count="exact").eq(
            "status", "accepted"
        ).eq("requester_id", user_id).execute()
        as_addr = supabase.table("phriendships").select("id", count="exact").eq(
            "status", "accepted"
        ).eq("addressee_id", user_id).execute()
        phriends_count = (as_req.count or 0) + (as_addr.count or 0)
    except Exception:
        phriends_count = 0

    data = result.data[0] if result.data else {}
    data["phriends_count"] = phriends_count
    return UserProfile(**data)


async def update_me(user_id: str, data: UpdateProfileRequest) -> UserProfile:
    updates = data.model_dump(exclude_none=True)
    if not updates:
        return await get_me(user_id)
    supabase.table("users").update(updates).eq("id", user_id).execute()
    return await get_me(user_id)
