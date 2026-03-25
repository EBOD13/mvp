from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, user_router
from routers.post_router import router as post_router

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
app.include_router(post_router)
