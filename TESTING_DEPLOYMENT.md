# Appointment System - Testing & Deployment Guide

Complete checklist for deploying and testing the appointment booking system.

---

## Phase 1: Database Setup

### ✅ Step 1: Deploy Schema to Supabase

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your ShipGovApp project
3. Go to **SQL Editor**
4. Create a **New Query**
5. Copy entire [supabase/setup.sql](supabase/setup.sql) file content
6. Paste into SQL editor
7. Click **Run** (or Ctrl+Enter)
8. Wait for confirmation: "Query executed successfully"

**What Gets Created:**

- 6 departments
- 8 services with realistic metadata
- 5 officials (one per service) with individual credentials
- ~240 appointment slots per service (30 days, working days, gov hrs)

### ✅ Step 2: Verify Schema in Database

In Supabase SQL Editor, run verification queries:

```sql
-- Verify 5 officials created
SELECT COUNT(*) as official_count FROM officials;
-- Expected: 5

-- Verify officials assigned to services
SELECT email, full_name, s.name as service
FROM officials o
LEFT JOIN services s ON o.service_id = s.id
ORDER BY email;
-- Expected: 5 rows, each with unique service

-- Verify appointment slots seeded
SELECT
  s.name,
  COUNT(*) as slot_count,
  MIN(slot_date) as first_slot,
  MAX(slot_date) as last_slot
FROM service_appointment_slots sas
LEFT JOIN services s ON sas.service_id = s.id
GROUP BY s.name;
-- Expected: 8 services with ~240 slots each, spanning 30 days
```

### ✅ Step 3: Check Environment Variables

Ensure `.env` file has:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
```

Run verification:

```bash
echo $env:EXPO_PUBLIC_SUPABASE_URL  # Windows PowerShell
# Should print your Supabase URL
```

---

## Phase 2: Build & Install

### ✅ Step 4: Clean Build

```bash
# Terminal 1
npm install
npm run lint
# Expected: Exit code 0 (no errors)
```

### ✅ Step 5: Start Metro & Install APK

```bash
# Terminal 1: Start Metro bundler
npm start

# Wait for QR code and "Press a │ open Android" message
```

```bash
# Terminal 2: Build and install APK
npm run android

# Wait for "BUILD SUCCESSFUL" and app to open on emulator/device
```

---

## Phase 3: Citizen Booking Flow

### ✅ Test 3.1: Citizen Login

1. **Open app** on emulator/device
2. **Tap "Citizen"** login button
3. **Enter phone/email** (e.g., `9876543210`)
4. **Tap "Get OTP"**
5. **Wait 2 seconds** (OTP simulated)
6. **Enter OTP** shown in Metro bundler logs
7. **Tap "Verify"**
8. **Expected:** Citizen dashboard loads with welcome message

### ✅ Test 3.2: Search Services

1. **On Citizen Dashboard,** tap "Search services or departments"
2. **Type:** `driving`
3. **Expected:** Search results show "Driving Licence Services"
4. **Tap service**
5. **Expected:** Service details displayed

### ✅ Test 3.3: Book Appointment - Manual

1. **On Citizen Dashboard,** go to **"Ask GovGuide AI"** tab
2. **Send message:** `Book appointment for driving license`
3. **Wait 2-3 seconds** (Gemini API call)
4. **Expected:** AI responds with available dates and asks to confirm
5. **Verify AI response includes:**
   - ✅ Service name: "Driving Licence Services"
   - ✅ Available dates
   - ✅ Time slots
   - ✅ Reference format: "APPT-XXXXXX"

### ✅ Test 3.4: Complete Booking

1. **In AI chat, respond:** `Yes, book for [date/time]` or `Confirm`
2. **Wait 2-3 seconds** (booking execution)
3. **Expected:** Confirmation message with:
   - ✅ Appointment reference (e.g., APPT-EF12A4)
   - ✅ Selected date/time formatted
   - ✅ Department name
   - ✅ Help note: "Carry valid ID proof..."

### ✅ Test 3.5: Verify Citizen Dashboard

1. **Go back to Citizen Dashboard**
2. **Scroll to "My Appointments"**
3. **Expected to see:**
   - ✅ Service: "Driving Licence Services"
   - ✅ Status: "scheduled"
   - ✅ Schedule: Formatted date/time
   - ✅ Booking Ref: "APPT-XXXXXX"
   - ✅ Booked On: Timestamp

---

## Phase 4: Official Dashboard Access

### ✅ Test 4.1: Official Login - RTO Officer

1. **On app login screen,** tap "Official" login
2. **Enter email:** `rto.officer@govt.in`
3. **Enter password:** `<SET_DEMO_PASSWORD_IN_ENV>`
4. **Tap "Login"**
5. **Expected:** Official console dashboard loads

### ✅ Test 4.2: Verify Official Dashboard Header

**Expected to see:**

- ✅ Title: "Official Console"
- ✅ Name: "Rajesh Kumar - RTO Officer" or similar
- ✅ Department: "Transport Department"
- ✅ Refresh & Logout buttons

### ✅ Test 4.3: Verify Stats

On dashboard, look for **"Live Overview"** section:

- ✅ **Pending Applications:** 0 (or count if any)
- ✅ **Scheduled Appointments:** 1 (the one booked in citizen flow)
- ✅ **Completed Appointments:** 0

### ✅ Test 4.4: Verify Appointments Section

Scroll to **"Recent Appointments"** section:

**Expected to see 1 appointment card with:**

- ✅ Service: "Driving Licence Services"
- ✅ Status badge: "scheduled"
- ✅ Citizen ID: (the citizen's reference)
- ✅ Schedule: Formatted date/time (e.g., "Wed, 02 Apr 2026, 10:30 AM")
- ✅ Booking Ref: "APPT-XXXXXX"
- ✅ Booked On: Timestamp
- ✅ Action button: "Mark as completed"

### ✅ Test 4.5: Update Appointment Status

1. **Tap "Mark as completed"** button
2. **Wait 1-2 seconds** (status update)
3. **Expected outcomes:**
   - ✅ Status badge changes to "completed"
   - ✅ Button becomes disabled ("Completed")
   - ✅ "Completed Appointments" stat increases to 1
   - ✅ "Scheduled Appointments" stat decreases to 0

---

## Phase 5: Official Isolation Testing

### ✅ Test 5.1: RTO Officer Sees Only RTO Appointments

1. **Ensure logged in as:** `rto.officer@govt.in`
2. **Verify appointment list shows:** Only driving license appointments
3. **Expected:** Cannot see hospital OPD, Aadhaar, or municipal certificates

### ✅ Test 5.2: Test Other Officials

Repeat official login with each official:

**UIDAI Officer:**

```
Email: uidai.officer@govt.in
Password: <SET_DEMO_PASSWORD_IN_ENV>
Expected: Only Aadhaar service appointments
```

**Hospital Coordinator:**

```
Email: hospital.officer@govt.in
Password: <SET_DEMO_PASSWORD_IN_ENV>
Expected: Only OPD appointment bookings
```

**Municipal Officer:**

```
Email: municipal.officer@govt.in
Password: <SET_DEMO_PASSWORD_IN_ENV>
Expected: Birth/Death/Income certificate appointments
```

**Grievance Officer:**

```
Email: grievance.officer@govt.in
Password: <SET_DEMO_PASSWORD_IN_ENV>
Expected: Public grievance & complaint bookings
```

### ✅ Test 5.3: Verify Data Isolation in DB

Run in Supabase SQL Editor:

```sql
-- Check each official's appointments
SELECT
  o.email,
  s.name as service,
  COUNT(sa.id) as appointment_count
FROM officials o
LEFT JOIN service_appointments sa ON o.id = sa.official_id
LEFT JOIN services s ON o.service_id = s.id
GROUP BY o.email, s.name
ORDER BY o.email;

-- Each official should see only their service's appointments
```

---

## Phase 6: Advanced Testing

### ✅ Test 6.1: Capacity Limits

1. **Book multiple appointments** for same time slot
2. **Create 4 citizens** and book them for same slot/time
3. **On 5th booking attempt,** expect error: "No available slots"
4. **Official dashboard** shows all 4 appointments for that slot

```sql
-- Verify capacity enforcement
SELECT slot_date, slot_time, capacity, booked_count
FROM service_appointment_slots
WHERE service_id = (SELECT id FROM services WHERE name = 'Driving Licence Services' LIMIT 1)
LIMIT 5;
```

### ✅ Test 6.2: Realistic Time Slots

1. **From citizen perspective,** request appointment
2. **Verify only working hours appear:** 9:30 AM, 10:00 AM, 10:30 AM, ... 5:00 PM
3. **Verify no weekend slots** are available
4. **Verify 30-minute intervals** between slots

### ✅ Test 6.3: AI Chat Integration

1. **In AI assistant,** ask: `What are available slots for aadhaar?`
2. **Expected:** AI returns list of dates and times
3. **Ask:** `Book for [date] at [time]`
4. **AI executes booking** and confirms

### ✅ Test 6.4: Multi-Service Booking

1. **Book appointment for Service A** (e.g., driving license)
2. **Book appointment for Service B** (e.g., aadhaar)
3. **Login as Service A official** - see only Service A appointment
4. **Login as Service B official** - see only Service B appointment
5. **On citizen dashboard** - see both appointments

---

## Phase 7: Regression Testing

### ✅ Test 7.1: Citizen Dashboard All Views

- [ ] All buttons clickable
- [ ] Service search works
- [ ] Department listing works
- [ ] My Applications section shows (even if empty)
- [ ] My Appointments section shows booked appointments
- [ ] AI Assistant accessible and responsive

### ✅ Test 7.2: Official Dashboard Filters

1. **Try Application Status filters:** all, draft, submitted, in_review, approved
2. **Try Appointment Status filters:** all, scheduled, completed, cancelled
3. **Try Date filters:** all, today, upcoming
4. **Try Reset button** - all filters clear

### ✅ Test 7.3: Navigation & Logout

- [ ] Can navigate without crashes
- [ ] Logout works correctly
- [ ] Redirects to login screen
- [ ] Cannot access protected screens after logout

---

## Phase 8: Performance Testing

### ✅ Test 8.1: Dashboard Load Time

1. **Login as official**
2. **Measure load time:** Should be < 3 seconds
3. **Tap Refresh button** - should re-load in < 2 seconds

### ✅ Test 8.2: Appointment List Rendering

1. **With 10 appointments** - should render immediately
2. **Scroll smoothly** without lag
3. **No memory warnings** in console

### ✅ Test 8.3: Slot Fetching

1. **Request appointment booking**
2. **Slots should appear** within 1-2 seconds
3. **Scrolling slot list** should be smooth

---

## Phase 9: Deployment Checklist

### Pre-Release

- [ ] All tests from Phase 3-8 passing
- [ ] No console errors in Metro bundler
- [ ] Lint/type check: `npm run lint` exits 0
- [ ] Database schema verified in Supabase
- [ ] All 5 officials can login
- [ ] All 5 officials see only their service appointments
- [ ] Appointment capacity working correctly
- [ ] Documentation reviewed ([APPOINTMENT_SYSTEM.md](APPOINTMENT_SYSTEM.md), [OFFICIALS_REFERENCE.md](OFFICIALS_REFERENCE.md))

### Production Build

```bash
# Build APK for testing
npm run build:apk

# Build AAB for Play Store (if deploying)
npm run build:aab
```

### Release Notes

**Version 1.0 - Appointment System Launch**

Features:

- ✅ 5 government services with appointments
- ✅ 5 official accounts with dedicated dashboards
- ✅ Realistic government office timings (9:30 AM - 5:00 PM)
- ✅ Automatic appointment assignment to officials
- ✅ Capacity-managed appointment slots
- ✅ Status tracking (scheduled → completed)

Known Limitations:

- Single official per service (can extend to load-balance)
- No appointment cancellation yet
- No SMS/email notifications yet
- No holiday calendar management yet

---

## Troubleshooting During Testing

### "App crashes on official dashboard login"

**Solution:**

```bash
# Stop Metro (Ctrl+C in Terminal 1)
# Uninstall app: adb uninstall com.shipgov.app
# Clean build:
npm run android
```

### "Official doesn't see booked appointment"

**Check:**

1. Verify `official_id` is stored in appointment:

```sql
SELECT official_id, service_id FROM service_appointments WHERE id = 'appointment-id';
```

2. Verify official has correct service_id:

```sql
SELECT id, email, service_id FROM officials WHERE email = 'rto.officer@govt.in';
```

3. Make sure official_id values match

### "No slots available after booking just one"

**Check:**

1. Verify slot capacity:

```sql
SELECT capacity, booked_count FROM service_appointment_slots WHERE id = 'slot-id';
```

2. For document services, capacity should be 4-5, not 1

### "Official sees all appointments across services"

**Check:**

```
-- Query being used
WHERE official_id = ?
-- Make sure this filter is NOT being removed
```

---

## Success Criteria

### ✅ System Ready When:

1. **Citizen can book** appointment → appointment appears in their dashboard
2. **Official can login** with their credentials
3. **Official sees** only appointments assigned to their service
4. **Official can update** appointment status → stats update in real-time
5. **Different officials** don't see each other's appointments
6. **Capacity enforced** → slot fills up and shows unavailable
7. **Time slots realistic** → 9:30 AM to 5:00 PM, working days only
8. **No console errors** in Metro bundler logs
9. **Lint passes** with exit code 0
10. **Database verified** with all officials and slots seeded

---

## Next Steps After Deployment

1. **User Training:** Brief officials on using dashboard
2. **Monitor Logs:** Watch for errors in first week
3. **Collect Feedback:** Ask officials what features to add
4. **Plan v1.1:**
   - Appointment cancellation
   - SMS reminders
   - Holiday calendar
   - Load-balancing across multiple officials

