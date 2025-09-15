import { useState, useCallback } from 'react'

export interface FormHandlerOptions {
  initialError?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  defaultErrorMessage?: string
}

export function useFormHandler<T = any>(
  submitFn: (data: T) => Promise<void>,
  options: FormHandlerOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(options.initialError || '')

  const handleSubmit = useCallback(
    async (data: T) => {
      setLoading(true)
      setError('')

      try {
        await submitFn(data)
        options.onSuccess?.()
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : options.defaultErrorMessage || 'Une erreur s\'est produite'

        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))
      } finally {
        setLoading(false)
      }
    },
    [submitFn, options]
  )

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const resetForm = useCallback(() => {
    setLoading(false)
    setError('')
  }, [])

  return {
    loading,
    error,
    handleSubmit,
    clearError,
    resetForm,
    isSuccess: !loading && !error,
  }
}

// Specialized hook for form events
export function useFormEventHandler<T = any>(
  submitFn: (data: T) => Promise<void>,
  options: FormHandlerOptions = {}
) {
  const { handleSubmit, ...rest } = useFormHandler(submitFn, options)

  const handleFormSubmit = useCallback(
    (e: React.FormEvent, data: T) => {
      e.preventDefault()
      return handleSubmit(data)
    },
    [handleSubmit]
  )

  return {
    ...rest,
    handleSubmit,
    handleFormSubmit,
  }
}