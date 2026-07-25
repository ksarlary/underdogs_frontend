type ErrorStateProps = {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

function ErrorState({ message, onRetry, retryLabel = 'Réessayer' }: ErrorStateProps) {
  if (!onRetry) {
    return (
      <p className="page-status" role="alert">
        {message}
      </p>
    )
  }

  return (
    <div className="page-status page-status-with-action" role="alert">
      <span>{message}</span>

      <button className="secondary-button" type="button" onClick={onRetry}>
        {retryLabel}
      </button>
    </div>
  )
}

export default ErrorState
