# Hostly — User Personas & Journey Mapping

## Personas

### P1: Owner/Host (Primary — Sumit)
- Manages 2-5 Airbnb properties in Buenos Aires
- All bookings come from Airbnb
- Has on-site person for physical check-ins
- Wants to replace property manager, save 15%+ commission
- **Goals**: See everything at a glance, minimum clicks to handle daily ops
- **Daily ritual**: Morning check — who's arriving today? Any issues? Any messages?
- **Weekly ritual**: Review occupancy, check maintenance backlog, coordinate staff

### P2: On-Site Staff (Cleaner/Maintenance)
- Receives tasks from owner
- Needs: what to do, where, by when
- Does NOT need: bookings, revenue, guest chat
- **Goals**: See my assigned tasks, mark them done, report issues
- **Daily ritual**: Check task list → go to property → mark complete

### P3: Guest (Public, no login)
- Arrives via unique check-in link shared before stay
- Needs: check-in instructions, Wi-Fi, house rules, emergency contact
- Wants to ask questions (AI answers)
- **Goals**: Smooth arrival, get info fast, no friction
- **Journey**: Click link → see property info → verified by on-site staff

---

## Critical Journeys (Priority Order)

### J1: First-Time Setup (Owner) ★★★
**Current**: Sign up → empty dashboard → confused → must discover "Add Property" button
**Ideal**: Sign up → guided onboarding wizard → add first property inline → see it on dashboard
**Shortest path**: 
1. Sign up (name, email, password, org)
2. Immediately prompted: "Add your first property" (inline form, not separate page)
3. After property added: "Add your first booking" 
4. Dashboard shows real data

**UI implications**:
- Dashboard empty state = onboarding wizard, NOT blank page with zeroes
- Progress checklist that persists until setup complete
- CTAs contextual to next logical step

### J2: Morning Check (Owner) ★★★
**Current**: Dashboard shows stats → must click into Bookings/Maintenance separately
**Ideal**: Dashboard shows TODAY's arrivals/departures + urgent items in one glance
**Shortest path**: Open app → see today's timeline → action items highlighted

**UI implications**:
- Dashboard needs "Today" section: arriving, departing, in-house
- Urgent maintenance flagged with count
- Unread messages count
- Quick actions: "Add booking", "Copy check-in link"

### J3: New Booking (Owner) ★★★
**Current**: Navigate to Bookings → click Add → fill form → submit → go back to copy check-in link
**Ideal**: Add booking → auto-generates check-in link → one click to copy/share
**Shortest path**: 
1. Click "+" or "Add Booking" (available from dashboard or bookings page)
2. Select property, enter guest details, dates
3. On success: toast with "Copy check-in link" button right there

**UI implications**:
- Add booking should be accessible from dashboard
- Success state should immediately show the check-in link
- Booking cards/rows should have prominent "copy link" action

### J4: Guest Check-In Flow (Guest + On-Site Staff) ★★
**Current**: Guest gets link → sees property details → staff verifies ID
**Ideal**: Same but with clearer visual hierarchy, step-by-step feel
**Shortest path**: Open link → see property name/photo → see check-in details → staff taps "verify"

**UI implications**:
- Check-in page needs to feel like a branded guest portal, not an admin form
- Large property name, clear sections for instructions/wifi/rules
- Verification is a clear CTA for the on-site person

### J5: Guest Message Handling (Owner) ★★
**Current**: Navigate to Messages → select booking → type response or let AI handle
**Ideal**: See unread count in nav → click → latest conversations on top → AI auto-responds
**Shortest path**: See badge "2 new" → click Messages → respond or let AI handle

**UI implications**:
- Nav badge showing unread count
- Conversations sorted by recency
- Clear visual distinction: guest messages vs host vs AI responses

### J6: Maintenance Tracking (Owner + Staff) ★★
**Current**: Navigate to Maintenance → see flat list → change status via dropdown
**Ideal**: See issues by status (kanban or tabs) → assign → update → resolve
**Shortest path**: Open Maintenance → filter by status → update inline

**UI implications**:
- Status filter tabs (Open / In Progress / Resolved)
- Property name visible on each issue
- Inline status change
- Assigned person clearly shown

### J7: Staff Task View (Staff Member) ★
**Current**: Staff logs in → sees same dashboard as owner → must navigate to Maintenance
**Ideal**: Staff logs in → sees only their assigned tasks and relevant property info
**Shortest path**: Login → "My Tasks" view → complete tasks

**UI implications**:
- Staff role sees filtered navigation (no team management, no bookings details)
- Dashboard for staff = their task list
- (Future: separate staff-optimized view)

---

## Key UI Decisions from Journey Analysis

1. **Dashboard is a command center, not a stats page**
   - Today's timeline (arrivals/departures)
   - Unread messages badge
   - Open maintenance count
   - Quick actions row
   - Onboarding checklist for new users

2. **Every page needs a clear empty state with the ONE thing to do**
   - Properties empty: "Add your first property" with inline guidance
   - Bookings empty: "No bookings yet. Add a property first" or "Add a booking"
   - Maintenance empty: "All clear! No issues reported"

3. **Reduce clicks for most common actions**
   - "Add Booking" accessible from dashboard + bookings page
   - "Copy check-in link" is ONE CLICK from booking row
   - Status changes are inline (no modal needed)

4. **Navigation badges for attention items**
   - Messages: unread count
   - Maintenance: open issues count
   - Bookings: today's arrivals count

5. **Property is the anchor entity**
   - Everything ties back to a property
   - Property cards should show: active bookings, open issues, last activity
   - Property detail could be a future enhancement

6. **Mobile-first for staff journeys**
   - Staff will use phones
   - Task list must work perfectly on mobile
   - Large tap targets for status updates
