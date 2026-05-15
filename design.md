# ThriveIndex — Design Document

## Brand Identity
- **Name**: ThriveIndex
- **Tagline**: "A scientifically grounded operating system for a better life."
- **Tone**: Evidence-based, credible, minimal, performance-oriented, calm, modern, non-gimmicky

## Color Palette
- **Primary**: `#1A6B5A` — Deep teal-green (calm, nature, growth)
- **Accent**: `#3ECFA0` — Mint green (vitality, progress)
- **Background Light**: `#F9FAFB`
- **Background Dark**: `#0F1117`
- **Surface Light**: `#FFFFFF`
- **Surface Dark**: `#1C1F26`
- **Foreground Light**: `#111827`
- **Foreground Dark**: `#F3F4F6`
- **Muted Light**: `#6B7280`
- **Muted Dark**: `#9CA3AF`
- **Border Light**: `#E5E7EB`
- **Border Dark**: `#2D3748`
- **Success**: `#22C55E`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

## Typography
- System font (SF Pro on iOS, Roboto on Android)
- Large titles: 28–34px bold
- Section headers: 18–20px semibold
- Body: 15–16px regular
- Captions/muted: 12–13px regular

## Screen List
1. **Onboarding** — Welcome, philosophy, Apple Health connect, threshold setup, priorities
2. **Today** (Home Tab) — Daily Thrive Score, automated metrics, manual reflections
3. **Weekly** (Week Tab) — Weekly habits, weekly reflection, weekly score
4. **Insights** (Insights Tab) — Trend charts, behavioral correlations, personal bests
5. **Profile** (Profile Tab) — Streaks, milestones, thresholds settings, subscription

## Key User Flows
1. **First Launch**: Onboarding → Connect Health → Set thresholds → Today screen
2. **Daily Check-in**: Today tab → View auto-tracked metrics → Complete reflections → See score
3. **Weekly Reflection**: Weekly tab (Sunday) → Answer 3 habit questions → Write journal → See weekly score
4. **Review Progress**: Insights tab → Browse trend charts → Read behavioral insights
5. **Customize**: Profile → Edit thresholds → View streaks/milestones

## Navigation Structure
- **Tab Bar** (4 tabs):
  - Today (house icon)
  - Week (calendar icon)
  - Insights (chart icon)
  - Profile (person icon)
- **Onboarding**: Separate stack, shown only on first launch

## Design Principles
- Whitespace-first layout
- Soft gradients on score cards
- Minimal iconography (SF Symbols)
- Subtle shadows on cards
- No bright neon, no cartoonish elements
- Score displayed as large number with ring/arc progress indicator
- Consistency messaging: "X day streak" shown prominently
