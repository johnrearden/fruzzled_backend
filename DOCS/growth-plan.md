# Fruzzled.ie Visibility & User Growth Plan

## Current State
- Sudoku (thousands of puzzles, 4 difficulty levels) and Crosswords (50+) available
- User accounts with PlayerProfile (nickname, country)
- Sudoku leaderboard working
- Usage stats tracking (admin-only)
- Basic SEO: static sitemap.xml, robots.txt, basic meta description
- **0 users**

## Goals
- Improve search engine visibility
- Add engagement features (social sharing, personal stats, achievements)
- Organic marketing to attract initial users

---

## Phase 1: Technical SEO (Week 1)

### 1.1 Dynamic Meta Tags
**Files:** `frontend/index.html`, `frontend/package.json`, new component
- Install `react-helmet-async`
- Create SEO component for per-page meta tags
- Add unique title/description for each route:
  - Home: "Free Online Sudoku & Crossword Puzzles | Fruzzled"
  - Sudoku: "Play Free Sudoku Online - Easy to Expert | Fruzzled"
  - Crosswords: "Free Crossword Puzzles Online | Fruzzled"

### 1.2 Open Graph & Twitter Cards
**File:** `frontend/index.html`, SEO component
- Add Open Graph meta tags (og:title, og:description, og:image, og:url)
- Add Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- Create a shareable preview image (1200x630px) for social media

### 1.3 Structured Data (JSON-LD)
**File:** `frontend/index.html` or SEO component
- Add Organization schema
- Add WebApplication/Game schema for puzzle pages
- Add BreadcrumbList schema

### 1.4 Technical Fixes
**Files:** `sitemap.xml`, `fruzzled_backend/urls.py`
- Consider dynamic sitemap generation (Django sitemap framework)
- Add canonical tags to prevent duplicate content
- Verify Google Search Console setup

---

## Phase 2: Personal Stats Dashboard (Week 2)

### 2.1 Backend API
**New file:** `player_profile/views.py` (extend)
- Create `/api/player-stats/` endpoint returning:
  - Total puzzles completed (sudoku + crossword)
  - Puzzles completed by difficulty
  - Best times per difficulty
  - Recent completions (last 10)
  - Average completion time

### 2.2 Frontend Stats Page
**New file:** `frontend/src/pages/profile/MyStats.jsx`
- Personal statistics dashboard
- Charts/graphs showing progress over time
- Best times display
- Completion counts by difficulty
- Link from navbar when logged in

### 2.3 Crossword Stats
**File:** `crosswords/views.py`, new frontend component
- Add crossword leaderboard view (backend exists, frontend missing)
- Show percent_correct and time_taken stats

---

## Phase 3: Social Sharing (Week 2-3)

### 3.1 Share Results Feature
**New files:** Share component, share utility
- "Share Result" button after puzzle completion
- Generate shareable text: "I completed a Hard Sudoku in 5:32 on Fruzzled! Can you beat my time?"
- Twitter/X share (Web Intent API - no API key needed)
- Facebook share
- Copy to clipboard option
- WhatsApp share link

### 3.2 Challenge Links
**Files:** URL routing, puzzle views
- Generate shareable puzzle links: `fruzzled.ie/sudoku/challenge/[puzzle-id]`
- When opened, shows challenger's time after completion
- "Beat [nickname]'s time of 5:32!"

### 3.3 Open Graph for Shared Links
- Dynamic OG tags for challenge links
- Preview shows puzzle type, difficulty, challenger info

---

## Phase 4: Achievements System (Week 3-4)

### 4.1 Backend Models
**New file:** `achievements/models.py` (new app)
```
Achievement: name, description, icon, criteria_type, criteria_value
PlayerAchievement: player, achievement, earned_at
```

### 4.2 Achievement Definitions
**Initial achievements:**
- First Steps: Complete your first puzzle
- Speed Demon: Complete any puzzle under 3 minutes
- Centurion: Complete 100 puzzles
- Difficulty Master: Complete one puzzle at each difficulty
- Streak achievements: 7-day, 30-day streaks
- Crossword Champion: Complete 10 crosswords
- Perfect Score: 100% correct on a crossword

### 4.3 Achievement Checking Logic
**File:** `achievements/signals.py` or view decorators
- Check achievements on puzzle completion
- Award and notify user of new achievements

### 4.4 Frontend Display
**New files:** Achievements page, achievement notification component
- Achievements page showing earned/locked achievements
- Toast notification when achievement unlocked
- Achievement badges on profile

### 4.5 Streak Tracking
**Extend:** `PlayerProfile` model
- Add `current_streak`, `longest_streak`, `last_played_date` fields
- Update on puzzle completion
- Display streak on home page / stats

---

## Phase 5: Organic Marketing (Ongoing)

### 5.1 Content & Community (No code)
- **Reddit**: Post to r/sudoku, r/crossword, r/puzzles, r/WebGames (follow rules, don't spam)
- **Puzzle forums**: Engage in puzzle communities
- **Product Hunt**: Submit when features are ready

### 5.2 Google Search Console
- Submit sitemap
- Monitor search performance
- Fix any crawl errors

### 5.3 Social Media Presence
- Create Twitter/X account for Fruzzled
- Post daily puzzle hints or interesting crossword clues
- Engage with puzzle community

### 5.4 Word of Mouth Features (code)
- Referral tracking (optional, later phase)
- "Invite friends" feature with tracking

---

## Implementation Priority (Recommended Order)

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Open Graph + Twitter Cards | Low | High (sharing looks good) |
| 2 | Social Sharing buttons | Medium | High (viral potential) |
| 3 | Personal Stats page | Medium | Medium (retention) |
| 4 | Dynamic meta tags (react-helmet) | Medium | Medium (SEO) |
| 5 | Streak tracking | Low | Medium (retention) |
| 6 | Achievements system | High | Medium (retention) |
| 7 | Structured data | Low | Low-Medium (SEO) |
| 8 | Challenge links | Medium | Medium (viral) |

---

## Key Files to Modify

**Frontend:**
- `frontend/index.html` - OG tags, Twitter cards, structured data
- `frontend/package.json` - add react-helmet-async
- `frontend/src/App.jsx` - add new routes
- `frontend/src/components/NavBar.jsx` - add stats link
- New: `frontend/src/components/ShareButton.jsx`
- New: `frontend/src/pages/profile/MyStats.jsx`
- New: `frontend/src/pages/profile/Achievements.jsx`

**Backend:**
- `player_profile/views.py` - stats endpoint
- `player_profile/models.py` - streak fields
- `player_profile/urls.py` - new routes
- New app: `achievements/` (models, views, urls, signals)
- `fruzzled_backend/settings.py` - add achievements app

---

## Success Metrics
- Google Search Console: impressions, clicks, average position
- Usage stats: daily active users, puzzles completed per day
- Social: shares per week, referral traffic
- Retention: returning users, streak lengths
