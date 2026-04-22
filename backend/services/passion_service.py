from typing import Optional
from lib.supabase_client import supabase
from schemas.passion_schema import PassionListItem


def _normalize_role(role: Optional[str]) -> str:
    value = (role or "member").lower()
    if value in {"member", "moderator", "admin", "organizer"}:
        return value
    return "member"


async def get_my_passions(user_id: str) -> list[PassionListItem]:
    return await get_user_passions(user_id, user_id)


async def get_user_passions(user_id: str, requesting_user_id: str) -> list[PassionListItem]:
    members = supabase.table("passion_members").select(
        "passion_id, role"
    ).eq("user_id", user_id).execute()

    owned = supabase.table("passions").select(
        "id"
    ).eq("owner_id", user_id).execute()

    approved_requests = supabase.table("passion_join_requests").select(
        "passion_id"
    ).eq("requester_id", user_id).eq("status", "approved").execute()

    member_rows = members.data or []
    owned_rows = owned.data or []
    approved_rows = approved_requests.data or []

    if not member_rows and not owned_rows and not approved_rows:
        return []

    role_map = {row["passion_id"]: _normalize_role(row.get("role")) for row in member_rows}
    for row in approved_rows:
        role_map.setdefault(row["passion_id"], "member")
    for row in owned_rows:
        role_map[row["id"]] = "organizer"

    passion_ids = list(role_map.keys())

    favorite_ids: set[str] = set()
    try:
        favorites = supabase.table("passion_favorites").select(
            "passion_id"
        ).eq("user_id", requesting_user_id).in_("passion_id", passion_ids).execute()
        favorite_ids = {row["passion_id"] for row in favorites.data or []}
    except Exception:
        # Keep the endpoint functional even if favorites migration has not been run yet.
        favorite_ids = set()

    passions = supabase.table("passions").select(
        "id, name, cover_url, category, member_count"
    ).in_("id", passion_ids).execute()

    return [
        PassionListItem(
            id=p["id"],
            name=p["name"],
            cover_url=p.get("cover_url"),
            member_count=p.get("member_count") or 0,
            category=p.get("category"),
            my_role=role_map.get(p["id"], "member"),
            is_favorite=p["id"] in favorite_ids,
        )
        for p in passions.data
    ]


async def get_user_passions_by_username(username: str, requesting_user_id: str) -> list[PassionListItem]:
    user = (
        supabase.table("users")
        .select("id")
        .eq("username", username)
        .limit(1)
        .execute()
    )

    if not user.data:
        return []

    return await get_user_passions(user.data[0]["id"], requesting_user_id)


async def add_favorite(user_id: str, passion_id: str) -> None:
    try:
        supabase.table("passion_favorites").insert({
            "user_id": user_id,
            "passion_id": passion_id,
        }).execute()
    except Exception as e:
        # Duplicate favorite should be idempotent.
        if "23505" in str(e):
            return
        raise


async def remove_favorite(user_id: str, passion_id: str) -> None:
    supabase.table("passion_favorites").delete().eq(
        "user_id", user_id
    ).eq(
        "passion_id", passion_id
    ).execute()
