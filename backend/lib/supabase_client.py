# backend/lib/supabase_client.py
import os
import logging
import httpx
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise Exception("Missing Supabase backend environment variables")

_supabase = None


def _build_client():
    from supabase import create_client
    from supabase.lib.client_options import SyncClientOptions

    # Retry on connection errors (handles stale keep-alive connections).
    # 30-second read timeout handles Supabase free-tier cold starts (~15-30s).
    transport = httpx.HTTPTransport(retries=3)
    http_client = httpx.Client(
        transport=transport,
        timeout=httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=5.0),
    )

    options = SyncClientOptions(
        postgrest_client_timeout=httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=5.0),
        httpx_client=http_client,
    )

    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY, options=options)
    logger.info("Supabase client initialized")
    return client


def get_supabase():
    global _supabase
    if _supabase is None:
        try:
            _supabase = _build_client()
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    return _supabase


def restore_service_role():
    """
    Call after any supabase.auth operation that signs in/refreshes a user.

    sign_in_with_password / sign_up / refresh_session all internally call
    _save_session which fires _listen_to_auth_events(SIGNED_IN / TOKEN_REFRESHED).
    That callback overwrites options.headers["Authorization"] with the user's JWT,
    breaking every subsequent DB query for every other user.

    This restores the service role key so the backend always queries as admin.
    """
    global _supabase
    if _supabase is None:
        return
    service_header = f"Bearer {SUPABASE_SERVICE_KEY}"
    _supabase.options.headers["Authorization"] = service_header
    _supabase.auth._headers["Authorization"] = service_header
    # Force postgrest to recreate its client with the restored header
    _supabase._postgrest = None


class SupabaseProxy:
    def __getattr__(self, name):
        return getattr(get_supabase(), name)


supabase = SupabaseProxy()
