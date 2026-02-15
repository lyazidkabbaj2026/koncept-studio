import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { IconAlertTriangle, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

interface ErrorAlertProps {
  error: string | string[] | null | undefined
  title?: string
  variant?: 'default' | 'destructive'
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function ErrorAlert({
  error,
  title = 'Erreur',
  variant = 'destructive',
  dismissible = false,
  onDismiss,
  className
}: ErrorAlertProps) {
  if (!error) return null

  const errors = Array.isArray(error) ? error.filter(Boolean) : [error].filter(Boolean)

  // Don't render if no valid errors after filtering
  if (errors.length === 0) return null

  return (
    <Alert variant={variant} className={className}>
      <IconAlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          {title}
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </AlertTitle>
        <AlertDescription>
          {errors.length === 1 ? (
            <span>{errors[0]}</span>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </div>
    </Alert>
  )
}

interface SuccessAlertProps {
  message: string | null | undefined
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function SuccessAlert({
  message,
  title = 'Succès',
  dismissible = false,
  onDismiss,
  className
}: SuccessAlertProps) {
  if (!message) return null

  return (
    <Alert variant="default" className={`border-green-200 bg-green-50 text-green-800 ${className}`}>
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between text-green-800">
          {title}
          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </AlertTitle>
        <AlertDescription className="text-green-700">
          {message}
        </AlertDescription>
      </div>
    </Alert>
  )
}

interface LoadingAlertProps {
  message?: string
  title?: string
  className?: string
}

export function LoadingAlert({
  message = 'Chargement en cours...',
  title = 'Chargement',
  className
}: LoadingAlertProps) {
  return (
    <Alert variant="default" className={`border-blue-200 bg-blue-50 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <div>
          <AlertTitle className="text-blue-800">{title}</AlertTitle>
          <AlertDescription className="text-blue-700">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}