from typing import Optional
from lib.supabase_client import supabase
from lib.exceptions import NotFoundError, ForbiddenError
from schemas.passion_schema import PassionListItem, PassionCreate, PassionResponse, PassionDiscoverItem, SubchannelListItem, SubchannelCreate


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


async def get_discover_passions(
    user_id: str,
    query: str = '',
    offset: int = 0,
    limit: int = 20,
) -> list[PassionDiscoverItem]:
    # Passions the user owns
    owned = supabase.table("passions").select("id").eq("owner_id", user_id).execute()
    owned_ids = {r["id"] for r in owned.data or []}

    # Passions the user is a member of
    memberships = supabase.table("passion_members").select("passion_id").eq("user_id", user_id).execute()
    member_ids = {r["passion_id"] for r in memberships.data or []}

    user_passion_ids = owned_ids | member_ids

    # Fetch ALL public passions — search by name OR description
    public_q = supabase.table("passions").select(
        "id, name, description, category, cover_url, member_count, visibility, join_type"
    ).eq("visibility", "public").order("member_count", desc=True).order("name")
    if query:
        # Two queries to avoid .or_() cold-start issues; merge in Python
        by_name = public_q.ilike("name", f"%{query}%").range(offset, offset + limit - 1).execute()
        by_desc = supabase.table("passions").select(
            "id, name, description, category, cover_url, member_count, visibility, join_type"
        ).eq("visibility", "public").ilike("description", f"%{query}%").limit(limit).execute()
        public_passions = by_name.data or []
        extra = [r for r in (by_desc.data or []) if r["id"] not in {p["id"] for p in public_passions}]
        public_passions = public_passions + extra
    else:
        public_result = public_q.range(offset, offset + limit - 1).execute()
        public_passions = public_result.data or []

    # Fetch user's private passions (always included regardless of pagination)
    user_private: list[dict] = []
    if user_passion_ids:
        priv_q = supabase.table("passions").select(
            "id, name, description, category, cover_url, member_count, visibility, join_type"
        ).in_("id", list(user_passion_ids)).eq("visibility", "private")
        if query:
            priv_q = priv_q.ilike("name", f"%{query}%")
        user_private = priv_q.execute().data or []

    # Merge, deduplicate
    seen: set[str] = set()
    all_passions: list[dict] = []
    for p in public_passions + user_private:
        if p["id"] not in seen:
            seen.add(p["id"])
            all_passions.append(p)

    if not all_passions:
        return []

    passion_ids = [p["id"] for p in all_passions]

    # Membership status for each passion
    mem_result = supabase.table("passion_members").select("passion_id").eq(
        "user_id", user_id
    ).in_("passion_id", passion_ids).execute()
    confirmed_member_ids = {r["passion_id"] for r in mem_result.data or []} | owned_ids

    req_result = supabase.table("passion_join_requests").select("passion_id, status").eq(
        "requester_id", user_id
    ).in_("passion_id", passion_ids).execute()
    pending_ids = {r["passion_id"] for r in req_result.data or [] if r["status"] == "pending"}

    # Favorites
    favorite_ids: set[str] = set()
    try:
        fav_result = supabase.table("passion_favorites").select("passion_id").eq(
            "user_id", user_id
        ).in_("passion_id", passion_ids).execute()
        favorite_ids = {r["passion_id"] for r in fav_result.data or []}
    except Exception:
        pass

    items = [
        PassionDiscoverItem(
            id=p["id"],
            name=p["name"],
            description=p.get("description") or "",
            category=p.get("category"),
            cover_url=p.get("cover_url"),
            member_count=p.get("member_count") or 0,
            visibility=p.get("visibility", "public"),
            join_type=p.get("join_type", "open"),
            membership_status=(
                "member"  if p["id"] in confirmed_member_ids else
                "pending" if p["id"] in pending_ids else
                "not_member"
            ),
            is_favorite=p["id"] in favorite_ids,
        )
        for p in all_passions
    ]

    # Surface unjoined passions first so Discover feels global, not personal
    status_order = {"not_member": 0, "pending": 1, "member": 2}
    items.sort(key=lambda item: (status_order[item.membership_status], item.name.lower()))
    return items


async def create_passion(user_id: str, data: PassionCreate) -> PassionResponse:
    row = supabase.table("passions").insert({
        "name": data.name.strip(),
        "description": data.description,
        "category": data.category,
        "visibility": data.visibility,
        "join_type": data.join_type,
        "cover_url": data.cover_url,
        "owner_id": user_id,
        "member_count": 1,
    }).execute()

    if not row.data:
        raise Exception("Failed to create passion")

    passion = row.data[0]
    passion_id = str(passion["id"])

    # Add creator as admin member
    try:
        supabase.table("passion_members").insert({
            "passion_id": passion_id,
            "user_id": user_id,
            "role": "admin",
        }).execute()
    except Exception:
        pass

    return PassionResponse(
        id=passion_id,
        name=passion["name"],
        description=passion.get("description") or "",
        category=passion.get("category") or "General",
        visibility=passion.get("visibility", "public"),
        join_type=passion.get("join_type", "open"),
        cover_url=passion.get("cover_url"),
        member_count=1,
        created_at=str(passion.get("created_at", "")),
        my_role="organizer",
        is_favorite=False,
        membership_status="member",
    )


async def get_passion(passion_id: str, user_id: str) -> PassionResponse:
    result = supabase.table("passions").select(
        "id, name, description, category, visibility, join_type, cover_url, member_count, owner_id, created_at"
    ).eq("id", passion_id).limit(1).execute()

    if not result.data:
        raise NotFoundError("Passion not found")

    p = result.data[0]

    # Determine role
    is_owner = p.get("owner_id") == user_id
    my_role = "organizer" if is_owner else "member"

    if not is_owner:
        member = supabase.table("passion_members").select("role").eq(
            "passion_id", passion_id
        ).eq("user_id", user_id).execute()
        if member.data:
            my_role = _normalize_role(member.data[0].get("role"))

    # Membership status
    membership_status = "not_member"
    if is_owner or (not is_owner and my_role != "member"):
        membership_status = "member"
    else:
        member_check = supabase.table("passion_members").select("role").eq(
            "passion_id", passion_id
        ).eq("user_id", user_id).execute()
        if member_check.data:
            membership_status = "member"
        else:
            req_check = supabase.table("passion_join_requests").select("status").eq(
                "passion_id", passion_id
            ).eq("requester_id", user_id).execute()
            if req_check.data:
                status = req_check.data[0].get("status", "")
                membership_status = "pending" if status == "pending" else (
                    "member" if status == "approved" else "not_member"
                )

    # Favorite check
    fav = supabase.table("passion_favorites").select("passion_id").eq(
        "user_id", user_id
    ).eq("passion_id", passion_id).execute()
    is_favorite = len(fav.data) > 0 if fav.data else False

    return PassionResponse(
        id=p["id"],
        name=p["name"],
        description=p.get("description") or "",
        category=p.get("category") or "General",
        visibility=p.get("visibility", "public"),
        join_type=p.get("join_type", "open"),
        cover_url=p.get("cover_url"),
        member_count=p.get("member_count") or 0,
        created_at=str(p.get("created_at", "")),
        my_role=my_role,
        is_favorite=is_favorite,
        membership_status=membership_status,
    )


async def join_passion(passion_id: str, user_id: str) -> PassionResponse:
    try:
        supabase.table("passion_members").insert({
            "passion_id": passion_id,
            "user_id": user_id,
            "role": "member",
        }).execute()
        supabase.rpc("increment_field", {
            "table_name": "passions",
            "field_name": "member_count",
            "row_id": passion_id,
        }).execute()
    except Exception as e:
        if "23505" not in str(e):
            raise
    return await get_passion(passion_id, user_id)


async def request_join(passion_id: str, user_id: str) -> PassionResponse:
    try:
        supabase.table("passion_join_requests").insert({
            "passion_id": passion_id,
            "requester_id": user_id,
            "status": "pending",
        }).execute()
    except Exception as e:
        if "23505" not in str(e):
            raise
    return await get_passion(passion_id, user_id)


async def get_subchannels(passion_id: str) -> list[SubchannelListItem]:
    result = supabase.table("subchannels").select(
        "id, name, description, passion_id"
    ).eq("passion_id", passion_id).order("name").execute()
    return [SubchannelListItem(**row) for row in result.data or []]


async def create_subchannel(passion_id: str, user_id: str, data: SubchannelCreate) -> SubchannelListItem:
    passion = supabase.table("passions").select("owner_id").eq(
        "id", passion_id
    ).limit(1).execute()
    if not passion.data:
        raise NotFoundError("Passion not found")

    is_owner = passion.data[0]["owner_id"] == user_id
    if not is_owner:
        member = supabase.table("passion_members").select("role").eq(
            "passion_id", passion_id
        ).eq("user_id", user_id).limit(1).execute()
        if not member.data or member.data[0]["role"] not in ("admin", "organizer"):
            raise ForbiddenError("Only organizers and admins can create channels")

    result = supabase.table("subchannels").insert({
        "passion_id": passion_id,
        "name": data.name,
        "description": data.description,
        "created_by": user_id,
    }).execute()

    if not result.data:
        raise Exception("Failed to create subchannel")

    row = result.data[0]
    return SubchannelListItem(
        id=str(row["id"]),
        name=row["name"],
        description=row.get("description"),
        passion_id=str(row["passion_id"]),
    )
