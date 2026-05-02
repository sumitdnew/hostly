import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations (tenants)
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export type Organization = typeof organizations.$inferSelect;

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  orgId: varchar("org_id").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("owner"), // "owner" | "staff"
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, passwordHash: true, createdAt: true }).extend({
  password: z.string().min(6),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "passwordHash">;

// Properties
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey(),
  orgId: varchar("org_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  imageUrl: text("image_url"),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  maxGuests: integer("max_guests").notNull().default(2),
  wifiPassword: text("wifi_password"),
  checkInInstructions: text("check_in_instructions"),
  houseRules: text("house_rules"),
  emergencyContact: text("emergency_contact"),
  status: text("status").notNull().default("active"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, orgId: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey(),
  orgId: varchar("org_id").notNull(),
  propertyId: varchar("property_id").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  guestIdNumber: text("guest_id_number"),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  numberOfGuests: integer("number_of_guests").notNull().default(1),
  status: text("status").notNull().default("confirmed"),
  notes: text("notes"),
  idVerified: boolean("id_verified").notNull().default(false),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, orgId: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Messages (AI chat with guests)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  bookingId: varchar("booking_id").notNull(),
  sender: text("sender").notNull(), // "guest" | "ai" | "host"
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Maintenance Requests
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: varchar("id").primaryKey(),
  orgId: varchar("org_id").notNull(),
  propertyId: varchar("property_id").notNull(),
  bookingId: varchar("booking_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  assignedTo: text("assigned_to"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceRequests).omit({ id: true, orgId: true });
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
