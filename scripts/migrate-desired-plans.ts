/**
 * Migration Script: Convert desired_plan to subscription_requests
 *
 * This script migrates existing user plan preferences from the
 * profiles.desired_plan JSON field to the enhanced subscription_requests table.
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../lib/database.types'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface MigrationStats {
  usersProcessed: number
  plansParsed: number
  requestsCreated: number
  errors: number
  skipped: number
}

interface UserWithPlans {
  id: string
  email: string
  full_name: string
  desired_plan: string | null
  created_at: string
}

/**
 * Parse desired_plan JSON array or string
 */
function parseDesiredPlans(desiredPlan: string | null): string[] {
  if (!desiredPlan) return []

  try {
    // Try parsing as JSON array first
    const parsed = JSON.parse(desiredPlan)
    if (Array.isArray(parsed)) {
      return parsed.filter(plan => typeof plan === 'string' && plan.trim())
    }

    // If not an array, treat as single plan string
    if (typeof parsed === 'string' && parsed.trim()) {
      return [parsed.trim()]
    }

    return []
  } catch {
    // If JSON parsing fails, treat as plain string
    if (typeof desiredPlan === 'string' && desiredPlan.trim()) {
      return [desiredPlan.trim()]
    }
    return []
  }
}

/**
 * Find subscription plan ID by name (fuzzy matching)
 */
async function findPlanByName(planName: string): Promise<string | null> {
  try {
    // First, try exact match
    const { data: exactMatch } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .ilike('name', planName)
      .limit(1)
      .single()

    if (exactMatch) {
      return exactMatch.id
    }

    // Try fuzzy matching with common variations
    const normalizedPlanName = planName.toLowerCase()
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ôö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[îï]/g, 'i')
      .replace(/[ùûü]/g, 'u')
      .replace(/\s+/g, ' ')
      .trim()

    const { data: allPlans } = await supabase
      .from('subscription_plans')
      .select('id, name')

    if (!allPlans) return null

    // Find best match using simple string similarity
    let bestMatch: { id: string; similarity: number } | null = null

    for (const plan of allPlans) {
      const normalizedDbName = plan.name.toLowerCase()
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/[ôö]/g, 'o')
        .replace(/[ç]/g, 'c')
        .replace(/[îï]/g, 'i')
        .replace(/[ùûü]/g, 'u')
        .replace(/\s+/g, ' ')
        .trim()

      // Calculate similarity (simple approach)
      if (normalizedDbName.includes(normalizedPlanName) || normalizedPlanName.includes(normalizedDbName)) {
        const similarity = Math.max(
          normalizedPlanName.length / normalizedDbName.length,
          normalizedDbName.length / normalizedPlanName.length
        )

        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { id: plan.id, similarity }
        }
      }
    }

    // Return match if similarity is above threshold
    return bestMatch && bestMatch.similarity > 0.5 ? bestMatch.id : null
  } catch (error) {
    console.error(`Error finding plan for "${planName}":`, error)
    return null
  }
}

/**
 * Create subscription request for a user
 */
async function createSubscriptionRequest(
  userId: string,
  planId: string,
  planName: string,
  userCreatedAt: string
): Promise<boolean> {
  try {
    // Calculate expires_at based on user creation date (30 days from creation or now + 30 days, whichever is later)
    const userCreated = new Date(userCreatedAt)
    const now = new Date()
    const thirtyDaysFromCreation = new Date(userCreated.getTime() + 30 * 24 * 60 * 60 * 1000)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiresAt = thirtyDaysFromCreation > now ? thirtyDaysFromCreation : thirtyDaysFromNow

    const { error } = await supabase
      .from('subscription_requests')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        request_type: 'new',
        priority: 2, // High priority for migrated requests
        user_notes: `Demande migrée depuis la sélection initiale: ${planName}`,
        expires_at: expiresAt.toISOString(),
        requested_at: userCreatedAt, // Use original creation date
        is_active: true
      })

    if (error) {
      console.error(`Error creating request for user ${userId}, plan ${planName}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error creating subscription request:`, error)
    return false
  }
}

/**
 * Migrate a single user's desired plans
 */
async function migrateUserPlans(user: UserWithPlans, stats: MigrationStats): Promise<void> {
  try {
    stats.usersProcessed++

    if (!user.desired_plan) {
      stats.skipped++
      return
    }

    const planNames = parseDesiredPlans(user.desired_plan)

    if (planNames.length === 0) {
      stats.skipped++
      return
    }

    console.log(`\n📋 Migrating ${planNames.length} plans for user: ${user.email}`)

    for (const planName of planNames) {
      stats.plansParsed++
      console.log(`  🔍 Looking for plan: "${planName}"`)

      const planId = await findPlanByName(planName)

      if (!planId) {
        console.log(`  ❌ Plan not found: "${planName}"`)
        stats.errors++
        continue
      }

      console.log(`  ✅ Found plan ID: ${planId}`)

      // Check if request already exists (to avoid duplicates on re-runs)
      const { data: existingRequest } = await supabase
        .from('subscription_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_id', planId)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (existingRequest) {
        console.log(`  ⏭️  Request already exists, skipping`)
        stats.skipped++
        continue
      }

      const success = await createSubscriptionRequest(
        user.id,
        planId,
        planName,
        user.created_at
      )

      if (success) {
        console.log(`  ✅ Created subscription request`)
        stats.requestsCreated++
      } else {
        console.log(`  ❌ Failed to create subscription request`)
        stats.errors++
      }
    }
  } catch (error) {
    console.error(`Error migrating user ${user.email}:`, error)
    stats.errors++
  }
}

/**
 * Mark migrated desired_plan fields as processed
 */
async function markAsProcessed(userId: string): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({
        // Keep original desired_plan but add a suffix to indicate it's been processed
        desired_plan: null // Clear it since we've migrated to subscription_requests
      })
      .eq('id', userId)
  } catch (error) {
    console.error(`Error marking user ${userId} as processed:`, error)
  }
}

/**
 * Main migration function
 */
export async function migrateDesiredPlansToRequests(options: {
  dryRun?: boolean
  batchSize?: number
  clearAfterMigration?: boolean
} = {}): Promise<MigrationStats> {
  const { dryRun = false, batchSize = 50, clearAfterMigration = true } = options

  console.log('🚀 Starting migration from desired_plan to subscription_requests')
  console.log(`📊 Dry run: ${dryRun ? 'YES' : 'NO'}`)
  console.log(`📦 Batch size: ${batchSize}`)
  console.log(`🧹 Clear after migration: ${clearAfterMigration ? 'YES' : 'NO'}`)

  const stats: MigrationStats = {
    usersProcessed: 0,
    plansParsed: 0,
    requestsCreated: 0,
    errors: 0,
    skipped: 0
  }

  try {
    // Get all users with desired_plan data
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, desired_plan, created_at')
      .not('desired_plan', 'is', null)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    if (!users || users.length === 0) {
      console.log('✅ No users with desired_plan data found')
      return stats
    }

    console.log(`📊 Found ${users.length} users with desired_plan data`)

    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`)

      for (const user of batch) {
        if (!dryRun) {
          await migrateUserPlans(user, stats)

          if (clearAfterMigration && stats.requestsCreated > 0) {
            await markAsProcessed(user.id)
          }
        } else {
          // Dry run - just count what would be migrated
          const planNames = parseDesiredPlans(user.desired_plan)
          stats.usersProcessed++
          stats.plansParsed += planNames.length
          console.log(`  [DRY RUN] Would migrate ${planNames.length} plans for ${user.email}`)
        }
      }

      // Small delay between batches to avoid overwhelming the database
      if (!dryRun && i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    console.log('📊 Final Statistics:')
    console.log(`  Users processed: ${stats.usersProcessed}`)
    console.log(`  Plans parsed: ${stats.plansParsed}`)
    console.log(`  Requests created: ${stats.requestsCreated}`)
    console.log(`  Errors: ${stats.errors}`)
    console.log(`  Skipped: ${stats.skipped}`)

    return stats
  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

/**
 * CLI interface for running the migration
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const noClear = args.includes('--no-clear')
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '50')

  try {
    await migrateDesiredPlansToRequests({
      dryRun,
      batchSize,
      clearAfterMigration: !noClear
    })
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main()
}

export default migrateDesiredPlansToRequests