import { ErrorAlert, SuccessAlert } from './error-alert'

interface FormWrapperProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  error?: string | string[] | null
  success?: string | null
  loading?: boolean
  className?: string
}

export function FormWrapper({
  children,
  onSubmit,
  error,
  success,
  loading = false,
  className = 'space-y-6'
}: FormWrapperProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    await onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <ErrorAlert error={error} />
      <SuccessAlert message={success} />
      {children}
    </form>
  )
}

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className = 'space-y-2'
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}