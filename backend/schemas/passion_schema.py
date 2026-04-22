from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Literal


class PassionListItem(BaseModel):
    id: UUID
    name: str
    cover_url: Optional[str] = None
    member_count: int
    category: Optional[str] = None
    my_role: Literal['member', 'moderator', 'admin', 'organizer']
    is_favorite: bool = False
