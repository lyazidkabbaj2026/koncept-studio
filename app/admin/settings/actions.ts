'use server'

import { createClient } from '@/lib/supabase/server'
import { SettingValue } from '@/lib/services/settings.service'
import { redirect } from 'next/navigation'

interface UpdateSettingsParams {
  updates: Record<string, SettingValue>
}

// Helper function to parse setting values
function parseSettingValue(value: any, dataType: string): SettingValue {
  if (value === null || value === undefined) {
    return null
  }

  switch (dataType) {
    case 'string':
      return typeof value === 'string' ? value : String(value)
    case 'number':
      return typeof value === 'number' ? value : Number(value)
    case 'boolean':
      return typeof value === 'boolean' ? value : Boolean(value)
    case 'array':
    case 'object':
      return typeof value === 'object' ? value : JSON.parse(String(value))
    default:
      return value
  }
}

// Helper function to serialize setting values
function serializeSettingValue(value: SettingValue, dataType: string): any {
  switch (dataType) {
    case 'string':
      return String(value)
    case 'number':
      return Number(value)
    case 'boolean':
      return Boolean(value)
    case 'array':
    case 'object':
      return value // Supabase handles JSON serialization
    default:
      return value
  }
}

// Get setting display name
function getSettingDisplayName(key: string): string {
  const displayNames: Record<string, string> = {
    // Business Rules
    'cancellation_deadline_hours': 'Délai d\'annulation (heures)',
    'default_weekly_limit': 'Limite hebdomadaire par défaut',
    'max_booking_days_ahead': 'Réservation max à l\'avance (jours)',
    'min_cancellation_hours': 'Préavis minimum d\'annulation (heures)',
    'default_class_duration': 'Durée cours par défaut (minutes)',
    'max_class_capacity': 'Capacité maximale cours',
    'min_class_capacity': 'Capacité minimale cours',
    'max_subscription_price': 'Prix max abonnement (DHS)',
    'max_credits_per_plan': 'Crédits max par formule',
    'max_weekly_limit': 'Limite hebdomadaire maximale',
    'max_validity_months': 'Validité max abonnement (mois)',

    // Business Info
    'app_name': 'Nom du Studio',
    'studio_phone': 'Téléphone Studio',
    'studio_email': 'Email Studio',
    'studio_location': 'Localisation Studio',
    'studio_address': 'Adresse Complète',
    'instagram_url': 'URL Instagram',
    'instagram_handle': 'Handle Instagram',
    'operating_hours': 'Horaires d\'Ouverture',

    // UI Settings
    'animation_duration_short': 'Animation Courte (ms)',
    'animation_duration_medium': 'Animation Moyenne (ms)',
    'animation_duration_long': 'Animation Longue (ms)',
    'toast_duration_success': 'Durée Toast Succès (ms)',
    'toast_duration_error': 'Durée Toast Erreur (ms)',
    'toast_duration_warning': 'Durée Toast Avertissement (ms)',
    'toast_duration_info': 'Durée Toast Info (ms)',
    'default_page_size': 'Taille Page Par Défaut',
    'max_page_size': 'Taille Page Maximum',
    'max_file_size': 'Taille Fichier Max (bytes)',
    'allowed_image_types': 'Types Images Autorisés',
    'api_timeout': 'Timeout API (ms)',
    'upload_timeout': 'Timeout Upload (ms)',

    // Formatting
    'date_format': 'Format Date',
    'datetime_format': 'Format Date-Heure',
    'time_format': 'Format Heure',
    'locale': 'Langue/Région',

    // Validation
    'password_min_length': 'Longueur Min Mot de Passe',
    'phone_validation_pattern': 'Pattern Validation Téléphone',
    'name_min_length': 'Longueur Min Nom',
    'name_max_length': 'Longueur Max Nom',

    // Communication
    'whatsapp_country_code': 'Code Pays WhatsApp',
    'whatsapp_sender_number': 'Numéro Expéditeur WhatsApp',

    // Content
    'faq_content': 'Contenu FAQ'
  }
  return displayNames[key] || key
}

export async function getAdminSettings() {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      redirect('/login')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      redirect('/espace')
    }

    // Get all settings grouped by category
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching settings:', error)
      throw new Error('Failed to fetch settings')
    }

    // Parse setting values and group by category
    const parsedSettings = data.map(setting => ({
      ...setting,
      value: parseSettingValue(setting.value, setting.data_type)
    }))

    // Group by category
    const grouped = new Map<string, any[]>()
    parsedSettings.forEach(setting => {
      if (!grouped.has(setting.category)) {
        grouped.set(setting.category, [])
      }
      grouped.get(setting.category)!.push(setting)
    })

    return Array.from(grouped.entries()).map(([category, settings]) => ({
      category,
      settings
    }))
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    throw new Error('Failed to fetch settings')
  }
}

export async function updateAdminSettings({
  updates
}: UpdateSettingsParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autorisé' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return { success: false, error: 'Accès administrateur requis' }
    }

    // Validate required fields
    const requiredSettings = [
      'app_name', 'studio_phone', 'studio_email', 'studio_address',
      'cancellation_deadline_hours', 'default_weekly_limit', 'max_booking_days_ahead'
    ]

    for (const key of requiredSettings) {
      if (updates[key] !== undefined) {
        const value = updates[key]
        if (value === null || value === undefined || value === '') {
          return {
            success: false,
            error: `Le champ ${getSettingDisplayName(key)} est requis`
          }
        }
      }
    }

    // Validate numeric values
    const numericValidations: Record<string, { min?: number; max?: number }> = {
      'cancellation_deadline_hours': { min: 0, max: 168 }, // 0 to 7 days
      'default_weekly_limit': { min: 1, max: 50 },
      'max_booking_days_ahead': { min: 1, max: 365 },
      'min_cancellation_hours': { min: 0, max: 48 },
      'default_class_duration': { min: 15, max: 180 },
      'max_class_capacity': { min: 1, max: 200 },
      'min_class_capacity': { min: 1, max: 50 },
      'max_subscription_price': { min: 0, max: 50000 },
      'max_credits_per_plan': { min: 1, max: 1000 },
      'max_weekly_limit': { min: 1, max: 100 },
      'max_validity_months': { min: 1, max: 60 },
      'password_min_length': { min: 6, max: 50 },
      'name_min_length': { min: 1, max: 20 },
      'name_max_length': { min: 10, max: 500 },
      'animation_duration_short': { min: 50, max: 1000 },
      'animation_duration_medium': { min: 100, max: 2000 },
      'animation_duration_long': { min: 200, max: 5000 },
      'toast_duration_success': { min: 1000, max: 10000 },
      'toast_duration_error': { min: 1000, max: 15000 },
      'toast_duration_warning': { min: 1000, max: 10000 },
      'toast_duration_info': { min: 1000, max: 10000 },
      'default_page_size': { min: 5, max: 100 },
      'max_page_size': { min: 10, max: 500 },
      'max_file_size': { min: 1024, max: 50 * 1024 * 1024 }, // 1KB to 50MB
      'api_timeout': { min: 1000, max: 60000 },
      'upload_timeout': { min: 5000, max: 300000 }
    }

    for (const [key, value] of Object.entries(updates)) {
      if (numericValidations[key] && typeof value === 'number') {
        const { min, max } = numericValidations[key]
        if (min !== undefined && value < min) {
          return {
            success: false,
            error: `${getSettingDisplayName(key)} doit être au moins ${min}`
          }
        }
        if (max !== undefined && value > max) {
          return {
            success: false,
            error: `${getSettingDisplayName(key)} ne peut pas dépasser ${max}`
          }
        }
      }
    }

    // Validate email format
    if (updates.studio_email && typeof updates.studio_email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.studio_email)) {
        return { success: false, error: 'Format d\'email invalide' }
      }
    }

    // Validate phone format (Moroccan)
    if (updates.studio_phone && typeof updates.studio_phone === 'string') {
      const phoneRegex = /^0[6-7]\d{8}$/
      if (!phoneRegex.test(updates.studio_phone)) {
        return { success: false, error: 'Format de téléphone invalide (ex: 0612345678)' }
      }
    }

    // Validate URL format for Instagram
    if (updates.instagram_url && typeof updates.instagram_url === 'string') {
      try {
        new URL(updates.instagram_url)
      } catch {
        return { success: false, error: 'Format d\'URL Instagram invalide' }
      }
    }

    // Get all settings to know their data types
    const { data: existingSettings, error: fetchError } = await supabase
      .from('admin_settings')
      .select('key, data_type')
      .in('key', Object.keys(updates))

    if (fetchError) {
      return { success: false, error: 'Erreur lors de la récupération des paramètres existants' }
    }

    const settingsMap = new Map(existingSettings.map(s => [s.key, s.data_type]))

    // Perform batch update
    for (const [key, value] of Object.entries(updates)) {
      const dataType = settingsMap.get(key)
      if (!dataType) {
        return { success: false, error: `Paramètre ${key} introuvable` }
      }

      const serializedValue = serializeSettingValue(value, dataType)

      const { error } = await supabase
        .from('admin_settings')
        .update({ value: serializedValue })
        .eq('key', key)

      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        return { success: false, error: `Erreur lors de la mise à jour du paramètre ${key}` }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return { success: false, error: 'Erreur lors de la mise à jour des paramètres' }
  }
}

export async function resetSettingsToDefault(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autorisé' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return { success: false, error: 'Accès administrateur requis' }
    }

    // Reset to default values - this would typically involve re-running the initial insert
    // For now, we'll reset key business settings
    const defaultSettings = {
      'cancellation_deadline_hours': 24,
      'default_weekly_limit': 3,
      'max_booking_days_ahead': 30,
      'min_cancellation_hours': 2,
      'default_class_duration': 45,
      'max_class_capacity': 50,
      'min_class_capacity': 1,
      'max_subscription_price': 5000,
      'max_credits_per_plan': 100,
      'max_weekly_limit': 20,
      'max_validity_months': 24,
      'animation_duration_short': 150,
      'animation_duration_medium': 300,
      'animation_duration_long': 500,
      'toast_duration_success': 3000,
      'toast_duration_error': 5000,
      'toast_duration_warning': 4000,
      'toast_duration_info': 3000,
      'default_page_size': 10,
      'max_page_size': 100,
      'max_file_size': 5242880, // 5MB
      'api_timeout': 10000,
      'upload_timeout': 30000,
      'password_min_length': 8,
      'name_min_length': 2,
      'name_max_length': 100,
      'whatsapp_country_code': '212'
    }

    // Update default settings
    for (const [key, value] of Object.entries(defaultSettings)) {
      const { error } = await supabase
        .from('admin_settings')
        .update({ value })
        .eq('key', key)

      if (error) {
        console.error(`Error resetting setting ${key}:`, error)
        return { success: false, error: `Erreur lors de la réinitialisation du paramètre ${key}` }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error resetting settings:', error)
    return { success: false, error: 'Erreur lors de la réinitialisation' }
  }
}

export async function exportSettings(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autorisé' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return { success: false, error: 'Accès administrateur requis' }
    }

    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) {
      return { success: false, error: 'Erreur lors de la récupération des paramètres' }
    }

    return {
      success: true,
      data: {
        exported_at: new Date().toISOString(),
        settings: settings.map(s => ({
          key: s.key,
          value: parseSettingValue(s.value, s.data_type),
          category: s.category,
          description: s.description
        }))
      }
    }
  } catch (error) {
    console.error('Error exporting settings:', error)
    return { success: false, error: 'Erreur lors de l\'export' }
  }
}