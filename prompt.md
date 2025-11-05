# **Problem Statement: E-Team Slot Machine** 

## **Executive Summary**

The Edrington Team, the number one real estate team in Chattanooga and North Georgia, is developing an interactive digital slot machine that will gamify and visualize daily lead generation performance across five key sources: Zillow, Realtor.com, Homes.com, Google, and our proprietary "Smart Sign" system.

This slot machine will serve as a centerpiece attraction at conventions and expos, sparking conversations with real estate agents and showcasing our data-driven, tech-focused approach to lead generation with the goal of inspiring them to join The Edrington Team.

### **Business Value**

**Prospect Attraction:** Gamification and friendly competition draw target agents to our booth, creating opportunities for recruitment and engagement.

**Performance Visibility:** Real-time feedback allows team members to see how their lead generation efforts compare and understand their growth potential.

**Social Proof & Branding:**

The slot machine highlights The Edrington Team’s culture of innovation and success, reinforcing our reputation as a top-performing, tech-forward real estate group. By showcasing live results and engagement at events, it creates authentic social proof that strengthens our brand credibility and attracts high-quality agents who want to align with a winning team.

### **Acceptance Criteria**

#### **1\. System Architecture**

AC 1.1: The system shall consist of two separate interfaces:  
iPad controller interface for player input  
TV display interface for slot machine animation and leaderboard  
Both interfaces shall communicate via a centralized Rails backend  
AC 1.2: The system shall use PostgreSQL database to persist:  
Player information  
Spin results for each lead source  
Daily leaderboard data

#### **2\. iPad Controller Interface**

AC 2.1: Form Input  
SHALL display a form accepting player name, email, phone number  
SHALL validate that both fields are required before submission  
SHALL provide clear visual feedback for validation errors  
SHALL display current game state to prevent duplicate submissions  
AC 2.2: Spin Button  
SHALL be disabled when a spin is already in progress or form has not been submitted  
SHALL provide visual feedback on button press  
SHALL trigger the TV display to transition to spinning state  
AC 2.3: State Management  
SHALL display different states: idle, ready, spinning, results  
SHALL poll the backend every 1.5 seconds to sync with TV display  
SHALL prevent multiple simultaneous spins  
SHALL automatically return to idle state after results are displayed

#### **3\. TV Display Interface**

AC 3.1: Leaderboard View  
SHALL display top 10 players by total daily score  
SHALL show top 3 players on a podium with distinct styling:  
1st place: Gold/yellow gradient with crown icon  
2nd place: Silver/gray gradient with medal icon  
3rd place: Bronze/orange gradient with medal icon  
SHALL display players 4-10 in a list format with rank, name, and score  
SHALL show animated entrance for all leaderboard elements  
SHALL update automatically when new scores are submitted  
SHALL display "No spins yet today" message when leaderboard is empty  
SHALL contain visual queues directing attention below the screen where the prize will be displayed.  
AC 3.2: Ready State  
SHALL display player name prominently  
SHALL show 3 second countdown message instructing user to press button to spin  
SHALL animate entrance with smooth transitions  
SHALL display for minimum 3 seconds before allowing spin  
AC 3.3: Spinning State \- Reel Mechanics  
SHALL display 5 vertical reels, one for each lead source:  
Zillow (\#1277e1)  
Realtor.com (\#e61a39)  
Homes.com (\#ff6c2c)  
Google (\#34a853)  
Smart Sign (\#552448)  
Each reel SHALL:  
Start covered with lead source logo  
Reveal with slide-up animation  
Spin through all possible values with smooth animation  
Use 3-phase easing: quick start, smooth middle, dramatic slow finish  
Complete spin in 5 seconds (300 frames at 60fps)  
Display 5 visible items at once (center item largest)  
Show final value with "pop" reveal animation  
SHALL spin reels sequentially (not simultaneously)  
SHALL include 800ms anticipation delay between reels  
SHALL highlight currently spinning reel with glowing border  
SHALL include animation when reel lands on the “feature” (banana icon)  
SHALL trigger bonus reel if 3 reels land on a “feature”  
SHALL randomize value positions on each spin  
AC 3.4: Spinning State \- Visual Effects  
SHALL display animated gradient background throughout experience  
SHALL show shimmer effects on active reel payline  
SHALL use depth with gradient overlays (top and bottom fade)  
SHALL display lead source logo and name above each reel  
SHALL scale and highlight active lead source during its spin  
SHALL show all 5 reels in a row horizontally  
AC 3.5: Spinning State \- Audio Feedback  
SHALL play synthesized sound effects  
Anticipation sound before each reel  
Reveal sound when cover slides away  
Spin start sound  
Tick sounds during final slowdown phase  
Stop sound when reel lands  
AC 3.6: Results Display  
SHALL show player name with "'S TOTAL" suffix  
SHALL display total score as sum of all 5 reel values  
SHALL format score with thousands separator (e.g., "3,500K")  
SHALL use gold gradient text styling  
SHALL display dynamic message based on score:  
≥5000K: "🎉 INCREDIBLE\! LEGENDARY SPIN\! 🎉"  
≥3000K: "🔥 AMAZING\! BIG WIN\! 🔥"  
≥2000K: "⭐ Fantastic performance\! ⭐"  
\<2000K: "Great job\!"  
SHALL add pulsing glow effect for scores ≥3000K  
SHALL remain visible for 5 seconds before returning to leaderboard  
AC 3.7: Special Effects  
SHALL display “big win” animation for scores ≥3000K:  
5-second animation duration  
SHALL trigger screen shake animation for scores ≥3000K:  
1-second duration  
Horizontal shake pattern  
SHALL play victory fanfare for normal wins  
SHALL play epic fanfare for big wins ≥3000K

#### **4\. Reel Values & Scoring**

AC 4.1: Value Distribution  
SHALL support the following value tiers:  
Low: $200K, $250K, $300K (gray color)  
Medium: $375K, $450K, $550K (blue color)  
High: $750K, $1M (purple color)  
Premium: $1.5M, $3M (amber/gold color)  
Special: 🍌 Banana (worth $3M)  
SHALL randomly shuffle value positions on each reel  
SHALL display only 5 values visible at a time per reel  
SHALL use color coding to indicate value tier  
AC 4.2: Near-Miss Detection  
SHALL detect when reel passes premium value (≥$1M) during final approach  
SHALL trigger warning animation and sound for near-misses  
SHALL flash golden border 3 times (0.5s each)  
SHALL play descending warning sound (200-180Hz)

#### **5\. Data Persistence & API**

AC 5.1: Database Schema  
SHALL maintain players table with:  
id (primary key)  
name (string, required)  
player\_id (string, required)  
created\_at, updated\_at timestamps  
SHALL maintain spins table with:  
id (primary key)  
player\_id (foreign key)  
zillow\_value (integer)  
realtor\_value (integer)  
homes\_value (integer)  
google\_value (integer)  
smart\_sign\_value (integer)  
total\_score (integer, calculated)  
created\_at, updated\_at timestamps  
AC 5.2: API Endpoints  
POST /api/players \- Create new player  
Accepts: { name: string, player\_id: string }  
Returns: Player object with ID  
POST /api/game\_state \- Update game state  
Accepts: { state: string, player\_id: int, player\_name: string }  
Returns: Updated state  
GET /api/game\_state \- Get current game state  
Returns: { state: string, player\_id: int, player\_name: string }  
POST /api/spins \- Record spin results  
Accepts: All 5 lead source values and player\_id  
Returns: Spin record with calculated total  
GET /api/spins/leaderboard \- Get daily top 10  
Returns: Array of players with total\_score, ordered descending  
SHALL include only spins from current day  
SHALL fire webhook payload at the end of each attempt containing user’s name, reel values, and boolean for “feature” activated?  
AC 5.3: State Polling  
TV display SHALL poll /api/game\_state every 1 second  
TV display SHALL poll /api/spins/leaderboard every 5 seconds when on leaderboard view  
iPad SHALL poll /api/game\_state every 1.5 seconds after spin initiation  
SHALL use exponential backoff for failed requests

#### **6\. Performance & Optimization**

AC 6.1: Animation Performance  
SHALL maintain 60fps during reel spinning  
SHALL use requestAnimationFrame for smooth animations  
SHALL render only visible reel items (5 per reel)  
SHALL avoid expensive DOM queries during animation frames  
SHALL pause infinite animations when not on active screen  
AC 6.2: Network Optimization  
SHALL use production builds of React (minified)  
SHALL load external dependencies from CDN  
SHALL implement request debouncing where appropriate  
SHALL handle network failures gracefully with error messages

#### **7\. User Experience & Accessibility**

AC 7.1: Visual Design  
SHALL maintain consistent color scheme  
SHALL use large, readable text sizes for TV viewing distance  
SHALL provide sufficient color contrast (WCAG AA minimum)  
AC 7.2: Transitions & Feedback  
SHALL use smooth transitions between all states (0.4-0.6s duration)  
SHALL provide immediate visual feedback for all user actions  
SHALL use scale and fade animations for state changes  
SHALL maintain visual continuity (no jarring cuts)  
AC 7.3: Error Handling  
SHALL display user-friendly error messages for:  
Network failures  
Invalid form submissions  
SHALL log errors to console for debugging  
SHALL gracefully degrade when features unavailable (e.g., audio)

#### **8\. Configuration & Deployment**

AC 8.1: Environment Configuration  
SHALL use .env file for environment-specific settings  
SHALL support configuration of:  
Database credentials  
Rails environment (development/production)  
API polling intervals  
AC 8.2: Asset Management  
SHALL display placeholders or error messages for missing assets  
AC 8.3: Daily Reset  
SHALL automatically filter leaderboard to current day's spins  
SHALL use database timestamps for date comparison  
SHALL support manual reset via admin interface (future enhancement)

#### **9\. Browser Compatibility**

AC 9.1: Supported Browsers  
SHALL support Chromium browser on Raspberry Pi OS  
SHALL support modern browsers (Chrome, Firefox, Safari, Edge) on desktop  
SHALL support iOS Safari on iPad (iOS 14+)  
AC 9.2: Feature Detection  
SHALL detect requestAnimationFrame support before animating  
SHALL provide fallbacks for unsupported CSS features

#### **10\. Testing & Quality Assurance**

AC 10.1: Functional Testing  
SHALL verify all API endpoints return correct data  
SHALL verify form validation works correctly  
SHALL verify game state transitions occur in correct sequence  
SHALL verify scores calculate correctly (sum of 5 values)  
SHALL verify leaderboard sorts by score descending  
AC 10.2: Performance Testing  
SHALL verify no memory leaks during extended operation  
SHALL verify acceptable load times  
AC 10.3: Integration Testing  
SHALL verify iPad and TV display stay synchronized  
SHALL verify multiple iPad devices can control same display  
SHALL verify database persists data correctly  
SHALL verify daily leaderboard filtering works correctly  
