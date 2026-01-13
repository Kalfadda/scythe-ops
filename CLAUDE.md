# Claude Code Instructions

## Build & Test Workflow

After every feature change or code modification:
1. Run `npm run release` to auto-bump version and build
2. Launch the built executable from `src-tauri\target\release\scytheops.exe` to verify the changes work

**Note:** `npm run release` automatically increments the patch version (e.g., 0.1.0 → 0.1.1) before building.
For manual builds without version bump, use `npm run tauri build`.

## Project Structure

- **Frontend**: React + TypeScript + Vite
- **Backend**: Tauri (Rust)
- **Database**: Supabase (auth + PostgreSQL)
- **State Management**: Zustand (auth) + TanStack Query (data fetching)
- **UI**: Custom inline CSS + Lucide icons + Framer Motion

## Feature Overview

### Tasks (Assets)
- Three-stage workflow: Pending → Completed → Implemented
- Categories: Art, Code, Audio, Design, Docs, Marketing, Infra, Other
- Priorities: Low, Medium, High, Critical
- Claim system: Users can claim/unclaim tasks to signal ownership
- Implemented tasks auto-delete after 7 days
- Full CRUD with edit support in detail modal

### Schedule
- Three event types: Milestone, Deliverable, Label
- Calendar view with month navigation
- List view for chronological browsing
- Deliverables can auto-create linked tasks
- Deleting a task removes linked calendar events

### Tools
- Compare tool: Side-by-side comparison of task categories

### Admin
- User management panel
- Block/unblock users (auto-unclaims their tasks)

## Key Files

### Auth
- `src/features/auth/hooks/useAuth.ts` - Authentication hook
- `src/stores/authStore.ts` - Zustand auth state
- `src/features/auth/components/AuthPage.tsx` - Login/Register
- `src/features/auth/components/ProtectedRoute.tsx` - Route guard

### Tasks
- `src/features/assets/components/Dashboard.tsx` - Main dashboard with sidebar
- `src/features/assets/components/AssetList.tsx` - Task list with filtering
- `src/features/assets/components/AssetCard.tsx` - Task card with claim visuals
- `src/features/assets/components/AssetDetailModal.tsx` - Task detail/edit modal
- `src/features/assets/hooks/useAssets.ts` - Task queries (includes claimer join)
- `src/features/assets/hooks/useAssetMutations.ts` - Task mutations (CRUD, claim/unclaim)

### Schedule
- `src/features/schedule/components/ScheduleView.tsx` - Main schedule view
- `src/features/schedule/components/Calendar.tsx` - Calendar component
- `src/features/schedule/components/EventForm.tsx` - Event create/edit form
- `src/features/schedule/components/EventCard.tsx` - Event card display
- `src/features/schedule/hooks/useEvents.ts` - Event queries
- `src/features/schedule/hooks/useEventMutations.ts` - Event mutations

### Tools
- `src/features/tools/components/Compare.tsx` - Category comparison tool

### Utilities
- `src/lib/supabase.ts` - Supabase client
- `src/lib/heartbeat.ts` - Database ping to prevent free tier pause

## Database Schema

### profiles
- id, email, display_name, is_blocked, blocked_at, blocked_reason, created_at, updated_at

### assets (tasks)
- id, name, blurb, status, category, priority
- created_by, completed_by, completed_at, implemented_by, implemented_at
- claimed_by, claimed_at
- created_at, updated_at

### events
- id, type, title, description, event_date, event_time
- visibility, linked_asset_id, auto_create_task
- created_by, created_at, updated_at

## Supabase Configuration

**Important:** Email confirmation must be DISABLED for the desktop app to work properly.

In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Email**
2. Turn **OFF** "Confirm email"
3. Save

## Database Migrations

**IMPORTANT:** Whenever you modify `src/types/database.ts`, you MUST:
1. Generate the corresponding SQL migration
2. Prompt the user to run it in Supabase SQL Editor
3. Provide clear step-by-step instructions

The app will fail if TypeScript types don't match the database schema.

## Auto-Updates

The app checks for updates on launch using GitHub Releases.

### Creating a Release

1. Set signing key: `set TAURI_SIGNING_PRIVATE_KEY=<contents of src-tauri/.tauri-updater-key>`
2. Build: `npm run release`
3. Create GitHub Release with version tag (e.g., `v0.1.11`)
4. Upload from `src-tauri/target/release/bundle/`:
   - `nsis/Scythe Ops_x.x.x_x64-setup.exe` + `.sig`
   - `msi/Scythe Ops_x.x.x_x64_en-US.msi` + `.sig`
   - `latest.json`

### Signing Key Location
- Private: `src-tauri/.tauri-updater-key` (SECRET - do not commit!)
- Public: embedded in `tauri.conf.json`

## Common Patterns

- Auth state via Zustand, accessed with `useAuthStore()`
- Data fetching via TanStack Query hooks
- Protected routes redirect to `/login` when no user
- Inline CSS styles (not Tailwind) for all components
- Feature-based folder structure: `src/features/<feature>/components|hooks`
