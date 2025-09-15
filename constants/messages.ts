export const MESSAGES = {
  ERRORS: {
    GENERIC: "Une erreur s'est produite",
    NETWORK: "Problème de connexion réseau",
    VALIDATION: "Données invalides",
    UNAUTHORIZED: "Accès non autorisé",
    NOT_FOUND: "Élément non trouvé",
    TIMEOUT: "Délai d'attente dépassé",
    SERVER: "Erreur du serveur",

    // Auth specific
    AUTH: {
      INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
      WEAK_PASSWORD: "Le mot de passe est trop faible",
      EMAIL_EXISTS: "Un compte avec cet email existe déjà",
      EMAIL_NOT_FOUND: "Aucun compte trouvé avec cet email",
      TOKEN_EXPIRED: "Session expirée, veuillez vous reconnecter",
      SIGNUP_FAILED: "Erreur lors de la création du compte",
      LOGIN_FAILED: "Erreur lors de la connexion",
    },

    // Booking specific
    BOOKING: {
      CLASS_FULL: "Ce cours est complet",
      ALREADY_BOOKED: "Vous êtes déjà inscrit à ce cours",
      NO_CREDITS: "Crédits insuffisants",
      INVALID_SUBSCRIPTION: "Abonnement non valide",
      BOOKING_FAILED: "Erreur lors de la réservation",
      CANCEL_FAILED: "Erreur lors de l'annulation",
      TOO_LATE: "Il est trop tard pour annuler",
    },

    // Admin specific
    ADMIN: {
      ACCESS_DENIED: "Accès administrateur requis",
      UPDATE_FAILED: "Erreur lors de la mise à jour",
      DELETE_FAILED: "Erreur lors de la suppression",
      CREATE_FAILED: "Erreur lors de la création",
    }
  },

  LOADING: {
    DEFAULT: "Chargement...",
    SAVING: "Enregistrement...",
    LOADING: "Chargement...",
    CONNECTING: "Connexion...",
    PROCESSING: "Traitement...",
    UPDATING: "Mise à jour...",
    DELETING: "Suppression...",
    SENDING: "Envoi...",

    // Specific actions
    AUTH: {
      SIGNING_IN: "Connexion...",
      SIGNING_UP: "Création du compte...",
      SIGNING_OUT: "Déconnexion...",
      RESETTING_PASSWORD: "Envoi du lien de réinitialisation...",
    },

    BOOKING: {
      BOOKING_CLASS: "Réservation en cours...",
      CANCELLING: "Annulation en cours...",
      JOINING_WAITLIST: "Inscription à la liste d'attente...",
    },

    DATA: {
      FETCHING_CLASSES: "Chargement des cours...",
      FETCHING_BOOKINGS: "Chargement des réservations...",
      FETCHING_USERS: "Chargement des utilisateurs...",
      FETCHING_SUBSCRIPTIONS: "Chargement des abonnements...",
    }
  },

  SUCCESS: {
    GENERIC: "Opération réussie",
    SAVED: "Enregistré avec succès",
    UPDATED: "Mis à jour avec succès",
    DELETED: "Supprimé avec succès",
    CREATED: "Créé avec succès",
    SENT: "Envoyé avec succès",

    // Auth specific
    AUTH: {
      SIGNED_IN: "Connexion réussie",
      SIGNED_UP: "Compte créé avec succès",
      SIGNED_OUT: "Déconnexion réussie",
      PASSWORD_RESET: "Lien de réinitialisation envoyé",
      PASSWORD_UPDATED: "Mot de passe mis à jour",
    },

    // Booking specific
    BOOKING: {
      CLASS_BOOKED: "Cours réservé avec succès",
      BOOKING_CANCELLED: "Réservation annulée",
      JOINED_WAITLIST: "Ajouté à la liste d'attente",
      LEFT_WAITLIST: "Retiré de la liste d'attente",
      PROMOTED_FROM_WAITLIST: "Votre place a été confirmée !",
    },

    // Admin specific
    ADMIN: {
      USER_UPDATED: "Utilisateur mis à jour",
      CLASS_CREATED: "Cours créé",
      CLASS_UPDATED: "Cours mis à jour",
      CLASS_DELETED: "Cours supprimé",
      SCHEDULE_CREATED: "Créneau créé",
      SUBSCRIPTION_APPROVED: "Abonnement approuvé",
      SUBSCRIPTION_REJECTED: "Abonnement rejeté",
    }
  },

  CONFIRMATIONS: {
    DELETE: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    CANCEL_BOOKING: "Êtes-vous sûr de vouloir annuler cette réservation ?",
    LOGOUT: "Êtes-vous sûr de vouloir vous déconnecter ?",
    UNSAVED_CHANGES: "Vous avez des modifications non sauvegardées. Voulez-vous continuer ?",

    // Admin specific
    ADMIN: {
      DELETE_CLASS: "Êtes-vous sûr de vouloir supprimer ce cours ?",
      DELETE_USER: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      APPROVE_SUBSCRIPTION: "Approuver cet abonnement ?",
      REJECT_SUBSCRIPTION: "Rejeter cet abonnement ?",
    }
  },

  PLACEHOLDERS: {
    EMAIL: "votre@email.com",
    PASSWORD: "••••••••",
    NAME: "Jean Dupont",
    PHONE: "06 12 34 56 78",
    SEARCH: "Rechercher...",
    SELECT: "Sélectionner...",
    OPTIONAL: "(optionnel)",
  },

  VALIDATION: {
    REQUIRED: "Ce champ est requis",
    EMAIL_INVALID: "Email invalide",
    PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères",
    PASSWORDS_DONT_MATCH: "Les mots de passe ne correspondent pas",
    PHONE_INVALID: "Numéro de téléphone invalide",
    DATE_INVALID: "Date invalide",
    NUMBER_INVALID: "Nombre invalide",
    MIN_LENGTH: (min: number) => `Minimum ${min} caractères requis`,
    MAX_LENGTH: (max: number) => `Maximum ${max} caractères autorisés`,
  }
} as const

// Helper function to get nested messages safely
export function getMessage(path: string, fallback = MESSAGES.ERRORS.GENERIC): string {
  const keys = path.split('.')
  let current: any = MESSAGES

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return fallback
    }
  }

  return typeof current === 'string' ? current : fallback
}