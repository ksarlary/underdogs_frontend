export function formatKibbles(value: number): string {
  return `${value.toLocaleString('fr-FR')} K`
}

export function formatDate(value: string): string {
  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return 'Date non disponible'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(timestamp)
}
