from pydantic import BaseModel, field_validator
from uuid import UUID
from typing import Optional, Literal


class PassionCreate(BaseModel):
    name: str
    description: str = ''
    category: str = 'General'
    visibility: Literal['public', 'private'] = 'public'
    join_type: Literal['open', 'request'] = 'open'
    cover_url: Optional[str] = None

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Passion name cannot be empty')
        return v.strip()


class PassionListItem(BaseModel):
    id: UUID
    name: str
    cover_url: Optional[str] = None
    member_count: int
    category: Optional[str] = None
    my_role: Literal['member', 'moderator', 'admin', 'organizer']
    is_favorite: bool = False


class PassionDiscoverItem(BaseModel):
    id: UUID
    name: str
    description: str
    category: Optional[str] = None
    cover_url: Optional[str] = None
    member_count: int = 0
    visibility: Literal['public', 'private']
    join_type: Literal['open', 'request']
    membership_status: Literal['not_member', 'member', 'pending']
    is_favorite: bool = False


class SubchannelCreate(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Channel name cannot be empty')
        return v.strip()


class SubchannelListItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    passion_id: str


class PassionResponse(BaseModel):
    id: UUID
    name: str
    description: str
    category: str
    visibility: Literal['public', 'private']
    join_type: Literal['open', 'request']
    cover_url: Optional[str] = None
    member_count: int = 0
    created_at: str
    my_role: Literal['member', 'moderator', 'admin', 'organizer']
    is_favorite: bool = False
    membership_status: Literal['not_member', 'member', 'pending'] = 'member'
