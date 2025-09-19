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
      SELECT id FROM profiles
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