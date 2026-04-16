# Government Service Appointment System

## System Overview

ShipGovApp implements a complete, production-grade appointment booking system for government services with realistic working hours, automatic official assignment, and dedicated official dashboards for managing appointments.

---

## Architecture

### Database Schema

#### Services Table

- **Link:** Each service is assigned to a department
- **Slot Configuration:** Each service has predefined appointment slots with capacity management
- **Service Types:** `document`, `certificate`, `appointment`, `complaint`

#### Officials Table (Enhanced)

- **New Field:** `service_id` (UUID) - Links official to specific service
- **One-to-One per Service:** Each official manages one assigned service
- **Individual Credentials:** Each official has unique email & password

#### Appointment Slots Table

- **Realistic Timings:** 9:30 AM to 5:00 PM, 30-minute intervals
- **Working Days Only:** Mon-Fri (excludes weekends)
- **Capacity Management:** Variable capacity per service type
- **30-Day Seeding:** Pre-populated slots for next 30 days

#### Service Appointments Table (Enhanced)

- **New Field:** `official_id` (UUID) - Auto-assigned on booking
- **Automatic Assignment:** Appointment automatically linked to service's assigned official
- **Complete Track Record:** Stores citizen ref, service, slot, dates/times, status

---

## Five Government Officials

Each official is pre-configured with individual credentials and assigned to one service:

### 1. **RTO Officer - Driving Licence Services**

- **Email:** `rto.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Department:** Transport Department
- **Service:** Driving Licence Services
- **Responsibility:** Manage driving licence applications, renewals, road tests bookings

### 2. **UIDAI Officer - Aadhaar Services**

- **Email:** `uidai.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Department:** Unique Identification Authority (UIDAI)
- **Service:** Aadhaar Services
- **Responsibility:** Manage Aadhaar enrolment, corrections, authentication services

### 3. **Hospital Coordinator - OPD Appointments**

- **Email:** `hospital.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Department:** Health Department
- **Service:** Government Hospital OPD Appointment
- **Responsibility:** Manage hospital OPD appointment bookings and scheduling

### 4. **Municipal Officer - Certificates**

- **Email:** `municipal.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Department:** Municipal Corporation
- **Service:** Birth Certificate
- **Responsibility:** Manage municipal certificates (birth, death, income)

### 5. **Grievance Officer - Public Complaints**

- **Email:** `grievance.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Department:** Public Grievance Redressal
- **Service:** Public Grievance & Complaint System
- **Responsibility:** Manage and track public grievances and complaints

---

## Appointment Slot Configuration

### Working Hours by Service Type

| Service Type             | Hours             | Slots/Day | Capacity     |
| ------------------------ | ----------------- | --------- | ------------ |
| Appointment (OPD)        | 9:30 AM - 5:00 PM | 12        | 8 per slot   |
| Document (Licence, Cert) | 9:30 AM - 5:00 PM | 12        | 4-5 per slot |
| Complaint (Grievance)    | 9:30 AM - 5:00 PM | 12        | 10 per slot  |

### Slot Generation

- **Time Intervals:** 30-minute slots (9:30, 10:00, 10:30, 11:00, 11:30, 2:00 PM, 2:30 PM, 3:00 PM, 3:30 PM, 4:00 PM, 4:30 PM, 5:00 PM)
- **Days Covered:** Next 30 calendar days
- **Excluded:** Weekends (Saturday & Sunday)
- **Total Slots per Service:** ~240 slots (12 slots × ~20 working days)

### Realistic Government Timings

```
Morning Session:  9:30 AM - 1:00 PM
Lunch Break:      1:00 PM - 2:00 PM (not included in slot generation)
Afternoon Session: 2:00 PM - 5:00 PM
```

---

## Appointment Booking Flow

### Citizen Side

1. **Citizen Opens App** → Navigates to "Ask GovGuide AI"
2. **Requests Appointment** → "Book appointment for driving license"
3. **AI Detects Intent** → `type: "book_appointment"`, `query: "driving license"`
4. **Service Lookup** → Finds "Driving Licence Services" via semantic search
5. **Slot Selection** → Available slots displayed (date options, specific times)
6. **Confirmation** → Citizen selects preferred date/time
7. **Booking Execution:**
   - Insert into `service_appointments` with:
     - `citizen_ref`: Citizen's reference ID
     - `service_id`: Service UUID
     - **`official_id`: Auto-fetched RTO officer's UUID** ← Automatic assignment
     - `appointment_date`: Selected date
     - `appointment_time`: Selected time
     - `status`: "scheduled"
8. **Confirmation Delivered:**
   - Appointment reference: `APPT-ABC123`
   - Official assigned: "Rajesh Kumar (RTO)"
   - Scheduled date/time formatted
   - Help note: "Carry valid ID proof, arrive 10 min early"

### Behind the Scenes: Official Assignment

```javascript
// When citizen books appointment
const { data: officials } = await supabase
  .from("officials")
  .select("id")
  .eq("service_id", selectedService.id)
  .eq("is_active", true)
  .limit(1);

const assignedOfficialId = officials?.[0]?.id || null;

// Insert appointment with official_id
await supabase.from("service_appointments").insert([
  {
    citizen_ref,
    service_id,
    official_id: assignedOfficialId, // ← Auto-linked
    appointment_date,
    appointment_time,
  },
]);
```

---

## Official Dashboard

### Login

- Visit official login screen
- Enter credentials (e.g., `rto.officer@govt.in` / `<SET_DEMO_PASSWORD_IN_ENV>`)
- Dashboard displays personalized view

### What Officials See

#### Live Overview Stats

- **Pending Applications:** Count of applications not yet approved/rejected
- **Scheduled Appointments:** Count of upcoming scheduled appointments
- **Completed Appointments:** Count of finished appointments

#### Recent Appointments Section

Only shows appointments assigned to that specific official:

For each appointment, officials can view:

- **Service Name:** "Driving Licence Services"
- **Citizen ID:** Unique reference for the booking citizen
- **Schedule:** Formatted date/time (e.g., "Mon, 02 Apr 2026, 10:30 AM")
- **Booking Reference:** "APPT-EF12A4"
- **Booked On:** Timestamp when citizen made booking
- **Status:** "scheduled" or "completed"
- **Action Button:** "Mark as completed" (moves appointment to next status)

#### Query Filtering

```javascript
// Only fetch appointments for logged-in official
.eq("official_id", auth.user?.id)
.order("appointment_date", { ascending: false })
```

#### Update Appointment Status

- Officials can mark appointments as `completed`
- Status automatically transitions: `scheduled` → `completed`
- UI prevents action if appointment at final stage

---

## Data Flow Diagram

```
Citizen Books Appointment
    ↓
AI Detects "book_appointment" intent
    ↓
Service found (e.g., "Driving Licence Services")
    ↓
Available slots queried for that service
    ↓
Citizen selects date/time
    ↓
Query assigned official for that service
    ↓
Create appointment with official_id + slot details
↓
Appointment inserted into database:
├─ citizen_ref: "citizen-uuid"
├─ service_id: "driving-license-service-uuid"
├─ official_id: "rto-officer-uuid" ← AUTOMATIC
├─ appointment_date: "2026-04-02"
├─ appointment_time: "10:30:00"
└─ status: "scheduled"
    ↓
Confirmation sent to citizen
    ↓
Official's Dashboard Refreshes
    ↓
New appointment appears in "Recent Appointments"
```

---

## API Endpoints & Functions

### `bookAppointmentSlot(citizenRef, serviceQuery)`

**Purpose:** Core booking logic
**Flow:**

1. Find service by query
2. Find available slots
3. Find assigned official
4. Insert appointment with official_id
5. Update slot booking count

**Returns:**

```javascript
{
  ok: true,
  summary: "✓ Appointment booked...",
  payload: {
    appointmentId: "appt-uuid",
    appointmentRef: "APPT-ABC123",
    serviceName: "Driving Licence Services",
    departmentName: "Transport Department",
    appointmentDate: "2026-04-02",
    appointmentTime: "10:30:00",
    status: "scheduled",
    bookedAt: "2026-03-28T10:15:00",
    helpNote: "Carry valid ID proof..."
  }
}
```

### `getAvailableSlots(serviceQuery)`

**Purpose:** Fetch available slots for UI date/time picker
**Returns:**

```javascript
{
  ok: true,
  serviceName: "Driving Licence Services",
  slots: {
    "2026-04-02": [
      { id: "slot-1", time: "09:30:00", available: 4 },
      { id: "slot-2", time: "10:00:00", available: 5 },
      ...
    ],
    "2026-04-03": [...],
    ...
  },
  summary: "127 slots available for Driving Licence Services"
}
```

---

## Database Queries on Official Dashboard

### Fetch Official's Appointments

```sql
SELECT
  sa.id,
  sa.citizen_ref,
  sa.appointment_date,
  sa.appointment_time,
  sa.status,
  sa.created_at,
  s.name as service_name
FROM service_appointments sa
LEFT JOIN services s ON sa.service_id = s.id
WHERE sa.official_id = $1
ORDER BY sa.appointment_date DESC
LIMIT 10
```

---

## Seeding Instructions

### Step 1: Deploy Database Schema

```bash
# In Supabase dashboard:
# SQL Editor → Run the setup.sql
```

### Step 2: Services & Officials Auto-Created

The `setup.sql` file includes:

- 5 departments
- 8 services (5 primary + 3 secondary)
- 5 officials (one per primary service)
- 30-day slot generation

### Step 3: Verify

Login as one of the officials:

```
Email: rto.officer@govt.in
Password: <SET_DEMO_PASSWORD_IN_ENV>
```

You should see their dashboard empty (unless appointments already created).

---

## Testing Checklist

### ✅ Citizen Flow

- [ ] Login as citizen via OTP
- [ ] Search for "driving license" service
- [ ] Say "book appointment for driving license"
- [ ] Verify AI returns available dates/times
- [ ] Confirm booking shows appointment ref
- [ ] Check appointment appears on citizen dashboard

### ✅ Official Flow

- [ ] Logout from citizen account
- [ ] Login as RTO officer (`rto.officer@govt.in` / `<SET_DEMO_PASSWORD_IN_ENV>`)
- [ ] Official dashboard loads
- [ ] "Recent Appointments" section shows booked appointment
- [ ] Appointment displays: citizen ID, date, time, status
- [ ] Click "Mark as completed" button
- [ ] Status updates to "completed"
- [ ] Logout

### ✅ Other Officials

- [ ] Login as UIDAI officer - see ONLY Aadhaar appointments
- [ ] Login as Hospital officer - see ONLY OPD appointments
- [ ] Login as Municipal officer - see ONLY certificate appointments
- [ ] Login as Grievance officer - see ONLY complaint appointments

---

## Key Features

✅ **Realistic Government Timings:** 9:30 AM - 5:00 PM, working days only
✅ **Proper Capacity Management:** Variable capacity per service type
✅ **Automatic Official Assignment:** Appointments auto-linked to service's officer
✅ **Individual Credentials:** Each official has unique login
✅ **Separate Dashboards:** Officials only see their own appointments
✅ **Complete Booking Details:** Date, time, citizen ID, reference number
✅ **Status Tracking:** Appointments progress from scheduled → completed
✅ **30-Day Availability:** Pre-seeded slots for planning
✅ **Production-Ready:** Proper foreign key relationships, error handling, timeouts

---

## Future Enhancements

1. **Multiple Officials per Service:** Load-balancing appointments across officers
2. **Cancellation Flow:** Citizens can cancel; officials can free up slots
3. **Reschedule:** Change appointment date/time with availability check
4. **SMS/Email Reminders:** Notify citizens 1 day before appointment
5. **Slot Analytics:** Track busiest times, no-show rates
6. **Holiday Management:** Mark holidays to exclude from slot generation
7. **Service-Specific Forms:** Additional data collection during booking
8. **Queue Management:** Real-time queue position for waiting appointments

---

## Troubleshooting

### Appointment Not Showing in Official Dashboard

**Issue:** Appointment booked but not visible to official
**Solution:**

- Verify `official_id` is correctly stored in database
- Check official is logged in with correct account
- Query should filter by `WHERE official_id = logged_in_official_id`

### Slots Not Available

**Issue:** "No available slots" error
**Solution:**

- Check `service_appointment_slots` table has records
- Verify `is_available = true` for future dates
- Check `booked_count < capacity` for slots

### Official Can't Access Appointments

**Issue:** Official sees empty appointments list
**Solution:**

- Verify official has `service_id` assigned in `officials` table
- Check no citizens have booked yet
- Test by booking as citizen, then refreshing official dashboard

