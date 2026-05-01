# MVP — My Virtual Passions

> A social media platform that connects people through shared interests and communities, built as a course project for **CS-4063 Human Computer Interaction, Spring 2026** at the University of Oklahoma.

---

## What is MVP?

MVP (My Virtual Passions) lets users discover and join **Passions** — interest-based communities — and connect with other users who share the same interests. Users can post within passions, react and comment on posts, and add each other as **Phriends**. The feed is filtered to show either phriends' posts or posts from passions you belong to.

**Key features:**
- Create and join Passions (communities) with categories and member counts
- Dual-filter home feed: **Phriends** feed and **Passions** feed
- Posts with media, reactions, comments, and saves
- Phriend requests: send, accept, decline, and cancel
- User profiles with bio, avatar, profile song, and verified badge
- Discover tab: search all communities globally and find people by name or username
- Full CRUD on posts and profile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (TypeScript) |
| Backend | Python 3.9 + FastAPI |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| Storage | Supabase Storage |
| Navigation | React Navigation (Stack + Bottom Tabs) |

---

## Project Structure

```
mvp/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env                     # SUPABASE_URL, SUPABASE_KEY, JWT_SECRET
│   ├── lib/
│   │   ├── supabase_client.py   # Supabase admin client
│   │   ├── auth.py              # JWT auth dependency
│   │   └── exceptions.py        # NotFoundError, etc.
│   ├── routers/
│   │   ├── auth_router.py
│   │   ├── post_router.py
│   │   ├── comment_router.py
│   │   ├── passion_router.py
│   │   ├── phriendship_router.py
│   │   ├── user_router.py
│   │   ├── message_router.py
│   │   └── event_router.py
│   ├── services/                # Business logic (one per domain)
│   ├── schemas/                 # Pydantic request/response models
│   └── migrations/              # SQL migration files (001–018)
│
└── frontend/
    ├── package.json
    ├── src/
    │   ├── api/                 # Axios wrappers (postApi, userApi, phriendApi, …)
    │   ├── components/
    │   │   ├── cards/           # PostCard, PassionCard
    │   │   ├── common/          # CommentSheet, SongPlayer, …
    │   │   └── layout/          # BottomNavBar, FloatingActionButton
    │   ├── hooks/               # useFeed, useAuth, usePassions, …
    │   ├── navigation/          # Stack navigator + route types
    │   ├── screens/
    │   │   ├── auth/            # LoginScreen, SignUpScreen
    │   │   ├── feed/            # HomeFeedScreen, CreatePostScreen
    │   │   ├── discover/        # DiscoverScreen
    │   │   ├── passions/        # PassionDetailScreen, CreatePassionScreen
    │   │   ├── profile/         # ProfileScreen, EditProfileScreen
    │   │   ├── social/          # PhriendsList, PhriendRequestsScreen
    │   │   └── stub/            # OtherUserScreen (other user's profile)
    │   ├── theme/               # Colors, spacing, typography
    │   └── types/               # Shared TypeScript interfaces
    └── assets/
        └── images/              # Logo and static assets
```

---

## Getting Started

### Prerequisites

- **Python 3.9+** and `pip`
- **Node.js 18+** and `npm`
- **Xcode** (for iOS simulator) or **Android Studio** (for Android emulator)
- A Supabase project with the schema from `backend/migrations/` applied

---

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
#    Create a .env file in the backend/ folder with:
#    SUPABASE_URL=https://your-project.supabase.co
#    SUPABASE_KEY=your-service-role-key
#    JWT_SECRET=your-jwt-secret

# 5. Run the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install JavaScript dependencies
npm install

# 3. iOS — install CocoaPods (first time only)
cd ios && pod install && cd ..

# 4. Run on iOS simulator
npx react-native run-ios

# — OR —

# 4. Run on Android emulator (emulator must be running)
npx react-native run-android
```

> **Note:** Make sure your backend server is running before launching the app. Update `frontend/src/lib/apiClient.ts` with your machine's local IP address if testing on a physical device.

---

## Database Migrations

SQL migration files live in `backend/migrations/`. Apply them in order (001 → 018) in the Supabase SQL editor or via the Supabase CLI:

```bash
supabase db push
```

---

## API Overview

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login + receive JWT |
| GET | `/users/me` | Get own profile |
| PATCH | `/users/me` | Update own profile |
| GET | `/users/{id}` | Get another user's profile |
| GET | `/users/search` | Search users by name/username |
| GET | `/posts/feed` | Get home feed (phriends or passions) |
| POST | `/posts` | Create a post |
| PATCH | `/posts/{id}` | Edit a post |
| DELETE | `/posts/{id}` | Delete a post |
| POST | `/posts/{id}/like` | Like a post |
| DELETE | `/posts/{id}/like` | Unlike a post |
| GET | `/passions` | List all passions |
| POST | `/passions` | Create a passion |
| POST | `/passions/{id}/join` | Join a passion |
| GET | `/phriends/status/{id}` | Check phriendship status |
| POST | `/phriends/request/{id}` | Send phriend request |
| DELETE | `/phriends/request/to/{id}` | Cancel outgoing request |
| POST | `/phriends/accept/{requestId}` | Accept phriend request |
| DELETE | `/phriends/decline/{requestId}` | Decline phriend request |
| GET | `/comments/{postId}` | List comments on a post |
| POST | `/comments/{postId}` | Add a comment |

---

## Contributors

| Name | Role |
|---|---|
| Daniel Esambu | |
| Marilou Bento | |
| Jennifer Marwitz | |
| Mooketsi Noko | |
| Terriauna James | |
| Abraham Gutu | |

---

## Course Info

**CS-4063 Human Computer Interaction**  
Spring 2026 — University of Oklahoma  
Instructor: Dr. Ghulam Quadri

---

## License

This project was created for academic purposes. All rights reserved by the contributors.
