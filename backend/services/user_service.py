from lib.supabase_client import supabase
from schemas.user_schema import UserProfile, UpdateProfileRequest


async def get_me(user_id: str) -> UserProfile:
    result = supabase.table("users").select(
        "id, username, display_name, bio, avatar_url, is_verified, created_at"
    ).eq("id", user_id).single().execute()
    return UserProfile(**result.data)


async def update_me(user_id: str, data: UpdateProfileRequest) -> UserProfile:
    updates = data.model_dump(exclude_none=True)
    result = supabase.table("users").update(updates).eq("id", user_id).execute()
    return UserProfile(**result.data[0])
