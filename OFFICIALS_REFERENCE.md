# Official Login Reference Card

Quick reference for testing the 5 government officials and their dedicated appointment management dashboards.

## Officials Overview

| #   | Service                   | Email                       | Password        | Department |
| --- | ------------------------- | --------------------------- | --------------- | ---------- |
| 1   | 🚗 Driving Licence (RTO)  | `rto.officer@govt.in`       | `<SET_DEMO_PASSWORD_IN_ENV>`       | Transport  |
| 2   | 🆔 Aadhaar Services       | `uidai.officer@govt.in`     | `<SET_DEMO_PASSWORD_IN_ENV>`     | UIDAI      |
| 3   | 🏥 Hospital OPD           | `hospital.officer@govt.in`  | `<SET_DEMO_PASSWORD_IN_ENV>`  | Health     |
| 4   | 📋 Municipal Certificates | `municipal.officer@govt.in` | `<SET_DEMO_PASSWORD_IN_ENV>` | Municipal  |
| 5   | 📢 Public Grievance       | `grievance.officer@govt.in` | `<SET_DEMO_PASSWORD_IN_ENV>` | Grievance  |

---

## Detailed Official Profiles

### 1️⃣ **Rajesh Kumar - RTO Officer**

**Role:** Regional Transport Office - Driving Licence Management

- **Email:** `rto.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Assigned Service:** Driving Licence Services
- **Office Hours:** 9:30 AM - 5:00 PM (Mon-Fri)
- **Appointment Capacity:** 4 per 30-min slot
- **Responsibilities:**
  - Review driving licence applications
  - Schedule road tests
  - Process licence renewals
  - Manage test centre bookings

**Dashboard Access:**

1. Go to login screen
2. Select "Official" login mode
3. Enter email & password
4. View all driving licence appointments assigned to you

---

### 2️⃣ **Priya Singh - UIDAI Officer**

**Role:** Unique Identification Authority - Aadhaar Services

- **Email:** `uidai.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Assigned Service:** Aadhaar Services
- **Office Hours:** 9:30 AM - 5:00 PM (Mon-Fri)
- **Appointment Capacity:** 4 per 30-min slot
- **Responsibilities:**
  - Process Aadhaar enrolment
  - Handle corrections & updates
  - Verify identity documents
  - Issue temporary IDs

---

### 3️⃣ **Dr. Arvind Patel - Hospital Coordinator**

**Role:** Government Hospital - OPD Appointment Management

- **Email:** `hospital.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Assigned Service:** Government Hospital OPD Appointment
- **Office Hours:** 9:30 AM - 5:00 PM (Mon-Fri)
- **Appointment Capacity:** 8 per 30-min slot (OPD has higher capacity)
- **Responsibilities:**
  - Manage OPD appointment bookings
  - Assign consultation slots
  - Track patient attendance
  - Coordinate with doctors

---

### 4️⃣ **Sneha Sharma - Municipal Officer**

**Role:** Municipal Corporation - Certificate Services

- **Email:** `municipal.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Assigned Service:** Birth Certificate (+ manages Death & Income certificates)
- **Office Hours:** 9:30 AM - 5:00 PM (Mon-Fri)
- **Appointment Capacity:** 4-5 per 30-min slot
- **Responsibilities:**
  - Process birth certificate applications
  - Issue death certificates
  - Verify income proofs
  - Maintain municipal records

---

### 5️⃣ **Vikram Desai - Grievance Officer**

**Role:** Public Grievance Redressal - Complaint Management

- **Email:** `grievance.officer@govt.in`
- **Password:** `<SET_DEMO_PASSWORD_IN_ENV>`
- **Assigned Service:** Public Grievance & Complaint System
- **Office Hours:** 9:30 AM - 5:00 PM (Mon-Fri)
- **Appointment Capacity:** 10 per 30-min slot (high capacity for grievances)
- **Responsibilities:**
  - Register public complaints
  - Track grievance resolution
  - Escalate critical issues
  - Generate complaint reports

---

## Testing Workflow

### For Each Official

#### Step 1: Citizen Books Appointment

1. **As Citizen:**
   - Login via OTP
   - Ask AI: "Book appointment for [service]" (e.g., driving license)
   - Select available date/time
   - Confirm booking
   - Get appointment reference (e.g., APPT-EF12A4)

#### Step 2: Official Reviews Appointment

1. **As Official:**
   - Logout from citizen account
   - Go to Official Login screen
   - Enter official credentials (from table above)
   - View "Recent Appointments" section
   - See booked appointment with:
     - Citizen ID
     - Service name
     - Appointment date/time (formatted)
     - Booking reference
     - Status: "scheduled"

#### Step 3: Official Manages Appointment

1. **Update Status:**
   - Click "Mark as completed"
   - Appointment status changes to "completed"
   - Appointment moves to completed count in stats

#### Step 4: Verify Isolation

- **Important:** Each official only sees appointments for THEIR service
- Example: RTO Officer cannot see hospital OPD appointments
- This isolation is enforced by the database query filtering

---

## Quick Test Scenarios

### Scenario 1: Full Booking to Management Cycle

```
1. Login as citizen
2. Say "book appointment for driving license"
3. Select date/time
4. Get confirmation with ref APPT-ABC123
5. Logout

6. Login as rto.officer@govt.in
7. See new appointment in dashboard
8. Click "Mark as completed"
9. Confirm status updated
```

### Scenario 2: Multiple Officials Isolation Test

```
1. Book 2 appointments:
   - One for "driving license"
   - One for "aadhaar services"

2. Login as RTO officer
   - See ONLY driving license appointment

3. Logout, Login as UIDAI officer
   - See ONLY aadhaar appointment

4. Verify each official sees only their service
```

### Scenario 3: Peak Hours Load Test

```
1. Book appointments for the same time slot from multiple citizens
2. Check slot capacity doesn't exceed limit
3. Verify "No available slots" after capacity filled
4. Official sees multiple appointments at same time
```

---

## Appointment Details on Official Dashboard

When viewing appointments, officials see:

| Field        | Example                      | Purpose                       |
| ------------ | ---------------------------- | ----------------------------- |
| Service Name | "Driving Licence Services"   | Which service this is for     |
| Citizen ID   | "citizen-abc123"             | Identify the booking citizen  |
| Schedule     | "Mon, 02 Apr 2026, 10:30 AM" | Appointment date/time         |
| Booking Ref  | "APPT-EF12A4"                | Unique reference number       |
| Booked On    | "28 Mar 2026, 02:15 PM"      | When citizen made the booking |
| Status       | "scheduled" or "completed"   | Current appointment stage     |
| Action       | "Mark as completed" button   | Status update control         |

---

## Real-World Usage Notes

### Office Setup

- **Browser/App Access:** Officials access dashboard via web/mobile
- **Kiosk Display:** Can be displayed on office waiting area screen
- **Print Reports:** Appointment lists can be printed for verification

### Appointment Flow

- **Pre-Arrival:** Official reviews appointments for the day
- **At Counter:** Official marks appointment as completed when citizen arrives
- **End of Day:** View all completed appointments for reporting

### Capacity Planning

| Service         | Slots/Day | Capacity | Total Capacity/Day |
| --------------- | --------- | -------- | ------------------ |
| Driving Licence | 12 slots  | 4 each   | 48 citizens/day    |
| Aadhaar         | 12 slots  | 4 each   | 48 citizens/day    |
| Hospital OPD    | 12 slots  | 8 each   | 96 patients/day    |
| Municipal Certs | 12 slots  | 5 each   | 60 citizens/day    |
| Grievance       | 12 slots  | 10 each  | 120 complaints/day |

---

## Troubleshooting Official Login

| Issue                                    | Solution                                          |
| ---------------------------------------- | ------------------------------------------------- |
| "Invalid credentials"                    | Verify email & password match table above exactly |
| Official dashboard shows no appointments | Book appointment as citizen first, then check     |
| Seeing other official's appointments     | Check you logged in with correct email            |
| Can't update status to "completed"       | Appointment must be in "scheduled" state          |

---

## Database Verification

To verify officials are properly set up in Supabase:

```sql
-- Check all 5 officials
SELECT email, full_name, role, s.name as assigned_service
FROM officials o
LEFT JOIN services s ON o.service_id = s.id
ORDER BY email;

-- Should return 5 rows with one service each
```

To verify appointment slots:

```sql
-- Check slots for each service
SELECT
  s.name as service_name,
  COUNT(*) as total_slots,
  COUNT(CASE WHEN is_available THEN 1 END) as available_slots
FROM service_appointment_slots sas
LEFT JOIN services s ON sas.service_id = s.id
GROUP BY s.name
ORDER BY s.name;

-- Should show ~240 slots per service (12/day × 20 working days)
```

