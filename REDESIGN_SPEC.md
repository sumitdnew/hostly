# Hostly Redesign Spec — Implementation Guide

## Design System
- **Stack**: React 18 + Tailwind CSS v3 + shadcn/ui + wouter (hash routing)
- **Font**: General Sans (Fontshare)
- **Palette**: Warm hospitality — cream surfaces, terracotta primary (HSL 12 76% 44% light / 12 65% 55% dark)
- **Max heading size**: text-xl (webapp rule)
- **Border radius**: rounded-md (small)
- **Icons**: lucide-react
- **Auth token**: Bearer token in Authorization header, stored in window.__HOSTLY_AUTH_TOKEN__
- **CRITICAL**: Never use localStorage, sessionStorage, cookies — blocked in sandboxed iframes

## Persona-Driven Page Specs

### 1. Dashboard (Command Center)
**Serves**: J1 (first-time setup) + J2 (morning check)

**Empty state (0 properties)**:
- Welcome banner with gradient bg: "Hey {firstName}, let's set up your properties"
- Prominent CTA: "Add Your First Property" 
- Three quick-link cards: Properties, Bookings, Team
- No KPI cards showing zeroes — that's depressing

**Active state (has properties)**:
- Greeting: "Good morning, {firstName}" with subtitle "Here's what's happening across your properties today."
- If setup incomplete: Onboarding checklist (progress bar + steps: account ✓, add property, add booking, invite team)
- KPI row: 4 cards — Properties, Active Stays, Upcoming, Open Issues — each clickable (Link to relevant page)
  - Each card has colored icon in a soft bg circle, large number, label
- "Today" section (only shows if there are today arrivals/departures):
  - "Arriving Today" and "Departing Today" badges with counts
- Two-column: "Upcoming Bookings" (with guest avatar initial, name, property, dates, verification badge) + "Open Maintenance" (with priority-colored icon, title, property, assignee)
- Both have "View all →" links and proper empty states with CTAs

### 2. Properties Page
**Serves**: J1 (setup — add first property)

**Empty state**: 
- Large illustration area with Building2 icon
- "No properties yet" heading
- "Add your first property to start managing bookings and guests."
- Primary CTA button

**Active state**:
- Header: count + "Add Property" button
- Grid of property cards (2-3 columns):
  - Gradient header area with property initial letter (large, centered)
  - Property name (font-semibold), address with MapPin icon
  - Stats row: bedrooms, bathrooms, max guests (with icons)
  - Status badge
  - "Edit" button

### 3. Bookings Page  
**Serves**: J3 (new booking — shortest path)

**Empty state (no properties)**:
- "Add a property first before creating bookings"
- Link to Properties

**Empty state (has properties, no bookings)**:
- "No bookings yet" 
- "Create your first booking and share the check-in link with guests."
- Primary CTA

**Active state**:
- Header: total count + "Add Booking" button
- Status filter tabs: All, Confirmed, Checked In, Checked Out, Cancelled
- Table with columns: Guest (name + email), Property, Dates, ID status, Status badge, Actions (copy link, open portal)
- IMPORTANT: After creating a booking, the success toast should mention the check-in link
- Copy check-in link should be very prominent (not hidden in tiny icon buttons)

### 4. Messages Page
**Serves**: J5 (guest message handling)

**Empty state**:
- "No active conversations"
- "Messages will appear here when guests send questions about their stay."

**Active state**:
- Left panel: booking list with guest name, property, last message preview, unread indicator
- Right panel: chat with clear sender distinction (guest=left, host=right, AI=left with bot icon)
- Input area with "Send as Guest (AI responds)" and "Send as Host" buttons
- Help text explaining the dual-send feature

### 5. Maintenance Page
**Serves**: J6 (maintenance tracking)

**Empty state**:
- CheckCircle2 icon (green tint)
- "All clear — no maintenance issues"
- "When issues arise, you can log and track them here."

**Active state**:
- Status filter tabs: All, Open, In Progress, Resolved
- Cards (not table) with: status icon, title, property name, assignee, priority badge, inline status dropdown
- Sorted: high priority first, then by date

### 6. Team Page
**Serves**: Owner managing staff

**Empty state**:
- "You're the only member"
- "Invite cleaners, maintenance workers, or co-hosts to help manage your properties."

**Active state**:
- Member cards with avatar (initials), name, email, role badge (Owner=primary, Staff=secondary)
- Invite button (owner only)

### 7. Check-In Page (Guest Portal)
**Serves**: J4 (guest check-in)
- Keep current design but ensure it feels like a branded guest portal
- Current implementation is decent — just polish spacing

### 8. Landing Page
- Keep current design — it's already good
- Just ensure CTAs are prominent

## Navigation Badges
The sidebar should show badge counts for:
- Messages: (future — would need unread tracking)
- Maintenance: open issues count
- Bookings: today's arrivals

## Key Implementation Rules
1. Use wouter `Link` component for navigation, NOT window.location
2. Use `useHashLocation` hook in Router
3. All queries use TanStack Query v5 object form
4. Forms use native FormData (current pattern) — don't switch to react-hook-form mid-redesign
5. Keep all existing API endpoints and data shapes
6. Don't break auth flow
7. Every interactive element needs data-testid
8. Use shadcn Card, Button, Badge, Dialog, Table etc.
9. Never nest Card inside Card
