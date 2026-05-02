-- ============================================================
-- Hostly — Seed Data for Supabase
-- Run AFTER schema.sql in the SQL Editor
--
-- NOTE: This inserts data directly into tables. For the admin
-- user, you must ALSO create them via Supabase Auth:
--   Dashboard → Authentication → Users → Add User
--   Email: admin@hostly.com  Password: admin123
--   Then copy the UUID and update the profiles INSERT below.
--
-- OR use the app's signup flow, which handles everything.
-- ============================================================

-- Organization
INSERT INTO organizations (id, name) VALUES
  ('org-sunset01', 'Sunset Stays BA');

-- NOTE: After creating the auth user for admin@hostly.com,
-- replace 'REPLACE-WITH-AUTH-UUID' with the actual UUID from
-- Supabase Auth → Users table.
--
-- INSERT INTO profiles (id, org_id, email, name, role) VALUES
--   ('REPLACE-WITH-AUTH-UUID', 'org-sunset01', 'admin@hostly.com', 'Sumit Das', 'owner');

-- Properties
INSERT INTO properties (id, org_id, name, address, city, bedrooms, bathrooms, max_guests, wifi_password, check_in_instructions, house_rules, emergency_contact, status) VALUES
  ('prop-palermo1', 'org-sunset01', 'Palermo Soho Loft', 'Gorriti 4860, Buenos Aires', 'Buenos Aires', 2, 1, 4, 'PalermoLoft2026', 'Enter through the main door using code 4860#. Take elevator to 3rd floor, unit 3B. Lockbox code: 7291. Keys inside.', 'No smoking. No parties. Quiet hours 10PM-8AM. Max 4 guests. Take out trash before checkout.', '+54 11 5555-1234', 'active'),
  ('prop-puerto01', 'org-sunset01', 'Puerto Madero View', 'Olga Cossettini 1545, Buenos Aires', 'Buenos Aires', 2, 2, 5, 'PuertoView2026', 'Building concierge will provide access card. Take elevator to 12th floor. Unit 12A. Parking spot B2 in basement.', 'No smoking. No pets. Pool hours 8AM-10PM. Gym access with room card. Quiet hours 11PM-7AM.', '+54 11 5555-2345', 'active'),
  ('prop-recolet1', 'org-sunset01', 'Recoleta Classic', 'Av. Alvear 1891, Buenos Aires', 'Buenos Aires', 3, 2, 6, 'RecoletaClassic!', 'Ring doorbell at street level. Portero will buzz you in. 2nd floor, door on the left. Key under the mat in hallway.', 'Historic building — please be gentle with doors. No smoking. Quiet hours 10PM-8AM. Recycling bins in kitchen.', '+54 11 5555-3456', 'active'),
  ('prop-santelm1', 'org-sunset01', 'San Telmo Studio', 'Defensa 1234, Buenos Aires', 'Buenos Aires', 1, 1, 2, 'SanTelmo2026', 'Ground floor unit. Street door code: 1234A. Studio is first door on the right. Keys in lockbox next to door (code: 5678).', 'Cozy studio — max 2 guests. No parties. Street can be lively on Sundays (San Telmo Fair). Earplugs in bedside drawer!', '+54 11 5555-4567', 'active'),
  ('prop-tigre001', 'org-sunset01', 'Tigre River House', 'Paseo Victorica 302, Tigre', 'Tigre', 4, 3, 8, 'TigreRiver2026!', 'Drive to marina, take boat taxi to Dock 7. House is 2 min walk from dock. Gate code: 3025. Keys under flower pot.', 'River house rules: life jackets in closet, dock gate must stay locked, BBQ area clean after use, no loud music after 9PM.', '+54 11 5555-5678', 'active');

-- Bookings
INSERT INTO bookings (id, org_id, property_id, guest_name, guest_email, guest_phone, guest_id_number, check_in, check_out, number_of_guests, status, notes, id_verified) VALUES
  ('bk-past0001', 'org-sunset01', 'prop-palermo1', 'Sofia Rossi', 'sofia.r@gmail.com', '+39 333 1234567', 'IT-AB1234567', '2026-02-13', '2026-02-18', 2, 'checked-out', 'Anniversary trip', true),
  ('bk-past0002', 'org-sunset01', 'prop-recolet1', 'Hans Mueller', 'hans.m@web.de', '+49 170 9876543', 'DE-T220001234', '2026-02-22', '2026-03-01', 3, 'checked-out', 'Business + leisure', true),
  ('bk-past0003', 'org-sunset01', 'prop-santelm1', 'Yuki Tanaka', 'yuki.t@yahoo.co.jp', '+81 90 1234 5678', 'JP-TK12345678', '2026-03-05', '2026-03-08', 1, 'checked-out', 'Photography trip for San Telmo Fair', true),
  ('bk-past0004', 'org-sunset01', 'prop-tigre001', 'Emma Wilson', 'emma.w@outlook.com', '+1 415 555 0123', 'US-E12345678', '2026-03-01', '2026-03-06', 4, 'checked-out', 'Family getaway', true),
  ('bk-active01', 'org-sunset01', 'prop-palermo1', 'James Chen', 'james.c@gmail.com', '+86 138 0001 2345', 'CN-E12345678', '2026-03-13', '2026-03-18', 2, 'checked-in', 'Honeymoon', true),
  ('bk-active02', 'org-sunset01', 'prop-recolet1', 'Maria Garcia', 'maria.g@hotmail.com', '+34 612 345 678', 'ES-AAA123456', '2026-03-14', '2026-03-20', 2, 'checked-in', null, true),
  ('bk-active03', 'org-sunset01', 'prop-tigre001', 'Lucas Dubois', 'lucas.d@free.fr', '+33 6 12 34 56 78', 'FR-123456789012', '2026-03-12', '2026-03-16', 3, 'checked-in', 'River activities enthusiast', true),
  ('bk-today001', 'org-sunset01', 'prop-santelm1', 'Ana Petrova', 'ana.p@yandex.ru', '+7 916 123 4567', null, '2026-03-15', '2026-03-19', 1, 'confirmed', 'First time in Buenos Aires', false),
  ('bk-today002', 'org-sunset01', 'prop-puerto01', 'Oliver Smith', 'oliver.s@gmail.com', '+44 7700 900123', null, '2026-03-15', '2026-03-22', 2, 'confirmed', 'Remote work trip — needs good wifi', false),
  ('bk-future01', 'org-sunset01', 'prop-palermo1', 'Priya Sharma', 'priya.s@gmail.com', '+91 98765 43210', null, '2026-03-20', '2026-03-25', 2, 'confirmed', null, false),
  ('bk-future02', 'org-sunset01', 'prop-recolet1', 'Tom Johnson', 'tom.j@icloud.com', '+1 212 555 0456', null, '2026-03-23', '2026-03-27', 1, 'confirmed', 'Business trip', false),
  ('bk-future03', 'org-sunset01', 'prop-santelm1', 'Lina Berger', 'lina.b@gmx.de', '+49 151 12345678', null, '2026-03-25', '2026-03-29', 2, 'confirmed', null, false),
  ('bk-future04', 'org-sunset01', 'prop-puerto01', 'Kai Nakamura', 'kai.n@me.com', '+81 80 9876 5432', null, '2026-03-27', '2026-03-31', 2, 'confirmed', 'Wants early check-in if possible', false),
  ('bk-cancel01', 'org-sunset01', 'prop-palermo1', 'Robert Brown', 'rob.b@yahoo.com', '+1 310 555 0789', null, '2026-03-18', '2026-03-21', 2, 'cancelled', 'Flight cancelled', false),
  ('bk-future05', 'org-sunset01', 'prop-tigre001', 'Elena Vasquez', 'elena.v@gmail.com', '+54 11 4567 8901', null, '2026-03-30', '2026-04-04', 4, 'confirmed', 'Easter family vacation', false);

-- Messages (guest conversations)
INSERT INTO messages (id, booking_id, sender, content, timestamp) VALUES
  ('msg-jc01', 'bk-active01', 'guest', 'Hi! We just arrived at the apartment. Beautiful place! Quick question — what''s the wifi password?', '2026-03-13T15:37:00Z'),
  ('msg-jc02', 'bk-active01', 'ai', 'Welcome, James! So glad you''re enjoying the Palermo Soho Loft. The Wi-Fi password is: PalermoLoft2026. You should find the network name on the router in the living room. Let me know if you need anything else!', '2026-03-13T15:37:05Z'),
  ('msg-jc03', 'bk-active01', 'guest', 'Got it, thanks! Also, any good restaurant recommendations nearby?', '2026-03-13T15:37:30Z'),
  ('msg-jc04', 'bk-active01', 'host', 'Hey James! I''d personally recommend Don Julio on Guatemala street — it''s a 10 min walk from the apartment. Get there early (before 8pm) or expect a 30-45 min wait. The entraña and ojo de bife are incredible. For a more casual option, La Cabrera on Thames is also excellent. Enjoy!', '2026-03-13T16:02:00Z'),
  ('msg-jc05', 'bk-active01', 'guest', 'Don Julio was AMAZING. Thanks for the rec! One more thing — I need to check out early on our last day (around 6am instead of 11am). Is that okay?', '2026-03-13T20:37:00Z'),
  ('msg-jc06', 'bk-active01', 'host', 'Absolutely, no problem at all! Just leave the keys in the lockbox by the door (same one you found them in). Safe travels! 🙌', '2026-03-13T15:37:30Z'),
  ('msg-mg01', 'bk-active02', 'guest', 'Hola! The apartment is gorgeous. One small issue — the hot water takes a long time to warm up in the shower. Is that normal?', '2026-03-14T10:15:00Z'),
  ('msg-mg02', 'bk-active02', 'ai', 'Thanks for letting us know, Maria! In this building, the hot water can take about 2-3 minutes to fully warm up — it''s a central boiler system. If it''s still not hot after 5 minutes, please let me know and I''ll send someone to check. There''s also an electric kettle for quick hot water for tea/mate!', '2026-03-14T10:15:05Z'),
  ('msg-mg03', 'bk-active02', 'guest', 'Ah okay, that makes sense. It''s working now! Also — is there a good coffee shop nearby for working?', '2026-03-14T11:30:00Z'),
  ('msg-mg04', 'bk-active02', 'host', 'For coffee and coworking, check out Cuervo Café on Junín — 5 min walk. Great wifi, excellent flat whites, and they have a quiet back room that''s perfect for working. Also Birkin on Arenales for a more upscale vibe.', '2026-03-14T11:45:00Z'),
  ('msg-mg05', 'bk-active02', 'guest', 'Perfect, heading there now. Thanks!', '2026-03-14T12:00:00Z'),
  ('msg-ld01', 'bk-active03', 'guest', 'Hey! We arrived at the dock but can''t figure out the gate code. Can you help?', '2026-03-12T14:20:00Z'),
  ('msg-ld02', 'bk-active03', 'ai', 'Hi Lucas! Welcome to Tigre River House. The gate code is 3025. Press the numbers then push the gate — it should click open. The house keys are under the large flower pot to the right of the front door. Let me know when you''re settled!', '2026-03-12T14:20:05Z'),
  ('msg-ld03', 'bk-active03', 'guest', 'Got in! This place is incredible. The view from the deck is amazing. Quick question — can we use the kayaks?', '2026-03-12T14:45:00Z'),
  ('msg-ld04', 'bk-active03', 'host', 'Yes, absolutely! The kayaks are in the shed next to the dock. Life jackets are in the hall closet. Just be careful of boat traffic in the main channel — stick to the smaller canals for a more peaceful paddle. The sunset kayak route going north is gorgeous!', '2026-03-12T15:10:00Z'),
  ('msg-ld05', 'bk-active03', 'guest', 'Amazing! Also, is the BBQ available? We bought some meat at the market.', '2026-03-12T17:30:00Z'),
  ('msg-ld06', 'bk-active03', 'host', 'The BBQ (parrilla) is all yours! Charcoal is in the bag next to it under the covered area. There''s chimichurri in the fridge too — homemade by our caretaker. Enjoy the asado! 🥩🔥', '2026-03-12T17:45:00Z'),
  ('msg-ld07', 'bk-active03', 'guest', 'Best. Stay. Ever. That chimichurri is unreal. One question — what time does the last boat taxi run?', '2026-03-12T21:00:00Z'),
  ('msg-ld08', 'bk-active03', 'ai', 'Glad you''re loving it! The last regular boat taxi runs at 10:30 PM on weekdays and 11:00 PM on weekends. After that, you can call a private launch — the number is on the fridge magnet. It costs about 5000 ARS after hours. Let me know if you need anything else!', '2026-03-12T21:00:05Z'),
  ('msg-ld09', 'bk-active03', 'guest', 'Perfect, thanks for all the help!', '2026-03-12T21:15:00Z');

-- Maintenance Requests
INSERT INTO maintenance_requests (id, org_id, property_id, booking_id, title, description, priority, status, assigned_to, created_at, resolved_at) VALUES
  ('mnt-open001', 'org-sunset01', 'prop-palermo1', 'bk-active01', 'Bathroom faucet leaking', 'Hot water faucet in the main bathroom is dripping constantly. Guest reported it yesterday. Need plumber ASAP.', 'high', 'open', null, '2026-03-14T09:00:00Z', null),
  ('mnt-open002', 'org-sunset01', 'prop-recolet1', null, 'Bedroom window stuck', 'Window in the master bedroom won''t open fully. The latch mechanism seems jammed.', 'medium', 'open', 'Carlos Mendez', '2026-03-13T14:00:00Z', null),
  ('mnt-prog001', 'org-sunset01', 'prop-puerto01', null, 'AC not cooling properly', 'The air conditioning in the living room is running but not reaching the set temperature. Filter might need replacement.', 'high', 'in-progress', 'Carlos Mendez', '2026-03-12T11:00:00Z', null),
  ('mnt-prog002', 'org-sunset01', 'prop-tigre001', 'bk-active03', 'Dock railing loose', 'Third railing post on the dock is wobbling. Safety concern — need to get it re-anchored.', 'medium', 'in-progress', 'Carlos Mendez', '2026-03-13T08:00:00Z', null),
  ('mnt-done001', 'org-sunset01', 'prop-palermo1', null, 'Light bulb replacement', 'Kitchen ceiling light burned out. Replaced with LED equivalent.', 'low', 'resolved', 'Carlos Mendez', '2026-03-10T16:00:00Z', '2026-03-10T17:30:00Z'),
  ('mnt-done002', 'org-sunset01', 'prop-santelm1', null, 'Door lock sticking', 'Front door key was hard to turn. Lubricated the lock mechanism — working smoothly now.', 'medium', 'resolved', 'Carlos Mendez', '2026-03-08T10:00:00Z', '2026-03-08T11:00:00Z'),
  ('mnt-done003', 'org-sunset01', 'prop-recolet1', null, 'Hot water heater reset', 'No hot water reported by guest. Reset the heater — working fine now.', 'high', 'resolved', null, '2026-03-06T19:00:00Z', '2026-03-06T19:30:00Z');
