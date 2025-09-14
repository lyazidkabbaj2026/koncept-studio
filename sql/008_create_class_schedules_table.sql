-- Create class schedules table for calendar functionality
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Recurrence fields
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB, -- stores recurrence pattern
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  parent_schedule_id UUID REFERENCES public.class_schedules(id) ON DELETE CASCADE, -- for recurring instances
  
  -- Exception handling
  is_exception BOOLEAN DEFAULT FALSE, -- marks cancelled instances
  exception_reason TEXT,
  
  -- Booking fields
  current_bookings INTEGER DEFAULT 0,
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_id ON public.class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_start_datetime ON public.class_schedules(start_datetime);
CREATE INDEX IF NOT EXISTS idx_class_schedules_end_datetime ON public.class_schedules(end_datetime);
CREATE INDEX IF NOT EXISTS idx_class_schedules_parent_id ON public.class_schedules(parent_schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_recurring ON public.class_schedules(is_recurring);
CREATE INDEX IF NOT EXISTS idx_class_schedules_exception ON public.class_schedules(is_exception);

-- Create updated_at trigger
CREATE OR REPLACE TRIGGER update_class_schedules_updated_at 
BEFORE UPDATE ON public.class_schedules 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can do everything
CREATE POLICY "Admins can manage class schedules" ON public.class_schedules
  FOR ALL USING (
    check_user_admin(auth.uid())
  );

-- Regular users can only view non-cancelled schedules
CREATE POLICY "Users can view class schedules" ON public.class_schedules
  FOR SELECT USING (
    NOT is_cancelled AND NOT is_exception
  );

-- Grant necessary permissions
GRANT ALL ON public.class_schedules TO authenticated;
GRANT SELECT ON public.class_schedules TO anon;

-- Create view for easier calendar queries
CREATE OR REPLACE VIEW public.calendar_events AS
SELECT 
  cs.id,
  cs.class_id,
  c.title,
  c.description,
  c.coach,
  c.location,
  c.difficulty_level,
  c.max_capacity,
  cs.start_datetime,
  cs.end_datetime,
  cs.is_recurring,
  cs.recurrence_rule,
  cs.parent_schedule_id,
  cs.is_exception,
  cs.exception_reason,
  cs.current_bookings,
  cs.is_cancelled,
  cs.cancellation_reason,
  cs.created_at,
  cs.updated_at
FROM public.class_schedules cs
JOIN public.classes c ON cs.class_id = c.id
WHERE NOT cs.is_exception AND NOT cs.is_cancelled;

-- Grant permissions on view
GRANT SELECT ON public.calendar_events TO authenticated;
GRANT SELECT ON public.calendar_events TO anon;