import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/nav/conditional-navbar";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/error-boundary";
import { Toaster } from "sonner";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { BackToTop } from "@/components/ui/back-to-top";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://konceptstudio.ma'),
  title: {
    default: "Koncept Studio - Studio de Fitness à Temara",
    template: "%s | Koncept Studio"
  },
  description: "Studio de fitness à Temara spécialisé dans le renforcement, cardio, cardio boxing, mobilité, TRX, cycling, bootcamp et coaching personnalisé. Réservez vos cours en ligne.",
  keywords: ["fitness", "gym", "studio", "Temara", "Rabat", "musculation", "cardio", "boxing", "TRX", "cycling", "bootcamp", "coaching personnel", "sport", "entraînement"],
  authors: [{ name: "Koncept Studio" }],
  creator: "Koncept Studio",
  publisher: "Koncept Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://konceptstudio.ma',
    siteName: 'Koncept Studio',
    title: 'Koncept Studio - Studio de Fitness à Temara',
    description: 'Studio de fitness à Temara spécialisé dans le renforcement, cardio, cardio boxing, mobilité, TRX, cycling, bootcamp et coaching personnalisé.',
    images: [
      {
        url: '/images/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Koncept Studio - Studio de Fitness à Temara',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koncept Studio - Studio de Fitness à Temara',
    description: 'Studio de fitness à Temara spécialisé dans le renforcement, cardio, cardio boxing, mobilité, TRX, cycling, bootcamp et coaching personnalisé.',
    images: ['/images/logo.svg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://konceptstudio.ma',
  },
  category: 'fitness',
  icons: {
    icon: [
      {
        url: '/images/logo.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ConditionalNavbar />
            {children}
          </ErrorBoundary>
          <Toaster
            position="top-center"
            expand={true}
            richColors={true}
            closeButton={true}
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                fontSize: '16px',
                padding: '16px 20px',
                minHeight: '60px',
                maxWidth: '500px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'none',
                opacity: '1',
              },
              className: 'toast-custom',
            }}
            theme="system"
          />
        </ThemeProvider>
        <BackToTop />
        <SpeedInsights />
      </body>
    </html>
  );
}