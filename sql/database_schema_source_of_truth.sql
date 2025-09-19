1. All Tables Structure

[
  {
    "table_name": "booking_audit",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": "booking_audit",
    "foreign_column_name": "id"
  },
  {
    "table_name": "booking_audit",
    "column_name": "booking_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "booking_audit",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "booking_audit",
    "column_name": "operation",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "booking_audit",
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": "FOREIGN KEY",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id"
  },
  {
    "table_name": "booking_audit",
    "column_name": "details",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "booking_audit",
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
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": "class_bookings",
    "foreign_column_name": "id"
  },
  {
    "table_name": "class_bookings",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_bookings",
    "foreign_column_name": "user_id"
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
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_bookings",
    "foreign_column_name": "schedule_id"
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
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_bookings",
    "foreign_column_name": "schedule_id"
  },
  {
    "table_name": "class_bookings",
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_bookings",
    "foreign_column_name": "user_id"
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
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id"
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
    "constraint_type": "FOREIGN KEY",
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
    "foreign_table_name": "class_waitlist",
    "foreign_column_name": "id"
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
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_waitlist",
    "foreign_column_name": "schedule_id"
  },
  {
    "table_name": "class_waitlist",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_waitlist",
    "foreign_column_name": "user_id"
  },
  {
    "table_name": "class_waitlist",
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_waitlist",
    "foreign_column_name": "schedule_id"
  },
  {
    "table_name": "class_waitlist",
    "column_name": "schedule_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "class_waitlist",
    "foreign_column_name": "user_id"
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
    "foreign_table_name": "classes",
    "foreign_column_name": "id"
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
    "constraint_type": "FOREIGN KEY",
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
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "profiles",
    "column_name": "email",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "constraint_type": "UNIQUE",
    "foreign_table_name": "profiles",
    "foreign_column_name": "email"
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
    "foreign_table_name": "subscription_plans",
    "foreign_column_name": "id"
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
    "column_name": "validity_days",
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
    "table_name": "subscription_requests",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "constraint_type": "PRIMARY KEY",
    "foreign_table_name": "subscription_requests",
    "foreign_column_name": "id"
  },
  {
    "table_name": "subscription_requests",
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
    "table_name": "subscription_requests",
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
    "table_name": "subscription_requests",
    "column_name": "status",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'pending'::text",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_requests",
    "column_name": "notes",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_requests",
    "column_name": "requested_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_requests",
    "column_name": "contacted_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_requests",
    "column_name": "resolved_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "constraint_type": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "subscription_requests",
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
    "table_name": "subscription_requests",
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
    "foreign_table_name": "user_subscriptions",
    "foreign_column_name": "id"
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
  }
]
 
2. All Functions (RPC endpoints)

[
  {
    "function_name": "adjust_waitlist_positions",
    "function_body": "\r\nBEGIN\r\n  -- Adjust positions of everyone behind the deleted entry\r\n  UPDATE public.class_waitlist\r\n  SET position = position - 1\r\n  WHERE schedule_id = OLD.schedule_id\r\n  AND position > OLD.position;\r\n  RETURN OLD;\r\nEND;\r\n",
    "return_type": "trigger",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "book_class",
    "function_body": "\r\n\r\nDECLARE\r\n  booking_check JSONB;\r\n  subscription_record RECORD;\r\n  class_schedule_record RECORD;\r\n  class_record RECORD;\r\n  current_bookings INTEGER;\r\n  new_booking_id UUID;\r\n  waitlist_position INTEGER;\r\nBEGIN\r\n  -- Start a transaction and lock the schedule row\r\n  SELECT * INTO class_schedule_record\r\n  FROM public.class_schedules\r\n  WHERE id = schedule_uuid\r\n  FOR UPDATE;\r\n\r\n  -- Check if schedule exists FIRST (before accessing fields)\r\n  IF class_schedule_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'schedule_not_found',\r\n      'message', 'Créneau non trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Now safely get class info for max_capacity\r\n  SELECT * INTO class_record\r\n  FROM public.classes c\r\n  WHERE c.id = class_schedule_record.class_id;\r\n\r\n  -- Check if class exists\r\n  IF class_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_not_found',\r\n      'message', 'Cours non trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Get current confirmed booking count (REMOVED FOR UPDATE - this was causing the error)\r\n  SELECT COUNT(*) INTO current_bookings\r\n  FROM public.class_bookings\r\n  WHERE schedule_id = schedule_uuid\r\n    AND status = 'confirmed';\r\n\r\n  -- Check if user can book the class\r\n  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;\r\n\r\n  IF (booking_check->>'can_book')::boolean = false THEN\r\n    RETURN booking_check;\r\n  END IF;\r\n\r\n  -- Get subscription info\r\n  SELECT * INTO subscription_record\r\n  FROM get_user_valid_subscription(user_uuid)\r\n  LIMIT 1;\r\n\r\n  -- Additional safety check for subscription\r\n  IF subscription_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'no_valid_subscription',\r\n      'message', 'Aucun abonnement valide trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class is full\r\n  IF current_bookings >= class_record.max_capacity THEN\r\n    -- Class is full, add to waitlist\r\n    SELECT COALESCE(MAX(position), 0) + 1 INTO waitlist_position\r\n    FROM public.class_waitlist\r\n    WHERE schedule_id = schedule_uuid;\r\n\r\n    INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id, position)\r\n    VALUES (user_uuid, schedule_uuid, subscription_record.id, waitlist_position);\r\n\r\n    RETURN jsonb_build_object(\r\n      'success', true,\r\n      'status', 'waitlisted',\r\n      'position', waitlist_position,\r\n      'message', format('Classe complète. Vous êtes en position %s sur la liste d''attente.', waitlist_position)\r\n    );\r\n  END IF;\r\n\r\n  -- Create the booking (class has space)\r\n  INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)\r\n  VALUES (user_uuid, schedule_uuid, subscription_record.id, 'confirmed')\r\n  RETURNING id INTO new_booking_id;\r\n\r\n  -- Deduct credit atomically\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    UPDATE public.user_subscriptions\r\n    SET weekly_credits_used = weekly_credits_used + 1\r\n    WHERE id = subscription_record.id;\r\n  ELSE\r\n    UPDATE public.user_subscriptions\r\n    SET credits_remaining = credits_remaining - 1,\r\n        credits_used = credits_used + 1\r\n    WHERE id = subscription_record.id;\r\n  END IF;\r\n\r\n  -- Return success with updated subscription data\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'status', 'confirmed',\r\n    'booking_id', new_booking_id,\r\n    'message', 'Réservation confirmée',\r\n    'updated_subscription', jsonb_build_object(\r\n      'credits_remaining', CASE WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.credits_remaining ELSE subscription_record.credits_remaining - 1 END,\r\n      'weekly_credits_used', CASE WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.weekly_credits_used + 1 ELSE subscription_record.weekly_credits_used END,\r\n      'credits_used', CASE WHEN subscription_record.plan_type = 'abonnement' THEN subscription_record.credits_used ELSE subscription_record.credits_used + 1 END\r\n    )\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    -- Log the error and return failure\r\n    RAISE LOG 'Error in book_class function: %', SQLERRM;\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'system_error',\r\n      'message', 'Erreur système. Veuillez réessayer.'\r\n    );\r\nEND;\r\n\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "can_user_book_class",
    "function_body": "\r\nDECLARE\r\n  subscription_record RECORD;\r\n  class_info RECORD;\r\n  existing_booking_count INTEGER;\r\nBEGIN\r\n  -- Check if user has valid subscription\r\n  SELECT * INTO subscription_record\r\n  FROM get_user_valid_subscription(user_uuid)\r\n  LIMIT 1;\r\n\r\n  IF subscription_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'no_valid_subscription',\r\n      'message', 'Aucun abonnement valide trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Get class information\r\n  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime\r\n  INTO class_info\r\n  FROM public.class_schedules cs\r\n  JOIN public.classes c ON cs.class_id = c.id\r\n  WHERE cs.id = schedule_uuid;\r\n\r\n  IF class_info IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'class_not_found',\r\n      'message', 'Cours introuvable'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class has already started\r\n  IF class_info.start_datetime <= NOW() THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'class_started',\r\n      'message', 'Le cours a déjà commencé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if user already booked this class\r\n  SELECT COUNT(*) INTO existing_booking_count\r\n  FROM public.class_bookings\r\n  WHERE user_id = user_uuid\r\n    AND schedule_id = schedule_uuid\r\n    AND status = 'confirmed';\r\n\r\n  IF existing_booking_count > 0 THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'already_booked',\r\n      'message', 'Vous avez déjà réservé ce cours'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if class is full\r\n  IF class_info.current_bookings >= class_info.max_capacity THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'class_full',\r\n      'message', 'Le cours est complet',\r\n      'can_waitlist', true\r\n    );\r\n  END IF;\r\n\r\n  -- Check subscription-specific limits\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    IF subscription_record.weekly_credits_used >= subscription_record.weekly_limit THEN\r\n      RETURN jsonb_build_object(\r\n        'can_book', false,\r\n        'reason', 'weekly_limit_reached',\r\n        'message', 'Limite hebdomadaire de séances atteinte'\r\n      );\r\n    END IF;\r\n  ELSIF subscription_record.credits_remaining <= 0 THEN\r\n    RETURN jsonb_build_object(\r\n      'can_book', false,\r\n      'reason', 'no_credits',\r\n      'message', 'Plus de crédits disponibles'\r\n    );\r\n  END IF;\r\n\r\n  -- All checks passed\r\n  RETURN jsonb_build_object(\r\n    'can_book', true,\r\n    'subscription_id', subscription_record.id,\r\n    'message', 'Réservation possible'\r\n  );\r\nEND;\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "cancel_booking",
    "function_body": "\r\nDECLARE\r\n  booking_record RECORD;\r\n  subscription_record RECORD;\r\nBEGIN\r\n  -- Get and lock the booking with schedule info\r\n  SELECT cb.*, cs.start_datetime INTO booking_record\r\n  FROM public.class_bookings cb\r\n  JOIN public.class_schedules cs ON cb.schedule_id = cs.id\r\n  WHERE cb.id = booking_uuid\r\n    AND cb.user_id = user_uuid\r\n    AND cb.status = 'confirmed'\r\n  FOR UPDATE;\r\n\r\n  IF booking_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'booking_not_found',\r\n      'message', 'Réservation non trouvée ou déjà annulée'\r\n    );\r\n  END IF;\r\n\r\n  -- Check cancellation policy (24h before class)\r\n  IF booking_record.start_datetime <= NOW() + INTERVAL '24 hours' THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'too_late_to_cancel',\r\n      'message', 'Impossible d''annuler moins de 24h avant le cours'\r\n    );\r\n  END IF;\r\n\r\n  -- Get subscription info\r\n  SELECT * INTO subscription_record\r\n  FROM public.user_subscriptions\r\n  WHERE id = booking_record.subscription_id;\r\n\r\n  -- Cancel the booking\r\n  UPDATE public.class_bookings\r\n  SET status = 'cancelled',\r\n      cancelled_at = NOW()\r\n  WHERE id = booking_uuid;\r\n\r\n  -- Refund credit\r\n  IF subscription_record.plan_type = 'abonnement' THEN\r\n    UPDATE public.user_subscriptions\r\n    SET weekly_credits_used = weekly_credits_used - 1\r\n    WHERE id = subscription_record.id;\r\n  ELSE\r\n    UPDATE public.user_subscriptions\r\n    SET credits_remaining = credits_remaining + 1,\r\n        credits_used = credits_used - 1\r\n    WHERE id = subscription_record.id;\r\n  END IF;\r\n\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'message', 'Réservation annulée avec succès'\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    RAISE LOG 'Error in cancel_booking function: %', SQLERRM;\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'system_error',\r\n      'message', 'Erreur système. Veuillez réessayer.'\r\n    );\r\nEND;\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "check_expired_subscriptions",
    "function_body": "\r\nBEGIN\r\n  UPDATE public.user_subscriptions\r\n  SET status = 'expired'\r\n  WHERE status = 'active' AND end_date < NOW();\r\nEND;\r\n",
    "return_type": "void",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "check_user_admin",
    "function_body": "\r\nDECLARE\r\n  user_role text;\r\nBEGIN\r\n  SELECT role INTO user_role\r\n  FROM public.profiles\r\n  WHERE id = user_id;\r\n\r\n  RETURN COALESCE(user_role = 'admin', false);\r\nEND;\r\n",
    "return_type": "boolean",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_admin_users_data",
    "function_body": "\r\nDECLARE\r\n  result JSONB;\r\n  total_count INTEGER;\r\nBEGIN\r\n  -- Get total count\r\n  SELECT COUNT(*) INTO total_count\r\n  FROM public.profiles\r\n  WHERE role != 'admin' OR role IS NULL;\r\n\r\n  SELECT jsonb_build_object(\r\n    'users', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'id', p.id,\r\n          'email', p.email,\r\n          'full_name', p.full_name,\r\n          'phone', p.phone,\r\n          'desired_plan', p.desired_plan,\r\n          'subscription_status', p.subscription_status,\r\n          'role', p.role,\r\n          'created_at', p.created_at,\r\n          'active_subscription', us_data.subscription_data\r\n        ) ORDER BY p.created_at DESC  -- Fixed: ORDER BY moved inside jsonb_agg()\r\n      )\r\n      FROM public.profiles p\r\n      LEFT JOIN LATERAL (\r\n        SELECT jsonb_build_object(\r\n          'id', us.id,\r\n          'status', us.status,\r\n          'credits_remaining', us.credits_remaining,\r\n          'end_date', us.end_date,\r\n          'plan_name', sp.name\r\n        ) as subscription_data\r\n        FROM public.user_subscriptions us\r\n        JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n        WHERE us.user_id = p.id AND us.status = 'active'\r\n        ORDER BY us.end_date DESC\r\n        LIMIT 1\r\n      ) us_data ON true\r\n      WHERE (p.role != 'admin' OR p.role IS NULL)\r\n      -- Removed the problematic ORDER BY here since it's now inside jsonb_agg()\r\n      LIMIT page_limit OFFSET page_offset\r\n    ),\r\n    'total_count', total_count,\r\n    'page_offset', page_offset,\r\n    'page_limit', page_limit\r\n  ) INTO result;\r\n\r\n  RETURN result;\r\nEND;\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_database_performance_stats",
    "function_body": "\r\nDECLARE\r\n  result JSONB;\r\nBEGIN\r\n  SELECT jsonb_build_object(\r\n    'table_sizes', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'table_name', tablename,\r\n          'size', pg_size_pretty(pg_total_relation_size('public.' || tablename)),\r\n          'size_bytes', pg_total_relation_size('public.' || tablename),\r\n          'rows_read', pg_stat_get_tuples_returned(c.oid),\r\n          'rows_fetched', pg_stat_get_tuples_fetched(c.oid),\r\n          'efficiency_ratio',\r\n            CASE\r\n              WHEN pg_stat_get_tuples_returned(c.oid) = 0 THEN 0\r\n              ELSE round((pg_stat_get_tuples_fetched(c.oid) * 100.0) / pg_stat_get_tuples_returned(c.oid), 2)\r\n            END\r\n        ) ORDER BY pg_total_relation_size('public.' || tablename) DESC\r\n      )\r\n      FROM pg_tables pt\r\n      JOIN pg_class c ON c.relname = pt.tablename\r\n      WHERE pt.schemaname = 'public'\r\n    ),\r\n    'index_usage', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'table_name', schemaname || '.' || tablename,\r\n          'index_name', indexname,\r\n          'definition', indexdef\r\n        )\r\n      )\r\n      FROM pg_indexes\r\n      WHERE schemaname = 'public'\r\n      ORDER BY tablename, indexname\r\n    )\r\n  ) INTO result;\r\n\r\n  RETURN result;\r\nEND;\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_user_dashboard_data",
    "function_body": "\r\n\r\nDECLARE\r\n  result JSONB;\r\nBEGIN\r\n  SELECT jsonb_build_object(\r\n    'profile', (\r\n      SELECT jsonb_build_object(\r\n        'id', id,\r\n        'email', email,\r\n        'full_name', full_name,\r\n        'phone', phone,\r\n        'subscription_status', subscription_status,\r\n        'role', role\r\n      )\r\n      FROM public.profiles WHERE id = user_uuid\r\n    ),\r\n    'active_subscription', (\r\n      SELECT jsonb_build_object(\r\n        'id', us.id,\r\n        'status', us.status,\r\n        'credits_remaining', us.credits_remaining,\r\n        'weekly_credits_used', us.weekly_credits_used,\r\n        'end_date', us.end_date,\r\n        'start_date', us.start_date,\r\n        'plan', jsonb_build_object(\r\n          'id', sp.id,\r\n          'name', sp.name,\r\n          'type', sp.type,\r\n          'weekly_limit', sp.weekly_limit,\r\n          'credits', sp.credits,\r\n          'price_dhs', sp.price_dhs\r\n        )\r\n      )\r\n      FROM public.user_subscriptions us\r\n      JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n      WHERE us.user_id = user_uuid\r\n        AND us.status = 'active'\r\n        AND us.end_date > NOW()\r\n      ORDER BY us.end_date DESC\r\n      LIMIT 1\r\n    ),\r\n    'recent_bookings', (\r\n      SELECT jsonb_agg(\r\n        jsonb_build_object(\r\n          'id', cb.id,\r\n          'status', cb.status,\r\n          'booked_at', cb.booked_at,\r\n          'cancelled_at', cb.cancelled_at,\r\n          'class_title', c.title,\r\n          'start_datetime', cs.start_datetime,\r\n          'end_datetime', cs.end_datetime,\r\n          'coach', c.coach,\r\n          'location', c.location\r\n        ) ORDER BY cb.booked_at DESC\r\n      )\r\n      FROM public.class_bookings cb\r\n      JOIN public.class_schedules cs ON cb.schedule_id = cs.id\r\n      JOIN public.classes c ON cs.class_id = c.id\r\n      WHERE cb.user_id = user_uuid\r\n      ORDER BY cb.booked_at DESC\r\n      LIMIT 10\r\n    ),\r\n    'upcoming_classes', (\r\n      SELECT jsonb_agg(\r\n        upcoming_class ORDER BY (upcoming_class->>'start_datetime')::timestamp\r\n      )\r\n      FROM (\r\n        SELECT jsonb_build_object(\r\n          'id', cs.id,\r\n          'title', c.title,\r\n          'description', c.description,\r\n          'start_datetime', cs.start_datetime,\r\n          'end_datetime', cs.end_datetime,\r\n          'coach', c.coach,\r\n          'location', c.location,\r\n          'difficulty_level', c.difficulty_level,\r\n          'current_bookings', cs.current_bookings,\r\n          'max_capacity', c.max_capacity,\r\n          'user_booked', (cb.id IS NOT NULL),\r\n          'user_booking_id', cb.id,\r\n          'user_waitlist_position', cw.position\r\n        ) as upcoming_class\r\n        FROM public.class_schedules cs\r\n        JOIN public.classes c ON cs.class_id = c.id\r\n        LEFT JOIN public.class_bookings cb ON cs.id = cb.schedule_id AND cb.user_id = user_uuid AND cb.status = 'confirmed'\r\n        LEFT JOIN public.class_waitlist cw ON cs.id = cw.schedule_id AND cw.user_id = user_uuid\r\n        WHERE cs.start_datetime >= NOW()\r\n          AND NOT cs.is_cancelled\r\n          AND NOT cs.is_exception\r\n        ORDER BY cs.start_datetime\r\n        LIMIT 20\r\n      ) subquery\r\n    )\r\n  ) INTO result;\r\n\r\n  RETURN result;\r\nEND;\r\n\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "get_user_valid_subscription",
    "function_body": "\r\nBEGIN\r\n  RETURN QUERY\r\n  SELECT\r\n    us.id,\r\n    us.plan_id,\r\n    sp.type as plan_type,\r\n    us.credits_remaining,\r\n    us.weekly_credits_used,\r\n    sp.weekly_limit,\r\n    us.status,\r\n    us.end_date\r\n  FROM public.user_subscriptions us\r\n  JOIN public.subscription_plans sp ON us.plan_id = sp.id\r\n  WHERE us.user_id = user_uuid\r\n    AND us.status = 'active'\r\n    AND us.end_date > NOW()\r\n    AND (\r\n      us.credits_remaining > 0\r\n      OR (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)\r\n    )\r\n  ORDER BY us.end_date DESC\r\n  LIMIT 1;\r\nEND;\r\n",
    "return_type": "record",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "handle_new_user",
    "function_body": "\r\nBEGIN\r\n  INSERT INTO public.profiles (id, email, full_name, phone, desired_plan)\r\n  VALUES (\r\n    NEW.id,\r\n    NEW.email,\r\n    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),\r\n    COALESCE(NEW.raw_user_meta_data->>'phone', ''),\r\n    COALESCE(NEW.raw_user_meta_data->>'desired_plan', '')\r\n  );\r\n  RETURN NEW;\r\nEND;\r\n",
    "return_type": "trigger",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "is_admin",
    "function_body": "\r\nDECLARE\r\n  user_role TEXT;\r\nBEGIN\r\n  SELECT role INTO user_role\r\n  FROM public.profiles\r\n  WHERE id = auth.uid()\r\n  LIMIT 1;\r\n  \r\n  RETURN COALESCE(user_role = 'admin', false);\r\nEND;\r\n",
    "return_type": "boolean",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "is_admin",
    "function_body": "\r\nDECLARE\r\n  user_role TEXT;\r\nBEGIN\r\n  SELECT role INTO user_role\r\n  FROM profiles\r\n  WHERE id = user_uuid\r\n  LIMIT 1;\r\n\r\n  RETURN COALESCE(user_role = 'admin', false);\r\nEND;\r\n",
    "return_type": "boolean",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "join_waitlist",
    "function_body": "\r\nDECLARE\r\n  subscription_record RECORD;\r\n  class_info RECORD;\r\n  existing_waitlist_count INTEGER;\r\n  new_waitlist_id UUID;\r\nBEGIN\r\n  -- Check if user has valid subscription\r\n  SELECT * INTO subscription_record\r\n  FROM get_user_valid_subscription(user_uuid)\r\n  LIMIT 1;\r\n\r\n  IF subscription_record IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'no_valid_subscription',\r\n      'message', 'Aucun abonnement valide trouvé'\r\n    );\r\n  END IF;\r\n\r\n  -- Check if user is already on waitlist\r\n  SELECT COUNT(*) INTO existing_waitlist_count\r\n  FROM public.class_waitlist\r\n  WHERE user_id = user_uuid AND schedule_id = schedule_uuid;\r\n\r\n  IF existing_waitlist_count > 0 THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'already_on_waitlist',\r\n      'message', 'Vous êtes déjà sur la liste d''attente'\r\n    );\r\n  END IF;\r\n\r\n  -- Get class information\r\n  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime\r\n  INTO class_info\r\n  FROM public.class_schedules cs\r\n  JOIN public.classes c ON cs.class_id = c.id\r\n  WHERE cs.id = schedule_uuid;\r\n\r\n  -- Verify class is actually full\r\n  IF class_info.current_bookings < class_info.max_capacity THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'reason', 'class_not_full',\r\n      'message', 'Le cours n''est pas complet, vous pouvez le réserver directement'\r\n    );\r\n  END IF;\r\n\r\n  -- Add to waitlist\r\n  INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id)\r\n  VALUES (user_uuid, schedule_uuid, subscription_record.id)\r\n  RETURNING id INTO new_waitlist_id;\r\n\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'waitlist_id', new_waitlist_id,\r\n    'message', 'Ajouté à la liste d''attente'\r\n  );\r\nEND;\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "promote_from_waitlist",
    "function_body": "\r\nDECLARE\r\n  waitlist_entry RECORD;\r\n  subscription_record RECORD;\r\n  class_schedule_record RECORD;\r\n  class_record RECORD;\r\n  current_bookings INTEGER;\r\nBEGIN\r\n  -- Only process when a booking is cancelled/removed\r\n  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN\r\n    -- Lock the schedule to prevent race conditions\r\n    SELECT * INTO class_schedule_record\r\n    FROM class_schedules\r\n    WHERE id = NEW.schedule_id\r\n    FOR UPDATE;\r\n\r\n    -- Get class info for max_capacity\r\n    SELECT * INTO class_record\r\n    FROM classes\r\n    WHERE id = class_schedule_record.class_id;\r\n\r\n    -- Get current booking count\r\n    SELECT COUNT(*) INTO current_bookings\r\n    FROM class_bookings\r\n    WHERE schedule_id = NEW.schedule_id\r\n      AND status = 'confirmed'\r\n    FOR UPDATE;\r\n\r\n    -- Only promote if there's space\r\n    IF current_bookings < class_record.max_capacity THEN\r\n      -- Find the first person on the waitlist with locking\r\n      SELECT * INTO waitlist_entry\r\n      FROM class_waitlist\r\n      WHERE schedule_id = NEW.schedule_id\r\n      ORDER BY position ASC\r\n      LIMIT 1\r\n      FOR UPDATE SKIP LOCKED;\r\n\r\n      IF waitlist_entry IS NOT NULL THEN\r\n        -- Get their subscription info\r\n        SELECT * INTO subscription_record\r\n        FROM get_user_valid_subscription(waitlist_entry.user_id)\r\n        WHERE id = waitlist_entry.subscription_id\r\n        LIMIT 1;\r\n\r\n        IF subscription_record IS NOT NULL THEN\r\n          -- Create booking for waitlisted user\r\n          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)\r\n          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');\r\n\r\n          -- Deduct credit\r\n          IF subscription_record.plan_type = 'abonnement' THEN\r\n            UPDATE user_subscriptions\r\n            SET weekly_credits_used = weekly_credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          ELSE\r\n            UPDATE user_subscriptions\r\n            SET credits_remaining = credits_remaining - 1,\r\n                credits_used = credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          END IF;\r\n\r\n          -- Remove from waitlist\r\n          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;\r\n\r\n          -- Update positions for remaining waitlist entries\r\n          UPDATE class_waitlist\r\n          SET position = position - 1\r\n          WHERE schedule_id = NEW.schedule_id\r\n            AND position > waitlist_entry.position;\r\n        END IF;\r\n      END IF;\r\n    END IF;\r\n\r\n  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN\r\n    -- Similar logic for deleted bookings\r\n    SELECT * INTO class_schedule_record\r\n    FROM class_schedules\r\n    WHERE id = OLD.schedule_id\r\n    FOR UPDATE;\r\n\r\n    -- Get class info for max_capacity\r\n    SELECT * INTO class_record\r\n    FROM classes\r\n    WHERE id = class_schedule_record.class_id;\r\n\r\n    SELECT COUNT(*) INTO current_bookings\r\n    FROM class_bookings\r\n    WHERE schedule_id = OLD.schedule_id\r\n      AND status = 'confirmed'\r\n    FOR UPDATE;\r\n\r\n    IF current_bookings < class_record.max_capacity THEN\r\n      SELECT * INTO waitlist_entry\r\n      FROM class_waitlist\r\n      WHERE schedule_id = OLD.schedule_id\r\n      ORDER BY position ASC\r\n      LIMIT 1\r\n      FOR UPDATE SKIP LOCKED;\r\n\r\n      IF waitlist_entry IS NOT NULL THEN\r\n        SELECT * INTO subscription_record\r\n        FROM get_user_valid_subscription(waitlist_entry.user_id)\r\n        WHERE id = waitlist_entry.subscription_id\r\n        LIMIT 1;\r\n\r\n        IF subscription_record IS NOT NULL THEN\r\n          INSERT INTO class_bookings (user_id, schedule_id, subscription_id, status)\r\n          VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');\r\n\r\n          IF subscription_record.plan_type = 'abonnement' THEN\r\n            UPDATE user_subscriptions\r\n            SET weekly_credits_used = weekly_credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          ELSE\r\n            UPDATE user_subscriptions\r\n            SET credits_remaining = credits_remaining - 1,\r\n                credits_used = credits_used + 1\r\n            WHERE id = subscription_record.id;\r\n          END IF;\r\n\r\n          DELETE FROM class_waitlist WHERE id = waitlist_entry.id;\r\n\r\n          -- Update positions\r\n          UPDATE class_waitlist\r\n          SET position = position - 1\r\n          WHERE schedule_id = OLD.schedule_id\r\n            AND position > waitlist_entry.position;\r\n        END IF;\r\n      END IF;\r\n    END IF;\r\n  END IF;\r\n\r\n  RETURN COALESCE(NEW, OLD);\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    -- Log errors but don't fail the transaction\r\n    RAISE LOG 'Error in promote_from_waitlist trigger: %', SQLERRM;\r\n    RETURN COALESCE(NEW, OLD);\r\nEND;\r\n",
    "return_type": "trigger",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "reset_weekly_credits",
    "function_body": "\r\nDECLARE\r\n    affected_rows INTEGER := 0;\r\n    log_message TEXT;\r\nBEGIN\r\n    -- Update all active abonnement subscriptions to reset weekly credits\r\n    UPDATE public.user_subscriptions\r\n    SET\r\n        weekly_credits_used = 0,\r\n        last_weekly_reset = NOW(),\r\n        updated_at = NOW()\r\n    FROM public.subscription_plans sp\r\n    WHERE user_subscriptions.plan_id = sp.id\r\n        AND user_subscriptions.status = 'active'\r\n        AND sp.type = 'abonnement'\r\n        AND user_subscriptions.end_date > NOW();\r\n\r\n    GET DIAGNOSTICS affected_rows = ROW_COUNT;\r\n\r\n    log_message := format('Weekly credits reset completed. %s abonnement subscriptions updated at %s',\r\n                         affected_rows, NOW());\r\n\r\n    -- Log the operation\r\n    RAISE LOG '%', log_message;\r\n\r\n    -- Return success with details\r\n    RETURN jsonb_build_object(\r\n        'success', true,\r\n        'affected_rows', affected_rows,\r\n        'reset_time', NOW(),\r\n        'message', log_message\r\n    );\r\n\r\nEXCEPTION\r\n    WHEN others THEN\r\n        RAISE LOG 'Error in reset_weekly_credits: %', SQLERRM;\r\n        RETURN jsonb_build_object(\r\n            'success', false,\r\n            'error', SQLERRM,\r\n            'reset_time', NOW()\r\n        );\r\nEND;\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "set_waitlist_position",
    "function_body": "\r\nBEGIN\r\n  -- Set position as the last in line\r\n  NEW.position = COALESCE(\r\n    (SELECT MAX(position) FROM public.class_waitlist\r\n     WHERE schedule_id = NEW.schedule_id) + 1,\r\n    1\r\n  );\r\n  RETURN NEW;\r\nEND;\r\n",
    "return_type": "trigger",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_booking_count",
    "function_body": "\r\nBEGIN\r\n  IF TG_OP = 'INSERT' THEN\r\n    -- Increase booking count\r\n    UPDATE public.class_schedules\r\n    SET current_bookings = current_bookings + 1\r\n    WHERE id = NEW.schedule_id;\r\n    RETURN NEW;\r\n  ELSIF TG_OP = 'UPDATE' THEN\r\n    -- Handle status changes\r\n    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN\r\n      -- Booking was cancelled/no-show, decrease count\r\n      UPDATE public.class_schedules\r\n      SET current_bookings = current_bookings - 1\r\n      WHERE id = NEW.schedule_id;\r\n    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN\r\n      -- Booking was restored, increase count\r\n      UPDATE public.class_schedules\r\n      SET current_bookings = current_bookings + 1\r\n      WHERE id = NEW.schedule_id;\r\n    END IF;\r\n    RETURN NEW;\r\n  ELSIF TG_OP = 'DELETE' THEN\r\n    -- Decrease booking count only if booking was confirmed\r\n    IF OLD.status = 'confirmed' THEN\r\n      UPDATE public.class_schedules\r\n      SET current_bookings = current_bookings - 1\r\n      WHERE id = OLD.schedule_id;\r\n    END IF;\r\n    RETURN OLD;\r\n  END IF;\r\n  RETURN NULL;\r\nEND;\r\n",
    "return_type": "trigger",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_subscription_credits",
    "function_body": "\r\n\r\nDECLARE\r\n  result_data jsonb;\r\nBEGIN\r\n  -- Update the subscription credits atomically\r\n  UPDATE public.user_subscriptions\r\n  SET\r\n    credits_remaining = GREATEST(0, credits_remaining + credits_change),\r\n    weekly_credits_used = GREATEST(0, weekly_credits_used + weekly_credits_change),\r\n    credits_used = GREATEST(0, COALESCE(credits_used, 0) + credits_used_change),\r\n    updated_at = NOW()\r\n  WHERE id = subscription_uuid\r\n  RETURNING jsonb_build_object(\r\n    'id', id,\r\n    'credits_remaining', credits_remaining,\r\n    'weekly_credits_used', weekly_credits_used,\r\n    'credits_used', credits_used,\r\n    'updated_at', updated_at\r\n  ) INTO result_data;\r\n\r\n  -- Check if any row was updated\r\n  IF result_data IS NULL THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'message', 'Abonnement introuvable'\r\n    );\r\n  END IF;\r\n\r\n  -- Return success with updated data\r\n  RETURN jsonb_build_object(\r\n    'success', true,\r\n    'subscription', result_data,\r\n    'message', 'Crédits mis à jour avec succès'\r\n  );\r\n\r\nEXCEPTION\r\n  WHEN others THEN\r\n    RETURN jsonb_build_object(\r\n      'success', false,\r\n      'message', 'Erreur lors de la mise à jour des crédits: ' || SQLERRM\r\n    );\r\nEND;\r\n\r\n",
    "return_type": "jsonb",
    "routine_type": "FUNCTION"
  },
  {
    "function_name": "update_updated_at_column",
    "function_body": "\r\nBEGIN\r\n    NEW.updated_at = NOW();\r\n    RETURN NEW;\r\nEND;\r\n",
    "return_type": "trigger",
    "routine_type": "FUNCTION"
  }
]
  
3. All Indexes

[
  {
    "schemaname": "public",
    "tablename": "booking_audit",
    "indexname": "booking_audit_pkey",
    "indexdef": "CREATE UNIQUE INDEX booking_audit_pkey ON public.booking_audit USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "booking_audit",
    "indexname": "idx_booking_audit_booking_operation",
    "indexdef": "CREATE INDEX idx_booking_audit_booking_operation ON public.booking_audit USING btree (booking_id, operation)"
  },
  {
    "schemaname": "public",
    "tablename": "booking_audit",
    "indexname": "idx_booking_audit_user_created",
    "indexdef": "CREATE INDEX idx_booking_audit_user_created ON public.booking_audit USING btree (user_id, created_at)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "class_bookings_pkey",
    "indexdef": "CREATE UNIQUE INDEX class_bookings_pkey ON public.class_bookings USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "class_bookings_user_id_schedule_id_key",
    "indexdef": "CREATE UNIQUE INDEX class_bookings_user_id_schedule_id_key ON public.class_bookings USING btree (user_id, schedule_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_booked_at",
    "indexdef": "CREATE INDEX idx_class_bookings_booked_at ON public.class_bookings USING btree (booked_at)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_schedule_id",
    "indexdef": "CREATE INDEX idx_class_bookings_schedule_id ON public.class_bookings USING btree (schedule_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_schedule_status",
    "indexdef": "CREATE INDEX idx_class_bookings_schedule_status ON public.class_bookings USING btree (schedule_id, status)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_status",
    "indexdef": "CREATE INDEX idx_class_bookings_status ON public.class_bookings USING btree (status)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_subscription_id",
    "indexdef": "CREATE INDEX idx_class_bookings_subscription_id ON public.class_bookings USING btree (subscription_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_user_id",
    "indexdef": "CREATE INDEX idx_class_bookings_user_id ON public.class_bookings USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "indexname": "idx_class_bookings_user_status_active",
    "indexdef": "CREATE INDEX idx_class_bookings_user_status_active ON public.class_bookings USING btree (user_id, status) WHERE (status = 'confirmed'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "class_schedules_pkey",
    "indexdef": "CREATE UNIQUE INDEX class_schedules_pkey ON public.class_schedules USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_class_id",
    "indexdef": "CREATE INDEX idx_class_schedules_class_id ON public.class_schedules USING btree (class_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_created_by",
    "indexdef": "CREATE INDEX idx_class_schedules_created_by ON public.class_schedules USING btree (created_by)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_datetime_range",
    "indexdef": "CREATE INDEX idx_class_schedules_datetime_range ON public.class_schedules USING btree (start_datetime, end_datetime) WHERE ((NOT is_cancelled) AND (NOT is_exception))"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_end_datetime",
    "indexdef": "CREATE INDEX idx_class_schedules_end_datetime ON public.class_schedules USING btree (end_datetime)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_exception",
    "indexdef": "CREATE INDEX idx_class_schedules_exception ON public.class_schedules USING btree (is_exception)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_parent_id",
    "indexdef": "CREATE INDEX idx_class_schedules_parent_id ON public.class_schedules USING btree (parent_schedule_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_recurring",
    "indexdef": "CREATE INDEX idx_class_schedules_recurring ON public.class_schedules USING btree (is_recurring)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_start_datetime",
    "indexdef": "CREATE INDEX idx_class_schedules_start_datetime ON public.class_schedules USING btree (start_datetime)"
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "indexname": "idx_class_schedules_start_future",
    "indexdef": "CREATE INDEX idx_class_schedules_start_future ON public.class_schedules USING btree (start_datetime) WHERE ((NOT is_cancelled) AND (NOT is_exception))"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "class_waitlist_pkey",
    "indexdef": "CREATE UNIQUE INDEX class_waitlist_pkey ON public.class_waitlist USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "class_waitlist_user_id_schedule_id_key",
    "indexdef": "CREATE UNIQUE INDEX class_waitlist_user_id_schedule_id_key ON public.class_waitlist USING btree (user_id, schedule_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "idx_class_waitlist_joined_at",
    "indexdef": "CREATE INDEX idx_class_waitlist_joined_at ON public.class_waitlist USING btree (joined_at)"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "idx_class_waitlist_position",
    "indexdef": "CREATE INDEX idx_class_waitlist_position ON public.class_waitlist USING btree (\"position\")"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "idx_class_waitlist_schedule_id",
    "indexdef": "CREATE INDEX idx_class_waitlist_schedule_id ON public.class_waitlist USING btree (schedule_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "idx_class_waitlist_schedule_position",
    "indexdef": "CREATE INDEX idx_class_waitlist_schedule_position ON public.class_waitlist USING btree (schedule_id, \"position\")"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "idx_class_waitlist_subscription_id",
    "indexdef": "CREATE INDEX idx_class_waitlist_subscription_id ON public.class_waitlist USING btree (subscription_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "indexname": "idx_class_waitlist_user_id",
    "indexdef": "CREATE INDEX idx_class_waitlist_user_id ON public.class_waitlist USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "indexname": "classes_pkey",
    "indexdef": "CREATE UNIQUE INDEX classes_pkey ON public.classes USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "indexname": "idx_classes_coach",
    "indexdef": "CREATE INDEX idx_classes_coach ON public.classes USING btree (coach)"
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "indexname": "idx_classes_created_at",
    "indexdef": "CREATE INDEX idx_classes_created_at ON public.classes USING btree (created_at)"
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "indexname": "idx_classes_difficulty_level",
    "indexdef": "CREATE INDEX idx_classes_difficulty_level ON public.classes USING btree (difficulty_level)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "idx_profiles_role_admin",
    "indexdef": "CREATE INDEX idx_profiles_role_admin ON public.profiles USING btree (role) WHERE (role = 'admin'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "idx_profiles_subscription_status_created",
    "indexdef": "CREATE INDEX idx_profiles_subscription_status_created ON public.profiles USING btree (subscription_status, created_at)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "profiles_email_key",
    "indexdef": "CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "profiles_pkey",
    "indexdef": "CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_plans",
    "indexname": "idx_subscription_plans_type",
    "indexdef": "CREATE INDEX idx_subscription_plans_type ON public.subscription_plans USING btree (type)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_plans",
    "indexname": "subscription_plans_pkey",
    "indexdef": "CREATE UNIQUE INDEX subscription_plans_pkey ON public.subscription_plans USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_requests",
    "indexname": "idx_subscription_requests_plan_id",
    "indexdef": "CREATE INDEX idx_subscription_requests_plan_id ON public.subscription_requests USING btree (plan_id)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_requests",
    "indexname": "idx_subscription_requests_user_id",
    "indexdef": "CREATE INDEX idx_subscription_requests_user_id ON public.subscription_requests USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_requests",
    "indexname": "subscription_requests_pkey",
    "indexdef": "CREATE UNIQUE INDEX subscription_requests_pkey ON public.subscription_requests USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "indexname": "idx_user_subscriptions_active_users",
    "indexdef": "CREATE INDEX idx_user_subscriptions_active_users ON public.user_subscriptions USING btree (status, end_date) WHERE (status = 'active'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "indexname": "idx_user_subscriptions_plan_id",
    "indexdef": "CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions USING btree (plan_id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "indexname": "idx_user_subscriptions_status_end_date",
    "indexdef": "CREATE INDEX idx_user_subscriptions_status_end_date ON public.user_subscriptions USING btree (user_id, status, end_date)"
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "indexname": "idx_user_subscriptions_user_id",
    "indexdef": "CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "indexname": "user_subscriptions_pkey",
    "indexdef": "CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id)"
  }
]

3.5. Admin Settings Table

-- Admin Settings Table
-- This table stores all configurable application settings

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  data_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'array', 'object'
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users with admin role can access settings
CREATE POLICY "Admin users can manage settings" ON admin_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles
      WHERE role = 'admin'
    )
  );

-- Insert default settings values
INSERT INTO admin_settings (key, value, category, description, data_type, is_required) VALUES
-- Business Rules & Policies
('cancellation_deadline_hours', '24', 'business_rules', 'Minimum hours before class to allow cancellation', 'number', true),
('default_weekly_limit', '3', 'business_rules', 'Default weekly class limit for new subscriptions', 'number', true),
('max_booking_days_ahead', '30', 'business_rules', 'Maximum days in advance users can book classes', 'number', true),
('min_cancellation_hours', '2', 'business_rules', 'Minimum hours notice required for cancellation', 'number', true),
('default_class_duration', '45', 'business_rules', 'Default class duration in minutes', 'number', true),
('max_class_capacity', '50', 'business_rules', 'Maximum class capacity', 'number', true),
('min_class_capacity', '1', 'business_rules', 'Minimum class capacity', 'number', true),
('max_subscription_price', '5000', 'business_rules', 'Maximum subscription plan price in DHS', 'number', true),
('max_credits_per_plan', '100', 'business_rules', 'Maximum credits per subscription plan', 'number', true),
('max_weekly_limit', '20', 'business_rules', 'Maximum weekly class limit for subscriptions', 'number', true),
('max_validity_months', '24', 'business_rules', 'Maximum subscription validity period in months', 'number', true),

-- Contact Information & Business Details
('app_name', '"Koncept Studio"', 'business_info', 'Application/Studio name', 'string', true),
('studio_phone', '"0663235797"', 'business_info', 'Studio phone number', 'string', true),
('studio_email', '"contact@konceptstudio.ma"', 'business_info', 'Studio email address', 'string', true),
('studio_location', '"155 SECT 02 SAHL EL HIJAZ RYAD OULAD MTAA, Temara"', 'business_info', 'Studio location', 'string', true),
('studio_address', '"155 SECT 02 SAHL EL HIJAZ RYAD OULAD MTAA, Temara"', 'business_info', 'Studio full address', 'string', true),
('instagram_url', '"https://instagram.com/k_oncept_training"', 'business_info', 'Instagram profile URL', 'string', false),
('instagram_handle', '"@k_oncept_training"', 'business_info', 'Instagram handle', 'string', false),
('operating_hours', '"Du lundi au vendredi de 7h00 à 21h00, et le samedi de 10h00 à 13h00"', 'business_info', 'Studio operating hours', 'string', true),

-- User Interface Settings
('animation_duration_short', '150', 'ui_settings', 'Short animation duration in milliseconds', 'number', false),
('animation_duration_medium', '300', 'ui_settings', 'Medium animation duration in milliseconds', 'number', false),
('animation_duration_long', '500', 'ui_settings', 'Long animation duration in milliseconds', 'number', false),
('toast_duration_success', '3000', 'ui_settings', 'Success toast duration in milliseconds', 'number', false),
('toast_duration_error', '5000', 'ui_settings', 'Error toast duration in milliseconds', 'number', false),
('toast_duration_warning', '4000', 'ui_settings', 'Warning toast duration in milliseconds', 'number', false),
('toast_duration_info', '3000', 'ui_settings', 'Info toast duration in milliseconds', 'number', false),
('default_page_size', '10', 'ui_settings', 'Default number of items per page', 'number', false),
('max_page_size', '100', 'ui_settings', 'Maximum items per page', 'number', false),
('max_file_size', '5242880', 'ui_settings', 'Maximum file upload size in bytes (5MB)', 'number', false),
('allowed_image_types', '["image/jpeg", "image/png", "image/webp"]', 'ui_settings', 'Allowed image file types', 'array', false),
('api_timeout', '10000', 'ui_settings', 'API request timeout in milliseconds', 'number', false),
('upload_timeout', '30000', 'ui_settings', 'File upload timeout in milliseconds', 'number', false),

-- Date & Time Formatting
('date_format', '"dd/MM/yyyy"', 'formatting', 'Date display format', 'string', false),
('datetime_format', '"dd/MM/yyyy HH:mm"', 'formatting', 'Date-time display format', 'string', false),
('time_format', '"HH:mm"', 'formatting', 'Time display format', 'string', false),
('locale', '"fr"', 'formatting', 'Application locale', 'string', false),

-- Validation Rules
('password_min_length', '8', 'validation', 'Minimum password length', 'number', true),
('phone_validation_pattern', '"^0[6-7]\\d{8}$"', 'validation', 'Phone number validation regex pattern', 'string', true),
('name_min_length', '2', 'validation', 'Minimum name length', 'number', true),
('name_max_length', '100', 'validation', 'Maximum name length', 'number', true),

-- Communication Settings
('whatsapp_country_code', '"212"', 'communication', 'Default country code for WhatsApp', 'string', true),
('whatsapp_sender_number', '"+14155238886"', 'communication', 'WhatsApp sender number (Twilio)', 'string', true),

-- FAQ Content (stored as JSON array)
('faq_content', '[
  {
    "question": "Quels sont les types de cours proposés ?",
    "answer": "Nous proposons une variété de cours incluant le fitness, le yoga, le pilates, et l''entraînement fonctionnel. Consultez notre planning pour voir tous les cours disponibles."
  },
  {
    "question": "Comment puis-je réserver un cours ?",
    "answer": "Vous pouvez réserver directement via notre plateforme en ligne. Sélectionnez le cours souhaité dans le planning et confirmez votre réservation."
  },
  {
    "question": "Quelle est la politique d''annulation ?",
    "answer": "Vous pouvez annuler votre réservation jusqu''à 24 heures avant le début du cours. Les annulations tardives peuvent entraîner la perte de votre crédit."
  },
  {
    "question": "Les cours sont-ils adaptés aux débutants ?",
    "answer": "Absolument ! Nos instructeurs qualifiés adaptent les exercices à tous les niveaux. N''hésitez pas à nous informer si vous êtes débutant."
  },
  {
    "question": "Que dois-je apporter pour mon premier cours ?",
    "answer": "Apportez une tenue de sport confortable, une serviette et une bouteille d''eau. Nous fournissons tout le matériel nécessaire pour les cours."
  }
]', 'content', 'FAQ questions and answers', 'array', false)
ON CONFLICT (key) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

4. All Triggers

[
  {
    "trigger_name": "promote_from_waitlist_trigger",
    "event_manipulation": "UPDATE",
    "event_object_table": "class_bookings",
    "action_statement": "EXECUTE FUNCTION promote_from_waitlist()",
    "action_timing": "AFTER",
    "action_condition": null
  },
  {
    "trigger_name": "promote_from_waitlist_trigger",
    "event_manipulation": "DELETE",
    "event_object_table": "class_bookings",
    "action_statement": "EXECUTE FUNCTION promote_from_waitlist()",
    "action_timing": "AFTER",
    "action_condition": null
  },
  {
    "trigger_name": "update_booking_count_trigger",
    "event_manipulation": "DELETE",
    "event_object_table": "class_bookings",
    "action_statement": "EXECUTE FUNCTION update_booking_count()",
    "action_timing": "AFTER",
    "action_condition": null
  },
  {
    "trigger_name": "update_booking_count_trigger",
    "event_manipulation": "UPDATE",
    "event_object_table": "class_bookings",
    "action_statement": "EXECUTE FUNCTION update_booking_count()",
    "action_timing": "AFTER",
    "action_condition": null
  },
  {
    "trigger_name": "update_booking_count_trigger",
    "event_manipulation": "INSERT",
    "event_object_table": "class_bookings",
    "action_statement": "EXECUTE FUNCTION update_booking_count()",
    "action_timing": "AFTER",
    "action_condition": null
  },
  {
    "trigger_name": "update_class_bookings_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "class_bookings",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_class_schedules_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "class_schedules",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "adjust_waitlist_positions_trigger",
    "event_manipulation": "DELETE",
    "event_object_table": "class_waitlist",
    "action_statement": "EXECUTE FUNCTION adjust_waitlist_positions()",
    "action_timing": "AFTER",
    "action_condition": null
  },
  {
    "trigger_name": "set_waitlist_position_trigger",
    "event_manipulation": "INSERT",
    "event_object_table": "class_waitlist",
    "action_statement": "EXECUTE FUNCTION set_waitlist_position()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_class_waitlist_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "class_waitlist",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_classes_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "classes",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_profiles_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "profiles",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_subscription_plans_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "subscription_plans",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_subscription_requests_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "subscription_requests",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  },
  {
    "trigger_name": "update_user_subscriptions_updated_at",
    "event_manipulation": "UPDATE",
    "event_object_table": "user_subscriptions",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
    "action_timing": "BEFORE",
    "action_condition": null
  }
]

5. Row-Level Security (RLS) Policies

[
  {
    "schemaname": "public",
    "tablename": "booking_audit",
    "policyname": "Admins can manage audit entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "booking_audit",
    "policyname": "System can insert audit entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "booking_audit",
    "policyname": "Users can view own audit entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((user_id = auth.uid()) OR (EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "policyname": "Admins can manage all bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "policyname": "Users can create own bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "policyname": "Users can update own bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_bookings",
    "policyname": "Users can view own bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "policyname": "Admins can manage class schedules",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "check_user_admin(auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_schedules",
    "policyname": "Users can view class schedules",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((NOT is_cancelled) AND (NOT is_exception))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "policyname": "Admins can manage all waitlist entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "policyname": "Users can create own waitlist entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "policyname": "Users can delete own waitlist entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "class_waitlist",
    "policyname": "Users can view own waitlist entries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "policyname": "Admins can manage classes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "check_user_admin(auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "policyname": "Users can view classes",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Admins can update all profiles",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "is_admin(auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Admins can view all profiles",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "is_admin(auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Enable insert for authenticated users",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = id)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Users can update own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Users can view own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_plans",
    "policyname": "Admins can manage subscription plans",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_plans",
    "policyname": "Anyone can view subscription plans",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_requests",
    "policyname": "Admins can manage subscription requests",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(( SELECT profiles.role\n   FROM profiles\n  WHERE (profiles.id = auth.uid())\n LIMIT 1) = 'admin'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "subscription_requests",
    "policyname": "Users can create subscription requests",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_requests",
    "policyname": "Users can view own subscription requests",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "policyname": "Admins can manage subscriptions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(( SELECT profiles.role\n   FROM profiles\n  WHERE (profiles.id = auth.uid())\n LIMIT 1) = 'admin'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "policyname": "Admins can view all subscriptions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(( SELECT profiles.role\n   FROM profiles\n  WHERE (profiles.id = auth.uid())\n LIMIT 1) = 'admin'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_subscriptions",
    "policyname": "Users can view own subscriptions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  }
]

6. All Views

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

7. Foreign Key Relationships

[
  {
    "constraint_name": "booking_audit_schedule_id_fkey",
    "table_name": "booking_audit",
    "column_name": "schedule_id",
    "foreign_table_name": "class_schedules",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
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
    "constraint_name": "subscription_requests_plan_id_fkey",
    "table_name": "subscription_requests",
    "column_name": "plan_id",
    "foreign_table_name": "subscription_plans",
    "foreign_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "RESTRICT"
  },
  {
    "constraint_name": "subscription_requests_user_id_fkey",
    "table_name": "subscription_requests",
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
  }
]

8. Table Permissions and RLS Status

[
  {
    "table_name": "booking_audit",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "class_bookings",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "class_schedules",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "class_waitlist",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "classes",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "profiles",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "subscription_plans",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "subscription_requests",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_name": "user_subscriptions",
    "rls_enabled": true,
    "rls_forced": false
  }
]

9. Enum Types

No rows returned  
