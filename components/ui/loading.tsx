interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-foreground mx-auto"></div>
      <p className="text-sm sm:text-base text-muted-foreground mt-4">{message}</p>
    </div>
  )
}