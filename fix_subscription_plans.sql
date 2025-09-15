-- Insert sample subscription plans for testing
-- Based on database_schema_source_of_truth.sql:
-- CREATE TABLEpublic.subscription_plans(iduuid NOT NULLDEFAULT gen_random_uuid(), nametext NOT NULL, typetext NOT NULL, creditsinteger(32,0) NOT NULL, price_dhsinteger(32,0) NOT NULL, validity_monthsinteger(32,0) NOT NULL, validity_daysinteger(32,0), weekly_limitinteger(32,0), created_attimestamp with time zoneDEFAULT now(), updated_attimestamp with time zoneDEFAULT now());

INSERT INTO subscription_plans (
  name,
  type,
  credits,
  price_dhs,
  validity_months,
  validity_days,
  weekly_limit
) VALUES
-- Abonnements (Monthly subscriptions)
('Abonnement Basic', 'abonnement', 0, 250, 1, null, 2),
('Abonnement Standard', 'abonnement', 0, 400, 1, null, 4),
('Abonnement Premium', 'abonnement', 0, 600, 1, null, 8),

-- Carnets (Credit packages)
('Carnet 5 séances', 'carnet', 5, 200, 2, null, null),
('Carnet 10 séances', 'carnet', 10, 380, 3, null, null),
('Carnet 20 séances', 'carnet', 20, 720, 4, null, null),

-- Personal Training
('Personal Training 1h', 'personal_training', 1, 150, 1, null, null),
('Personal Training Pack 5', 'personal_training', 5, 700, 2, null, null),
('Personal Training Pack 10', 'personal_training', 10, 1300, 3, null, null);