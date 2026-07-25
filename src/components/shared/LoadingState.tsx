type LoadingStateProps = {
  message: string
}

function LoadingState({ message }: LoadingStateProps) {
  return (
    <p className="page-status" role="status" aria-live="polite">
      {message}
    </p>
  )
}

export default LoadingState
