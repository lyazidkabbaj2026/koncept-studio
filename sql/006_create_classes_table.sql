-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- duration in minutes
  tags TEXT[], -- array of tags
  max_capacity INTEGER NOT NULL DEFAULT 1,
  coach VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_difficulty_level ON public.classes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON public.classes(created_at);
CREATE INDEX IF NOT EXISTS idx_classes_coach ON public.classes(coach);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can do everything
CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (
    check_user_admin(auth.uid())
  );

-- Regular users can only view classes
CREATE POLICY "Users can view classes" ON public.classes
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON public.classes TO authenticated;
GRANT SELECT ON public.classes TO anon;