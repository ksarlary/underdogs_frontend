type EmptyStateProps = {
  message: string
  variant?: 'default' | 'panel'
}

function EmptyState({ message, variant = 'default' }: EmptyStateProps) {
  const className = variant === 'panel' ? 'admin-panel-empty' : 'page-status'

  return <p className={className}>{message}</p>
}

export default EmptyState
