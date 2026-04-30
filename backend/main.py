from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from routers import (
    auth_router,
    user_router,
    event_router,
    comment_router,
    phriendship_router,
    post_router,
    passion_router,
    message_router,
)

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(post_router.router)
app.include_router(passion_router.router)
app.include_router(event_router.router)
app.include_router(comment_router.router)
app.include_router(phriendship_router.router)
app.include_router(message_router.router)
