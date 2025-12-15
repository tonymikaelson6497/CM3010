-- =========================================================
-- CM3010 Database and Advanced Data Techniques
-- Practical 03: Normalisation (0NF → 1NF → 2NF)
-- Case Study: Lion City Events Pte Ltd (Singapore)
-- =========================================================

-- 0NF: RAW DENORMALISED DATA

CREATE TABLE raw_events (
    client_name VARCHAR(100),
    event_date DATE,
    venue VARCHAR(150),
    venue_address VARCHAR(200),
    event_type VARCHAR(50),
    planner_name VARCHAR(100),
    planner_contact VARCHAR(20),
    vendor1 VARCHAR(100),
    vendor2 VARCHAR(100),
    vendor3 VARCHAR(100),
    total_budget_sgd DECIMAL(10,2)
);

-- Sample messy spreadsheet-style data
INSERT INTO raw_events VALUES
('Chen Wei', '2025-06-12', 'Marina Bay Sands',
 '10 Bayfront Ave, Singapore 018956',
 'Wedding', 'Aisha Binte', '91234567',
 'DJ Spin SG', 'Golden Catering', NULL, 45000),

('Chen Wei', '2025-06-12', 'Gardens by the Bay',
 '18 Marina Gardens Dr, Singapore 018953',
 'Wedding', 'Aisha Binte', '91234567',
 'DJ Spin SG', 'Golden Catering', 'Floral Art SG', 45000);

-- 1NF: REMOVE REPEATING GROUPS (VENDORS)

CREATE TABLE events_1nf AS
SELECT client_name, event_date, venue, venue_address, event_type,
       planner_name, planner_contact, total_budget_sgd,
       vendor1 AS vendor
FROM raw_events
WHERE vendor1 IS NOT NULL AND vendor1 != ''
UNION ALL
SELECT client_name, event_date, venue, venue_address, event_type,
       planner_name, planner_contact, total_budget_sgd,
       vendor2
FROM raw_events
WHERE vendor2 IS NOT NULL AND vendor2 != ''
UNION ALL
SELECT client_name, event_date, venue, venue_address, event_type,
       planner_name, planner_contact, total_budget_sgd,
       vendor3
FROM raw_events
WHERE vendor3 IS NOT NULL AND vendor3 != '';

-- 2NF: REMOVE PARTIAL DEPENDENCIES

-- Core reference tables
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) UNIQUE
);

CREATE TABLE planners (
    planner_id INT AUTO_INCREMENT PRIMARY KEY,
    planner_name VARCHAR(100) UNIQUE,
    planner_contact VARCHAR(20)
);

CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_name VARCHAR(150),
    venue_address VARCHAR(200)
);

CREATE TABLE vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(100) UNIQUE
);

-- Core event table (one per client + date)
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    event_date DATE,
    event_type VARCHAR(50),
    planner_id INT,
    total_budget_sgd DECIMAL(10,2),
    UNIQUE KEY unique_event (client_id, event_date),
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (planner_id) REFERENCES planners(planner_id)
);

-- Junction tables (many-to-many)
CREATE TABLE event_venues (
    event_id INT,
    venue_id INT,
    PRIMARY KEY (event_id, venue_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

CREATE TABLE event_vendors (
    event_id INT,
    vendor_id INT,
    PRIMARY KEY (event_id, vendor_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

-- POPULATE NORMALISED TABLES

INSERT INTO clients (client_name)
SELECT DISTINCT client_name FROM events_1nf;

INSERT INTO planners (planner_name, planner_contact)
SELECT DISTINCT planner_name, planner_contact FROM events_1nf;

INSERT INTO venues (venue_name, venue_address)
SELECT DISTINCT venue, venue_address FROM events_1nf;

INSERT INTO vendors (vendor_name)
SELECT DISTINCT vendor FROM events_1nf;

INSERT INTO events (client_id, event_date, event_type, planner_id, total_budget_sgd)
SELECT DISTINCT
    c.client_id,
    e.event_date,
    e.event_type,
    p.planner_id,
    e.total_budget_sgd
FROM events_1nf e
JOIN clients c ON e.client_name = c.client_name
JOIN planners p ON e.planner_name = p.planner_name;

INSERT INTO event_venues (event_id, venue_id)
SELECT DISTINCT
    ev.event_id,
    v.venue_id
FROM events_1nf e
JOIN clients c ON e.client_name = c.client_name
JOIN events ev ON ev.client_id = c.client_id AND ev.event_date = e.event_date
JOIN venues v ON e.venue = v.venue_name;

INSERT INTO event_vendors (event_id, vendor_id)
SELECT DISTINCT
    ev.event_id,
    v.vendor_id
FROM events_1nf e
JOIN clients c ON e.client_name = c.client_name
JOIN events ev ON ev.client_id = c.client_id AND ev.event_date = e.event_date
JOIN vendors v ON e.vendor = v.vendor_name;


-- VERIFICATION QUERIES

-- View normalised events
SELECT * FROM events;

-- View vendors per event
SELECT e.event_id, v.vendor_name
FROM event_vendors ev
JOIN events e ON ev.event_id = e.event_id
JOIN vendors v ON ev.vendor_id = v.vendor_id;
