-- Complete Database Dump

-- ============================================================================
-- 1. TABLES STRUCTURE AND DATA
-- ============================================================================
[
  {
    "table_name": "admin_settings"
  },
  {
    "table_name": "class_bookings"
  },
  {
    "table_name": "class_schedules"
  },
  {
    "table_name": "class_waitlist"
  },
  {
    "table_name": "classes"
  },
  {
    "table_name": "profiles"
  },
  {
    "table_name": "subscription_plans"
  },
  {
    "table_name": "user_subscriptions"
  },
  {
    "table_name": "whatsapp_logs"
  }
]

-- ============================================================================
-- 2. DETAILED TABLE SCHEMA
-- ============================================================================

[
  {
    "table_name": "admin_settings",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "key",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "value",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "category",
    "data_type": "character varying",
    "character_maximum_length": 100,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "description",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "data_type",
    "data_type": "character varying",
    "character_maximum_length": 50,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "is_required",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "admin_settings",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_bookings",
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_bookings",
    "column_name": "subscription_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "user_subscriptions",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_bookings",
    "column_name": "status",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'confirmed'::text",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "booked_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "cancelled_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "cancellation_reason",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_bookings",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "class_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "classes",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_schedules",
    "column_name": "start_datetime",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "end_datetime",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "is_recurring",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "recurrence_rule",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "recurrence_end_date",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "parent_schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_schedules",
    "column_name": "is_exception",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "exception_reason",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "current_bookings",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "0",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "is_cancelled",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "cancellation_reason",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_schedules",
    "column_name": "created_by",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_waitlist",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_waitlist",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_waitlist",
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_waitlist",
    "column_name": "subscription_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "user_subscriptions",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_waitlist",
    "column_name": "position",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_waitlist",
    "column_name": "joined_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_waitlist",
    "column_name": "notified_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_waitlist",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "class_waitlist",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "title",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "description",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "duration",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "max_capacity",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "1",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "coach",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "location",
    "data_type": "character varying",
    "character_maximum_length": 255,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "difficulty_level",
    "data_type": "character varying",
    "character_maximum_length": 20,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "classes",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "email",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "full_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "phone",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "desired_plan",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "role",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'user'::text",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "profiles",
    "column_name": "subscription_status",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'pending'::text",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "credits",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "price_dhs",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "validity_months",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "weekly_limit",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_plans",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "plan_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "subscription_plans",
    "foreign_column_name": "id"
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "status",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'active'::text",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "credits_remaining",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "credits_used",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "0",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "weekly_credits_used",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "0",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "start_date",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "end_date",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "last_weekly_reset",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "user_subscriptions",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "event_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "phone_number",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "message_content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "status",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'pending'::text",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "error_message",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "twilio_message_sid",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "whatsapp_logs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  }
]

-- ============================================================================
-- 3. VIEWS
-- ============================================================================

[
  {
    "view_name": "calendar_events",
    "view_definition": " SELECT cs.id,\n    cs.class_id,\n    c.title,\n    c.description,\n    c.coach,\n    c.location,\n    c.difficulty_level,\n    c.max_capacity,\n    cs.start_datetime,\n    cs.end_datetime,\n    cs.is_recurring,\n    cs.recurrence_rule,\n    cs.parent_schedule_id,\n    cs.is_exception,\n    cs.exception_reason,\n    cs.current_bookings,\n    cs.is_cancelled,\n    cs.cancellation_reason,\n    cs.created_at,\n    cs.updated_at\n   FROM (class_schedules cs\n     JOIN classes c ON ((cs.class_id = c.id)))\n  WHERE ((NOT cs.is_exception) AND (NOT cs.is_cancelled));"
  },
  {
    "view_name": "calendar_events_optimized",
    "view_definition": " SELECT cs.id,\n    cs.class_id,\n    c.title,\n    c.description,\n    c.coach,\n    c.location,\n    c.difficulty_level,\n    c.max_capacity,\n    cs.start_datetime,\n    cs.end_datetime,\n    cs.current_bookings,\n    cs.is_cancelled,\n    cs.is_exception\n   FROM (class_schedules cs\n     JOIN classes c ON ((cs.class_id = c.id)))\n  WHERE ((NOT cs.is_exception) AND (NOT cs.is_cancelled) AND (cs.start_datetime >= now()))\n  ORDER BY cs.start_datetime;"
  }
]

-- ============================================================================
-- 4. FUNCTIONS
-- ============================================================================

[
  {
    "function_name": "adjust_waitlist_positions",
    "function_definition": "\r\nBEGIN\r\n  -- Adjust positions of everyone behind the deleted entry\r\n  UPDATE public.class_waitlist\r\n  SET position = position - 1\r\n  WHERE schedule_id = OLD.schedule_id\r\n  AND position > OLD.position;\r\n  RETURN OLD;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "book_class",
    "function_definition": "\r\nDECLARE\r\n  booking_check JSONB;\r\n  subscription_record RECORD;\r\n  class_schedule_record RECORD;\r\n  class_record RECORD;\r\n  current_bookings INTEGER;\r\n  new_booking_id UUID;\r\n  waitlist_position INTEGER;\r\nBEGIN\r\n  -- First check if schedule exists without FOR UPDATE (for debugging)\r\n  SELECT COUNT(*) INTO current_bookings\r\n  FROM public.class_schedules\r\n  WHERE id = schedule_uuid;\r\n\r\n  -- Get the schedule record (removed FOR UPDATE for debugging)\r\n  SELECT * INTO class_schedule_record\r\n  FROM public.class_schedules\r\n  WHERE id = schedule_uuid;\r\n\r\n  -- Check if schedule exists\r\n  IF class_schedule_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'schedule_not_found',\r\n      'message', format('Schedule %s not found in class_schedules table', schedule_uuid),\r\n      'debug_schedule_id', schedule_uuid\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class is cancelled\r\n  IF class_schedule_record.is_cancelled THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_cancelled',\r\n      'message', 'Ce cours a été annulé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class is an exception (shouldn't be bookable)\r\n  IF class_schedule_record.is_exception THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_exception',\r\n      'message', 'Ce créneau n''est pas disponible pour la réservation'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class has started\r\n  IF class_schedule_record.start_datetime <= NOW() THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_started',\r\n      'message', 'Le cours a déjà commencé'\r\n    );\r\n  END IF;\r\n\r\n  -- Get class info for max_capacity\r\n  SELECT * INTO class_record\r\n  FROM public.classes c\r\n  WHERE c.id = class_schedule_record.class_id;\r\n\r\n  IF class_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_not_found',\r\n      'message', 'Cours non trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Get current confirmed booking count\r\n  SELECT COUNT(*) INTO current_bookings\r\n  FROM public.class_bookings\r\n  WHERE schedule_id = schedule_uuid\r\n    AND status = 'confirmed';\r\n\r\n  -- Check if user can book the class\r\n  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;\r\n\r\n  IF (booking_check->>'can_book')::boolean = false THEN\r\n    RETURN booking_check;\r\n  END IF;\r\n\r\n  -- Get best subscription for booking\r\n  SELECT * INTO subscription_record\r\n  FROM get_user_booking_subscription(user_uuid)\r\n  LIMIT 1;\r\n\r\n  IF subscription_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'no_valid_subscription',\r\n      'message', 'Aucun abonnement valide trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class is full\r\n  IF current_bookings >= class_record.max_capacity THEN\r\n    -- Class is full, add to waitlist if user has valid subscription\r\n    SELECT COALESCE(MAX(position), 0) + 1 INTO waitlist_position\r\n    FROM public.class_waitlist\r\n    WHERE schedule_id = schedule_uuid;\r\n\r\n    INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id, position)\r\n    VALUES (user_uuid, schedule_uuid, subscription_record.id, waitlist_position);\r\n\r\n    RETURN jsonb_build_object(\r\n      'success', true,\r\n      'status', 'waitlisted',\r\n      'position', waitlist_position,\r\n      'message', format('Classe complète. Vous êtes en position %s sur la liste d''attente.', waitlist_position)\r\n    );\r\n  END IF;\r\n\r\n  -- Create the booking (class has space)\r\n  INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)\r\n  VALUES (user_uuid, schedule_uuid, subscription_record.id, 'confirmed')\r\n  RETURNING id INTO new_booking_id;\r\n\r\n  -- Deduct credit/usage atomically based on subscription type\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    -- For abonnement: increment weekly usage\r\n    UPDATE public.user_subscriptions\r\n    SET weekly_credits_used = weekly_credits_used + 1\r\n    WHERE id = subscription_record.id;\r\n  ELSIF subscription_record.plan_type = 'carnet' THEN\r\n    -- For carnet: deduct credit\r\n    UPDATE public.user_subscriptions\r\n    SET credits_remaining = credits_remaining - 1,\r\n        credits_used = credits_used + 1\r\n    WHERE id = subscription_record.id;\r\n  END IF;\r\n  -- Note: personal_training should never reach here due to can_user_book_class check\r\n\r\n  -- Return success with updated subscription data\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'status', 'confirmed',\r\n    'booking_id', new_booking_id,\r\n    'subscription_type', subscription_record.plan_type,\r\n    'message', 'Réservation confirmée',\r\n    'updated_subscription', jsonb_build_object(\r\n      'id', subscription_record.id,\r\n      'credits_remaining',\r\n        CASE\r\n          WHEN subscription_record.plan_type = 'carnet' THEN subscription_record.credits_remaining - 1\r\n          ELSE subscription_record.credits_remaining\r\n        END,\r\n      'weekly_credits_used',\r\n        CASE\r\n          WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.weekly_credits_used + 1\r\n          ELSE subscription_record.weekly_credits_used\r\n        END,\r\n      'credits_used',\r\n        CASE\r\n          WHEN subscription_record.plan_type = 'carnet' THEN subscription_record.credits_remaining - 1\r\n          ELSE subscription_record.credits_remaining\r\n        END\r\n    )\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    RAISE LOG 'Error in book_class function: %', SQLERRM;\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'system_error',\r\n      'message', 'Erreur système. Veuillez réessayer.'\r\n    );\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "can_user_book_class",
    "function_definition": "\r\nDECLARE\r\n  subscription_record RECORD;\r\n  class_info RECORD;\r\n  existing_booking_count INTEGER;\r\n  subscription_count INTEGER := 0;\r\n  personal_training_count INTEGER := 0;\r\n  has_personal_training_only BOOLEAN := false;\r\nBEGIN\r\n  -- Check if user has only personal_training subscription\r\n  SELECT COUNT(*), COUNT(*) FILTER (WHERE plan_type = 'personal_training')\r\n  INTO subscription_count, personal_training_count\r\n  FROM get_user_valid_subscriptions(user_uuid);\r\n\r\n  -- If user has only personal_training, they cannot book online\r\n  IF subscription_count = 1 AND personal_training_count = 1 THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'personal_training_only',\r\n      'message', 'Vous ne pouvez pas réserver un cours avec votre abonnement actuel. Merci d''ajouter un abonnement ou un carnet pour effectuer une réservation.'\r\n    );\r\n  END IF;\r\n\r\n  -- Get best subscription for booking\r\n  SELECT * INTO subscription_record\r\n  FROM get_user_booking_subscription(user_uuid)\r\n  LIMIT 1;\r\n\r\n  IF subscription_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'no_valid_subscription',\r\n      'message', 'Aucun abonnement valide trouvé pour effectuer une réservation'\r\n    );\r\n  END IF;\r\n\r\n  -- Get class information\r\n  -- Note: Removed filters since calendar_events_optimized already pre-filters these\r\n  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime\r\n  INTO class_info\r\n  FROM public.class_schedules cs\r\n  JOIN public.classes c ON cs.class_id = c.id\r\n  WHERE cs.id = schedule_uuid;\r\n\r\n  IF class_info IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'class_not_found',\r\n      'message', 'Cours introuvable'\r\n    );\r\n  END IF;\r\n\r\n  -- Note: Schedule validation will be handled in the book_class function\r\n\r\n  -- Check if class has already started\r\n  IF class_info.start_datetime <= NOW() THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'class_started',\r\n      'message', 'Le cours a déjà commencé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if user already booked this class\r\n  SELECT COUNT(*) INTO existing_booking_count\r\n  FROM public.class_bookings\r\n  WHERE user_id = user_uuid\r\n    AND schedule_id = schedule_uuid\r\n    AND status = 'confirmed';\r\n\r\n  IF existing_booking_count > 0 THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'already_booked',\r\n      'message', 'Vous avez déjà réservé ce cours'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class is full\r\n  IF class_info.current_bookings >= class_info.max_capacity THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'class_full',\r\n      'message', 'Le cours est complet',\r\n      'can_waitlist', true\r\n    );\r\n  END IF;\r\n\r\n  -- Check subscription-specific limits\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    IF subscription_record.weekly_credits_used >= subscription_record.weekly_limit THEN\r\n      RETURN jsonb_build_object(\r\n        'can_book', false,\r\n        'reason', 'weekly_limit_reached',\r\n        'message', 'Limite hebdomadaire de séances atteinte'\r\n      );\r\n    END IF;\r\n  ELSIF subscription_record.plan_type = 'carnet' THEN\r\n    IF subscription_record.credits_remaining <= 0 THEN\r\n      RETURN jsonb_build_object(\r\n        'can_book', false,\r\n        'reason', 'no_credits',\r\n        'message', 'Plus de crédits disponibles'\r\n      );\r\n    END IF;\r\n  END IF;\r\n\r\n  -- All checks passed\r\n  RETURN jsonb_build_object(\r\n    'can_book', true,\r\n    'subscription_id', subscription_record.id,\r\n    'subscription_type', subscription_record.plan_type,\r\n    'message', 'Réservation possible'\r\n  );\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "cancel_booking",
    "function_definition": "\r\nDECLARE\r\n  booking_record RECORD;\r\n  subscription_record RECORD;\r\n  user_uuid uuid;\r\nBEGIN\r\n  -- Get current user\r\n  SELECT auth.uid() INTO user_uuid;\r\n\r\n  -- Get and lock the booking with schedule info\r\n  SELECT cb.*, cs.start_datetime INTO booking_record\r\n  FROM public.class_bookings cb\r\n  JOIN public.class_schedules cs ON cb.schedule_id = cs.id\r\n  WHERE cb.id = booking_uuid\r\n    AND cb.user_id = user_uuid\r\n    AND cb.status = 'confirmed'\r\n  FOR UPDATE;\r\n\r\n  IF booking_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'booking_not_found',\r\n      'message', 'Réservation non trouvée ou déjà annulée'\r\n    );\r\n  END IF;\r\n\r\n  -- Check cancellation policy (24h before class)\r\n  IF booking_record.start_datetime <= NOW() + INTERVAL '24 hours' THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'too_late_to_cancel',\r\n      'message', 'Impossible d''annuler moins de 24h avant le cours'\r\n    );\r\n  END IF;\r\n\r\n  -- Get subscription info with plan type\r\n  SELECT us.*, sp.type as plan_type INTO subscription_record\r\n  FROM public.user_subscriptions us\r\n  JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n  WHERE us.id = booking_record.subscription_id;\r\n\r\n  -- Cancel the booking\r\n  UPDATE public.class_bookings\r\n  SET status = 'cancelled',\r\n      cancelled_at = NOW()\r\n  WHERE id = booking_uuid;\r\n\r\n  -- Refund credit based on subscription type\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    -- For abonnement: decrement weekly usage\r\n    UPDATE public.user_subscriptions\r\n    SET weekly_credits_used = weekly_credits_used - 1\r\n    WHERE id = subscription_record.id;\r\n  ELSIF subscription_record.plan_type = 'carnet' THEN\r\n    -- For carnet: refund credit\r\n    UPDATE public.user_subscriptions\r\n    SET credits_remaining = credits_remaining + 1,\r\n        credits_used = credits_used - 1\r\n    WHERE id = subscription_record.id;\r\n  END IF;\r\n  -- Note: personal_training bookings should not exist, but if they do, no credit handling needed\r\n\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'message', 'Réservation annulée avec succès'\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    RAISE LOG 'Error in cancel_booking function: %', SQLERRM;\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'system_error',\r\n      'message', 'Erreur système. Veuillez réessayer.'\r\n    );\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "cancel_booking",
    "function_definition": "\r\nDECLARE\r\n  booking_record RECORD;\r\n  subscription_record RECORD;\r\nBEGIN\r\n  -- Get and lock the booking with schedule info\r\n  SELECT cb.*, cs.start_datetime INTO booking_record\r\n  FROM public.class_bookings cb\r\n  JOIN public.class_schedules cs ON cb.schedule_id = cs.id\r\n  WHERE cb.id = booking_uuid\r\n    AND cb.user_id = user_uuid\r\n    AND cb.status = 'confirmed'\r\n  FOR UPDATE;\r\n\r\n  IF booking_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'booking_not_found',\r\n      'message', 'Réservation non trouvée ou déjà annulée'\r\n    );\r\n  END IF;\r\n\r\n  -- Check cancellation policy (24h before class)\r\n  IF booking_record.start_datetime <= NOW() + INTERVAL '24 hours' THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'too_late_to_cancel',\r\n      'message', 'Impossible d''annuler moins de 24h avant le cours'\r\n    );\r\n  END IF;\r\n\r\n  -- Get subscription info\r\n  SELECT * INTO subscription_record\r\n  FROM public.user_subscriptions\r\n  WHERE id = booking_record.subscription_id;\r\n\r\n  -- Cancel the booking\r\n  UPDATE public.class_bookings\r\n  SET status = 'cancelled',\r\n      cancelled_at = NOW()\r\n  WHERE id = booking_uuid;\r\n\r\n  -- Refund credit\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    UPDATE public.user_subscriptions\r\n    SET weekly_credits_used = weekly_credits_used - 1\r\n    WHERE id = subscription_record.id;\r\n  ELSE\r\n    UPDATE public.user_subscriptions\r\n    SET credits_remaining = credits_remaining + 1,\r\n        credits_used = credits_used - 1\r\n    WHERE id = subscription_record.id;\r\n  END IF;\r\n\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'message', 'Réservation annulée avec succès'\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    RAISE LOG 'Error in cancel_booking function: %', SQLERRM;\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'system_error',\r\n      'message', 'Erreur système. Veuillez réessayer.'\r\n    );\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "check_expired_subscriptions",
    "function_definition": "\r\nBEGIN\r\n  -- Mark subscriptions as expired based on end_date\r\n  UPDATE public.user_subscriptions\r\n  SET status = 'expired'\r\n  WHERE status = 'active'\r\n    AND end_date < NOW();\r\n\r\n  -- Mark carnet subscriptions as expired if they have no credits remaining\r\n  UPDATE public.user_subscriptions us\r\n  SET status = 'expired'\r\n  FROM public.subscription_plans sp\r\n  WHERE us.plan_id = sp.id\r\n    AND us.status = 'active'\r\n    AND sp.type = 'carnet'\r\n    AND us.credits_remaining <= 0;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "check_user_admin",
    "function_definition": "\r\nDECLARE\r\n  user_role text;\r\nBEGIN\r\n  SELECT role INTO user_role\r\n  FROM public.profiles\r\n  WHERE id = user_id;\r\n\r\n  RETURN COALESCE(user_role = 'admin', false);\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_admin_users_data",
    "function_definition": "\r\nDECLARE\r\n  result JSONB;\r\n  total_count INTEGER;\r\nBEGIN\r\n  -- Get total count\r\n  SELECT COUNT(*) INTO total_count\r\n  FROM public.profiles\r\n  WHERE role != 'admin' OR role IS NULL;\r\n\r\n  SELECT jsonb_build_object(\r\n    'users', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'id', p.id,\r\n          'email', p.email,\r\n          'full_name', p.full_name,\r\n          'phone', p.phone,\r\n          'desired_plan', p.desired_plan,\r\n          'subscription_status', p.subscription_status,\r\n          'role', p.role,\r\n          'created_at', p.created_at,\r\n          'active_subscription', us_data.subscription_data\r\n        ) ORDER BY p.created_at DESC  -- Fixed: ORDER BY moved inside jsonb_agg()\r\n      )\r\n      FROM public.profiles p\r\n      LEFT JOIN LATERAL (\r\n        SELECT jsonb_build_object(\r\n          'id', us.id,\r\n          'status', us.status,\r\n          'credits_remaining', us.credits_remaining,\r\n          'end_date', us.end_date,\r\n          'plan_name', sp.name\r\n        ) as subscription_data\r\n        FROM public.user_subscriptions us\r\n        JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n        WHERE us.user_id = p.id AND us.status = 'active'\r\n        ORDER BY us.end_date DESC\r\n        LIMIT 1\r\n      ) us_data ON true\r\n      WHERE (p.role != 'admin' OR p.role IS NULL)\r\n      -- Removed the problematic ORDER BY here since it's now inside jsonb_agg()\r\n      LIMIT page_limit OFFSET page_offset\r\n    ),\r\n    'total_count', total_count,\r\n    'page_offset', page_offset,\r\n    'page_limit', page_limit\r\n  ) INTO result;\r\n\r\n  RETURN result;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_database_performance_stats",
    "function_definition": "\r\nDECLARE\r\n  result JSONB;\r\nBEGIN\r\n  SELECT jsonb_build_object(\r\n    'table_sizes', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'table_name', tablename,\r\n          'size', pg_size_pretty(pg_total_relation_size('public.' || tablename)),\r\n          'size_bytes', pg_total_relation_size('public.' || tablename),\r\n          'rows_read', pg_stat_get_tuples_returned(c.oid),\r\n          'rows_fetched', pg_stat_get_tuples_fetched(c.oid),\r\n          'efficiency_ratio',\r\n            CASE\r\n              WHEN pg_stat_get_tuples_returned(c.oid) = 0 THEN 0\r\n              ELSE round((pg_stat_get_tuples_fetched(c.oid) * 100.0) / pg_stat_get_tuples_returned(c.oid), 2)\r\n            END\r\n        ) ORDER BY pg_total_relation_size('public.' || tablename) DESC\r\n      )\r\n      FROM pg_tables pt\r\n      JOIN pg_class c ON c.relname = pt.tablename\r\n      WHERE pt.schemaname = 'public'\r\n    ),\r\n    'index_usage', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'table_name', schemaname || '.' || tablename,\r\n          'index_name', indexname,\r\n          'definition', indexdef\r\n        )\r\n      )\r\n      FROM pg_indexes\r\n      WHERE schemaname = 'public'\r\n      ORDER BY tablename, indexname\r\n    )\r\n  ) INTO result;\r\n\r\n  RETURN result;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_user_booking_subscription",
    "function_definition": "\r\nDECLARE\r\n  abonnement_sub RECORD;\r\n  carnet_sub RECORD;\r\nBEGIN\r\n  -- First, try to get valid abonnement subscription\r\n  SELECT * INTO abonnement_sub\r\n  FROM get_user_valid_subscriptions(user_uuid)\r\n  WHERE plan_type = 'abonnement'\r\n  LIMIT 1;\r\n\r\n  -- If abonnement exists and has weekly credits available, use it\r\n  IF abonnement_sub IS NOT NULL AND abonnement_sub.weekly_credits_used < abonnement_sub.weekly_limit THEN\r\n    RETURN QUERY\r\n    SELECT\r\n      abonnement_sub.id,\r\n      abonnement_sub.plan_id,\r\n      abonnement_sub.plan_type,\r\n      abonnement_sub.credits_remaining,\r\n      abonnement_sub.weekly_credits_used,\r\n      abonnement_sub.weekly_limit,\r\n      abonnement_sub.status,\r\n      abonnement_sub.end_date;\r\n    RETURN;\r\n  END IF;\r\n\r\n  -- If abonnement is at weekly limit or doesn't exist, try carnet\r\n  SELECT * INTO carnet_sub\r\n  FROM get_user_valid_subscriptions(user_uuid)\r\n  WHERE plan_type = 'carnet'\r\n  LIMIT 1;\r\n\r\n  IF carnet_sub IS NOT NULL AND carnet_sub.credits_remaining > 0 THEN\r\n    RETURN QUERY\r\n    SELECT\r\n      carnet_sub.id,\r\n      carnet_sub.plan_id,\r\n      carnet_sub.plan_type,\r\n      carnet_sub.credits_remaining,\r\n      carnet_sub.weekly_credits_used,\r\n      carnet_sub.weekly_limit,\r\n      carnet_sub.status,\r\n      carnet_sub.end_date;\r\n    RETURN;\r\n  END IF;\r\n\r\n  -- No valid subscription for booking\r\n  RETURN;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_user_dashboard_data",
    "function_definition": "\r\n\r\nDECLARE\r\n  result JSONB;\r\nBEGIN\r\n  SELECT jsonb_build_object(\r\n    'profile', (\r\n      SELECT jsonb_build_object(\r\n        'id', id,\r\n        'email', email,\r\n        'full_name', full_name,\r\n        'phone', phone,\r\n        'subscription_status', subscription_status,\r\n        'role', role\r\n      )\r\n      FROM public.profiles WHERE id = user_uuid\r\n    ),\r\n    'active_subscription', (\r\n      SELECT jsonb_build_object(\r\n        'id', us.id,\r\n        'status', us.status,\r\n        'credits_remaining', us.credits_remaining,\r\n        'weekly_credits_used', us.weekly_credits_used,\r\n        'end_date', us.end_date,\r\n        'start_date', us.start_date,\r\n        'plan', jsonb_build_object(\r\n          'id', sp.id,\r\n          'name', sp.name,\r\n          'type', sp.type,\r\n          'weekly_limit', sp.weekly_limit,\r\n          'credits', sp.credits,\r\n          'price_dhs', sp.price_dhs\r\n        )\r\n      )\r\n      FROM public.user_subscriptions us\r\n      JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n      WHERE us.user_id = user_uuid\r\n        AND us.status = 'active'\r\n        AND us.end_date > NOW()\r\n      ORDER BY us.end_date DESC\r\n      LIMIT 1\r\n    ),\r\n    'recent_bookings', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'id', cb.id,\r\n          'status', cb.status,\r\n          'booked_at', cb.booked_at,\r\n          'cancelled_at', cb.cancelled_at,\r\n          'class_title', c.title,\r\n          'start_datetime', cs.start_datetime,\r\n          'end_datetime', cs.end_datetime,\r\n          'coach', c.coach,\r\n          'location', c.location\r\n        ) ORDER BY cb.booked_at DESC\r\n      )\r\n      FROM public.class_bookings cb\r\n      JOIN public.class_schedules cs ON cb.schedule_id = cs.id\r\n      JOIN public.classes c ON cs.class_id = c.id\r\n      WHERE cb.user_id = user_uuid\r\n      ORDER BY cb.booked_at DESC\r\n      LIMIT 10\r\n    ),\r\n    'upcoming_classes', (\r\n      SELECT jsonb_agg(\r\n        upcoming_class ORDER BY (upcoming_class->>'start_datetime')::timestamp\r\n      )\r\n      FROM (\r\n        SELECT jsonb_build_object(\r\n          'id', cs.id,\r\n          'title', c.title,\r\n          'description', c.description,\r\n          'start_datetime', cs.start_datetime,\r\n          'end_datetime', cs.end_datetime,\r\n          'coach', c.coach,\r\n          'location', c.location,\r\n          'difficulty_level', c.difficulty_level,\r\n          'current_bookings', cs.current_bookings,\r\n          'max_capacity', c.max_capacity,\r\n          'user_booked', (cb.id IS NOT NULL),\r\n          'user_booking_id', cb.id,\r\n          'user_waitlist_position', cw.position\r\n        ) as upcoming_class\r\n        FROM public.class_schedules cs\r\n        JOIN public.classes c ON cs.class_id = c.id\r\n        LEFT JOIN public.class_bookings cb ON cs.id = cb.schedule_id AND cb.user_id = user_uuid AND cb.status = 'confirmed'\r\n        LEFT JOIN public.class_waitlist cw ON cs.id = cw.schedule_id AND cw.user_id = user_uuid\r\n        WHERE cs.start_datetime >= NOW()\r\n          AND NOT cs.is_cancelled\r\n          AND NOT cs.is_exception\r\n        ORDER BY cs.start_datetime\r\n        LIMIT 20\r\n      ) subquery\r\n    )\r\n  ) INTO result;\r\n\r\n  RETURN result;\r\nEND;\r\n\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_user_valid_subscriptions",
    "function_definition": "\r\nBEGIN\r\n  RETURN QUERY\r\n  SELECT\r\n    us.id,\r\n    us.plan_id,\r\n    sp.type as plan_type,\r\n    us.credits_remaining,\r\n    us.weekly_credits_used,\r\n    sp.weekly_limit,\r\n    us.status,\r\n    us.end_date,\r\n    -- Priority: abonnement first, then carnet, personal_training last (not bookable)\r\n    CASE\r\n      WHEN sp.type = 'abonnement' THEN 1\r\n      WHEN sp.type = 'carnet' THEN 2\r\n      WHEN sp.type = 'personal_training' THEN 3\r\n      ELSE 4\r\n    END as priority\r\n  FROM public.user_subscriptions us\r\n  JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n  WHERE us.user_id = user_uuid\r\n    AND us.status = 'active'\r\n    AND us.end_date > NOW()\r\n    -- Check subscription-specific validity\r\n    AND (\r\n      -- For carnet: must have credits or not expired by validity\r\n      (sp.type = 'carnet' AND us.credits_remaining > 0)\r\n      -- For abonnement: check weekly limit\r\n      OR (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)\r\n      -- For personal_training: always include (but can't book online)\r\n      OR sp.type = 'personal_training'\r\n    )\r\n  ORDER BY priority ASC, us.end_date DESC;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "handle_new_user",
    "function_definition": "\r\nBEGIN\r\n  INSERT INTO public.profiles (id, email, full_name, phone, desired_plan)\r\n  VALUES (\r\n    NEW.id,\r\n    NEW.email,\r\n    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),\r\n    COALESCE(NEW.raw_user_meta_data->>'phone', ''),\r\n    COALESCE(NEW.raw_user_meta_data->>'desired_plan', '')\r\n  );\r\n  RETURN NEW;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "is_admin",
    "function_definition": "\r\nDECLARE\r\n  user_role TEXT;\r\nBEGIN\r\n  SELECT role INTO user_role\r\n  FROM public.profiles\r\n  WHERE id = auth.uid()\r\n  LIMIT 1;\r\n  \r\n  RETURN COALESCE(user_role = 'admin', false);\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "is_admin",
    "function_definition": "\r\nDECLARE\r\n  user_role TEXT;\r\nBEGIN\r\n  SELECT role INTO user_role\r\n  FROM profiles\r\n  WHERE id = user_uuid\r\n  LIMIT 1;\r\n\r\n  RETURN COALESCE(user_role = 'admin', false);\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "join_waitlist",
    "function_definition": "\r\nDECLARE\r\n  subscription_record RECORD;\r\n  class_info RECORD;\r\n  existing_waitlist_count INTEGER;\r\n  new_waitlist_id UUID;\r\nBEGIN\r\n  -- Check if user has valid subscription\r\n  SELECT * INTO subscription_record\r\n  FROM get_user_valid_subscription(user_uuid)\r\n  LIMIT 1;\r\n\r\n  IF subscription_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'no_valid_subscription',\r\n      'message', 'Aucun abonnement valide trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if user is already on waitlist\r\n  SELECT COUNT(*) INTO existing_waitlist_count\r\n  FROM public.class_waitlist\r\n  WHERE user_id = user_uuid AND schedule_id = schedule_uuid;\r\n\r\n  IF existing_waitlist_count > 0 THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'already_on_waitlist',\r\n      'message', 'Vous êtes déjà sur la liste d''attente'\r\n    );\r\n  END IF;\r\n\r\n  -- Get class information\r\n  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime\r\n  INTO class_info\r\n  FROM public.class_schedules cs\r\n  JOIN public.classes c ON cs.class_id = c.id\r\n  WHERE cs.id = schedule_uuid;\r\n\r\n  -- Verify class is actually full\r\n  IF class_info.current_bookings < class_info.max_capacity THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_not_full',\r\n      'message', 'Le cours n''est pas complet, vous pouvez le réserver directement'\r\n    );\r\n  END IF;\r\n\r\n  -- Add to waitlist\r\n  INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id)\r\n  VALUES (user_uuid, schedule_uuid, subscription_record.id)\r\n  RETURNING id INTO new_waitlist_id;\r\n\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'waitlist_id', new_waitlist_id,\r\n    'message', 'Ajouté à la liste d''attente'\r\n  );\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "promote_from_waitlist",
    "function_definition": "\r\nDECLARE\r\n  waitlist_entry RECORD;\r\n  subscription_record RECORD;\r\n  class_schedule_record RECORD;\r\n  class_record RECORD;\r\n  current_bookings INTEGER;\r\nBEGIN\r\n  -- Only process when a booking is cancelled/removed\r\n  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN\r\n    -- Lock the schedule to prevent race conditions\r\n    SELECT * INTO class_schedule_record\r\n    FROM class_schedules\r\n    WHERE id = NEW.schedule_id\r\n    FOR UPDATE;\r\n\r\n    -- Get class info for max_capacity\r\n    SELECT * INTO class_record\r\n    FROM classes\r\n    WHERE id = class_schedule_record.class_id;\r\n\r\n    -- Get current booking count\r\n    SELECT COUNT(*) INTO current_bookings\r\n    FROM class_bookings\r\n    WHERE schedule_id = NEW.schedule_id\r\n      AND status = 'confirmed'\r\n    FOR UPDATE;\r\n\r\n    -- Only promote if there's space\r\n    IF current_bookings < class_record.max_capacity THEN\r\n      -- Find the first person on the waitlist with locking\r\n      SELECT * INTO waitlist_entry\r\n      FROM class_waitlist\r\n      WHERE schedule_id = NEW.schedule_id\r\n      ORDER BY position ASC\r\n      LIMIT 1\r\n      FOR UPDATE SKIP LOCKED;\r\n\r\n      IF waitlist_entry IS NOT NULL THEN\r\n        -- Get their subscription info\r\n        SELECT * INTO subscription_record\r\n        FROM get_user_valid_subscription(waitlist_entry.user_id)\r\n        WHERE id = waitlist_entry.subscription_id\r\n        LIMIT 1;\r\n\r\n        IF subscription_record IS NOT NULL THEN\r\n          -- Create booking for waitlisted user\r\n          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)\r\n          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');\r\n\r\n          -- Deduct credit\r\n          IF subscription_record.plan_type = 'abonnement' THEN\r\n            UPDATE user_subscriptions\r\n            SET weekly_credits_used = weekly_credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          ELSE\r\n            UPDATE user_subscriptions\r\n            SET credits_remaining = credits_remaining - 1,\r\n                credits_used = credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          END IF;\r\n\r\n          -- Remove from waitlist\r\n          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;\r\n\r\n          -- Update positions for remaining waitlist entries\r\n          UPDATE class_waitlist\r\n          SET position = position - 1\r\n          WHERE schedule_id = NEW.schedule_id\r\n            AND position > waitlist_entry.position;\r\n        END IF;\r\n      END IF;\r\n    END IF;\r\n\r\n  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN\r\n    -- Similar logic for deleted bookings\r\n    SELECT * INTO class_schedule_record\r\n    FROM class_schedules\r\n    WHERE id = OLD.schedule_id\r\n    FOR UPDATE;\r\n\r\n    -- Get class info for max_capacity\r\n    SELECT * INTO class_record\r\n    FROM classes\r\n    WHERE id = class_schedule_record.class_id;\r\n\r\n    SELECT COUNT(*) INTO current_bookings\r\n    FROM class_bookings\r\n    WHERE schedule_id = OLD.schedule_id\r\n      AND status = 'confirmed'\r\n    FOR UPDATE;\r\n\r\n    IF current_bookings < class_record.max_capacity THEN\r\n      SELECT * INTO waitlist_entry\r\n      FROM class_waitlist\r\n      WHERE schedule_id = OLD.schedule_id\r\n      ORDER BY position ASC\r\n      LIMIT 1\r\n      FOR UPDATE SKIP LOCKED;\r\n\r\n      IF waitlist_entry IS NOT NULL THEN\r\n        SELECT * INTO subscription_record\r\n        FROM get_user_valid_subscription(waitlist_entry.user_id)\r\n        WHERE id = waitlist_entry.subscription_id\r\n        LIMIT 1;\r\n\r\n        IF subscription_record IS NOT NULL THEN\r\n          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)\r\n          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');\r\n\r\n          IF subscription_record.plan_type = 'abonnement' THEN\r\n            UPDATE user_subscriptions\r\n            SET weekly_credits_used = weekly_credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          ELSE\r\n            UPDATE user_subscriptions\r\n            SET credits_remaining = credits_remaining - 1,\r\n                credits_used = credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          END IF;\r\n\r\n          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;\r\n\r\n          -- Update positions\r\n          UPDATE class_waitlist\r\n          SET position = position - 1\r\n          WHERE schedule_id = OLD.schedule_id\r\n            AND position > waitlist_entry.position;\r\n        END IF;\r\n      END IF;\r\n    END IF;\r\n  END IF;\r\n\r\n  RETURN COALESCE(NEW, OLD);\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    -- Log errors but don't fail the transaction\r\n    RAISE LOG 'Error in promote_from_waitlist trigger: %', SQLERRM;\r\n    RETURN COALESCE(NEW, OLD);\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "reset_weekly_credits",
    "function_definition": "\r\nDECLARE\r\n    affected_rows INTEGER := 0;\r\n    log_message TEXT;\r\nBEGIN\r\n    -- Update all active abonnement subscriptions to reset weekly credits\r\n    UPDATE public.user_subscriptions\r\n    SET\r\n        weekly_credits_used = 0,\r\n        last_weekly_reset = NOW(),\r\n        updated_at = NOW()\r\n    FROM public.subscription_plans sp\r\n    WHERE user_subscriptions.plan_id = sp.id\r\n        AND user_subscriptions.status = 'active'\r\n        AND sp.type = 'abonnement'\r\n        AND user_subscriptions.end_date > NOW();\r\n\r\n    GET DIAGNOSTICS affected_rows = ROW_COUNT;\r\n\r\n    log_message := format('Weekly credits reset completed. %s abonnement subscriptions updated at %s',\r\n                         affected_rows, NOW());\r\n\r\n    -- Log the operation\r\n    RAISE LOG '%', log_message;\r\n\r\n    -- Return success with details\r\n    RETURN jsonb_build_object(\r\n        'success', true,\r\n        'affected_rows', affected_rows,\r\n        'reset_time', NOW(),\r\n        'message', log_message\r\n    );\r\n\r\nEXCEPTION\r\n    WHEN others THEN\r\n        RAISE LOG 'Error in reset_weekly_credits: %', SQLERRM;\r\n        RETURN jsonb_build_object(\r\n            'success', false,\r\n            'error', SQLERRM,\r\n            'reset_time', NOW()\r\n        );\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "set_waitlist_position",
    "function_definition": "\r\nBEGIN\r\n  -- Set position as the last in line\r\n  NEW.position = COALESCE(\r\n    (SELECT MAX(position) FROM public.class_waitlist\r\n     WHERE schedule_id = NEW.schedule_id) + 1,\r\n    1\r\n  );\r\n  RETURN NEW;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_admin_settings_updated_at",
    "function_definition": "\r\nBEGIN\r\n  NEW.updated_at = NOW();\r\n  RETURN NEW;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_booking_count",
    "function_definition": "\r\nBEGIN\r\n  IF TG_OP = 'INSERT' THEN\r\n    -- Increase booking count\r\n    UPDATE public.class_schedules\r\n    SET current_bookings = current_bookings + 1\r\n    WHERE id = NEW.schedule_id;\r\n    RETURN NEW;\r\n  ELSIF TG_OP = 'UPDATE' THEN\r\n    -- Handle status changes\r\n    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN\r\n      -- Booking was cancelled/no-show, decrease count\r\n      UPDATE public.class_schedules\r\n      SET current_bookings = current_bookings - 1\r\n      WHERE id = NEW.schedule_id;\r\n    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN\r\n      -- Booking was restored, increase count\r\n      UPDATE public.class_schedules\r\n      SET current_bookings = current_bookings + 1\r\n      WHERE id = NEW.schedule_id;\r\n    END IF;\r\n    RETURN NEW;\r\n  ELSIF TG_OP = 'DELETE' THEN\r\n    -- Decrease booking count only if booking was confirmed\r\n    IF OLD.status = 'confirmed' THEN\r\n      UPDATE public.class_schedules\r\n      SET current_bookings = current_bookings - 1\r\n      WHERE id = OLD.schedule_id;\r\n    END IF;\r\n    RETURN OLD;\r\n  END IF;\r\n  RETURN NULL;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_subscription_credits",
    "function_definition": "\r\n\r\nDECLARE\r\n  result_data jsonb;\r\nBEGIN\r\n  -- Update the subscription credits atomically\r\n  UPDATE public.user_subscriptions\r\n  SET\r\n    credits_remaining = GREATEST(0, credits_remaining + credits_change),\r\n    weekly_credits_used = GREATEST(0, weekly_credits_used + weekly_credits_change),\r\n    credits_used = GREATEST(0, COALESCE(credits_used, 0) + credits_used_change),\r\n    updated_at = NOW()\r\n  WHERE id = subscription_uuid\r\n  RETURNING jsonb_build_object(\r\n    'id', id,\r\n    'credits_remaining', credits_remaining,\r\n    'weekly_credits_used', weekly_credits_used,\r\n    'credits_used', credits_used,\r\n    'updated_at', updated_at\r\n  ) INTO result_data;\r\n\r\n  -- Check if any row was updated\r\n  IF result_data IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'message', 'Abonnement introuvable'\r\n    );\r\n  END IF;\r\n\r\n  -- Return success with updated data\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'subscription', result_data,\r\n    'message', 'Crédits mis à jour avec succès'\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'message', 'Erreur lors de la mise à jour des crédits: ' || SQLERRM\r\n    );\r\nEND;\r\n\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_updated_at_column",
    "function_definition": "\r\nBEGIN\r\n    NEW.updated_at = NOW();\r\n    RETURN NEW;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_whatsapp_logs_updated_at",
    "function_definition": "\r\nBEGIN\r\n    NEW.updated_at = NOW();\r\n    RETURN NEW;\r\nEND;\r\n",
    "external_language": "PLPGSQL",
    "routine_type": "FUNCTION"
  }
]

-- ============================================================================
-- 5. FOREIGN KEY RELATIONSHIPS
-- ============================================================================

[
  {
    "constraint_name": "class_bookings_schedule_id_fkey",
    "table_name": "class_bookings",
    "column_name": "schedule_id",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_bookings_subscription_id_fkey",
    "table_name": "class_bookings",
    "column_name": "subscription_id",
    "foreign_table_name": "user_subscriptions",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_bookings_user_id_fkey",
    "table_name": "class_bookings",
    "column_name": "user_id",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_schedules_class_id_fkey",
    "table_name": "class_schedules",
    "column_name": "class_id",
    "foreign_table_name": "classes",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_schedules_parent_schedule_id_fkey",
    "table_name": "class_schedules",
    "column_name": "parent_schedule_id",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_waitlist_schedule_id_fkey",
    "table_name": "class_waitlist",
    "column_name": "schedule_id",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_waitlist_subscription_id_fkey",
    "table_name": "class_waitlist",
    "column_name": "subscription_id",
    "foreign_table_name": "user_subscriptions",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "class_waitlist_user_id_fkey",
    "table_name": "class_waitlist",
    "column_name": "user_id",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "user_subscriptions_plan_id_fkey",
    "table_name": "user_subscriptions",
    "column_name": "plan_id",
    "foreign_table_name": "subscription_plans",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "RESTRICT"
  },
  {
    "constraint_name": "user_subscriptions_user_id_fkey",
    "table_name": "user_subscriptions",
    "column_name": "user_id",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_name": "whatsapp_logs_user_id_fkey",
    "table_name": "whatsapp_logs",
    "column_name": "user_id",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  }
]

-- ============================================================================
-- 6. SAMPLE DATA FROM KEY TABLES (First 5 rows each)
-- ============================================================================

[
  {
    "table_name": "class_schedules",
    "id": "36409943-0519-4fda-935c-b65a1aa5f1c5",
    "class_id": "ad111a7e-48d4-434e-9de6-705a4b309107",
    "start_datetime": "2025-09-22 14:00:00+00",
    "end_datetime": "2025-09-22 14:45:00+00",
    "is_recurring": true,
    "recurrence_rule": {
      "endDate": "2025-10-06",
      "interval": 1,
      "frequency": "daily",
      "exceptionDates": [
        "2025-09-27",
        "2025-09-28",
        "2025-10-04",
        "2025-10-05"
      ]
    },
    "recurrence_end_date": "2025-10-06 00:00:00+00",
    "parent_schedule_id": null,
    "is_exception": false,
    "exception_reason": null,
    "current_bookings": 0,
    "is_cancelled": false,
    "cancellation_reason": null,
    "created_at": "2025-09-19 12:41:54.674536+00",
    "updated_at": "2025-09-19 12:41:54.674536+00",
    "created_by": null
  },
  {
    "table_name": "class_schedules",
    "id": "9839a843-8c9c-45b1-8519-7b2a144ce156",
    "class_id": "ad111a7e-48d4-434e-9de6-705a4b309107",
    "start_datetime": "2025-09-23 14:00:00+00",
    "end_datetime": "2025-09-23 14:45:00+00",
    "is_recurring": true,
    "recurrence_rule": {
      "endDate": "2025-10-06",
      "interval": 1,
      "frequency": "daily",
      "exceptionDates": [
        "2025-09-27",
        "2025-09-28",
        "2025-10-04",
        "2025-10-05"
      ]
    },
    "recurrence_end_date": "2025-10-06 00:00:00+00",
    "parent_schedule_id": null,
    "is_exception": false,
    "exception_reason": null,
    "current_bookings": 0,
    "is_cancelled": false,
    "cancellation_reason": null,
    "created_at": "2025-09-19 12:41:54.674536+00",
    "updated_at": "2025-09-19 12:41:54.674536+00",
    "created_by": null
  },
  {
    "table_name": "class_schedules",
    "id": "b994c0a8-8f51-4c2b-b5ae-ac106dda5f64",
    "class_id": "ad111a7e-48d4-434e-9de6-705a4b309107",
    "start_datetime": "2025-09-24 14:00:00+00",
    "end_datetime": "2025-09-24 14:45:00+00",
    "is_recurring": true,
    "recurrence_rule": {
      "endDate": "2025-10-06",
      "interval": 1,
      "frequency": "daily",
      "exceptionDates": [
        "2025-09-27",
        "2025-09-28",
        "2025-10-04",
        "2025-10-05"
      ]
    },
    "recurrence_end_date": "2025-10-06 00:00:00+00",
    "parent_schedule_id": null,
    "is_exception": false,
    "exception_reason": null,
    "current_bookings": 0,
    "is_cancelled": false,
    "cancellation_reason": null,
    "created_at": "2025-09-19 12:41:54.674536+00",
    "updated_at": "2025-09-19 12:41:54.674536+00",
    "created_by": null
  },
  {
    "table_name": "class_schedules",
    "id": "9a46a10e-57b2-4c8e-b8f6-226b929b3bf5",
    "class_id": "ad111a7e-48d4-434e-9de6-705a4b309107",
    "start_datetime": "2025-09-25 14:00:00+00",
    "end_datetime": "2025-09-25 14:45:00+00",
    "is_recurring": true,
    "recurrence_rule": {
      "endDate": "2025-10-06",
      "interval": 1,
      "frequency": "daily",
      "exceptionDates": [
        "2025-09-27",
        "2025-09-28",
        "2025-10-04",
        "2025-10-05"
      ]
    },
    "recurrence_end_date": "2025-10-06 00:00:00+00",
    "parent_schedule_id": null,
    "is_exception": false,
    "exception_reason": null,
    "current_bookings": 0,
    "is_cancelled": false,
    "cancellation_reason": null,
    "created_at": "2025-09-19 12:41:54.674536+00",
    "updated_at": "2025-09-19 12:41:54.674536+00",
    "created_by": null
  },
  {
    "table_name": "class_schedules",
    "id": "f6977f01-17ba-480c-a2aa-48fa69af8e49",
    "class_id": "ad111a7e-48d4-434e-9de6-705a4b309107",
    "start_datetime": "2025-09-26 14:00:00+00",
    "end_datetime": "2025-09-26 14:45:00+00",
    "is_recurring": true,
    "recurrence_rule": {
      "endDate": "2025-10-06",
      "interval": 1,
      "frequency": "daily",
      "exceptionDates": [
        "2025-09-27",
        "2025-09-28",
        "2025-10-04",
        "2025-10-05"
      ]
    },
    "recurrence_end_date": "2025-10-06 00:00:00+00",
    "parent_schedule_id": null,
    "is_exception": false,
    "exception_reason": null,
    "current_bookings": 0,
    "is_cancelled": false,
    "cancellation_reason": null,
    "created_at": "2025-09-19 12:41:54.674536+00",
    "updated_at": "2025-09-19 12:41:54.674536+00",
    "created_by": null
  }
]

-- ============================================================================
-- 7. SPECIFIC DEBUG DATA FOR YOUR BOOKING ISSUE
-- ============================================================================

[
  {
    "query_type": "user_subscriptions_debug",
    "id": "fe1e1e7c-cf27-4e6a-9d28-9d69c538369e",
    "user_id": "9c37f3a1-7bec-41af-8d48-64a27679fbd5",
    "plan_id": "ee952d89-47f6-49fd-bf0d-56072a1fe011",
    "status": "active",
    "credits_remaining": 0,
    "credits_used": 0,
    "weekly_credits_used": 0,
    "start_date": "2025-09-19 00:00:00+00",
    "end_date": "2026-09-19 00:00:00+00",
    "last_weekly_reset": "2025-09-19 14:53:40.010183+00",
    "created_at": "2025-09-19 14:53:40.010183+00",
    "updated_at": "2025-09-19 14:53:40.010183+00",
    "plan_type": "abonnement",
    "weekly_limit": 4
  }
]

-- ============================================================================
-- 8. CURRENT FUNCTIONS CHECK
-- ============================================================================

[
  {
    "query_type": "functions_check",
    "routine_name": "book_class",
    "function_created": null
  },
  {
    "query_type": "functions_check",
    "routine_name": "can_user_book_class",
    "function_created": null
  },
  {
    "query_type": "functions_check",
    "routine_name": "get_user_booking_subscription",
    "function_created": null
  },
  {
    "query_type": "functions_check",
    "routine_name": "get_user_valid_subscriptions",
    "function_created": null
  }
]