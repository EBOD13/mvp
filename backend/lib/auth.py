from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from lib.supabase_client import supabase
from lib.exceptions import ForbiddenError

bearer = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    token = credentials.credentials
    user = supabase.auth.get_user(token)
    if not user or not user.user:
        raise ForbiddenError("Invalid or expired token")
    return user.user