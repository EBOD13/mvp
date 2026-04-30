from lib.supabase_client import supabase
from lib.exceptions import NotFoundError
from schemas.user_schema import UserProfile, UpdateProfileRequest, UserSearchResult


async def get_me(user_id: str) -> UserProfile:
    result = supabase.table("users").select(
        "id, username, display_name, bio, avatar_url, profile_song_url, is_verified, created_at"
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


async def get_user_profile(user_id: str) -> UserProfile:
    result = supabase.table("users").select(
        "id, username, display_name, bio, avatar_url, profile_song_url, is_verified, created_at"
    ).eq("id", user_id).limit(1).execute()

    if not result.data:
        raise NotFoundError("User not found")

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

    data = result.data[0]
    data["phriends_count"] = phriends_count
    return UserProfile(**data)


async def update_me(user_id: str, data: UpdateProfileRequest) -> UserProfile:
    updates = data.model_dump(exclude_unset=True)
    if not updates:
        return await get_me(user_id)
    supabase.table("users").update(updates).eq("id", user_id).execute()
    return await get_me(user_id)


async def search_users(
    query: str,
    requesting_user_id: str,
    limit: int = 20,
    offset: int = 0,
) -> list[UserSearchResult]:
    q = f"%{query.strip()}%"

    # Two separate queries to avoid .or_() cold-start fragility
    by_username = supabase.table("users").select(
        "id, username, display_name, avatar_url"
    ).ilike("username", q).neq("id", requesting_user_id).limit(limit).execute()

    by_display = supabase.table("users").select(
        "id, username, display_name, avatar_url"
    ).ilike("display_name", q).neq("id", requesting_user_id).limit(limit).execute()

    seen: set[str] = set()
    merged: list[dict] = []
    for row in (by_username.data or []) + (by_display.data or []):
        if row["id"] not in seen:
            seen.add(row["id"])
            merged.append(row)

    page = merged[offset: offset + limit]
    return [UserSearchResult(**r) for r in page]
