import { createClient as createClientBrowser } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

export type SettingValue = string | number | boolean | object | any[] | null

export interface AdminSetting {
  id: string
  key: string
  value: SettingValue
  category: string
  description?: string
  data_type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  is_required: boolean
  created_at: string
  updated_at: string
}

export interface SettingsGroup {
  category: string
  settings: AdminSetting[]
}

// Settings cache to avoid repeated database calls
let settingsCache: Record<string, SettingValue> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export class SettingsService {
  // Get all settings (client-side only)
  static async getAllSettings(): Promise<AdminSetting[]> {
    const supabase = createClientBrowser()

    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching settings:', error)
      throw new Error('Failed to fetch settings')
    }

    return data.map(setting => ({
      ...setting,
      value: this.parseSettingValue(setting.value, setting.data_type)
    }))
  }

  // Get settings grouped by category
  static async getSettingsGrouped(): Promise<SettingsGroup[]> {
    const settings = await this.getAllSettings()
    const grouped = new Map<string, AdminSetting[]>()

    settings.forEach(setting => {
      if (!grouped.has(setting.category)) {
        grouped.set(setting.category, [])
      }
      grouped.get(setting.category)!.push(setting)
    })

    return Array.from(grouped.entries()).map(([category, settings]) => ({
      category,
      settings
    }))
  }

  // Get a specific setting value with caching
  static async getSetting(key: string): Promise<SettingValue | null> {
    // Check cache first
    if (settingsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return settingsCache[key] !== undefined ? settingsCache[key] : null
    }

    // Refresh cache
    await this.refreshCache()
    return settingsCache && settingsCache[key] !== undefined ? settingsCache[key] : null
  }

  // Get multiple settings at once
  static async getSettings(keys: string[]): Promise<Record<string, SettingValue>> {
    // Check cache first
    if (settingsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      const result: Record<string, SettingValue> = {}
      keys.forEach(key => {
        if (settingsCache![key] !== undefined) {
          result[key] = settingsCache![key]
        }
      })
      return result
    }

    // Refresh cache
    await this.refreshCache()
    const result: Record<string, SettingValue> = {}
    keys.forEach(key => {
      if (settingsCache?.[key] !== undefined) {
        result[key] = settingsCache[key]
      }
    })
    return result
  }

  // Update a setting (client-side only)
  static async updateSetting(key: string, value: SettingValue): Promise<void> {
    const supabase = createClientBrowser()

    // Get the setting to know its data type
    const { data: existingSetting, error: fetchError } = await supabase
      .from('admin_settings')
      .select('data_type')
      .eq('key', key)
      .single()

    if (fetchError) {
      throw new Error(`Setting ${key} not found`)
    }

    // Serialize the value based on data type
    const serializedValue = this.serializeSettingValue(value, existingSetting.data_type)

    const { error } = await supabase
      .from('admin_settings')
      .update({ value: serializedValue })
      .eq('key', key)

    if (error) {
      console.error('Error updating setting:', error)
      throw new Error(`Failed to update setting ${key}`)
    }

    // Clear cache to force refresh
    this.clearCache()
  }

  // Update multiple settings at once (client-side only)
  static async updateSettings(updates: Record<string, SettingValue>): Promise<void> {
    const supabase = createClientBrowser()

    // Get all settings to know their data types
    const { data: existingSettings, error: fetchError } = await supabase
      .from('admin_settings')
      .select('key, data_type')
      .in('key', Object.keys(updates))

    if (fetchError) {
      throw new Error('Failed to fetch existing settings')
    }

    const settingsMap = new Map(existingSettings.map((s: any) => [s.key, s.data_type]))

    // Prepare updates with proper serialization
    const serializedUpdates = Object.entries(updates).map(([key, value]) => {
      const dataType = settingsMap.get(key)
      if (!dataType) {
        throw new Error(`Setting ${key} not found`)
      }
      return {
        key,
        value: this.serializeSettingValue(value, dataType)
      }
    })

    // Perform batch update
    for (const update of serializedUpdates) {
      const { error } = await supabase
        .from('admin_settings')
        .update({ value: update.value })
        .eq('key', update.key)

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error)
        throw new Error(`Failed to update setting ${update.key}`)
      }
    }

    // Clear cache to force refresh
    this.clearCache()
  }

  // Refresh the settings cache
  private static async refreshCache(): Promise<void> {
    try {
      const settings = await this.getAllSettings()
      settingsCache = {}
      settings.forEach(setting => {
        settingsCache![setting.key] = setting.value
      })
      cacheTimestamp = Date.now()
    } catch (error) {
      console.error('Failed to refresh settings cache:', error)
    }
  }

  // Clear the settings cache
  static clearCache(): void {
    settingsCache = null
    cacheTimestamp = 0
  }

  // Parse setting value from database
  private static parseSettingValue(value: any, dataType: string): SettingValue {
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

  // Serialize setting value for database
  private static serializeSettingValue(value: SettingValue, dataType: string): any {
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

  // Get category display names
  static getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      'business_rules': 'Règles Métier',
      'business_info': 'Informations Studio',
      'ui_settings': 'Interface Utilisateur',
      'formatting': 'Formats & Localisation',
      'validation': 'Règles de Validation',
      'communication': 'Communication',
      'content': 'Gestion de Contenu'
    }
    return displayNames[category] || category
  }

  // Get setting display name
  static getSettingDisplayName(key: string): string {
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
}

// Convenience functions for commonly used settings
export const getAppName = () => SettingsService.getSetting('app_name')
export const getStudioPhone = () => SettingsService.getSetting('studio_phone')
export const getStudioEmail = () => SettingsService.getSetting('studio_email')
export const getCancellationDeadline = () => SettingsService.getSetting('cancellation_deadline_hours')
export const getDefaultWeeklyLimit = () => SettingsService.getSetting('default_weekly_limit')
export const getMaxBookingDaysAhead = () => SettingsService.getSetting('max_booking_days_ahead')