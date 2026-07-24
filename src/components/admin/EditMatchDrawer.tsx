import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../services/httpClient'
import { getMatchById, updateMatch } from '../../services/matches'
import { getTeams } from '../../services/teams'
import { getTournaments } from '../../services/tournaments'
import type { MatchDetail, MatchSummary } from '../../types/match'
import type { TeamSummary } from '../../types/team'
import type { TournamentSummary } from '../../types/tournament'
import { getMatchStatusLabel } from '../../utils/displayLabels'
import MatchFormFields from './MatchFormFields'
import { type MatchFormValues, updateMatchFormValues } from './matchFormOptions'
import useEscapeKey from './useEscapeKey'

type DateTimeParts = {
  date: string
  time: string
}

type EditMatchDrawerProps = {
  isOpen: boolean
  match: MatchSummary | null
  onClose: () => void
  onMatchUpdated?: () => void | Promise<void>
}

const initialFormValues: MatchFormValues = {
  game: '',
  tournamentId: '',
  team1Id: '',
  team2Id: '',
  date: '',
  time: '',
}

function splitDateTime(value: string | null | undefined): DateTimeParts {
  if (!value) {
    return {
      date: '',
      time: '',
    }
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      date: '',
      time: '',
    }
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  const hours = String(parsedDate.getHours()).padStart(2, '0')
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

function EditMatchDrawer({
  isOpen,
  match,
  onClose,
  onMatchUpdated,
}: EditMatchDrawerProps) {
  const [matchDetails, setMatchDetails] = useState<MatchDetail | null>(null)
  const [formValues, setFormValues] = useState<MatchFormValues>(initialFormValues)
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const closeDrawer = useCallback((): void => {
    setMatchDetails(null)
    setFormValues(initialFormValues)
    setLoadError('')
    setSubmitError('')
    onClose()
  }, [onClose])

  useEscapeKey(isOpen, closeDrawer)

  useEffect(() => {
    if (!isOpen || !match?.id) {
      return undefined
    }

    const matchId = match.id
    let isMounted = true

    async function loadFormData(): Promise<void> {
      setIsLoading(true)
      setLoadError('')
      setSubmitError('')
      setMatchDetails(null)

      try {
        const [matchData, teamsData, tournamentsData] = await Promise.all([
          getMatchById(matchId),
          getTeams(),
          getTournaments(),
        ])

        if (isMounted) {
          const scheduledAt = splitDateTime(matchData.scheduledAt)

          setMatchDetails(matchData)
          setTeams(teamsData)
          setTournaments(tournamentsData)
          setFormValues({
            game: matchData.game,
            tournamentId: matchData.tournamentId,
            team1Id: matchData.team1Id,
            team2Id: matchData.team2Id,
            date: scheduledAt.date,
            time: scheduledAt.time,
          })
        }
      } catch (error: unknown) {
        console.error(error)

        if (isMounted) {
          setLoadError('Impossible de charger les informations du match.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFormData()

    return () => {
      isMounted = false
    }
  }, [isOpen, match?.id])

  if (!isOpen || !match) {
    return null
  }

  const isFormComplete = Object.values(formValues).every(Boolean)
  const isSameTeam = Boolean(formValues.team1Id) && formValues.team1Id === formValues.team2Id
  const canSubmit =
    matchDetails !== null &&
    matchDetails.status === 'SCHEDULED' &&
    isFormComplete &&
    !isSameTeam &&
    !isSubmitting

  function handleFieldChange(
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ): void {
    const { name, value } = event.currentTarget

    setFormValues((currentValues) =>
      updateMatchFormValues(currentValues, name, value),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!canSubmit || !matchDetails || !formValues.game) {
      return
    }

    const game = formValues.game

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await updateMatch(matchDetails.id, {
        team1Id: formValues.team1Id,
        team2Id: formValues.team2Id,
        tournamentId: formValues.tournamentId,
        game,
        scheduledAt: new Date(`${formValues.date}T${formValues.time}:00`).toISOString(),
      })

      await onMatchUpdated?.()
      closeDrawer()
    } catch (error: unknown) {
      console.error(error)

      if (!(error instanceof ApiError)) {
        setSubmitError('Impossible de modifier le match pour le moment.')
        return
      }

      if (error.code === 'INVALID_MATCH_GAME') {
        setSubmitError('Les équipes et le tournoi doivent correspondre au jeu sélectionné.')
        return
      }

      if (error.code === 'MATCH_DATE_OUTSIDE_TOURNAMENT') {
        setSubmitError('La date du match doit être comprise dans la période du tournoi.')
        return
      }

      if (error.code === 'INVALID_MATCH_TEAMS') {
        setSubmitError('Les deux équipes doivent être différentes.')
        return
      }

      setSubmitError('Impossible de modifier le match pour le moment.')
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
        aria-labelledby="edit-match-title"
      >
        <header className="admin-drawer-header">
          <div>
            <p className="eyebrow">Programmation</p>
            <h2 id="edit-match-title">Modifier le match</h2>
            <p>
              Modifiez la programmation tant que le match n’est pas encore
              passé en direct.
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
            {isLoading && (
              <p
                className="page-status admin-drawer-message"
                role="status"
                aria-live="polite"
              >
                Chargement du match...
              </p>
            )}

            {!isLoading && loadError && (
              <p className="page-status admin-drawer-message" role="alert">
                {loadError}
              </p>
            )}

            {matchDetails && matchDetails.status !== 'SCHEDULED' && (
              <p className="page-status admin-drawer-message admin-warning-message">
                Ce match ne peut plus être modifié car son statut est{' '}
                {getMatchStatusLabel(matchDetails.status)}.
              </p>
            )}

            {matchDetails && (
              <MatchFormFields
                values={formValues}
                teams={teams}
                tournaments={tournaments}
                disabled={isSubmitting || matchDetails.status !== 'SCHEDULED'}
                onFieldChange={handleFieldChange}
              />
            )}

            {isSameTeam && (
              <p className="page-status admin-drawer-message">
                Les deux équipes doivent être différentes.
              </p>
            )}

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
              Annuler
            </button>

            <button className="primary-button" type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Modification...' : 'Modifier le match'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

export default EditMatchDrawer
