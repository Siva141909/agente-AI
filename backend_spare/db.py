import os
from supabase import create_client, Client

_admin: Client | None = None


def get_admin_supabase() -> Client:
    """Anon-key client — used only for JWT validation via auth.get_user()."""
    global _admin
    if _admin is None:
        _admin = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])
    return _admin


def get_user_supabase(jwt: str) -> Client:
    """Per-request client scoped to the user's JWT. RLS applies automatically."""
    client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])
    client.postgrest.auth(jwt)
    return client
