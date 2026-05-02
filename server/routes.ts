import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ── Supabase Auth client (server-side, service role for admin ops) ──
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client for verifying user tokens
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// ── Validation Schemas ──
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  orgName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const propertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(1).optional(),
  wifiPassword: z.string().nullable().optional(),
  checkInInstructions: z.string().nullable().optional(),
  houseRules: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  status: z.string().optional(),
});

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().min(1),
  guestEmail: z.string().nullable().optional(),
  guestPhone: z.string().nullable().optional(),
  guestIdNumber: z.string().nullable().optional(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  numberOfGuests: z.number().int().min(1).optional(),
  status: z.string().optional(),
  notes: z.string().nullable().optional(),
  idVerified: z.boolean().optional(),
});

const messageSchema = z.object({
  content: z.string().min(1),
  sender: z.string().optional(),
});

const maintenanceSchema = z.object({
  propertyId: z.string().min(1),
  bookingId: z.string().nullable().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
});

// ── Auth middleware — verifies Supabase JWT ──
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  // Verify the JWT with Supabase
  const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !authUser) return res.status(401).json({ error: "Invalid session" });

  // Get profile from our profiles table
  const profile = await storage.getProfileByAuthId(authUser.id);
  if (!profile) return res.status(401).json({ error: "Profile not found" });

  (req as any).user = profile;
  (req as any).orgId = profile.orgId;
  (req as any).authUser = authUser;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Auth Routes ──

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { email, password, name, orgName } = parsed.data;

      // Create org first
      const org = await storage.createOrg(orgName);

      // Create Supabase auth user with metadata
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto-confirm for now
        user_metadata: { name, org_id: org.id, role: "owner" },
      });

      if (authError) {
        if (authError.message?.includes("already been registered")) {
          return res.status(409).json({ error: "Email already registered" });
        }
        throw authError;
      }

      // The trigger creates the profile, but let's ensure it exists
      let profile = await storage.getProfileByAuthId(authData.user.id);
      if (!profile) {
        profile = await storage.createProfile(authData.user.id, org.id, email, name, "owner");
      }

      // Sign in to get a session token
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email, password,
      });
      if (signInError) throw signInError;

      res.status(201).json({
        token: signInData.session.access_token,
        user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role, orgId: profile.orgId },
        org: { id: org.id, name: org.name },
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Email and password required" });
      }
      const { email, password } = parsed.data;

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: "Invalid email or password" });

      const profile = await storage.getProfileByAuthId(data.user.id);
      if (!profile) return res.status(401).json({ error: "Profile not found" });

      const org = await storage.getOrg(profile.orgId);

      res.json({
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role, orgId: profile.orgId },
        org: { id: org?.id, name: org?.name },
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

      const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
      if (error || !data.session) return res.status(401).json({ error: "Invalid refresh token" });

      res.json({
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Refresh failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // Supabase handles session invalidation client-side
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !authUser) return res.status(401).json({ error: "Invalid session" });

    const profile = await storage.getProfileByAuthId(authUser.id);
    if (!profile) return res.status(401).json({ error: "Profile not found" });

    const org = await storage.getOrg(profile.orgId);

    res.json({
      user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role, orgId: profile.orgId },
      org: { id: org?.id, name: org?.name },
    });
  });

  // ── Invite staff (owner only) ──
  app.post("/api/auth/invite", requireAuth, async (req, res) => {
    const user = (req as any).user;
    const orgId = (req as any).orgId;

    if (user.role !== "owner") return res.status(403).json({ error: "Only owners can invite staff" });

    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "All fields required" });

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, org_id: orgId, role: "staff" },
      });
      if (authError) {
        if (authError.message?.includes("already been registered")) {
          return res.status(409).json({ error: "Email already registered" });
        }
        throw authError;
      }

      let profile = await storage.getProfileByAuthId(authData.user.id);
      if (!profile) {
        profile = await storage.createProfile(authData.user.id, orgId, email, name, "staff");
      }

      res.status(201).json({ id: profile.id, email: profile.email, name: profile.name, role: profile.role });
    } catch (err: any) {
      console.error("Invite error:", err);
      res.status(500).json({ error: "Invite failed" });
    }
  });

  // ── Team (authenticated) ──
  app.get("/api/team", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const users = await storage.getProfilesByOrg(orgId);
    res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
  });

  // ── Properties (tenant-scoped) ──
  app.get("/api/properties", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const properties = await storage.getProperties(orgId);
    res.json(properties);
  });

  app.get("/api/properties/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const property = await storage.getProperty(req.params.id);
    if (!property || property.orgId !== orgId) return res.status(404).json({ error: "Not found" });
    res.json(property);
  });

  app.post("/api/properties", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const parsed = propertySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const property = await storage.createProperty(orgId, parsed.data as any);
    res.status(201).json(property);
  });

  app.patch("/api/properties/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const property = await storage.updateProperty(req.params.id, orgId, req.body);
    if (!property) return res.status(404).json({ error: "Not found" });
    res.json(property);
  });

  app.delete("/api/properties/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const deleted = await storage.deleteProperty(req.params.id, orgId);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true });
  });

  // ── Bookings (tenant-scoped) ──
  app.get("/api/bookings", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const bookings = await storage.getBookings(orgId);
    res.json(bookings);
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const booking = await storage.getBooking(req.params.id);
    if (!booking || booking.orgId !== orgId) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  });

  app.post("/api/bookings", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const booking = await storage.createBooking(orgId, parsed.data as any);
    res.status(201).json(booking);
  });

  app.patch("/api/bookings/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const booking = await storage.updateBooking(req.params.id, orgId, req.body);
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  });

  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const deleted = await storage.deleteBooking(req.params.id, orgId);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true });
  });

  // ── Messages (auth required, scoped via booking ownership) ──
  app.get("/api/bookings/:bookingId/messages", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const booking = await storage.getBooking(req.params.bookingId);
    if (!booking || booking.orgId !== orgId) return res.status(404).json({ error: "Not found" });
    const messages = await storage.getMessagesByBooking(req.params.bookingId);
    res.json(messages);
  });

  app.post("/api/bookings/:bookingId/messages", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Content required" });
    const { content, sender } = parsed.data;
    const bookingId = req.params.bookingId;

    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.orgId !== orgId) return res.status(404).json({ error: "Not found" });

    const guestMsg = await storage.createMessage({
      bookingId,
      sender: sender || "guest",
      content,
      timestamp: new Date().toISOString(),
    });

    if (sender === "guest" || !sender) {
      let property = null;
      if (booking) {
        property = await storage.getProperty(booking.propertyId);
      }

      const aiResponse = generateAIResponse(content, property, booking);
      const aiMsg = await storage.createMessage({
        bookingId,
        sender: "ai",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      });

      return res.status(201).json({ guestMessage: guestMsg, aiResponse: aiMsg });
    }

    res.status(201).json({ message: guestMsg });
  });

  // ── Maintenance (tenant-scoped) ──
  app.get("/api/maintenance", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const requests = await storage.getMaintenanceRequests(orgId);
    res.json(requests);
  });

  app.post("/api/maintenance", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const parsed = maintenanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const request = await storage.createMaintenanceRequest(orgId, {
      ...parsed.data as any,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(request);
  });

  app.patch("/api/maintenance/:id", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const request = await storage.updateMaintenanceRequest(req.params.id, orgId, req.body);
    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  });

  // ── Guest Check-in Portal (PUBLIC — no auth required) ──
  app.get("/api/checkin/:bookingId", async (req, res) => {
    const booking = await storage.getBooking(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const property = await storage.getProperty(booking.propertyId);
    res.json({
      guestName: booking.guestName,
      propertyName: property?.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      idVerified: booking.idVerified,
      guestIdNumber: booking.guestIdNumber,
    });
  });

  app.post("/api/checkin/:bookingId/verify", async (req, res) => {
    const booking = await storage.getBooking(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const updated = await storage.updateBooking(req.params.bookingId, booking.orgId, {
      idVerified: true,
      status: "checked-in",
    });
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    const property = await storage.getProperty(updated.propertyId);
    res.json({
      success: true,
      checkInInstructions: property?.checkInInstructions,
      wifiPassword: property?.wifiPassword,
      houseRules: property?.houseRules,
      emergencyContact: property?.emergencyContact,
    });
  });

  // ── Dashboard Stats (tenant-scoped) ──
  app.get("/api/stats", requireAuth, async (req, res) => {
    const orgId = (req as any).orgId;
    const properties = await storage.getProperties(orgId);
    const bookings = await storage.getBookings(orgId);
    const maintenance = await storage.getMaintenanceRequests(orgId);

    const today = new Date().toISOString().split("T")[0];
    const activeBookings = bookings.filter(b => b.checkIn <= today && b.checkOut >= today && b.status !== "cancelled");
    const upcomingBookings = bookings.filter(b => b.checkIn > today && b.status === "confirmed");
    const openMaintenance = maintenance.filter(m => m.status !== "resolved");
    const todayArrivals = bookings.filter(b => b.checkIn === today && b.status !== "cancelled");
    const todayDepartures = bookings.filter(b => b.checkOut === today && b.status !== "cancelled");

    res.json({
      totalProperties: properties.length,
      activeBookings: activeBookings.length,
      upcomingBookings: upcomingBookings.length,
      openMaintenance: openMaintenance.length,
      occupancyRate: properties.length > 0 ? Math.round((activeBookings.length / properties.length) * 100) : 0,
      todayArrivals: todayArrivals.length,
      todayDepartures: todayDepartures.length,
      totalBookings: bookings.length,
    });
  });

  return httpServer;
}

function generateAIResponse(
  question: string,
  property: any,
  booking: any,
): string {
  const q = question.toLowerCase();

  if (q.includes("wifi") || q.includes("internet") || q.includes("password")) {
    return `The Wi-Fi password for ${property?.name || "your property"} is: ${property?.wifiPassword || "Please check with the host"}. You should find the network name on the router in the living room.`;
  }

  if (q.includes("check in") || q.includes("checkin") || q.includes("arrive") || q.includes("arrival") || q.includes("get in")) {
    return `Here are the check-in instructions for ${property?.name || "your property"}:\n\n${property?.checkInInstructions || "Please contact the host for check-in details."}\n\nYour check-in date is ${booking?.checkIn || "as confirmed"}. Let me know if you need any help!`;
  }

  if (q.includes("check out") || q.includes("checkout") || q.includes("leave") || q.includes("departure")) {
    return `Check-out time is 11:00 AM on ${booking?.checkOut || "your departure date"}. Please leave the keys on the kitchen counter and make sure all windows are closed. We hope you had a wonderful stay!`;
  }

  if (q.includes("rule") || q.includes("smoke") || q.includes("party") || q.includes("quiet") || q.includes("noise")) {
    return `Here are the house rules for ${property?.name || "your property"}:\n\n${property?.houseRules || "Please be respectful of neighbors and the property."}\n\nLet me know if you have any questions!`;
  }

  if (q.includes("emergency") || q.includes("urgent") || q.includes("help") || q.includes("problem")) {
    return `For emergencies, please contact: ${property?.emergencyContact || "the property manager"}.\n\nIf it's a maintenance issue, I can log a request for you. Just describe the problem and I'll make sure our maintenance team is notified.`;
  }

  if (q.includes("restaurant") || q.includes("food") || q.includes("eat") || q.includes("dinner") || q.includes("lunch") || q.includes("breakfast")) {
    const area = property?.address?.includes("Palermo") ? "Palermo Soho" : property?.address?.includes("Recoleta") ? "Recoleta" : property?.address?.includes("San Telmo") ? "San Telmo" : "the area";
    return `Great question! ${area} has amazing dining options. I'd recommend exploring the restaurants on the nearby streets — there are excellent parrillas, Italian restaurants, and contemporary Argentine cuisine within walking distance. Would you like me to suggest something specific based on your preferences?`;
  }

  if (q.includes("transport") || q.includes("taxi") || q.includes("uber") || q.includes("bus") || q.includes("subway") || q.includes("subte")) {
    return `Buenos Aires has great public transport! The Subte (subway) is the fastest way around the city. Uber and Cabify both work well here. For taxis, use the official black-and-yellow ones or call Radio Taxi. The nearest Subte station is within walking distance from the apartment. Would you like more specific directions?`;
  }

  if (q.includes("parking") || q.includes("car") || q.includes("garage")) {
    return `There are several parking options near ${property?.name || "the property"}. Most blocks have public parking garages that cost around 3000-5000 ARS per day. Street parking is available but can be competitive. I'd recommend the garage for security and convenience. Would you like the exact address?`;
  }

  return `Thanks for your message! I'm here to help make your stay at ${property?.name || "our property"} as comfortable as possible. I can help with check-in instructions, Wi-Fi info, house rules, restaurant recommendations, transportation tips, and more. Just let me know what you need!`;
}
