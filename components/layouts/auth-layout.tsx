import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

interface AuthLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  showSignupLink?: boolean
  showLoginLink?: boolean
}

export function AuthLayout({
  title,
  description,
  children,
  showSignupLink = false,
  showLoginLink = false
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.svg"
              alt="Koncept Studio Logo"
              width={48}
              height={48}
              className="h-12 w-12 dark:invert"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Koncept Studio</h1>
          <p className="mt-2 text-sm text-gray-600">
            Votre studio de fitness à Casablanca
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}

            <div className="mt-6 text-center space-y-2">
              {showSignupLink && (
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link
                    href="/signup"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Créer un compte
                  </Link>
                </p>
              )}

              {showLoginLink && (
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}