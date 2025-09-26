# WhatsApp Message Templates

This document contains all the WhatsApp message templates used in the Koncept Studio application.

## User Messages

### 1. Signup Welcome Message
**Trigger**: New user registration
**Function**: `generateSignupMessage(user)`

```
🎉 *Bienvenue chez Koncept Studio !*

Bonjour {name},

Merci de vous être inscrit(e) ! Votre compte a été créé avec succès.

📌 *Prochaines étapes:*
• Explorez nos formules d'abonnement depuis votre espace membre
• Contactez-nous pour choisir la formule qui vous convient
• Rendez-vous au studio pour finaliser votre inscription

📍 *Notre adresse:*
{studio_address}

📞 *Contact:*
{phone_number}

Nous avons hâte de vous accueillir !

L'équipe Koncept Studio 💪
```

### 2. Account Activation Message
**Trigger**: When user account is activated
**Function**: `generateActivationMessage(user)`

```
✅ *Compte activé - Bienvenue !*

Bonjour {name},

Félicitations ! Votre compte Koncept Studio est maintenant actif. 🎉

🎯 *Vous pouvez désormais:*
• Consulter le planning des cours
• Réserver vos séances
• Gérer votre abonnement
• Accéder à tous nos services

🚀 *Pour commencer:*
Connectez-vous à votre espace membre et découvrez notre planning de cours.

Besoin d'aide ? Contactez-nous au {phone_number}

Bons entraînements !

L'équipe Koncept Studio 💪
```

### 3. Waitlist Promotion Message
**Trigger**: User promoted from waitlist
**Function**: `generateWaitlistPromotionMessage(user)`

```
🎊 *Bonne nouvelle !*

Bonjour {name},

Vous avez été promu(e) de la liste d'attente !

✨ *Votre place est maintenant confirmée* et vous pouvez procéder à votre inscription complète.

📌 *Prochaines étapes:*
• Rendez-vous au studio pour finaliser votre inscription
• Choisissez votre formule d'abonnement
• Commencez vos entraînements

📞 *Questions ?* Contactez-nous au {phone_number}

Nous avons hâte de vous voir au studio !

L'équipe Koncept Studio 💪
```

### 4. Class Cancellation Message
**Trigger**: When a class is cancelled
**Function**: `generateClassCancellationMessage(user, className, classDate, classTime)`

```
⚠️ *Annulation de cours*

Bonjour {name},

Nous sommes désolés de vous informer que le cours suivant a été annulé :

📅 *Cours:* {className}
🕒 *Date et heure:* {classDate} à {classTime}

Nous nous excusons pour ce désagrément. Votre séance vous sera restitutée en crédits sur vore solde.

💡 *Alternatives:*
• Consultez notre planning pour d'autres créneaux disponibles
• Contactez-nous pour reprogrammer votre séance

📞 *Contact:* {phone_number}

Merci de votre compréhension.

L'équipe Koncept Studio 💪
```

## Subscription Request Messages

### 5. Simple Subscription Request Confirmation
**Trigger**: Basic subscription request submission
**Function**: `generateSubscriptionRequestMessage(user, planName)`

```
📋 *Demande d'abonnement reçue*

Bonjour {name},

Nous avons bien reçu votre demande d'abonnement !

📝 *Détails de la demande:*
• Plan: {planName}

⏰ *Prochaines étapes:*
• Notre équipe va examiner votre demande
• Nous vous contacterons sous 48h
• Vous recevrez une confirmation de traitement

📞 *Questions urgentes ?*
Contactez-nous au {phone_number}

Merci de votre confiance !

L'équipe Koncept Studio 💪
```

## Message Types Legend

**Request Types:**
- `new`: Nouvelle demande d'abonnement
- `renewal`: Demande de renouvellement
- `upgrade`: Demande de mise à niveau
- `additional`: Demande d'abonnement supplémentaire

**Contact Methods:**
- `whatsapp`: WhatsApp
- `phone`: téléphone
- `email`: email
- `in_person`: en personne

## Variables Used

- `{name}`: User's full name or "Cher membre" if not available
- `{planName}`: Selected subscription plan name
- `{phone_number}`: Formatted studio phone number
- `{studio_address}`: Studio address from config
- `{className}`: Name of the cancelled class
- `{classDate}` / `{classTime}`: Date and time of cancelled class
- `{requestType}`: Type of subscription request
- `{preferredStartDate}`: User's preferred start date
- `{budgetMax}`: User's maximum budget
- `{userNotes}`: User's notes on the request
- `{contactMethod}`: Method used to contact user
- `{activationDate}`: Date when subscription was activated
- `{expirationDate}`: Date when request expires
- `{reason}`: Reason for cancellation
- `{request_id}`: Unique request identifier