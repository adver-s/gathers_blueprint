from pydantic import BaseModel

class MeResponse(BaseModel):
    is_authenticated: bool
    needs_signup: bool
    is_profile_completed: bool | None
    user_id: int | None