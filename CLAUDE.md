# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fruzzled is a puzzle game platform with a Django REST Framework backend and React (Vite) frontend. The application serves multiple puzzle types including Sudoku, Crosswords, and Anagrams.

## Common Commands

### Backend (Django)
```bash
# Run development server
python manage.py runserver

# Run all tests
python manage.py test

# Run tests for a specific app
python manage.py test crosswords
python manage.py test sudoku

# Run a specific test class
python manage.py test crosswords.tests.test_views.TestPuzzleListView

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Load fixture data
python manage.py loaddata fixtures/crossword_builder_app.json
```

### Frontend (React/Vite)
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run Cypress tests
npm run cy:open
```

## Architecture

### Backend Structure
- **fruzzled_backend/**: Main Django project with settings, URL routing, and shared serializers
- **sudoku/**: Sudoku puzzle app with `PlayerProfile` model (shared across apps)
- **crosswords/**: Crossword puzzle builder with Grid, CrosswordPuzzle, CrosswordClue, and Dictionary models
- **anagrams/**: Anagram series puzzles
- **player_profile/**: Player profile management
- **usage_stats/**: Analytics and usage tracking

### Authentication
- Uses `dj-rest-auth` with JWT tokens in production (`JWTCookieAuthentication`)
- Uses `SessionAuthentication` in development (when `DEV` env var is set) or during tests
- Tests automatically use SessionAuthentication (detected via `sys.argv.__contains__('test')`)

### API Routes
All API endpoints are prefixed with `/api/`:
- `/api/` - Sudoku, player profile, anagrams
- `/api/crossword_builder/` - Crossword endpoints
- `/api/usage_stats/` - Usage statistics
- `/api/dj-rest-auth/` - Authentication

### Frontend Structure
- **frontend/src/pages/**: Page components organized by feature (puzzle, crossword, anagram, auth)
- **frontend/src/components/**: Reusable UI components
- **frontend/src/contexts/**: React context providers (CurrentUser, Theme, Profile, PuzzleHistory)

### Environment Configuration
Create an `env.py` file in the project root with required environment variables. Key settings:
- `DEV` - Enables development mode (SessionAuthentication, CORS allow all)
- `DEBUG` - Enables Django debug mode
- `USE_SERVER_POSTGRES` - Use PostgreSQL instead of SQLite
- `SHOULD_THROTTLE` - Enable API rate limiting
- `SECRET_KEY`, `ALLOWED_HOSTS`, `CLIENT_ORIGINS` - Required Django settings

### Database
- Development/tests: SQLite (default)
- Production: PostgreSQL (when `USE_SERVER_POSTGRES` is set)

### Test Fixtures
Test fixtures are in `fixtures/` directory. Tests use fixtures declared in test classes via the `fixtures` attribute.
