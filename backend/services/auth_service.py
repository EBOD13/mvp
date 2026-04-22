from fastapi import HTTPException, status
from lib.supabase_client import supabase
from schemas.auth_schema import SignUpRequest, AuthResponse, LoginRequest

async def sign_up(data: SignUpRequest) -> AuthResponse:
    # 1. Create user in Supabase Auth
    auth_response = supabase.auth.sign_up({
        "email": data.email,
        "password": data.password,
    })

    user = auth_response.user
    session = auth_response.session

    # 2. Insert profile row into users table
    supabase.table("users").insert({
        "id": str(user.id),
        "username": data.username,
        "email": data.email,
        "password_hash": "",
        "display_name": data.display_name,
    }).execute()

    # 3. Return AuthResponse with tokens
    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
    )

async def login(data: LoginRequest) -> AuthResponse:
    # 1. Resolve email from identifier
    if "@" in data.identifier:
        email = data.identifier
    else:
        result = supabase.table("users").select("email").eq("username", data.identifier).single().execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        email = result.data["email"]

    # 2. Sign in with email + password
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": data.password,
        })
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    session = auth_response.session
    user = auth_response.user

    if not session or not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 3. Return AuthResponse
    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
    )

async def refresh_token(refresh_token: str) -> AuthResponse:
    auth_response = supabase.auth.refresh_session(refresh_token)

    session = auth_response.session
    user = auth_response.user

    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
    )
