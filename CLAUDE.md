# The Animals Dashboard - Project Context

## Project Overview
A static prototype dashboard for "The Animals" agency showcasing ON Running brand insights. Built with vanilla HTML, CSS, and JavaScript (no frameworks).

## Tech Stack
- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, CSS Variables, Media Queries
- **JavaScript** - Vanilla ES6+
- **Fonts** - Inter (Google Fonts)

## Current Status
- **Phase**: Prototype/MVP
- **Last Updated**: January 2026
- **Mobile Optimization**: Complete with hamburger menu

### Completed Features
- [x] Navigation header with tabs (Live View, Peripheral View, Sources, Settings)
- [x] Brand bar with ON Running logo, hero image, marquee, and live clock
- [x] News Wire section with auto-scroll and source logos
- [x] Culture Pulse section with vertical image gallery and social media filters (TikTok, Reddit, Instagram)
- [x] On The Ground - YouTube Influence with sliding video carousel
- [x] Deterrents/Drivers tabbed section with consumer voices and sources count
- [x] Media Presence bar chart (.com traffic) with metadata icons
- [x] AI Search Visibility section with:
  - Platform breakdown (ChatGPT, AI Overview, AI Mode, Gemini)
  - Score ring visualization
  - Counter animation on hover (numbers count up from 0)
  - Live "Today" badge with pulsating indicator
- [x] Mobile responsive design with hamburger menu
- [x] Coming Soon modal for inactive pages

### Pending Features
- [ ] Peripheral View page
- [ ] Sources page
- [ ] Settings page
- [ ] Backend integration (currently static data)

## File Structure
```
the-animals/
├── index.html              # Main dashboard page
├── css/
│   └── styles.css          # All styles including responsive
├── js/
│   └── main.js             # All JavaScript functionality
├── assets/
│   ├── logo/               # The Animals logo
│   ├── images/
│   │   ├── brand-bar/      # ON Running logo, hero image
│   │   ├── source-logos/   # WSJ, BBC, Reuters, etc.
│   │   └── culture-pulse/  # Culture pulse images
└── CLAUDE.md               # This file
```

## Development Guidelines

### Use Claude Code Plugins
When working on this project, utilize the following plugins:

1. **`/frontend-design`** - Always Use for:
   - Building new UI components
   - Creating polished, production-grade interfaces
   - Designing distinctive visual elements
   - Avoiding generic AI aesthetics

2. **`/feature-dev`** - Always Use for:
   - Planning new feature implementations
   - Understanding existing codebase patterns
   - Architecture decisions
   - Guided development with context

### Code Style
- Use CSS Variables for colors and common values
- Follow BEM-like naming for CSS classes
- Keep JavaScript modular with clear section comments
- Mobile-first responsive approach

### Key CSS Variables
```css
--bg-primary: #D9D9D9;
--bg-card: #ffffff;
--accent-orange: #ff4d00;
--accent-red: #e63946;
--text-primary: #000000;
--text-secondary: #666666;
```

### Responsive Breakpoints
- `1200px` - Tablet landscape / small desktop
- `992px` - Tablet
- `768px` - Mobile (hamburger menu activates)
- `480px` - Small mobile

## Data Sources (Currently Hardcoded)
- `newsData` - News wire articles
- `cultureData` - Culture pulse images with platform tags (tiktok, reddit, instagram)
- `videoData` - YouTube video IDs and metadata
- `voiceData` - Consumer voice quotes (drivers, problems, solutions)

## Running Locally
```bash
# Using npx serve
npx serve -l 3000

# Or any static file server
python -m http.server 3000
```

## Git Repository
- **Remote**: https://github.com/adnanmalik008/the-animals.git
- **Branch**: main
