from fastapi import APIRouter
from schemas.auth_schema import SignUpRequest, LoginRequest, AuthResponse, RefreshRequest
from services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=AuthResponse)
async def sign_up(data: SignUpRequest):
    return await auth_service.sign_up(data)

@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    return await auth_service.login(data)

@router.post("/refresh", response_model=AuthResponse)
async def refresh(data: RefreshRequest):
    return await auth_service.refresh_token(data.refresh_token)