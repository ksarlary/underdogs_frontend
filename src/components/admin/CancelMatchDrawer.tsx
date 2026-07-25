import { type FormEvent, useCallback, useState } from 'react'
import { updateMatch } from '../../services/matches'
import type { MatchSummary } from '../../types/match'
import { getMatchStatusLabel } from '../../utils/displayLabels'
import MatchSummaryChip from './MatchSummaryChip'
import useEscapeKey from './useEscapeKey'

type CancelMatchDrawerProps = {
  isOpen: boolean
  match: MatchSummary | null
  onClose: () => void
  onMatchCancelled?: () => void | Promise<void>
}

function CancelMatchDrawer({
  isOpen,
  match,
  onClose,
  onMatchCancelled,
}: CancelMatchDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string>('')

  const closeDrawer = useCallback((): void => {
    setSubmitError('')
    onClose()
  }, [onClose])

  useEscapeKey(isOpen, closeDrawer)

  if (!isOpen || !match) {
    return null
  }

  const selectedMatch = match

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await updateMatch(selectedMatch.id, {
        status: 'CANCELLED',
      })

      await onMatchCancelled?.()
      closeDrawer()
    } catch (error: unknown) {
      console.error(error)
      setSubmitError('Impossible d’annuler le match pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div
        className="admin-drawer-backdrop"
        role="presentation"
        onClick={closeDrawer}
      />

      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-match-title"
      >
        <header className="admin-drawer-header">
          <div>
            <p className="eyebrow">Annulation</p>
            <h2 id="cancel-match-title">Annuler le match</h2>
            <p>
              Cette action passera le match au statut{' '}
              {getMatchStatusLabel('CANCELLED')}. Les paris associés seront automatiquement remboursés.
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={closeDrawer}
            aria-label="Fermer le panneau"
          >
            Fermer
          </button>
        </header>

        <form className="admin-drawer-form" onSubmit={handleSubmit}>
          <div className="admin-drawer-body">
            <MatchSummaryChip
              team1Name={selectedMatch.team1Name}
              team2Name={selectedMatch.team2Name}
              status={selectedMatch.status}
            />

            <p className="page-status admin-drawer-message admin-warning-message">
              Confirme uniquement si le match ne doit plus être joué. Les paris
              en attente seront remboursés automatiquement.
            </p>

            {submitError && (
              <p className="page-status admin-drawer-message" role="alert">
                {submitError}
              </p>
            )}
          </div>

          <footer className="admin-drawer-footer">
            <button
              className="secondary-button"
              type="button"
              onClick={closeDrawer}
              disabled={isSubmitting}
            >
              Retour
            </button>

            <button
              className="primary-button admin-danger-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Annulation...' : 'Confirmer l’annulation'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

export default CancelMatchDrawer
