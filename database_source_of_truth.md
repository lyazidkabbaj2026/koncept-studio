-- 1. Get all table structures

| table_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE TABLE admin_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    key varchar(255) NOT NULL,
    value jsonb NOT NULL,
    category varchar(100) NOT NULL,
    description text,
    data_type varchar(50) NOT NULL,
    is_required boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE TABLE calendar_events (
    id uuid,
    class_id uuid,
    title varchar(255),
    description text,
    coach varchar(255),
    location varchar(255),
    difficulty_level varchar(20),
    max_capacity integer,
    start_datetime timestamp with time zone,
    end_datetime timestamp with time zone,
    is_recurring boolean,
    recurrence_rule jsonb,
    parent_schedule_id uuid,
    is_exception boolean,
    exception_reason text,
    current_bookings integer,
    is_cancelled boolean,
    cancellation_reason text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);                                                                                                                                                                                                                                                                                                                            |
| CREATE TABLE calendar_events_optimized (
    id uuid,
    class_id uuid,
    title varchar(255),
    description text,
    coach varchar(255),
    location varchar(255),
    difficulty_level varchar(20),
    max_capacity integer,
    start_datetime timestamp with time zone,
    end_datetime timestamp with time zone,
    current_bookings integer,
    is_cancelled boolean,
    is_exception boolean
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE TABLE class_bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    schedule_id uuid NOT NULL,
    subscription_id uuid NOT NULL,
    status text DEFAULT 'confirmed'::text,
    booked_at timestamp with time zone DEFAULT now(),
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE TABLE class_schedules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    is_recurring boolean DEFAULT false,
    recurrence_rule jsonb,
    recurrence_end_date timestamp with time zone,
    parent_schedule_id uuid,
    is_exception boolean DEFAULT false,
    exception_reason text,
    current_bookings integer DEFAULT 0,
    is_cancelled boolean DEFAULT false,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);                                                                                                                                                                                                                                                                    |
| CREATE TABLE class_waitlist (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    schedule_id uuid NOT NULL,
    subscription_id uuid NOT NULL,
    position integer NOT NULL,
    joined_at timestamp with time zone DEFAULT now(),
    notified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE TABLE classes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    description text,
    duration integer NOT NULL,
    max_capacity integer NOT NULL DEFAULT 1,
    coach varchar(255) NOT NULL,
    location varchar(255) NOT NULL,
    difficulty_level varchar(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE TABLE profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    desired_plan text,
    role text DEFAULT 'user'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subscription_status text DEFAULT 'pending'::text
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE TABLE subscription_plans (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL,
    credits integer NOT NULL,
    price_dhs integer NOT NULL,
    validity_months integer NOT NULL,
    weekly_limit integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE TABLE subscription_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    priority integer NOT NULL DEFAULT 3,
    request_type text NOT NULL DEFAULT 'new'::text,
    user_notes text,
    preferred_start_date date,
    budget_max integer,
    contact_method text,
    notes text,
    assigned_to uuid,
    fulfilled_at timestamp with time zone,
    fulfilled_by uuid,
    resulting_subscription_id uuid,
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + '30 days'::interval),
    requested_at timestamp with time zone DEFAULT now(),
    contacted_at timestamp with time zone,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    is_active boolean NOT NULL DEFAULT true
); |
| CREATE TABLE user_subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text DEFAULT 'active'::text,
    credits_remaining integer NOT NULL,
    credits_used integer DEFAULT 0,
    weekly_credits_used integer DEFAULT 0,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone NOT NULL,
    last_weekly_reset timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE TABLE whatsapp_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    event_type text NOT NULL,
    phone_number text NOT NULL,
    message_content text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    error_message text,
    twilio_message_sid text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

-- 2. Get all indexes

| index_definition                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE UNIQUE INDEX admin_settings_key_key ON public.admin_settings USING btree (key);                                                                                  |
| CREATE INDEX idx_admin_settings_category ON public.admin_settings USING btree (category);                                                                               |
| CREATE INDEX idx_admin_settings_key ON public.admin_settings USING btree (key);                                                                                         |
| CREATE UNIQUE INDEX class_bookings_user_id_schedule_id_key ON public.class_bookings USING btree (user_id, schedule_id);                                                 |
| CREATE INDEX idx_class_bookings_booked_at ON public.class_bookings USING btree (booked_at);                                                                             |
| CREATE INDEX idx_class_bookings_schedule_id ON public.class_bookings USING btree (schedule_id);                                                                         |
| CREATE INDEX idx_class_bookings_schedule_status ON public.class_bookings USING btree (schedule_id, status);                                                             |
| CREATE INDEX idx_class_bookings_status ON public.class_bookings USING btree (status);                                                                                   |
| CREATE INDEX idx_class_bookings_subscription_id ON public.class_bookings USING btree (subscription_id);                                                                 |
| CREATE INDEX idx_class_bookings_user_id ON public.class_bookings USING btree (user_id);                                                                                 |
| CREATE INDEX idx_class_bookings_user_status_active ON public.class_bookings USING btree (user_id, status) WHERE (status = 'confirmed'::text);                           |
| CREATE INDEX idx_class_schedules_class_id ON public.class_schedules USING btree (class_id);                                                                             |
| CREATE INDEX idx_class_schedules_created_by ON public.class_schedules USING btree (created_by);                                                                         |
| CREATE INDEX idx_class_schedules_datetime_range ON public.class_schedules USING btree (start_datetime, end_datetime) WHERE ((NOT is_cancelled) AND (NOT is_exception)); |
| CREATE INDEX idx_class_schedules_end_datetime ON public.class_schedules USING btree (end_datetime);                                                                     |
| CREATE INDEX idx_class_schedules_exception ON public.class_schedules USING btree (is_exception);                                                                        |
| CREATE INDEX idx_class_schedules_parent_id ON public.class_schedules USING btree (parent_schedule_id);                                                                  |
| CREATE INDEX idx_class_schedules_recurring ON public.class_schedules USING btree (is_recurring);                                                                        |
| CREATE INDEX idx_class_schedules_start_datetime ON public.class_schedules USING btree (start_datetime);                                                                 |
| CREATE INDEX idx_class_schedules_start_future ON public.class_schedules USING btree (start_datetime) WHERE ((NOT is_cancelled) AND (NOT is_exception));                 |
| CREATE UNIQUE INDEX class_waitlist_user_id_schedule_id_key ON public.class_waitlist USING btree (user_id, schedule_id);                                                 |
| CREATE INDEX idx_class_waitlist_joined_at ON public.class_waitlist USING btree (joined_at);                                                                             |
| CREATE INDEX idx_class_waitlist_position ON public.class_waitlist USING btree ("position");                                                                             |
| CREATE INDEX idx_class_waitlist_schedule_id ON public.class_waitlist USING btree (schedule_id);                                                                         |
| CREATE INDEX idx_class_waitlist_schedule_position ON public.class_waitlist USING btree (schedule_id, "position");                                                       |
| CREATE INDEX idx_class_waitlist_subscription_id ON public.class_waitlist USING btree (subscription_id);                                                                 |
| CREATE INDEX idx_class_waitlist_user_id ON public.class_waitlist USING btree (user_id);                                                                                 |
| CREATE INDEX idx_classes_coach ON public.classes USING btree (coach);                                                                                                   |
| CREATE INDEX idx_classes_created_at ON public.classes USING btree (created_at);                                                                                         |
| CREATE INDEX idx_classes_difficulty_level ON public.classes USING btree (difficulty_level);                                                                             |
| CREATE INDEX idx_profiles_role_admin ON public.profiles USING btree (role) WHERE (role = 'admin'::text);                                                                |
| CREATE INDEX idx_profiles_subscription_status_created ON public.profiles USING btree (subscription_status, created_at);                                                 |
| CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);                                                                                          |
| CREATE INDEX idx_subscription_plans_type ON public.subscription_plans USING btree (type);                                                                               |
| CREATE INDEX idx_subscription_requests_expires_at ON public.subscription_requests USING btree (expires_at);                                                             |
| CREATE INDEX idx_subscription_requests_is_active ON public.subscription_requests USING btree (is_active);                                                               |
| CREATE INDEX idx_subscription_requests_plan_id ON public.subscription_requests USING btree (plan_id);                                                                   |
| CREATE INDEX idx_subscription_requests_priority ON public.subscription_requests USING btree (priority);                                                                 |
| CREATE INDEX idx_subscription_requests_status ON public.subscription_requests USING btree (status);                                                                     |
| CREATE INDEX idx_subscription_requests_user_id ON public.subscription_requests USING btree (user_id);                                                                   |
| CREATE INDEX idx_user_subscriptions_active_users ON public.user_subscriptions USING btree (status, end_date) WHERE (status = 'active'::text);                           |
| CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions USING btree (plan_id);                                                                         |
| CREATE INDEX idx_user_subscriptions_status_end_date ON public.user_subscriptions USING btree (user_id, status, end_date);                                               |
| CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);                                                                         |
| CREATE INDEX idx_whatsapp_logs_created_at ON public.whatsapp_logs USING btree (created_at);                                                                             |
| CREATE INDEX idx_whatsapp_logs_event_type ON public.whatsapp_logs USING btree (event_type);                                                                             |
| CREATE INDEX idx_whatsapp_logs_status ON public.whatsapp_logs USING btree (status);                                                                                     |
| CREATE INDEX idx_whatsapp_logs_user_id ON public.whatsapp_logs USING btree (user_id);                                                                                   |

-- 3. Get all functions (simple version)

| function_definition                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION adjust_waitlist_positions()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;               |
| CREATE OR REPLACE FUNCTION book_class()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                                |
| CREATE OR REPLACE FUNCTION can_user_book_class()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                       |
| CREATE OR REPLACE FUNCTION cancel_booking()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                            |
| CREATE OR REPLACE FUNCTION cancel_booking()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                            |
| CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                |
| CREATE OR REPLACE FUNCTION check_user_admin()
RETURNS boolean
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                        |
| CREATE OR REPLACE FUNCTION cleanup_expired_waitlists()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                 |
| CREATE OR REPLACE FUNCTION create_subscription_request()
RETURNS uuid
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                |
| CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                      |
| CREATE OR REPLACE FUNCTION get_admin_subscription_requests()
RETURNS record
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;          |
| CREATE OR REPLACE FUNCTION get_admin_users_data()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                      |
| CREATE OR REPLACE FUNCTION get_database_performance_stats()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;            |
| CREATE OR REPLACE FUNCTION get_subscription_request_statistics()
RETURNS record
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;      |
| CREATE OR REPLACE FUNCTION get_user_booking_subscription()
RETURNS record
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;            |
| CREATE OR REPLACE FUNCTION get_user_dashboard_data()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                   |
| CREATE OR REPLACE FUNCTION get_user_subscription_requests()
RETURNS record
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;           |
| CREATE OR REPLACE FUNCTION get_user_valid_subscriptions()
RETURNS record
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;             |
| CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                         |
| CREATE OR REPLACE FUNCTION handle_waitlist_promotion()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                 |
| CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                                |
| CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                                |
| CREATE OR REPLACE FUNCTION join_waitlist()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                             |
| CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                   |
| CREATE OR REPLACE FUNCTION refund_booking_credits()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                    |
| CREATE OR REPLACE FUNCTION reset_weekly_credits()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                      |
| CREATE OR REPLACE FUNCTION set_waitlist_position()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                   |
| CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;        |
| CREATE OR REPLACE FUNCTION update_booking_count()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                    |
| CREATE OR REPLACE FUNCTION update_booking_credits()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                    |
| CREATE OR REPLACE FUNCTION update_subscription_credits()
RETURNS jsonb
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;               |
| CREATE OR REPLACE FUNCTION update_subscription_requests_updated_at()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$; |
| CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;                |
| CREATE OR REPLACE FUNCTION update_whatsapp_logs_updated_at()
RETURNS trigger
LANGUAGE PLPGSQL
AS $$ -- Function body would go here $$;         |

-- 4. Get all triggers

| trigger_definition                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE
    ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_admin_settings_updated_at();                      |
| CREATE TRIGGER promote_from_waitlist_trigger
    AFTER UPDATE
    ON class_bookings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION promote_from_waitlist();                                     |
| CREATE TRIGGER promote_from_waitlist_trigger
    AFTER DELETE
    ON class_bookings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION promote_from_waitlist();                                     |
| CREATE TRIGGER update_booking_count_trigger
    AFTER DELETE
    ON class_bookings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_booking_count();                                       |
| CREATE TRIGGER update_booking_count_trigger
    AFTER UPDATE
    ON class_bookings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_booking_count();                                       |
| CREATE TRIGGER update_booking_count_trigger
    AFTER INSERT
    ON class_bookings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_booking_count();                                       |
| CREATE TRIGGER update_class_bookings_updated_at
    BEFORE UPDATE
    ON class_bookings
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                              |
| CREATE TRIGGER update_class_schedules_updated_at
    BEFORE UPDATE
    ON class_schedules
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                            |
| CREATE TRIGGER adjust_waitlist_positions_trigger
    AFTER DELETE
    ON class_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION adjust_waitlist_positions();                             |
| CREATE TRIGGER set_waitlist_position_trigger
    BEFORE INSERT
    ON class_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION set_waitlist_position();                                    |
| CREATE TRIGGER update_class_waitlist_updated_at
    BEFORE UPDATE
    ON class_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                              |
| CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE
    ON classes
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                                            |
| CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE
    ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                                          |
| CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE
    ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                      |
| CREATE TRIGGER update_subscription_requests_updated_at
    BEFORE UPDATE
    ON subscription_requests
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_subscription_requests_updated_at(); |
| CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE
    ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();                      |
| CREATE TRIGGER update_whatsapp_logs_updated_at_trigger
    BEFORE UPDATE
    ON whatsapp_logs
    FOR EACH ROW
    EXECUTE FUNCTION EXECUTE FUNCTION update_whatsapp_logs_updated_at();                 |

-- 5. Get RLS enabled tables

| rls_definition                                               |
| ------------------------------------------------------------ |
| ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;        |
| ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;        |
| ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;       |
| ALTER TABLE class_waitlist ENABLE ROW LEVEL SECURITY;        |
| ALTER TABLE classes ENABLE ROW LEVEL SECURITY;               |
| ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;              |
| ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;    |
| ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY; |
| ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;    |
| ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;         |

-- 6. Get all primary key constraints

[
  {
    "pk_definition": "ALTER TABLE admin_settings ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE class_bookings ADD CONSTRAINT class_bookings_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE class_schedules ADD CONSTRAINT class_schedules_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE class_waitlist ADD CONSTRAINT class_waitlist_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE classes ADD CONSTRAINT classes_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);"
  },
  {
    "pk_definition": "ALTER TABLE whatsapp_logs ADD CONSTRAINT whatsapp_logs_pkey PRIMARY KEY (id);"
  }
]

-- 7. Get all foreign key constraints

| fk_definition                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALTER TABLE class_bookings ADD CONSTRAINT class_bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES class_schedules(id);                                              |
| ALTER TABLE class_bookings ADD CONSTRAINT class_bookings_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id);                                   |
| ALTER TABLE class_bookings ADD CONSTRAINT class_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);                                                             |
| ALTER TABLE class_schedules ADD CONSTRAINT class_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id);                                                          |
| ALTER TABLE class_schedules ADD CONSTRAINT class_schedules_parent_schedule_id_fkey FOREIGN KEY (parent_schedule_id) REFERENCES class_schedules(id);                              |
| ALTER TABLE class_waitlist ADD CONSTRAINT class_waitlist_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES class_schedules(id);                                              |
| ALTER TABLE class_waitlist ADD CONSTRAINT class_waitlist_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id);                                   |
| ALTER TABLE class_waitlist ADD CONSTRAINT class_waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);                                                             |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);                                     |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_resulting_subscription_id_fkey FOREIGN KEY (resulting_subscription_id) REFERENCES user_subscriptions(id); |
| ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);                                           |
| ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);                                                     |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT whatsapp_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);                                                               |

-- 8. Get all unique constraints

| unique_definition                                                                                               |
| --------------------------------------------------------------------------------------------------------------- |
| ALTER TABLE admin_settings ADD CONSTRAINT admin_settings_key_key UNIQUE (key);                                  |
| ALTER TABLE class_bookings ADD CONSTRAINT class_bookings_user_id_schedule_id_key UNIQUE (user_id, schedule_id); |
| ALTER TABLE class_waitlist ADD CONSTRAINT class_waitlist_user_id_schedule_id_key UNIQUE (user_id, schedule_id); |
| ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);                                          |

-- 9. Get all check constraints

| check_definition                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALTER TABLE admin_settings ADD CONSTRAINT 2200_28078_1_not_null CHECK (id IS NOT NULL);                                                                                                                                          |
| ALTER TABLE admin_settings ADD CONSTRAINT 2200_28078_2_not_null CHECK (key IS NOT NULL);                                                                                                                                         |
| ALTER TABLE admin_settings ADD CONSTRAINT 2200_28078_3_not_null CHECK (value IS NOT NULL);                                                                                                                                       |
| ALTER TABLE admin_settings ADD CONSTRAINT 2200_28078_4_not_null CHECK (category IS NOT NULL);                                                                                                                                    |
| ALTER TABLE admin_settings ADD CONSTRAINT 2200_28078_6_not_null CHECK (data_type IS NOT NULL);                                                                                                                                   |
| ALTER TABLE class_bookings ADD CONSTRAINT 2200_18972_1_not_null CHECK (id IS NOT NULL);                                                                                                                                          |
| ALTER TABLE class_bookings ADD CONSTRAINT 2200_18972_2_not_null CHECK (user_id IS NOT NULL);                                                                                                                                     |
| ALTER TABLE class_bookings ADD CONSTRAINT 2200_18972_3_not_null CHECK (schedule_id IS NOT NULL);                                                                                                                                 |
| ALTER TABLE class_bookings ADD CONSTRAINT 2200_18972_4_not_null CHECK (subscription_id IS NOT NULL);                                                                                                                             |
| ALTER TABLE class_bookings ADD CONSTRAINT class_bookings_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'no_show'::text])));                                                                     |
| ALTER TABLE class_schedules ADD CONSTRAINT 2200_17458_1_not_null CHECK (id IS NOT NULL);                                                                                                                                         |
| ALTER TABLE class_schedules ADD CONSTRAINT 2200_17458_2_not_null CHECK (class_id IS NOT NULL);                                                                                                                                   |
| ALTER TABLE class_schedules ADD CONSTRAINT 2200_17458_3_not_null CHECK (start_datetime IS NOT NULL);                                                                                                                             |
| ALTER TABLE class_schedules ADD CONSTRAINT 2200_17458_4_not_null CHECK (end_datetime IS NOT NULL);                                                                                                                               |
| ALTER TABLE class_waitlist ADD CONSTRAINT 2200_19002_1_not_null CHECK (id IS NOT NULL);                                                                                                                                          |
| ALTER TABLE class_waitlist ADD CONSTRAINT 2200_19002_2_not_null CHECK (user_id IS NOT NULL);                                                                                                                                     |
| ALTER TABLE class_waitlist ADD CONSTRAINT 2200_19002_3_not_null CHECK (schedule_id IS NOT NULL);                                                                                                                                 |
| ALTER TABLE class_waitlist ADD CONSTRAINT 2200_19002_4_not_null CHECK (subscription_id IS NOT NULL);                                                                                                                             |
| ALTER TABLE class_waitlist ADD CONSTRAINT 2200_19002_5_not_null CHECK (position IS NOT NULL);                                                                                                                                    |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_1_not_null CHECK (id IS NOT NULL);                                                                                                                                                 |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_2_not_null CHECK (title IS NOT NULL);                                                                                                                                              |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_4_not_null CHECK (duration IS NOT NULL);                                                                                                                                           |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_6_not_null CHECK (max_capacity IS NOT NULL);                                                                                                                                       |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_7_not_null CHECK (coach IS NOT NULL);                                                                                                                                              |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_8_not_null CHECK (location IS NOT NULL);                                                                                                                                           |
| ALTER TABLE classes ADD CONSTRAINT 2200_17390_9_not_null CHECK (difficulty_level IS NOT NULL);                                                                                                                                   |
| ALTER TABLE profiles ADD CONSTRAINT 2200_17293_1_not_null CHECK (id IS NOT NULL);                                                                                                                                                |
| ALTER TABLE profiles ADD CONSTRAINT 2200_17293_2_not_null CHECK (email IS NOT NULL);                                                                                                                                             |
| ALTER TABLE profiles ADD CONSTRAINT 2200_17293_3_not_null CHECK (full_name IS NOT NULL);                                                                                                                                         |
| ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])));                                                                                                               |
| ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check CHECK ((subscription_status = ANY (ARRAY['pending'::text, 'contacted'::text, 'active'::text, 'inactive'::text])));                                        |
| ALTER TABLE subscription_plans ADD CONSTRAINT 2200_17609_1_not_null CHECK (id IS NOT NULL);                                                                                                                                      |
| ALTER TABLE subscription_plans ADD CONSTRAINT 2200_17609_2_not_null CHECK (name IS NOT NULL);                                                                                                                                    |
| ALTER TABLE subscription_plans ADD CONSTRAINT 2200_17609_3_not_null CHECK (type IS NOT NULL);                                                                                                                                    |
| ALTER TABLE subscription_plans ADD CONSTRAINT 2200_17609_4_not_null CHECK (credits IS NOT NULL);                                                                                                                                 |
| ALTER TABLE subscription_plans ADD CONSTRAINT 2200_17609_5_not_null CHECK (price_dhs IS NOT NULL);                                                                                                                               |
| ALTER TABLE subscription_plans ADD CONSTRAINT 2200_17609_6_not_null CHECK (validity_months IS NOT NULL);                                                                                                                         |
| ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_type_check CHECK ((type = ANY (ARRAY['carnet'::text, 'personal_training'::text, 'abonnement'::text])));                                                         |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_16_not_null CHECK (expires_at IS NOT NULL);                                                                                                                          |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_1_not_null CHECK (id IS NOT NULL);                                                                                                                                   |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_20_not_null CHECK (created_at IS NOT NULL);                                                                                                                          |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_21_not_null CHECK (updated_at IS NOT NULL);                                                                                                                          |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_22_not_null CHECK (is_active IS NOT NULL);                                                                                                                           |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_2_not_null CHECK (user_id IS NOT NULL);                                                                                                                              |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_3_not_null CHECK (plan_id IS NOT NULL);                                                                                                                              |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_4_not_null CHECK (status IS NOT NULL);                                                                                                                               |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_5_not_null CHECK (priority IS NOT NULL);                                                                                                                             |
| ALTER TABLE subscription_requests ADD CONSTRAINT 2200_33417_6_not_null CHECK (request_type IS NOT NULL);                                                                                                                         |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_budget_max_check CHECK ((budget_max > 0));                                                                                                                |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_contact_method_check CHECK ((contact_method = ANY (ARRAY['whatsapp'::text, 'phone'::text, 'email'::text, 'in_person'::text])));                           |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_priority_check CHECK (((priority >= 1) AND (priority <= 5)));                                                                                             |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_request_type_check CHECK ((request_type = ANY (ARRAY['new'::text, 'renewal'::text, 'upgrade'::text, 'additional'::text])));                               |
| ALTER TABLE subscription_requests ADD CONSTRAINT subscription_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'contacted'::text, 'approved'::text, 'fulfilled'::text, 'cancelled'::text, 'expired'::text]))); |
| ALTER TABLE user_subscriptions ADD CONSTRAINT 2200_17621_1_not_null CHECK (id IS NOT NULL);                                                                                                                                      |
| ALTER TABLE user_subscriptions ADD CONSTRAINT 2200_17621_2_not_null CHECK (user_id IS NOT NULL);                                                                                                                                 |
| ALTER TABLE user_subscriptions ADD CONSTRAINT 2200_17621_3_not_null CHECK (plan_id IS NOT NULL);                                                                                                                                 |
| ALTER TABLE user_subscriptions ADD CONSTRAINT 2200_17621_5_not_null CHECK (credits_remaining IS NOT NULL);                                                                                                                       |
| ALTER TABLE user_subscriptions ADD CONSTRAINT 2200_17621_9_not_null CHECK (end_date IS NOT NULL);                                                                                                                                |
| ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])));                                                                |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT 2200_26871_1_not_null CHECK (id IS NOT NULL);                                                                                                                                           |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT 2200_26871_3_not_null CHECK (event_type IS NOT NULL);                                                                                                                                   |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT 2200_26871_4_not_null CHECK (phone_number IS NOT NULL);                                                                                                                                 |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT 2200_26871_5_not_null CHECK (message_content IS NOT NULL);                                                                                                                              |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT 2200_26871_6_not_null CHECK (status IS NOT NULL);                                                                                                                                       |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT whatsapp_logs_event_type_check CHECK ((event_type = ANY (ARRAY['signup'::text, 'activation'::text, 'waitlist_promotion'::text, 'class_cancellation'::text])));                          |
| ALTER TABLE whatsapp_logs ADD CONSTRAINT whatsapp_logs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])));                                                                            |

-- 10. Get basic table info summary

| table_name                | column_count | has_primary_key | has_foreign_keys |
| ------------------------- | ------------ | --------------- | ---------------- |
| admin_settings            | 9            | true            | false            |
| calendar_events           | 20           | false           | false            |
| calendar_events_optimized | 13           | false           | false            |
| class_bookings            | 10           | true            | true             |
| class_schedules           | 16           | true            | true             |
| class_waitlist            | 9            | true            | true             |
| classes                   | 10           | true            | false            |
| profiles                  | 9            | true            | true             |
| subscription_plans        | 9            | true            | false            |
| subscription_requests     | 22           | true            | true             |
| user_subscriptions        | 12           | true            | true             |
| whatsapp_logs             | 10           | true            | true             |