from fastapi import APIRouter, Depends
from uuid import UUID
from schemas.passion_schema import PassionListItem, PassionCreate, PassionResponse, PassionDiscoverItem, SubchannelListItem, SubchannelCreate
from services import passion_service
from lib.auth import get_current_user

router = APIRouter(prefix="/passions", tags=["Passions"])


# ── Create ─────────────────────────────────────────────────────────────────────
@router.post("/", response_model=PassionResponse, status_code=201)
async def create_passion(data: PassionCreate, current_user=Depends(get_current_user)):
    return await passion_service.create_passion(str(current_user.id), data)


# ── List (must come before /{passion_id} wildcard) ─────────────────────────────
@router.get("/discover", response_model=list[PassionDiscoverItem])
async def get_discover_passions(
    query: str = '',
    offset: int = 0,
    limit: int = 20,
    current_user=Depends(get_current_user),
):
    return await passion_service.get_discover_passions(str(current_user.id), query, offset, limit)


@router.get("/me", response_model=list[PassionListItem])
async def get_my_passions(current_user=Depends(get_current_user)):
    return await passion_service.get_my_passions(str(current_user.id))


@router.get("/user/{user_id}", response_model=list[PassionListItem])
async def get_user_passions(user_id: UUID, current_user=Depends(get_current_user)):
    return await passion_service.get_user_passions(str(user_id), str(current_user.id))


@router.get("/by-username/{username}", response_model=list[PassionListItem])
async def get_user_passions_by_username(username: str, current_user=Depends(get_current_user)):
    return await passion_service.get_user_passions_by_username(username, str(current_user.id))


# ── Single passion ─────────────────────────────────────────────────────────────
@router.get("/{passion_id}", response_model=PassionResponse)
async def get_passion(passion_id: UUID, current_user=Depends(get_current_user)):
    return await passion_service.get_passion(str(passion_id), str(current_user.id))


# ── Join / Request join ────────────────────────────────────────────────────────
@router.post("/{passion_id}/join", response_model=PassionResponse)
async def join_passion(passion_id: UUID, current_user=Depends(get_current_user)):
    return await passion_service.join_passion(str(passion_id), str(current_user.id))


@router.post("/{passion_id}/request-join", response_model=PassionResponse)
async def request_join(passion_id: UUID, current_user=Depends(get_current_user)):
    return await passion_service.request_join(str(passion_id), str(current_user.id))


# ── Favorites ──────────────────────────────────────────────────────────────────
@router.post("/{passion_id}/favorite", status_code=204)
async def add_favorite(passion_id: UUID, current_user=Depends(get_current_user)):
    await passion_service.add_favorite(str(current_user.id), str(passion_id))


@router.delete("/{passion_id}/favorite", status_code=204)
async def remove_favorite(passion_id: UUID, current_user=Depends(get_current_user)):
    await passion_service.remove_favorite(str(current_user.id), str(passion_id))


# ── Subchannels ────────────────────────────────────────────────────────────────
@router.get("/{passion_id}/subchannels", response_model=list[SubchannelListItem])
async def get_subchannels(passion_id: UUID, current_user=Depends(get_current_user)):
    return await passion_service.get_subchannels(str(passion_id))


@router.post("/{passion_id}/subchannels", response_model=SubchannelListItem, status_code=201)
async def create_subchannel(passion_id: UUID, data: SubchannelCreate, current_user=Depends(get_current_user)):
    return await passion_service.create_subchannel(str(passion_id), str(current_user.id), data)
