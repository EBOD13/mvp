from fastapi import HTTPException, status
from lib.supabase_client import supabase, restore_service_role
from schemas.auth_schema import SignUpRequest, AuthResponse, LoginRequest


async def sign_up(data: SignUpRequest) -> AuthResponse:
    auth_response = supabase.auth.sign_up({
        "email": data.email,
        "password": data.password,
    })
    # sign_up fires SIGNED_IN internally, corrupting shared client headers.
    # Restore service role key immediately so other requests aren't affected.
    restore_service_role()

    user = auth_response.user
    session = auth_response.session

    supabase.table("users").insert({
        "id": str(user.id),
        "username": data.username,
        "email": data.email,
        "password_hash": "",
        "display_name": data.display_name,
    }).execute()

    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
    )


async def login(data: LoginRequest) -> AuthResponse:
    if "@" in data.identifier:
        email = data.identifier
    else:
        result = supabase.table("users").select("email").eq("username", data.identifier).limit(1).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        email = result.data[0]["email"]

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": data.password,
        })
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    finally:
        # sign_in_with_password fires SIGNED_IN, corrupting shared client headers.
        restore_service_role()

    session = auth_response.session
    user = auth_response.user

    if not session or not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
    )


async def refresh_token(refresh_token: str) -> AuthResponse:
    try:
        auth_response = supabase.auth.refresh_session(refresh_token)
    finally:
        # refresh_session fires TOKEN_REFRESHED, corrupting shared client headers.
        restore_service_role()

    session = auth_response.session
    user = auth_response.user

    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
    )
