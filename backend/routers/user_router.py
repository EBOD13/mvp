from fastapi import APIRouter, Depends, Query
from lib.auth import get_current_user
from schemas.user_schema import UserProfile, UpdateProfileRequest, UserSearchResult
from services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/search", response_model=list[UserSearchResult])
async def search_users(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    current_user=Depends(get_current_user),
):
    return await user_service.search_users(q, str(current_user.id), limit, offset)


@router.get("/me", response_model=UserProfile)
async def get_me(user=Depends(get_current_user)):
    return await user_service.get_me(str(user.id))


@router.patch("/me", response_model=UserProfile)
async def update_me(data: UpdateProfileRequest, user=Depends(get_current_user)):
    return await user_service.update_me(str(user.id), data)


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str, current_user=Depends(get_current_user)):
    return await user_service.get_user_profile(user_id)
