import type { Metadata } from "next";
import "./globals.css";
import { ConditionalNavbar } from "@/components/nav/conditional-navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: "Koncept Studio",
  description: "Réservez vos cours de fitness en ligne",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || headersList.get('x-pathname') || ''
  
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalNavbar pathname={pathname} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}