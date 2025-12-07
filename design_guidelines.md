# Design Guidelines: Universal Auto Profile Creator

## Design Approach

**Reference-Based Hybrid**: Drawing from IMDb's comprehensive profile layouts, LinkedIn's professional presentation, and modern portfolio sites like Behance for visual richness. This is a data-dense, media-rich application requiring clear information hierarchy and visual sophistication.

**Core Principle**: Present aggregated creative data with clarity, credibility, and visual impact. Every element reinforces professional authenticity.

---

## Typography

**Font Stack**:
- Primary: Inter (Google Fonts) - body text, metadata, labels
- Display: Space Grotesk (Google Fonts) - headings, names, project titles

**Hierarchy**:
- Profile name: text-5xl md:text-6xl font-bold (Space Grotesk)
- Section headers: text-2xl md:text-3xl font-semibold
- Project titles: text-xl font-medium
- Body/bio: text-base leading-relaxed
- Metadata/credits: text-sm text-gray-600
- Platform badges: text-xs uppercase tracking-wide font-semibold

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Common pattern: p-6, gap-8, space-y-12, mt-20
- Section padding: py-16 md:py-20
- Card padding: p-6
- Grid gaps: gap-6 md:gap-8

**Container Strategy**:
- Max-width wrapper: max-w-7xl mx-auto px-6
- Profile header: max-w-5xl mx-auto
- Bio/description: max-w-3xl

---

## Component Library

### Profile Header
- Two-column layout on desktop (md:grid-cols-[auto_1fr])
- Left: Large circular profile image (w-32 h-32 md:w-48 md:h-48) with subtle shadow
- Right: Name, role subtitle, quick stats row (projects count, years active, platforms)
- Social/platform links as icon badges below name
- Bio text with max-w-3xl, leading-relaxed

### Project Grid
- Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8
- Each card:
  - Aspect-ratio cover image (16:9 or 2:3 for posters)
  - Overlay gradient on hover for embedded CTAs
  - Title overlay at bottom with semi-transparent backdrop-blur
  - Platform badge (top-right corner, absolute positioning)
  - Year, role, collaborators metadata below image
  - Border radius: rounded-lg
  - Shadow: shadow-md hover:shadow-xl transition

### Platform Badges
- Small pills with platform logos/text
- Size: px-3 py-1 text-xs
- Rounded: rounded-full
- Include platform identifier (IMDb, YouTube, Vimeo icons via Heroicons or Font Awesome)
- Different subtle background treatments per platform for quick recognition

### Media Embeds
- 16:9 aspect ratio containers for video players
- Iframe wrappers with rounded-lg overflow-hidden
- Play button overlay before load
- Caption/description below player

### Source Attribution Tags
- Floating tag system showing data origins
- Small badge-style indicators: "Sourced from IMDb" with icon
- Position: bottom of cards or inline with metadata
- Transparency indicator: text-xs opacity-60

### Data Confidence Indicators
- Visual confidence scoring for AI-generated content
- Progress bar or star rating system
- Tooltip on hover explaining confidence threshold
- Color-coding: green (high), yellow (medium), gray (low confidence)

### Empty States
- Placeholder images for missing profile photos or project art
- Elegant illustration or pattern-based placeholders
- Text explaining "No image available" with visual appeal
- Maintain grid structure even with missing data

---

## Navigation & Structure

**Single-Page Layout**:
- Sticky header with profile name and quick navigation
- Sections: Profile Header → Projects → Credits → Collaborators → Media Gallery
- Smooth scroll between sections
- Back-to-top button appears after scroll

**Section Dividers**:
- Subtle horizontal rules or generous whitespace (space-y-20)
- Section headers with underline accent or side decoration

---

## Images

### Profile Photo
- Circular crop, centered, prominent placement in header
- Fallback: Gradient background with initials if no photo available
- Size: 192px × 192px on desktop, 128px × 128px on mobile

### Project Cover Art
- 16:9 landscape for videos, 2:3 portrait for films/shows
- High-quality, full-bleed within card boundaries
- Lazy loading for performance
- Hover state: slight zoom (scale-105 transition)

### Platform Icons/Logos
- Small, consistent sizing across all badges
- SVG format via Heroicons or Font Awesome
- Include: IMDb, YouTube, Vimeo, Facebook, LinkedIn, TMDB icons

---

## Special Features

**Loading States**: 
- Skeleton screens for profile and project cards while data loads
- Shimmer effect on placeholders

**Interactive Elements**:
- Project cards clickable to expand with full credits/description
- Modal or slide-out panel for detailed project view
- Embedded media players activate on click

**Responsive Behavior**:
- Mobile: Single column, stacked layout
- Tablet: Two-column project grid
- Desktop: Three-column grid with sidebar potential for filters

---

## Accessibility

- All images have descriptive alt text (AI-generated if needed)
- Platform badges have aria-labels
- Keyboard navigation for all interactive elements
- Focus states: ring-2 ring-offset-2
- Sufficient contrast ratios (WCAG AA minimum)
- Screen reader announcements for dynamically loaded content

---

**Overall Aesthetic**: Professional, data-rich, visually engaging portfolio presentation with credibility signals (source tags, platform badges) and media-first design that celebrates creative work while maintaining information clarity.