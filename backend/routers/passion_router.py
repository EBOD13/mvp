from fastapi import APIRouter, Depends
from uuid import UUID
from schemas.passion_schema import PassionListItem
from services import passion_service
from lib.auth import get_current_user

router = APIRouter(prefix="/passions", tags=["Passions"])


@router.get("/me", response_model=list[PassionListItem])
async def get_my_passions(current_user=Depends(get_current_user)):
    return await passion_service.get_my_passions(str(current_user.id))


@router.get("/user/{user_id}", response_model=list[PassionListItem])
async def get_user_passions(user_id: UUID, current_user=Depends(get_current_user)):
    return await passion_service.get_user_passions(str(user_id), str(current_user.id))


@router.get("/by-username/{username}", response_model=list[PassionListItem])
async def get_user_passions_by_username(username: str, current_user=Depends(get_current_user)):
    return await passion_service.get_user_passions_by_username(username, str(current_user.id))


@router.post("/{passion_id}/favorite", status_code=204)
async def add_favorite(passion_id: UUID, current_user=Depends(get_current_user)):
    await passion_service.add_favorite(str(current_user.id), str(passion_id))


@router.delete("/{passion_id}/favorite", status_code=204)
async def remove_favorite(passion_id: UUID, current_user=Depends(get_current_user)):
    await passion_service.remove_favorite(str(current_user.id), str(passion_id))
