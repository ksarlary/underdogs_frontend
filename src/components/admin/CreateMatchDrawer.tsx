import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../services/httpClient'
import { createMatch } from '../../services/matches'
import { getTeams } from '../../services/teams'
import { getTournaments } from '../../services/tournaments'
import type { TeamSummary } from '../../types/team'
import type { TournamentSummary } from '../../types/tournament'
import MatchFormFields from './MatchFormFields'
import { type MatchFormValues, updateMatchFormValues } from './matchFormOptions'
import useEscapeKey from './useEscapeKey'

type CreateMatchDrawerProps = {
  isOpen: boolean
  onClose: () => void
  onMatchCreated?: (location: string | null) => void | Promise<void>
}

const initialFormValues: MatchFormValues = {
  game: '',
  tournamentId: '',
  team1Id: '',
  team2Id: '',
  date: '',
  time: '',
}

function CreateMatchDrawer({
  isOpen,
  onClose,
  onMatchCreated,
}: CreateMatchDrawerProps) {
  const [formValues, setFormValues] =
    useState<MatchFormValues>(initialFormValues)
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [optionsError, setOptionsError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const closeDrawer = useCallback((): void => {
    setFormValues(initialFormValues)
    setOptionsError('')
    setSubmitError('')
    onClose()
  }, [onClose])

  useEscapeKey(isOpen, closeDrawer)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    let isMounted = true

    async function loadOptions(): Promise<void> {
      setIsLoadingOptions(true)
      setOptionsError('')
      setSubmitError('')

      try {
        const [teamsData, tournamentsData] = await Promise.all([
          getTeams(),
          getTournaments(),
        ])

        if (isMounted) {
          setTeams(teamsData)
          setTournaments(tournamentsData)
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setOptionsError('Impossible de charger les équipes et les tournois.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const isFormComplete = Object.values(formValues).every(Boolean)

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

    if (!isFormComplete || !formValues.game || isSubmitting) {
      return
    }

    const game = formValues.game

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const scheduledAt = new Date(`${formValues.date}T${formValues.time}:00`).toISOString()
      const location = await createMatch({
        team1Id: formValues.team1Id,
        team2Id: formValues.team2Id,
        tournamentId: formValues.tournamentId,
        game,
        scheduledAt,
      })

      await onMatchCreated?.(location)
      closeDrawer()
    } catch (error: unknown) {
      console.error(error)

      if (!(error instanceof ApiError)) {
        setSubmitError('Impossible de créer le match pour le moment.')
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

      setSubmitError('Impossible de créer le match pour le moment.')
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
        aria-labelledby="create-match-title"
      >
        <header className="admin-drawer-header">
          <div>
            <p className="eyebrow">Nouveau match</p>
            <h2 id="create-match-title">Créer un match</h2>
            <p>
              Sélectionnez un jeu, un tournoi, deux équipes du même jeu et un
              horaire de programmation.
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
            {isLoadingOptions && (
              <p
                className="page-status admin-drawer-message"
                role="status"
                aria-live="polite"
              >
                Chargement des équipes et tournois...
              </p>
            )}

            {!isLoadingOptions && optionsError && (
              <p className="page-status admin-drawer-message" role="alert">
                {optionsError}
              </p>
            )}

            <MatchFormFields
              values={formValues}
              teams={teams}
              tournaments={tournaments}
              disabled={isLoadingOptions || isSubmitting}
              onFieldChange={handleFieldChange}
            />

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

            <button
              className="primary-button"
              type="submit"
              disabled={!isFormComplete || isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer le match'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

export default CreateMatchDrawer
