import { pgTable, uuid, text, numeric, integer, timestamp, date, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"]);
export const vehicleStatusEnum = pgEnum("vehicle_status", ["available", "on_trip", "in_shop", "retired"]);
export const driverStatusEnum = pgEnum("driver_status", ["available", "on_trip", "off_duty", "suspended"]);
export const tripStatusEnum = pgEnum("trip_status", ["draft", "dispatched", "completed", "cancelled"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["active", "closed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  maxLoadCapacity: numeric("max_load_capacity").notNull(),
  odometer: numeric("odometer").notNull(),
  acquisitionCost: numeric("acquisition_cost").notNull(),
  region: text("region"),
  status: vehicleStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  licenseCategory: text("license_category").notNull(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  contactNumber: text("contact_number").notNull(),
  safetyScore: numeric("safety_score").default('100').notNull(),
  status: driverStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  driverId: uuid("driver_id").references(() => drivers.id).notNull(),
  cargoWeight: numeric("cargo_weight").notNull(),
  plannedDistance: numeric("planned_distance").notNull(),
  actualDistance: numeric("actual_distance"),
  fuelConsumed: numeric("fuel_consumed"),
  status: tripStatusEnum("status").default("draft").notNull(),
  createdById: uuid("created_by_id").references(() => users.id).notNull(),
  revenue: numeric("revenue").default('0').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dispatchedAt: timestamp("dispatched_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  description: text("description").notNull(),
  cost: numeric("cost").notNull(),
  status: maintenanceStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const fuelLogs = pgTable("fuel_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  tripId: uuid("trip_id").references(() => trips.id),
  liters: numeric("liters").notNull(),
  cost: numeric("cost").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  date: date("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
