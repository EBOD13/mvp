from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from lib.exceptions import ForbiddenError, NotFoundError
from lib.auth import get_current_user
from schemas.message_schema import MessageCreate, MessageResponse, ConversationSummary
from services.message_service import (
    send_dm,
    get_dm_conversation,
    get_dm_list,
    send_channel_message,
    get_channel_messages,
)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/dm", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_dm(
        payload: MessageCreate,
        current_user=Depends(get_current_user),
):
    """Send a direct message to another user."""
    if not payload.recipient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="recipient_id is required for DMs"
        )

    try:
        message = await send_dm(
            sender_id=current_user.id,
            recipient_id=payload.recipient_id,
            content=payload.content,
        )
        return message
    except ForbiddenError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/dm/{other_user_id}", response_model=list[MessageResponse])
async def get_conversation(
        other_user_id: UUID,
        offset: int = 0,
        limit: int = 50,
        current_user=Depends(get_current_user),
):
    """Fetch a conversation with another user."""
    try:
        messages = await get_dm_conversation(
            user_id=current_user.id,
            other_user_id=other_user_id,
            offset=offset,
            limit=limit,
        )
        return messages
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/dm", response_model=list[ConversationSummary])
async def get_dm_list_endpoint(
        current_user=Depends(get_current_user),
):
    """Fetch the user's DM conversation list."""
    try:
        conversations = await get_dm_list(user_id=current_user.id)
        return conversations
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/channels/{subchannel_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_channel_message(
        subchannel_id: UUID,
        payload: MessageCreate,
        current_user=Depends(get_current_user),
):
    """Send a message to a subchannel."""
    if not payload.subchannel_id:
        payload.subchannel_id = subchannel_id  # Allow it in the URL

    try:
        message = await send_channel_message(
            sender_id=current_user.id,
            subchannel_id=subchannel_id,
            content=payload.content,
        )
        return message
    except ForbiddenError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/channels/{subchannel_id}", response_model=list[MessageResponse])
async def get_subchannel_messages(
        subchannel_id: UUID,
        offset: int = 0,
        limit: int = 50,
        current_user=Depends(get_current_user),
):
    """Fetch messages from a subchannel."""
    try:
        messages = await get_channel_messages(
            subchannel_id=subchannel_id,
            user_id=current_user.id,
            offset=offset,
            limit=limit,
        )
        return messages
    except ForbiddenError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))