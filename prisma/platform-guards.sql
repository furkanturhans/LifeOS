-- Apply after academy.sql and platform.sql. API writes use the trusted server DB role.
ALTER TABLE profession_applications ADD CONSTRAINT profession_status_valid CHECK(status IN ('pending','approved','rejected','suspended'));
ALTER TABLE service_requests ADD CONSTRAINT service_status_valid CHECK(status IN ('open','accepted','completed','cancelled'));
ALTER TABLE service_unlocks ADD CONSTRAINT service_amounts_valid CHECK("feeMilli">=0 AND "offerKurus">=0);
ALTER TABLE travel_departures ADD CONSTRAINT departure_values_valid CHECK(capacity BETWEEN 1 AND 100 AND "priceKurus">0 AND "cancellationHours" BETWEEN 0 AND 168);
ALTER TABLE travel_reservations ADD CONSTRAINT ticket_amounts_valid CHECK("totalKurus">0 AND "commissionKurus">=0 AND "companyKurus">=0 AND "totalKurus"="commissionKurus"+"companyKurus");
ALTER TABLE travel_reservations ADD CONSTRAINT ticket_status_valid CHECK(status IN ('held','paid','cancelled','refund_pending','refunded'));
CREATE UNIQUE INDEX travel_one_paid_seat ON travel_reservations("departureId",seat) WHERE status='paid';
ALTER TABLE taxi_locations ADD CONSTRAINT taxi_coordinates_valid CHECK(latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180);

-- Block direct PostgREST access; membership/fee checks live in authenticated server APIs.
ALTER TABLE profession_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifechat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifechat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifechat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON profession_applications,service_requests,service_unlocks,credit_entries,credit_accounts,credit_purchases,taxi_passes,taxi_locations,lifechat_threads,lifechat_members,lifechat_messages,travel_companies,travel_departures,travel_reservations,users,user_permissions FROM anon,authenticated;
