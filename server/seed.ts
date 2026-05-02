/**
 * Hostly Seed Script
 * ------------------
 * Populates the database with realistic demo data.
 *
 * Admin credentials:
 *   Email:    admin@hostly.com
 *   Password: admin123
 *
 * Staff credentials:
 *   Email:    carlos@hostly.com
 *   Password: staff123
 *
 * Run:  npx tsx server/seed.ts
 */

import Database from "better-sqlite3";
import crypto from "crypto";
import { randomUUID } from "crypto";
import path from "path";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function uid(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

function isoDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function isoTimestamp(daysAgo: number, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() + hourOffset);
  return d.toISOString();
}

const dbPath = path.resolve(process.cwd(), "hostly.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = OFF"); // Temporarily off for clean wipe

// ── Wipe all tables ──
console.log("🗑  Clearing existing data...");
db.exec(`
  DELETE FROM messages;
  DELETE FROM maintenance_requests;
  DELETE FROM bookings;
  DELETE FROM properties;
  DELETE FROM sessions;
  DELETE FROM users;
  DELETE FROM organizations;
`);
db.pragma("foreign_keys = ON");

// ── Organization ──
const orgId = uid("org");
db.prepare("INSERT INTO organizations (id, name, created_at) VALUES (?, ?, ?)").run(
  orgId, "Sunset Stays BA", isoTimestamp(60)
);
console.log("🏢 Created org: Sunset Stays BA");

// ── Users ──
const adminId = uid("usr");
const staffId = uid("usr");

db.prepare(
  "INSERT INTO users (id, org_id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
).run(adminId, orgId, "admin@hostly.com", hashPassword("admin123"), "Sumit Das", "owner", isoTimestamp(60));

db.prepare(
  "INSERT INTO users (id, org_id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
).run(staffId, orgId, "carlos@hostly.com", hashPassword("staff123"), "Carlos Mendez", "staff", isoTimestamp(45));

console.log("👤 Created admin: admin@hostly.com / admin123");
console.log("👤 Created staff: carlos@hostly.com / staff123");

// ── Properties ──
const properties = [
  {
    id: uid("prop"), name: "Palermo Soho Loft",
    address: "Gorriti 4860", city: "Buenos Aires",
    bedrooms: 2, bathrooms: 1, maxGuests: 4,
    wifiPassword: "PalermoLoft2026", emergencyContact: "+54 11 5555 0101",
    checkInInstructions: "Enter through the glass door on Gorriti. Take the elevator to floor 3, apt 3B. The lockbox is next to the door — code is 4860#. Keys are inside.",
    houseRules: "No smoking indoors. Quiet hours 10pm–8am. No parties or events. Maximum 4 guests. Please separate recyclables.",
    status: "active",
  },
  {
    id: uid("prop"), name: "Recoleta Classic",
    address: "Av. Alvear 1891", city: "Buenos Aires",
    bedrooms: 3, bathrooms: 2, maxGuests: 6,
    wifiPassword: "Recoleta#2026", emergencyContact: "+54 11 5555 0202",
    checkInInstructions: "The doorman will greet you at the lobby. Give your name and he'll hand you the keys. Apartment is on floor 7, unit A.",
    houseRules: "No smoking. No pets. Quiet hours 11pm–7am. Please treat the antique furniture with care.",
    status: "active",
  },
  {
    id: uid("prop"), name: "San Telmo Studio",
    address: "Defensa 1234", city: "Buenos Aires",
    bedrooms: 1, bathrooms: 1, maxGuests: 2,
    wifiPassword: "SanTelmo!Wifi", emergencyContact: "+54 11 5555 0303",
    checkInInstructions: "Red door on Defensa street. Ring buzzer 2A. Walk up one flight of stairs. Key is under the mat (we know, classic).",
    houseRules: "No smoking. Be mindful of tango practice in the courtyard after 6pm. Farmers market is on Sundays — street gets busy.",
    status: "active",
  },
  {
    id: uid("prop"), name: "Puerto Madero View",
    address: "Olga Cossettini 1545", city: "Buenos Aires",
    bedrooms: 2, bathrooms: 2, maxGuests: 5,
    wifiPassword: "Dock$View2026", emergencyContact: "+54 11 5555 0404",
    checkInInstructions: "Check in at the building's front desk with your booking confirmation. They'll provide a keycard for the apartment (floor 18, unit B) and the gym/pool.",
    houseRules: "No smoking. Pool hours 7am–10pm. Gym available 24/7 with keycard. No glass on the balcony. Please don't hang anything on the balcony railing.",
    status: "active",
  },
  {
    id: uid("prop"), name: "Tigre River House",
    address: "Paseo Victorica 302", city: "Tigre",
    bedrooms: 4, bathrooms: 3, maxGuests: 8,
    wifiPassword: "RiverHouse!", emergencyContact: "+54 11 5555 0505",
    checkInInstructions: "Take the boat from Estación Fluvial dock (ask for 'Paseo Victorica'). The house has a green dock — you can't miss it. Keys are in the combination lockbox on the front porch: 0302#.",
    houseRules: "No smoking indoors. Life jackets must be worn on the dock after dark. BBQ area must be cleaned after use. No loud music after 9pm — sound carries on the water.",
    status: "active",
  },
];

const insertProp = db.prepare(`
  INSERT INTO properties (id, org_id, name, address, city, image_url, bedrooms, bathrooms, max_guests, wifi_password, check_in_instructions, house_rules, emergency_contact, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of properties) {
  insertProp.run(p.id, orgId, p.name, p.address, p.city, null,
    p.bedrooms, p.bathrooms, p.maxGuests, p.wifiPassword,
    p.checkInInstructions, p.houseRules, p.emergencyContact, p.status);
}
console.log(`🏠 Created ${properties.length} properties`);

// ── Bookings ──
// Mix of: past (checked-out), active (checked-in today), upcoming (confirmed), and one cancelled
const today = isoDate(0);
const bookingsData = [
  // Past bookings (checked out)
  { propertyIdx: 0, guest: "Emma Wilson", email: "emma.w@gmail.com", phone: "+1 415 555 0101", idNum: "US-P987654", checkIn: isoDate(-14), checkOut: isoDate(-9), guests: 2, status: "checked-out", verified: true, notes: "Honeymoon trip" },
  { propertyIdx: 1, guest: "Hans Mueller", email: "hans.m@web.de", phone: "+49 170 555 0202", idNum: "DE-R1234567", checkIn: isoDate(-21), checkOut: isoDate(-14), guests: 4, status: "checked-out", verified: true, notes: "Family vacation" },
  { propertyIdx: 2, guest: "Yuki Tanaka", email: "yuki.t@mail.jp", phone: "+81 90 5555 0303", idNum: "JP-TK8901234", checkIn: isoDate(-10), checkOut: isoDate(-7), guests: 1, status: "checked-out", verified: true, notes: "Solo traveler, photographer" },
  { propertyIdx: 3, guest: "Sofia Rossi", email: "sofia.r@libero.it", phone: "+39 339 555 0404", idNum: "IT-CA4567890", checkIn: isoDate(-30), checkOut: isoDate(-25), guests: 3, status: "checked-out", verified: true, notes: "" },

  // Active bookings (currently staying)
  { propertyIdx: 0, guest: "James Chen", email: "james.chen@outlook.com", phone: "+86 138 5555 0505", idNum: "CN-E12345678", checkIn: isoDate(-2), checkOut: isoDate(3), guests: 2, status: "checked-in", verified: true, notes: "Business trip, needs early checkout on last day" },
  { propertyIdx: 1, guest: "Maria Garcia", email: "maria.g@hotmail.com", phone: "+34 655 555 0606", idNum: "ES-AB1234567", checkIn: isoDate(-1), checkOut: isoDate(5), guests: 5, status: "checked-in", verified: true, notes: "Traveling with elderly parents" },
  { propertyIdx: 4, guest: "Lucas Dubois", email: "lucas.d@orange.fr", phone: "+33 6 55 55 07 07", idNum: "FR-1234567890", checkIn: isoDate(-3), checkOut: isoDate(1), guests: 6, status: "checked-in", verified: true, notes: "Group trip, booked BBQ for tomorrow" },

  // Today arrivals
  { propertyIdx: 2, guest: "Ana Petrova", email: "ana.p@yandex.ru", phone: "+7 916 555 0808", idNum: "", checkIn: today, checkOut: isoDate(4), guests: 2, status: "confirmed", verified: false, notes: "Arriving around 3pm" },
  { propertyIdx: 3, guest: "Oliver Smith", email: "oliver.s@gmail.com", phone: "+44 7700 555 0909", idNum: "", checkIn: today, checkOut: isoDate(7), guests: 2, status: "confirmed", verified: false, notes: "Late flight, arrival around 11pm" },

  // Upcoming bookings
  { propertyIdx: 0, guest: "Priya Sharma", email: "priya.s@gmail.com", phone: "+91 98 5555 1010", idNum: "", checkIn: isoDate(5), checkOut: isoDate(10), guests: 3, status: "confirmed", verified: false, notes: "Anniversary trip" },
  { propertyIdx: 1, guest: "Tom Johnson", email: "tom.j@icloud.com", phone: "+1 212 555 1111", idNum: "", checkIn: isoDate(8), checkOut: isoDate(12), guests: 2, status: "confirmed", verified: false, notes: "" },
  { propertyIdx: 2, guest: "Lina Berger", email: "lina.b@gmx.de", phone: "+49 160 555 1212", idNum: "", checkIn: isoDate(10), checkOut: isoDate(14), guests: 1, status: "confirmed", verified: false, notes: "Digital nomad, needs good wifi" },
  { propertyIdx: 3, guest: "Kai Nakamura", email: "kai.n@me.com", phone: "+81 80 5555 1313", idNum: "", checkIn: isoDate(12), checkOut: isoDate(16), guests: 4, status: "confirmed", verified: false, notes: "Family with 2 kids (ages 5 and 8)" },
  { propertyIdx: 4, guest: "Elena Vasquez", email: "elena.v@gmail.com", phone: "+52 55 5555 1414", idNum: "", checkIn: isoDate(15), checkOut: isoDate(20), guests: 7, status: "confirmed", verified: false, notes: "Birthday celebration, asked about cake delivery" },

  // Cancelled
  { propertyIdx: 0, guest: "Robert Brown", email: "rob.b@yahoo.com", phone: "+1 310 555 1515", idNum: "", checkIn: isoDate(3), checkOut: isoDate(6), guests: 2, status: "cancelled", verified: false, notes: "Cancelled due to flight change" },
];

const insertBooking = db.prepare(`
  INSERT INTO bookings (id, org_id, property_id, guest_name, guest_email, guest_phone, guest_id_number, check_in, check_out, number_of_guests, status, notes, id_verified)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const bookingIds: string[] = [];
for (const b of bookingsData) {
  const id = uid("bk");
  bookingIds.push(id);
  insertBooking.run(
    id, orgId, properties[b.propertyIdx].id,
    b.guest, b.email, b.phone, b.idNum || null,
    b.checkIn, b.checkOut, b.guests,
    b.status, b.notes || null, b.verified ? 1 : 0
  );
}
console.log(`📅 Created ${bookingsData.length} bookings`);

// ── Maintenance Requests ──
const maintenanceData = [
  // Open - high priority
  { propertyIdx: 0, title: "Bathroom faucet leaking", desc: "Hot water faucet in the main bathroom is dripping constantly. Guest reported it yesterday. Need plumber ASAP.", priority: "high", status: "open", assignedTo: null, daysAgo: 1 },
  // Open - medium
  { propertyIdx: 1, title: "Bedroom window stuck", desc: "Window in the master bedroom won't open fully. The latch mechanism seems jammed.", priority: "medium", status: "open", assignedTo: "Carlos Mendez", daysAgo: 3 },
  // In progress
  { propertyIdx: 3, title: "AC not cooling properly", desc: "The air conditioning in the living room is running but not reaching the set temperature. Filter might need replacement.", priority: "high", status: "in-progress", assignedTo: "Carlos Mendez", daysAgo: 2 },
  { propertyIdx: 4, title: "Dock railing loose", desc: "Third railing post on the dock is wobbling. Safety concern — need to get it re-anchored.", priority: "medium", status: "in-progress", assignedTo: "Carlos Mendez", daysAgo: 5 },
  // Resolved
  { propertyIdx: 0, title: "Light bulb replacement", desc: "Kitchen ceiling light burned out. Replaced with LED equivalent.", priority: "low", status: "resolved", assignedTo: "Carlos Mendez", daysAgo: 8 },
  { propertyIdx: 2, title: "Door lock sticking", desc: "Front door key was hard to turn. Lubricated the lock mechanism — working smoothly now.", priority: "medium", status: "resolved", assignedTo: "Carlos Mendez", daysAgo: 12 },
  { propertyIdx: 1, title: "Hot water heater reset", desc: "No hot water reported by guest. Reset the heater — working fine now.", priority: "high", status: "resolved", assignedTo: null, daysAgo: 20 },
];

const insertMaint = db.prepare(`
  INSERT INTO maintenance_requests (id, org_id, property_id, booking_id, title, description, priority, status, assigned_to, created_at, resolved_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const m of maintenanceData) {
  insertMaint.run(
    uid("mnt"), orgId, properties[m.propertyIdx].id, null,
    m.title, m.desc, m.priority, m.status,
    m.assignedTo, isoTimestamp(m.daysAgo),
    m.status === "resolved" ? isoTimestamp(m.daysAgo - 1) : null
  );
}
console.log(`🔧 Created ${maintenanceData.length} maintenance requests`);

// ── Messages (guest conversations) ──
// Conversations for the active bookings so the Messages page has content

// Conversation 1: James Chen (active in Palermo Soho Loft)
const jamesBookingId = bookingIds[4]; // James Chen
const jamesConvo = [
  { sender: "guest", content: "Hi! We just arrived at the apartment. Beautiful place! Quick question — what's the wifi password?", daysAgo: 2, hourOffset: 0 },
  { sender: "ai", content: "Welcome, James! So glad you're enjoying the Palermo Soho Loft. The Wi-Fi password is: PalermoLoft2026. You should find the network name on the router in the living room. Let me know if you need anything else!", daysAgo: 2, hourOffset: 0.01 },
  { sender: "guest", content: "Got it, thanks! Also, any good restaurant recommendations nearby?", daysAgo: 2, hourOffset: 1 },
  { sender: "ai", content: "Great question! Palermo Soho has amazing dining options. I'd recommend exploring the restaurants on the nearby streets — there are excellent parrillas, Italian restaurants, and contemporary Argentine cuisine within walking distance. Would you like me to suggest something specific based on your preferences?", daysAgo: 2, hourOffset: 1.01 },
  { sender: "guest", content: "We love steak! What's the best parrilla around here?", daysAgo: 2, hourOffset: 1.5 },
  { sender: "host", content: "Hey James! I'd personally recommend Don Julio on Guatemala street — it's a 10 min walk from the apartment. Get there early (before 8pm) or expect a 30-45 min wait. The entraña and ojo de bife are incredible. For a more casual option, La Cabrera on Thames is also excellent. Enjoy!", daysAgo: 2, hourOffset: 2 },
  { sender: "guest", content: "Don Julio was AMAZING. Thanks for the rec! One more thing — I need to check out early on our last day (around 6am instead of 11am). Is that okay?", daysAgo: 1, hourOffset: 0 },
  { sender: "host", content: "Absolutely, no problem at all! Just leave the keys in the lockbox by the door (same one you found them in). Safe travels! 🙌", daysAgo: 1, hourOffset: 0.5 },
];

// Conversation 2: Maria Garcia (active in Recoleta Classic)
const mariaBookingId = bookingIds[5]; // Maria Garcia
const mariaConvo = [
  { sender: "guest", content: "Hello! We're checking in this afternoon. My parents are with us and my mother uses a wheelchair — is the building accessible?", daysAgo: 1, hourOffset: -4 },
  { sender: "ai", content: "Thanks for your message! I'm here to help make your stay at Recoleta Classic as comfortable as possible. I can help with check-in instructions, Wi-Fi info, house rules, restaurant recommendations, transportation tips, and more. Just let me know what you need!", daysAgo: 1, hourOffset: -3.99 },
  { sender: "host", content: "Hi Maria! Yes, the building has an elevator and ramp access from the lobby. The doorman (Pablo) will help with luggage. The apartment itself is on one level with wide doorways. The only tricky spot is the bathroom — the shower has a small lip. I can arrange a shower chair if that would help?", daysAgo: 1, hourOffset: -3 },
  { sender: "guest", content: "A shower chair would be wonderful, thank you so much! What time can we check in?", daysAgo: 1, hourOffset: -2.5 },
  { sender: "host", content: "Check-in is anytime after 3pm. I've asked Pablo to have the shower chair ready. He'll greet you at the lobby — just give your name. Welcome to Buenos Aires! 🇦🇷", daysAgo: 1, hourOffset: -2 },
  { sender: "guest", content: "We're here! Pablo was so helpful. The apartment is gorgeous. My parents love it. Thank you!", daysAgo: 1, hourOffset: 2 },
];

// Conversation 3: Lucas Dubois (active in Tigre River House)
const lucasBookingId = bookingIds[6]; // Lucas Dubois
const lucasConvo = [
  { sender: "guest", content: "Bonjour! Can we use the BBQ area tomorrow evening? We'd like to do an asado for the group.", daysAgo: 1, hourOffset: 0 },
  { sender: "ai", content: "Thanks for your message! I'm here to help make your stay at Tigre River House as comfortable as possible. The BBQ area is available for your use. Just remember to clean up after use as per the house rules. Let me know if you need anything else!", daysAgo: 1, hourOffset: 0.01 },
  { sender: "guest", content: "Where can we buy charcoal and meat nearby?", daysAgo: 1, hourOffset: 0.5 },
  { sender: "host", content: "Hi Lucas! Of course, the BBQ is all yours. For supplies: take the boat back to the main dock and walk 2 blocks to 'Carnicería del Puerto' — they have excellent cuts and can pre-season them for you. They also sell charcoal. I'd recommend the vacío and chorizo for a classic asado. There's also a small market right at the dock for drinks and sides. Have an amazing time!", daysAgo: 1, hourOffset: 1 },
  { sender: "guest", content: "Merci beaucoup! One more thing — is it safe to swim in the river?", daysAgo: 0, hourOffset: -3 },
  { sender: "host", content: "I wouldn't recommend swimming in the river — the current can be strong and the water quality varies. But there's a great public pool about a 15-minute boat ride away if you'd like! The house has kayaks in the shed if you want to paddle around the calmer channels.", daysAgo: 0, hourOffset: -2 },
];

const insertMsg = db.prepare(`
  INSERT INTO messages (id, booking_id, sender, content, timestamp) VALUES (?, ?, ?, ?, ?)
`);

const allConvos = [
  { bookingId: jamesBookingId, messages: jamesConvo },
  { bookingId: mariaBookingId, messages: mariaConvo },
  { bookingId: lucasBookingId, messages: lucasConvo },
];

let msgCount = 0;
for (const convo of allConvos) {
  for (const m of convo.messages) {
    insertMsg.run(uid("msg"), convo.bookingId, m.sender, m.content, isoTimestamp(m.daysAgo, -m.hourOffset));
    msgCount++;
  }
}
console.log(`💬 Created ${msgCount} messages across ${allConvos.length} conversations`);

db.close();

console.log("\n✅ Seed complete!");
console.log("────────────────────────────────────");
console.log("  Admin:  admin@hostly.com / admin123");
console.log("  Staff:  carlos@hostly.com / staff123");
console.log("────────────────────────────────────");
console.log(`  ${properties.length} properties`);
console.log(`  ${bookingsData.length} bookings (4 past, 3 active, 2 arriving today, 5 upcoming, 1 cancelled)`);
console.log(`  ${maintenanceData.length} maintenance requests (2 open, 2 in progress, 3 resolved)`);
console.log(`  ${msgCount} messages in ${allConvos.length} guest conversations`);
console.log("────────────────────────────────────\n");
