import {
  type Organization,
  type User, type SafeUser,
  type Property, type InsertProperty,
  type Booking, type InsertBooking,
  type Message, type InsertMessage,
  type MaintenanceRequest, type InsertMaintenance,
} from "@shared/schema";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Supabase admin client (uses service role key for server-side ops) ──

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Create `./.env` (or copy `.env.example` → `.env`) and fill in your Supabase credentials.\n" +
    "Supabase dashboard: Project → Settings → API."
  );
  process.exit(1);
}

// Service role client bypasses RLS — used on the server for all DB operations
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Row Mappers ──

function rowToOrg(row: any): Organization {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

function rowToSafeUser(row: any): SafeUser {
  return {
    id: row.id,
    orgId: row.org_id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    passwordHash: "",
  };
}

function rowToProperty(row: any): Property {
  return {
    id: row.id, orgId: row.org_id, name: row.name, address: row.address,
    city: row.city, imageUrl: row.image_url, bedrooms: row.bedrooms,
    bathrooms: row.bathrooms, maxGuests: row.max_guests,
    wifiPassword: row.wifi_password, checkInInstructions: row.check_in_instructions,
    houseRules: row.house_rules, emergencyContact: row.emergency_contact,
    status: row.status,
  };
}

function rowToBooking(row: any): Booking {
  return {
    id: row.id, orgId: row.org_id, propertyId: row.property_id,
    guestName: row.guest_name, guestEmail: row.guest_email,
    guestPhone: row.guest_phone, guestIdNumber: row.guest_id_number,
    checkIn: row.check_in, checkOut: row.check_out,
    numberOfGuests: row.number_of_guests, status: row.status,
    notes: row.notes, idVerified: Boolean(row.id_verified),
  };
}

function rowToMessage(row: any): Message {
  return {
    id: row.id, bookingId: row.booking_id, sender: row.sender,
    content: row.content, timestamp: row.timestamp,
  };
}

function rowToMaintenance(row: any): MaintenanceRequest {
  return {
    id: row.id, orgId: row.org_id, propertyId: row.property_id,
    bookingId: row.booking_id, title: row.title, description: row.description,
    priority: row.priority, status: row.status, assignedTo: row.assigned_to,
    createdAt: row.created_at, resolvedAt: row.resolved_at,
  };
}

// ── Storage Interface ──

export interface IStorage {
  // Auth
  createOrg(name: string): Promise<Organization>;
  getOrg(id: string): Promise<Organization | undefined>;
  getProfileByAuthId(authId: string): Promise<SafeUser | undefined>;
  getProfilesByOrg(orgId: string): Promise<SafeUser[]>;
  createProfile(authId: string, orgId: string, email: string, name: string, role: string): Promise<SafeUser>;

  // Properties (tenant-scoped)
  getProperties(orgId: string): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(orgId: string, p: InsertProperty): Promise<Property>;
  updateProperty(id: string, orgId: string, p: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string, orgId: string): Promise<boolean>;

  // Bookings (tenant-scoped)
  getBookings(orgId: string): Promise<Booking[]>;
  getBookingsByProperty(propertyId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(orgId: string, b: InsertBooking): Promise<Booking>;
  updateBooking(id: string, orgId: string, b: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string, orgId: string): Promise<boolean>;

  // Messages
  getMessagesByBooking(bookingId: string): Promise<Message[]>;
  createMessage(m: InsertMessage): Promise<Message>;

  // Maintenance (tenant-scoped)
  getMaintenanceRequests(orgId: string): Promise<MaintenanceRequest[]>;
  getMaintenanceByProperty(propertyId: string): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined>;
  createMaintenanceRequest(orgId: string, m: InsertMaintenance): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: string, orgId: string, m: Partial<InsertMaintenance>): Promise<MaintenanceRequest | undefined>;
}

// ── Supabase Storage Implementation ──

export class SupabaseStorage implements IStorage {
  private db: SupabaseClient;

  constructor() {
    this.db = supabase;
  }

  // ── Auth / Org ──

  async createOrg(name: string): Promise<Organization> {
    const { data, error } = await this.db
      .from("organizations")
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    return rowToOrg(data);
  }

  async getOrg(id: string): Promise<Organization | undefined> {
    const { data, error } = await this.db
      .from("organizations")
      .select()
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return rowToOrg(data);
  }

  async getProfileByAuthId(authId: string): Promise<SafeUser | undefined> {
    const { data, error } = await this.db
      .from("profiles")
      .select()
      .eq("id", authId)
      .single();
    if (error || !data) return undefined;
    return rowToSafeUser(data);
  }

  async getProfilesByOrg(orgId: string): Promise<SafeUser[]> {
    const { data, error } = await this.db
      .from("profiles")
      .select()
      .eq("org_id", orgId)
      .order("created_at");
    if (error) throw error;
    return (data || []).map(rowToSafeUser);
  }

  async createProfile(authId: string, orgId: string, email: string, name: string, role: string): Promise<SafeUser> {
    const { data, error } = await this.db
      .from("profiles")
      .insert({ id: authId, org_id: orgId, email, name, role })
      .select()
      .single();
    if (error) throw error;
    return rowToSafeUser(data);
  }

  // ── Properties ──

  async getProperties(orgId: string): Promise<Property[]> {
    const { data, error } = await this.db
      .from("properties")
      .select()
      .eq("org_id", orgId)
      .order("name");
    if (error) throw error;
    return (data || []).map(rowToProperty);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const { data, error } = await this.db
      .from("properties")
      .select()
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return rowToProperty(data);
  }

  async createProperty(orgId: string, p: InsertProperty): Promise<Property> {
    const { data, error } = await this.db
      .from("properties")
      .insert({
        org_id: orgId,
        name: p.name,
        address: p.address,
        city: p.city,
        image_url: p.imageUrl ?? null,
        bedrooms: p.bedrooms ?? 1,
        bathrooms: p.bathrooms ?? 1,
        max_guests: p.maxGuests ?? 2,
        wifi_password: p.wifiPassword ?? null,
        check_in_instructions: p.checkInInstructions ?? null,
        house_rules: p.houseRules ?? null,
        emergency_contact: p.emergencyContact ?? null,
        status: p.status ?? "active",
      })
      .select()
      .single();
    if (error) throw error;
    return rowToProperty(data);
  }

  async updateProperty(id: string, orgId: string, p: Partial<InsertProperty>): Promise<Property | undefined> {
    const update: any = {};
    if (p.name !== undefined) update.name = p.name;
    if (p.address !== undefined) update.address = p.address;
    if (p.city !== undefined) update.city = p.city;
    if (p.imageUrl !== undefined) update.image_url = p.imageUrl;
    if (p.bedrooms !== undefined) update.bedrooms = p.bedrooms;
    if (p.bathrooms !== undefined) update.bathrooms = p.bathrooms;
    if (p.maxGuests !== undefined) update.max_guests = p.maxGuests;
    if (p.wifiPassword !== undefined) update.wifi_password = p.wifiPassword;
    if (p.checkInInstructions !== undefined) update.check_in_instructions = p.checkInInstructions;
    if (p.houseRules !== undefined) update.house_rules = p.houseRules;
    if (p.emergencyContact !== undefined) update.emergency_contact = p.emergencyContact;
    if (p.status !== undefined) update.status = p.status;

    const { data, error } = await this.db
      .from("properties")
      .update(update)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();
    if (error || !data) return undefined;
    return rowToProperty(data);
  }

  async deleteProperty(id: string, orgId: string): Promise<boolean> {
    const { error, count } = await this.db
      .from("properties")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("org_id", orgId);
    if (error) return false;
    return (count ?? 0) > 0;
  }

  // ── Bookings ──

  async getBookings(orgId: string): Promise<Booking[]> {
    const { data, error } = await this.db
      .from("bookings")
      .select()
      .eq("org_id", orgId)
      .order("check_in", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToBooking);
  }

  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    const { data, error } = await this.db
      .from("bookings")
      .select()
      .eq("property_id", propertyId)
      .order("check_in", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToBooking);
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const { data, error } = await this.db
      .from("bookings")
      .select()
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return rowToBooking(data);
  }

  async createBooking(orgId: string, b: InsertBooking): Promise<Booking> {
    const { data, error } = await this.db
      .from("bookings")
      .insert({
        org_id: orgId,
        property_id: b.propertyId,
        guest_name: b.guestName,
        guest_email: b.guestEmail ?? null,
        guest_phone: b.guestPhone ?? null,
        guest_id_number: b.guestIdNumber ?? null,
        check_in: b.checkIn,
        check_out: b.checkOut,
        number_of_guests: b.numberOfGuests ?? 1,
        status: b.status ?? "confirmed",
        notes: b.notes ?? null,
        id_verified: b.idVerified ?? false,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToBooking(data);
  }

  async updateBooking(id: string, orgId: string, b: Partial<InsertBooking>): Promise<Booking | undefined> {
    const update: any = {};
    if (b.propertyId !== undefined) update.property_id = b.propertyId;
    if (b.guestName !== undefined) update.guest_name = b.guestName;
    if (b.guestEmail !== undefined) update.guest_email = b.guestEmail;
    if (b.guestPhone !== undefined) update.guest_phone = b.guestPhone;
    if (b.guestIdNumber !== undefined) update.guest_id_number = b.guestIdNumber;
    if (b.checkIn !== undefined) update.check_in = b.checkIn;
    if (b.checkOut !== undefined) update.check_out = b.checkOut;
    if (b.numberOfGuests !== undefined) update.number_of_guests = b.numberOfGuests;
    if (b.status !== undefined) update.status = b.status;
    if (b.notes !== undefined) update.notes = b.notes;
    if (b.idVerified !== undefined) update.id_verified = b.idVerified;

    const { data, error } = await this.db
      .from("bookings")
      .update(update)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();
    if (error || !data) return undefined;
    return rowToBooking(data);
  }

  async deleteBooking(id: string, orgId: string): Promise<boolean> {
    const { error, count } = await this.db
      .from("bookings")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("org_id", orgId);
    if (error) return false;
    return (count ?? 0) > 0;
  }

  // ── Messages ──

  async getMessagesByBooking(bookingId: string): Promise<Message[]> {
    const { data, error } = await this.db
      .from("messages")
      .select()
      .eq("booking_id", bookingId)
      .order("timestamp", { ascending: true });
    if (error) throw error;
    return (data || []).map(rowToMessage);
  }

  async createMessage(m: InsertMessage): Promise<Message> {
    const { data, error } = await this.db
      .from("messages")
      .insert({
        booking_id: m.bookingId,
        sender: m.sender,
        content: m.content,
        timestamp: m.timestamp,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToMessage(data);
  }

  // ── Maintenance ──

  async getMaintenanceRequests(orgId: string): Promise<MaintenanceRequest[]> {
    const { data, error } = await this.db
      .from("maintenance_requests")
      .select()
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToMaintenance);
  }

  async getMaintenanceByProperty(propertyId: string): Promise<MaintenanceRequest[]> {
    const { data, error } = await this.db
      .from("maintenance_requests")
      .select()
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToMaintenance);
  }

  async getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined> {
    const { data, error } = await this.db
      .from("maintenance_requests")
      .select()
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return rowToMaintenance(data);
  }

  async createMaintenanceRequest(orgId: string, m: InsertMaintenance): Promise<MaintenanceRequest> {
    const { data, error } = await this.db
      .from("maintenance_requests")
      .insert({
        org_id: orgId,
        property_id: m.propertyId,
        booking_id: m.bookingId ?? null,
        title: m.title,
        description: m.description,
        priority: m.priority ?? "medium",
        status: m.status ?? "open",
        assigned_to: m.assignedTo ?? null,
        created_at: m.createdAt || new Date().toISOString(),
        resolved_at: m.resolvedAt ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToMaintenance(data);
  }

  async updateMaintenanceRequest(id: string, orgId: string, m: Partial<InsertMaintenance>): Promise<MaintenanceRequest | undefined> {
    const update: any = {};
    if (m.propertyId !== undefined) update.property_id = m.propertyId;
    if (m.bookingId !== undefined) update.booking_id = m.bookingId;
    if (m.title !== undefined) update.title = m.title;
    if (m.description !== undefined) update.description = m.description;
    if (m.priority !== undefined) update.priority = m.priority;
    if (m.status !== undefined) update.status = m.status;
    if (m.assignedTo !== undefined) update.assigned_to = m.assignedTo;
    if (m.createdAt !== undefined) update.created_at = m.createdAt;
    if (m.resolvedAt !== undefined) update.resolved_at = m.resolvedAt;

    const { data, error } = await this.db
      .from("maintenance_requests")
      .update(update)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();
    if (error || !data) return undefined;
    return rowToMaintenance(data);
  }
}

export const storage = new SupabaseStorage();
