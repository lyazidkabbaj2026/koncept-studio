import { APP_CONFIG } from '@/constants/config'
import { formatPhoneNumber } from './phone'

interface UserProfile {
  full_name: string | null
  email: string
  phone?: string | null
}

interface SubscriptionPlan {
  name: string
}

/**
 * Generate welcome WhatsApp message for new user signup
 */
export function generateSignupMessage(user: UserProfile, selectedPlans: string[]): string {
  const name = user.full_name || 'Cher membre'
  const plansText = selectedPlans.length > 0
    ? `\n\n📋 *Formules sélectionnées:*\n${selectedPlans.map(plan => `• ${plan}`).join('\n')}`
    : ''

  return `🎉 *Bienvenue chez Koncept Studio !*

Bonjour ${name},

Merci de vous être inscrit(e) ! Votre compte a été créé avec succès.${plansText}

📌 *Prochaines étapes:*
• Rendez-vous au studio pour finaliser votre inscription
• Procédez au paiement de votre formule
• Accédez au planning et réservez vos premiers cours

📍 *Notre adresse:*
${APP_CONFIG.CONTACT.ADDRESS}

📞 *Contact:*
${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Nous avons hâte de vous accueillir !

L'équipe Koncept Studio 💪`
}

/**
 * Generate account activation WhatsApp message
 */
export function generateActivationMessage(user: UserProfile): string {
  const name = user.full_name || 'Cher membre'

  return `✅ *Compte activé - Bienvenue !*

Bonjour ${name},

Félicitations ! Votre compte Koncept Studio est maintenant actif. 🎉

🎯 *Vous pouvez désormais:*
• Consulter le planning des cours
• Réserver vos séances
• Gérer votre abonnement
• Accéder à tous nos services

🚀 *Pour commencer:*
Connectez-vous à votre espace membre et découvrez notre planning de cours.

Besoin d'aide ? Contactez-nous au ${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Bons entraînements !

L'équipe Koncept Studio 💪`
}

/**
 * Generate waitlist promotion WhatsApp message
 */
export function generateWaitlistPromotionMessage(user: UserProfile): string {
  const name = user.full_name || 'Cher membre'

  return `🎊 *Bonne nouvelle !*

Bonjour ${name},

Vous avez été promu(e) de la liste d'attente !

✨ *Votre place est maintenant confirmée* et vous pouvez procéder à votre inscription complète.

📌 *Prochaines étapes:*
• Rendez-vous au studio pour finaliser votre inscription
• Choisissez votre formule d'abonnement
• Commencez vos entraînements

📞 *Questions ?* Contactez-nous au ${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Nous avons hâte de vous voir au studio !

L'équipe Koncept Studio 💪`
}

/**
 * Generate class cancellation WhatsApp message
 */
export function generateClassCancellationMessage(
  user: UserProfile,
  className: string,
  classDate: string,
  classTime: string
): string {
  const name = user.full_name || 'Cher membre'

  return `⚠️ *Annulation de cours*

Bonjour ${name},

Nous sommes désolés de vous informer que le cours suivant a été annulé :

📅 *Cours:* ${className}
🕒 *Date et heure:* ${classDate} à ${classTime}

Nous nous excusons pour ce désagrément. Votre crédit sera automatiquement remboursé sur votre compte.

💡 *Alternatives:*
• Consultez notre planning pour d'autres créneaux disponibles
• Contactez-nous pour reprogrammer votre séance

📞 *Contact:* ${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Merci de votre compréhension.

L'équipe Koncept Studio 💪`
}