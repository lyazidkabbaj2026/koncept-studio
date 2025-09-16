/**
 * Phone number utility functions
 */

/**
 * Formats a phone number for display
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format as XX XX XX XX XX for 10-digit numbers
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  // Return original if format doesn't match
  return phoneNumber;
}

/**
 * Creates a tel: link for phone numbers
 * @param phoneNumber - Phone number
 * @returns tel: link
 */
export function createPhoneLink(phoneNumber: string): string {
  return `tel:${phoneNumber}`;
}