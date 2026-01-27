# Fruzzled.ie Visibility & User Growth Plan

## Current State
- Sudoku (thousands of puzzles, 4 difficulty levels) and Crosswords (50+) available
- User accounts with PlayerProfile (nickname, country)
- Sudoku leaderboard working
- Crossword leaderboard working
- Usage stats tracking (admin-only)
- Personal stats dashboard (`/stats`)
- Social sharing buttons (Twitter, Facebook, Copy link)
- Challenge links for Sudoku puzzles
- SEO: dynamic meta tags, OG/Twitter cards, structured data, BreadcrumbList schema
- **0 users**

## Goals
- Improve search engine visibility
- Add engagement features (social sharing, personal stats, achievements)
- Organic marketing to attract initial users

---

## Phase 1: Technical SEO (Week 1)

### 1.1 Dynamic Meta Tags [DONE]
**Files:** `frontend/index.html`, `frontend/package.json`, `frontend/src/components/SEO.jsx`
- [x] Install `react-helmet-async`
- [x] Create SEO component for per-page meta tags
- [x] Add unique title/description for each route:
  - Home: "Free Online Sudoku & Crossword Puzzles | Fruzzled"
  - Sudoku: "Play Free Sudoku Online - Easy to Expert | Fruzzled"
  - Crosswords: "Free Crossword Puzzles Online | Fruzzled"

### 1.2 Open Graph & Twitter Cards [DONE]
**File:** `frontend/index.html`, SEO component
- [x] Add Open Graph meta tags (og:title, og:description, og:image, og:url)
- [x] Add Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [x] Create a shareable preview image template (1200x630px SVG at `static/images/fruzzled-og-image.svg`)
- [ ] Convert SVG to PNG for production (social platforms prefer PNG)

### 1.3 Structured Data (JSON-LD) [MOSTLY DONE]
**File:** `frontend/index.html`, `frontend/src/components/SEO.jsx`
- [x] Add WebApplication/Game schema for puzzle pages
- [x] Add BreadcrumbList schema (dynamic per-page)
- [ ] Add Organization schema (optional)

### 1.4 Technical Fixes [MOSTLY DONE]
**Files:** `templates/sitemap.xml`, `fruzzled_backend/urls.py`
- [x] Static sitemap with updated dates and changefreq values
- [x] Sitemap served via Django URL route
- [x] Add canonical tags to prevent duplicate content
- [ ] Consider dynamic sitemap generation (Django sitemap framework)
- [ ] Verify Google Search Console setup

---

## Phase 2: Personal Stats Dashboard (Week 2) [DONE]

### 2.1 Backend API [DONE]
**File:** `player_profile/views.py`
- [x] Create `/api/player_stats/` endpoint returning:
  - Total puzzles completed (sudoku + crossword)
  - Puzzles completed by difficulty
  - Best times per difficulty
  - Recent completions (last 10)
  - Average completion time
  - Streak information

### 2.2 Frontend Stats Page [DONE]
**File:** `frontend/src/pages/stats/MyStats.jsx`
- [x] Personal statistics dashboard
- [x] Best times display
- [x] Completion counts by difficulty
- [x] Streak display
- [x] Recent activity
- [ ] Charts/graphs showing progress over time (optional enhancement)

### 2.3 Crossword Stats [DONE]
**Files:** `crosswords/views.py`, `frontend/src/pages/crossword/CrosswordLeaderboard.jsx`
- [x] Add crossword leaderboard backend view
- [x] Add crossword leaderboard frontend component
- [x] Show percent_correct and time_taken stats
- [x] Leaderboard button after crossword completion

---

## Phase 3: Social Sharing (Week 2-3) [MOSTLY DONE]

### 3.1 Share Results Feature [DONE]
**File:** `frontend/src/components/ShareButton.jsx`
- [x] "Share Result" button after puzzle completion
- [x] Generate shareable text: "I completed a [difficulty] Sudoku on Fruzzled!"
- [x] Twitter/X share (Web Intent API)
- [x] Facebook share
- [x] Copy to clipboard option
- [x] Native Web Share API support (mobile)
- [ ] WhatsApp share link (optional)

### 3.2 Challenge Links [DONE]
**Files:** `sudoku/views.py`, `sudoku/urls.py`, `frontend/src/pages/puzzle/SudokuChallenge.jsx`, `frontend/src/App.jsx`
- [x] Generate shareable puzzle links: `fruzzled.ie/sudoku/challenge/[puzzle-id]`
- [x] Backend endpoint to fetch specific puzzle by ID
- [x] Frontend challenge page component
- [x] ShareButton includes challenge URL when sharing completed puzzles
- [ ] Show challenger's time after completion (requires additional tracking)

### 3.3 Open Graph for Shared Links [PARTIAL]
- [x] Static OG tags in index.html
- [ ] Dynamic OG tags for challenge links (requires SSR or prerendering)

---

## Phase 4: Achievements System (Week 3-4) [PARTIAL]

### 4.1 Backend Models [NOT STARTED]
**New file:** `achievements/models.py` (new app)
```
Achievement: name, description, icon, criteria_type, criteria_value
PlayerAchievement: player, achievement, earned_at
```

### 4.2 Achievement Definitions [NOT STARTED]
**Initial achievements:**
- First Steps: Complete your first puzzle
- Speed Demon: Complete any puzzle under 3 minutes
- Centurion: Complete 100 puzzles
- Difficulty Master: Complete one puzzle at each difficulty
- Streak achievements: 7-day, 30-day streaks
- Crossword Champion: Complete 10 crosswords
- Perfect Score: 100% correct on a crossword

### 4.3 Achievement Checking Logic [NOT STARTED]
**File:** `achievements/signals.py` or view decorators
- Check achievements on puzzle completion
- Award and notify user of new achievements

### 4.4 Frontend Display [NOT STARTED]
**New files:** Achievements page, achievement notification component
- Achievements page showing earned/locked achievements
- Toast notification when achievement unlocked
- Achievement badges on profile

### 4.5 Streak Tracking [DONE]
**File:** `player_profile/models.py`
- [x] Add `current_streak`, `longest_streak`, `last_played_date` fields
- [x] Update on puzzle completion (`update_streak()` method)
- [x] Display streak on home page / stats

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

## Implementation Priority (Updated)

| Priority | Item | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| 1 | Open Graph + Twitter Cards | Low | High | DONE |
| 2 | Social Sharing buttons | Medium | High | DONE |
| 3 | Personal Stats page | Medium | Medium | DONE |
| 4 | Dynamic meta tags (react-helmet) | Medium | Medium | DONE |
| 5 | Streak tracking | Low | Medium | DONE |
| 6 | Challenge links | Medium | Medium | DONE |
| 7 | Crossword leaderboard | Medium | Medium | DONE |
| 8 | BreadcrumbList schema | Low | Low-Medium | DONE |
| 9 | Convert OG image to PNG | Low | Medium | TODO |
| 10 | Achievements system | High | Medium | NOT STARTED |
| 11 | Dynamic sitemap generation | Low | Low | NOT STARTED |

---

## Key Files Reference

**Frontend (Implemented):**
- `frontend/index.html` - OG tags, Twitter cards, structured data
- `frontend/package.json` - react-helmet-async added
- `frontend/src/main.jsx` - HelmetProvider wrapper
- `frontend/src/App.jsx` - routes for challenge, leaderboards
- `frontend/src/components/SEO.jsx` - dynamic meta tags + BreadcrumbList
- `frontend/src/components/ShareButton.jsx` - social sharing
- `frontend/src/pages/stats/MyStats.jsx` - personal stats dashboard
- `frontend/src/pages/puzzle/SudokuChallenge.jsx` - challenge links
- `frontend/src/pages/crossword/CrosswordLeaderboard.jsx` - crossword leaderboard

**Backend (Implemented):**
- `player_profile/views.py` - PlayerStatsView endpoint
- `player_profile/models.py` - streak tracking fields
- `sudoku/views.py` - GetPuzzleById for challenge links
- `crosswords/views.py` - GetCrosswordLeaderboard
- `templates/sitemap.xml` - updated sitemap
- `static/images/fruzzled-og-image.svg` - OG image template

**Backend (Not Started):**
- New app: `achievements/` (models, views, urls, signals)

---

## Success Metrics
- Google Search Console: impressions, clicks, average position
- Usage stats: daily active users, puzzles completed per day
- Social: shares per week, referral traffic
- Retention: returning users, streak lengths

---

## Next Steps (Recommended)
1. Convert `fruzzled-og-image.svg` to PNG for social media compatibility
2. Set up Google Search Console and submit sitemap
3. Implement achievements system for improved retention
4. Consider dynamic OG tags via SSR or prerendering for challenge links
