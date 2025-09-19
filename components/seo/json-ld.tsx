import { APP_CONFIG } from '@/constants/config'

export function LocalBusinessJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://k-onceptstudio.com",
    "name": "Koncept Studio",
    "alternateName": "K-ONCEPT Studio",
    "description": "Studio de fitness à Temara spécialisé dans le renforcement, cardio, cardio boxing, mobilité, TRX, cycling, bootcamp et coaching personnalisé",
    "url": "https://k-onceptstudio.com",
    "logo": "https://k-onceptstudio.com/images/logo.svg",
    "image": [
      "https://k-onceptstudio.com/images/studio/studio-main.jpg",
      "https://k-onceptstudio.com/images/studio/studio-interior.jpg"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": APP_CONFIG.CONTACT.ADDRESS,
      "addressLocality": "Temara",
      "postalCode": "12000",
      "addressRegion": "Rabat-Salé-Kénitra",
      "addressCountry": "MA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 33.9333,
      "longitude": -6.9167
    },
    "telephone": APP_CONFIG.CONTACT.PHONE,
    "email": APP_CONFIG.CONTACT.EMAIL,
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "13:00"
      }
    ],
    "sameAs": [
      APP_CONFIG.CONTACT.INSTAGRAM.URL
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services de Fitness",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Renforcement Musculaire",
            "description": "Cours de renforcement musculaire pour tous niveaux"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cardio Boxing",
            "description": "Cours de cardio boxing dynamique"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "TRX",
            "description": "Entraînement fonctionnel avec sangles TRX"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cycling",
            "description": "Cours de cycling en musique"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Coaching Personnel",
            "description": "Séances de coaching personnalisé one-to-one"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "50",
      "bestRating": "5"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function FAQJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Koncept Studio",
    "url": "https://k-onceptstudio.com",
    "logo": "https://k-onceptstudio.com/images/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": APP_CONFIG.CONTACT.PHONE,
      "contactType": "Customer Service",
      "availableLanguage": ["French", "Arabic"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": APP_CONFIG.CONTACT.ADDRESS,
      "addressLocality": "Temara",
      "postalCode": "12000",
      "addressRegion": "Rabat-Salé-Kénitra",
      "addressCountry": "MA"
    },
    "sameAs": [
      APP_CONFIG.CONTACT.INSTAGRAM.URL
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}