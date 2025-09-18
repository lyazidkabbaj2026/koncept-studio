import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/nav/conditional-navbar";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/error-boundary";
import { Toaster } from "sonner";
import { SpeedInsights } from '@vercel/speed-insights/next';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Koncept Studio",
  description: "Réservez vos cours de fitness en ligne",
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
        <SpeedInsights />
      </body>
    </html>
  );
}