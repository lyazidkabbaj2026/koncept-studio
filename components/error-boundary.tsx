'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
    
    // In production, log to external service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return (
        <Fallback
          error={this.state.error!}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <IconAlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Une erreur s'est produite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur d'application</AlertTitle>
            <AlertDescription>
              {isDevelopment 
                ? error.message 
                : 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support si le problème persiste.'
              }
            </AlertDescription>
          </Alert>

          {isDevelopment && errorInfo && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Détails techniques (développement uniquement)
              </summary>
              <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-md overflow-auto max-h-40">
                {error.stack}
                {'\n\nComponent Stack:'}
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={resetError} className="flex items-center gap-2">
              <IconRefresh className="h-4 w-4" />
              Réessayer
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <IconHome className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>
              Si le problème persiste, contactez le support à{' '}
              <a 
                href="mailto:contact.upMotion@gmail.com" 
                className="text-primary hover:underline"
              >
                contact.upMotion@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components to trigger error boundaries
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Specialized error boundaries for different contexts
export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryClass
      fallback={AuthErrorFallback}
      onError={(error) => {
        console.error('Auth Error:', error)
        // Log auth-specific errors
      }}
    >
      {children}
    </ErrorBoundaryClass>
  )
}

export function BookingErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryClass
      fallback={BookingErrorFallback}
      onError={(error) => {
        console.error('Booking Error:', error)
        // Log booking-specific errors
      }}
    >
      {children}
    </ErrorBoundaryClass>
  )
}

function AuthErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <IconAlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <CardTitle>Erreur d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Un problème s'est produit lors de l'authentification. 
              Veuillez vous reconnecter.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button onClick={resetError}>Réessayer</Button>
            <Button variant="outline" asChild>
              <Link href="/login">Se reconnecter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BookingErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <IconAlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <CardTitle>Erreur de réservation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Un problème s'est produit lors de la réservation. 
              Veuillez réessayer.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button onClick={resetError}>Réessayer</Button>
            <Button variant="outline" asChild>
              <Link href="/espace/planning">Retour au planning</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorBoundaryClass