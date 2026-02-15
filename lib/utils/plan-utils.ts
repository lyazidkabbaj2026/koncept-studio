/**
 * Utility functions for handling user plan data
 */

export function parseDesiredPlans(desiredPlan: string | null): string[] {
  if (!desiredPlan) return []

  try {
    // Try to parse as JSON array (new format)
    const parsed = JSON.parse(desiredPlan)
    if (Array.isArray(parsed)) {
      return parsed.filter(plan => typeof plan === 'string')
    }

    // If it's a single string in JSON, return as array
    if (typeof parsed === 'string') {
      return [parsed]
    }

    return []
  } catch (error) {
    // If parsing fails, treat as legacy single plan string
    return [desiredPlan]
  }
}

export function formatDesiredPlansDisplay(desiredPlan: string | null): string {
  const plans = parseDesiredPlans(desiredPlan)

  if (plans.length === 0) {
    return 'Non spécifié'
  }

  if (plans.length === 1) {
    return plans[0]
  }

  return `${plans.length} formules sélectionnées`
}

export function getDesiredPlansTooltip(desiredPlan: string | null): string {
  const plans = parseDesiredPlans(desiredPlan)

  if (plans.length === 0) {
    return 'Aucune formule spécifiée'
  }

  return plans.join(', ')
}