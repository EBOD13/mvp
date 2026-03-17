from fastapi import APIRouter, Depends
from lib.auth import get_current_user
from schemas.user_schema import UserProfile, UpdateProfileRequest
from services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfile)
async def get_me(user=Depends(get_current_user)):
    return await user_service.get_me(str(user.id))


@router.patch("/me", response_model=UserProfile)
async def update_me(data: UpdateProfileRequest, user=Depends(get_current_user)):
    return await user_service.update_me(str(user.id), data)
