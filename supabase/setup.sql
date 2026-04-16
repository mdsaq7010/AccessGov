-- ShipGovApp demo schema and seed data
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  auth_method VARCHAR(50),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  service_type VARCHAR(100),
  processing_days INTEGER DEFAULT 7,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  auth_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_or_phone VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  auth_method VARCHAR(50),
  expires_at TIMESTAMP NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_ref VARCHAR(255) NOT NULL,
  service_id UUID REFERENCES services(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id),
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  capacity INTEGER DEFAULT 1,
  booked_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, slot_date, slot_time)
);

CREATE TABLE IF NOT EXISTS service_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_ref VARCHAR(255) NOT NULL,
  service_id UUID NOT NULL REFERENCES services(id),
  slot_id UUID REFERENCES service_appointment_slots(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE officials
ADD COLUMN IF NOT EXISTS service_id UUID;

ALTER TABLE service_appointments
ADD COLUMN IF NOT EXISTS official_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'officials_service_id_fkey'
  ) THEN
    ALTER TABLE officials
    ADD CONSTRAINT officials_service_id_fkey
    FOREIGN KEY (service_id) REFERENCES services(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'service_appointments_official_id_fkey'
  ) THEN
    ALTER TABLE service_appointments
    ADD CONSTRAINT service_appointments_official_id_fkey
    FOREIGN KEY (official_id) REFERENCES officials(id);
  END IF;
END $$;

INSERT INTO departments (name, description)
VALUES
  ('Health Department', 'Healthcare services'),
  ('Education Department', 'Education services'),
  ('Transport Department', 'Transportation services'),
  ('Unique Identification Authority (UIDAI)', 'Aadhaar and digital identity services'),
  ('Municipal Corporation', 'Municipal services and certificates'),
  ('Public Grievance Redressal', 'Complaints and grievance management')
ON CONFLICT DO NOTHING;

INSERT INTO services (name, description, department_id, service_type, processing_days)
VALUES
  ('Birth Certificate', 'Apply for birth certificate', (SELECT id FROM departments WHERE name = 'Municipal Corporation' LIMIT 1), 'document', 5),
  ('Passport', 'Apply for passport', (SELECT id FROM departments WHERE name = 'Transport Department' LIMIT 1), 'document', 10),
  ('Driving Licence Services', 'Apply for driving licence and renewals at RTO', (SELECT id FROM departments WHERE name = 'Transport Department' LIMIT 1), 'document', 3),
  ('Aadhaar Services', 'Enrolment, correction, and authentication services', (SELECT id FROM departments WHERE name = 'Unique Identification Authority (UIDAI)' LIMIT 1), 'document', 7),
  ('Government Hospital OPD Appointment', 'Book OPD appointment at government hospitals', (SELECT id FROM departments WHERE name = 'Health Department' LIMIT 1), 'appointment', 1),
  ('Death Certificate', 'Apply for death certificate', (SELECT id FROM departments WHERE name = 'Municipal Corporation' LIMIT 1), 'document', 5),
  ('Income Certificate', 'Apply for income certificate for educational and financial assistance', (SELECT id FROM departments WHERE name = 'Municipal Corporation' LIMIT 1), 'certificate', 10),
  ('Public Grievance & Complaint System', 'File complaints and grievances against government services', (SELECT id FROM departments WHERE name = 'Public Grievance Redressal' LIMIT 1), 'complaint', 14)
ON CONFLICT DO NOTHING;

-- Replace SET_SECURE_PASSWORD_HASH with real password hashes before using in non-demo environments.
INSERT INTO officials (email, full_name, password_hash, role, department_id, service_id, is_active)
VALUES
  ('rto.officer@govt.in', 'Rajesh Kumar - RTO Officer', 'SET_SECURE_PASSWORD_HASH', 'officer', (SELECT id FROM departments WHERE name = 'Transport Department' LIMIT 1), (SELECT id FROM services WHERE name = 'Driving Licence Services' LIMIT 1), TRUE),
  ('uidai.officer@govt.in', 'Priya Singh - UIDAI Officer', 'SET_SECURE_PASSWORD_HASH', 'officer', (SELECT id FROM departments WHERE name = 'Unique Identification Authority (UIDAI)' LIMIT 1), (SELECT id FROM services WHERE name = 'Aadhaar Services' LIMIT 1), TRUE),
  ('hospital.officer@govt.in', 'Dr. Arvind Patel - Hospital Coordinator', 'SET_SECURE_PASSWORD_HASH', 'officer', (SELECT id FROM departments WHERE name = 'Health Department' LIMIT 1), (SELECT id FROM services WHERE name = 'Government Hospital OPD Appointment' LIMIT 1), TRUE),
  ('municipal.officer@govt.in', 'Sneha Sharma - Municipal Officer', 'SET_SECURE_PASSWORD_HASH', 'officer', (SELECT id FROM departments WHERE name = 'Municipal Corporation' LIMIT 1), (SELECT id FROM services WHERE name = 'Birth Certificate' LIMIT 1), TRUE),
  ('grievance.officer@govt.in', 'Vikram Desai - Grievance Officer', 'SET_SECURE_PASSWORD_HASH', 'officer', (SELECT id FROM departments WHERE name = 'Public Grievance Redressal' LIMIT 1), (SELECT id FROM services WHERE name = 'Public Grievance & Complaint System' LIMIT 1), TRUE)
ON CONFLICT (email) DO NOTHING;

UPDATE officials o
SET service_id = s.id
FROM services s
WHERE (
  (o.email = 'rto.officer@govt.in' AND s.name = 'Driving Licence Services') OR
  (o.email = 'uidai.officer@govt.in' AND s.name = 'Aadhaar Services') OR
  (o.email = 'hospital.officer@govt.in' AND s.name = 'Government Hospital OPD Appointment') OR
  (o.email = 'municipal.officer@govt.in' AND s.name = 'Birth Certificate') OR
  (o.email = 'grievance.officer@govt.in' AND s.name = 'Public Grievance & Complaint System')
)
AND (o.service_id IS DISTINCT FROM s.id);

-- Seed realistic appointment slots for next 30 days (government office timings: 9:30 AM - 5:30 PM, Mon-Fri)
-- Different capacity for appointment vs document services
INSERT INTO service_appointment_slots (service_id, slot_date, slot_time, capacity, booked_count, is_available)
SELECT 
  s.id,
  CURRENT_DATE + (offset_days || ' days')::INTERVAL as slot_date,
  (hour || ':' || minute || ':00')::TIME as slot_time,
  CASE 
    WHEN s.service_type = 'appointment' THEN 8
    WHEN s.service_type = 'document' THEN 4
    WHEN s.service_type = 'certificate' THEN 5
    WHEN s.service_type = 'complaint' THEN 10
    ELSE 5
  END as capacity,
  0 as booked_count,
  TRUE as is_available
FROM 
  services s,
  (SELECT generate_series(1, 30) as offset_days) dates,
  (SELECT 9 as hour, 30 as minute UNION SELECT 10, 0 UNION SELECT 10, 30 UNION SELECT 11, 0 
   UNION SELECT 11, 30 UNION SELECT 14, 0 UNION SELECT 14, 30 UNION SELECT 15, 0 
   UNION SELECT 15, 30 UNION SELECT 16, 0 UNION SELECT 16, 30 UNION SELECT 17, 0) times
WHERE EXTRACT(DOW FROM CURRENT_DATE + (offset_days || ' days')::INTERVAL) NOT IN (0, 6)
ON CONFLICT (service_id, slot_date, slot_time) DO NOTHING;
