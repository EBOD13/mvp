from fastapi import APIRouter, Depends
from uuid import UUID
from lib.auth import get_current_user
from schemas.phriendship_schema import (
    PhriendRequestCreate,
    PhriendRequestResponse,
    PhriendResponse,
)
from services import phriendship_service

router = APIRouter(prefix="/phriends", tags=["Phriendships"])

# Send phriend request
@router.post("/request", response_model=PhriendRequestResponse, status_code=201)
async def send_request(data: PhriendRequestCreate, current_user=Depends(get_current_user)):
    return await phriendship_service.send_request(current_user.id, data.addressee_id)

# Accept phriend request
@router.patch("/{request_id}/accept", response_model=PhriendRequestResponse)
async def accept_request(request_id: UUID, current_user=Depends(get_current_user)):
    return await phriendship_service.accept_request(request_id, current_user.id)

# Decline phriend request
@router.patch("/{request_id}/decline", status_code=204)
async def decline_request(request_id: UUID, current_user=Depends(get_current_user)):
    await phriendship_service.decline_request(request_id, current_user.id)

# Remove phriend
@router.delete("/{other_user_id}", status_code=204)
async def remove_phriend(other_user_id: UUID, current_user=Depends(get_current_user)):
    await phriendship_service.remove_phriend(current_user.id, other_user_id)

# Get phriends
@router.get("/", response_model=list[PhriendResponse])
async def get_phriends(current_user=Depends(get_current_user)):
    return await phriendship_service.get_phriends(current_user.id)

# Best Phriends — all literal routes must come before /{other_user_id} wildcards
@router.get("/best", response_model=list[PhriendResponse])
async def get_best_phriends(current_user=Depends(get_current_user)):
    return await phriendship_service.get_best_phriends(current_user.id)

@router.get("/best/ids")
async def get_best_phriend_ids(current_user=Depends(get_current_user)):
    return await phriendship_service.get_best_phriend_ids(current_user.id)

@router.post("/{other_user_id}/best", status_code=204)
async def add_best_phriend(other_user_id: UUID, current_user=Depends(get_current_user)):
    await phriendship_service.add_best_phriend(current_user.id, other_user_id)

@router.delete("/{other_user_id}/best", status_code=204)
async def remove_best_phriend(other_user_id: UUID, current_user=Depends(get_current_user)):
    await phriendship_service.remove_best_phriend(current_user.id, other_user_id)

# Get pending phriend requests
@router.get("/requests/pending", response_model=list[PhriendRequestResponse])
async def get_pending_requests(current_user=Depends(get_current_user)):
    return await phriendship_service.get_pending_requests(current_user.id)

# Get phriendship status
@router.get("/status/{other_user_id}")
async def get_phriendship_status(other_user_id: UUID, current_user=Depends(get_current_user)):
    return await phriendship_service.get_phriendship_status(current_user.id, other_user_id)


# Cancel an outgoing pending request
@router.delete("/request/to/{other_user_id}", status_code=204)
async def cancel_request(other_user_id: UUID, current_user=Depends(get_current_user)):
    await phriendship_service.cancel_request(current_user.id, other_user_id)