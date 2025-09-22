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

interface SubscriptionRequest {
  id: string
  planName: string
  requestType: 'new' | 'renewal' | 'upgrade' | 'additional'
  userNotes?: string
  preferredStartDate?: string
  budgetMax?: number
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

Nous nous excusons pour ce désagrément. Votre séance vous sera restitutée en crédits sur vore solde.

💡 *Alternatives:*
• Consultez notre planning pour d'autres créneaux disponibles
• Contactez-nous pour reprogrammer votre séance

📞 *Contact:* ${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Merci de votre compréhension.

L'équipe Koncept Studio 💪`
}

/**
 * Generate subscription request confirmation WhatsApp message
 */
export function generateSubscriptionRequestMessage(
  user: UserProfile,
  request: SubscriptionRequest
): string {
  const name = user.full_name || 'Cher membre'

  const typeLabels = {
    new: 'Nouvelle demande d\'abonnement',
    renewal: 'Demande de renouvellement',
    upgrade: 'Demande de mise à niveau',
    additional: 'Demande d\'abonnement supplémentaire'
  }

  const notesSection = request.userNotes
    ? `\n💬 *Vos notes:* ${request.userNotes}`
    : ''

  const dateSection = request.preferredStartDate
    ? `\n📅 *Date de début souhaitée:* ${new Date(request.preferredStartDate).toLocaleDateString('fr-FR')}`
    : ''

  const budgetSection = request.budgetMax
    ? `\n💰 *Budget maximum:* ${request.budgetMax} DHS`
    : ''

  return `📋 *Demande d'abonnement reçue*

Bonjour ${name},

Nous avons bien reçu votre demande d'abonnement !

📝 *Détails de la demande:*
• Type: ${typeLabels[request.requestType]}
• Plan: ${request.planName}${dateSection}${budgetSection}${notesSection}

⏰ *Prochaines étapes:*
• Notre équipe va examiner votre demande
• Nous vous contacterons sous 48h
• Vous recevrez une confirmation de traitement

📞 *Questions urgentes ?*
Contactez-nous au ${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Merci de votre confiance !

L'équipe Koncept Studio 💪`
}

/**
 * Generate subscription request contacted WhatsApp message
 */
export function generateSubscriptionRequestContactedMessage(
  user: UserProfile,
  request: SubscriptionRequest,
  contactMethod: string = 'phone'
): string {
  const name = user.full_name || 'Cher membre'

  const contactMethodText = {
    whatsapp: 'WhatsApp',
    phone: 'téléphone',
    email: 'email',
    in_person: 'en personne'
  }[contactMethod] || 'téléphone'

  return `📞 *Mise à jour de votre demande*

Bonjour ${name},

Votre demande d'abonnement "${request.planName}" est en cours de traitement.

✅ *Statut:* Contacté par ${contactMethodText}

🎯 *Prochaines étapes:*
• Finalisation des détails de votre abonnement
• Programmation de votre rendez-vous si nécessaire
• Activation de votre abonnement

📞 *Besoin d'informations ?*
N'hésitez pas à nous appeler au ${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Merci de votre patience !

L'équipe Koncept Studio 💪`
}

/**
 * Generate subscription request approved WhatsApp message
 */
export function generateSubscriptionRequestApprovedMessage(
  user: UserProfile,
  request: SubscriptionRequest
): string {
  const name = user.full_name || 'Cher membre'

  return `🎉 *Demande approuvée !*

Bonjour ${name},

Excellente nouvelle ! Votre demande d'abonnement a été approuvée.

✅ *Plan approuvé:* ${request.planName}

📋 *Prochaines étapes:*
• Rendez-vous au studio pour finaliser l'inscription
• Procédez au paiement de votre abonnement
• Activation immédiate de votre accès

📍 *Adresse du studio:*
${APP_CONFIG.CONTACT.ADDRESS}

📞 *Contact:*
${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

🕒 *Horaires d'ouverture:*
Lundi - Samedi: 6h00 - 22h00
Dimanche: 8h00 - 20h00

Nous avons hâte de vous accueillir !

L'équipe Koncept Studio 💪`
}

/**
 * Generate subscription request fulfilled WhatsApp message
 */
export function generateSubscriptionRequestFulfilledMessage(
  user: UserProfile,
  request: SubscriptionRequest,
  activationDate: string
): string {
  const name = user.full_name || 'Cher membre'

  return `🎊 *Abonnement activé !*

Bonjour ${name},

Félicitations ! Votre abonnement "${request.planName}" est maintenant actif.

✅ *Activation:* ${new Date(activationDate).toLocaleDateString('fr-FR')}

🎯 *Vous pouvez désormais:*
• Consulter le planning des cours
• Réserver vos séances en ligne
• Gérer votre compte depuis votre espace membre
• Profiter de tous nos services

🚀 *Pour commencer:*
Connectez-vous à votre espace membre et réservez votre première séance !

📱 *Rappel:*
Pensez à télécharger l'application pour une expérience optimale.

Bons entraînements !

L'équipe Koncept Studio 💪`
}

/**
 * Generate subscription request cancelled WhatsApp message
 */
export function generateSubscriptionRequestCancelledMessage(
  user: UserProfile,
  request: SubscriptionRequest,
  reason?: string
): string {
  const name = user.full_name || 'Cher membre'

  const reasonSection = reason
    ? `\n📝 *Motif:* ${reason}`
    : ''

  return `ℹ️ *Demande annulée*

Bonjour ${name},

Votre demande d'abonnement "${request.planName}" a été annulée.${reasonSection}

💡 *Vous pouvez:*
• Créer une nouvelle demande à tout moment
• Nous contacter pour plus d'informations
• Explorer d'autres formules disponibles

📞 *Contact:*
${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

Nous restons à votre disposition pour vous accompagner.

L'équipe Koncept Studio 💪`
}

/**
 * Generate subscription request expiring WhatsApp message
 */
export function generateSubscriptionRequestExpiringMessage(
  user: UserProfile,
  request: SubscriptionRequest,
  expirationDate: string
): string {
  const name = user.full_name || 'Cher membre'

  return `⏰ *Demande expire bientôt*

Bonjour ${name},

Votre demande d'abonnement "${request.planName}" expire le ${new Date(expirationDate).toLocaleDateString('fr-FR')}.

⚡ *Action requise:*
Pour éviter l'expiration, merci de:
• Nous contacter pour finaliser votre abonnement
• Ou modifier votre demande si nécessaire

📞 *Contact urgent:*
${formatPhoneNumber(APP_CONFIG.CONTACT.PHONE)}

⏱️ *Heures d'ouverture:*
Lundi - Samedi: 6h00 - 22h00

Ne laissez pas passer cette opportunité !

L'équipe Koncept Studio 💪`
}

/**
 * Generate admin notification for new subscription request
 */
export function generateAdminNewRequestNotification(
  user: UserProfile,
  request: SubscriptionRequest
): string {
  const typeLabels = {
    new: 'Nouvelle demande',
    renewal: 'Renouvellement',
    upgrade: 'Mise à niveau',
    additional: 'Supplémentaire'
  }

  const notesSection = request.userNotes
    ? `\n💬 Notes: ${request.userNotes}`
    : ''

  const dateSection = request.preferredStartDate
    ? `\n📅 Début souhaité: ${new Date(request.preferredStartDate).toLocaleDateString('fr-FR')}`
    : ''

  const budgetSection = request.budgetMax
    ? `\n💰 Budget max: ${request.budgetMax} DHS`
    : ''

  return `🔔 *Nouvelle demande d'abonnement*

👤 *Client:* ${user.full_name || 'Nom non renseigné'}
📧 *Email:* ${user.email}
📱 *Téléphone:* ${user.phone || 'Non renseigné'}

📋 *Demande:*
• Type: ${typeLabels[request.requestType]}
• Plan: ${request.planName}${dateSection}${budgetSection}${notesSection}

⚡ *Action requise:* Traiter cette demande dans l'interface admin.

ID: ${request.id}`
}