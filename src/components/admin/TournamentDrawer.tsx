import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  createTournament,
  getTournamentById,
  updateTournament,
} from '../../services/tournaments'
import type { Game } from '../../types/common'
import type {
  TournamentDetail,
  TournamentSummary,
} from '../../types/tournament'
import { getGameLabel } from '../../utils/displayLabels'
import { gameOptions, isGame } from './matchFormOptions'
import useEscapeKey from './useEscapeKey'

type TournamentFormValues = {
  name: string
  game: Game | ''
  startDate: string
  endDate: string
}

type TournamentDrawerProps = {
  isOpen: boolean
  tournament: TournamentSummary | null
  onClose: () => void
  onTournamentSaved?: () => void | Promise<void>
}

const initialFormValues: TournamentFormValues = {
  name: '',
  game: '',
  startDate: '',
  endDate: '',
}

function TournamentDrawer({
  isOpen,
  tournament,
  onClose,
  onTournamentSaved,
}: TournamentDrawerProps) {
  const [tournamentDetails, setTournamentDetails] =
    useState<TournamentDetail | null>(null)
  const [formValues, setFormValues] =
    useState<TournamentFormValues>(initialFormValues)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const isEditing = tournament !== null
  const isFormComplete = Object.values(formValues).every(Boolean)
  const isDateRangeValid =
    formValues.startDate === '' ||
    formValues.endDate === '' ||
    formValues.endDate >= formValues.startDate
  const canSubmit =
    isFormComplete &&
    isDateRangeValid &&
    !isLoading &&
    !isSubmitting

  const closeDrawer = useCallback((): void => {
    setTournamentDetails(null)
    setFormValues(initialFormValues)
    setLoadError('')
    setSubmitError('')
    onClose()
  }, [onClose])

  useEscapeKey(isOpen, closeDrawer)

  useEffect(() => {
    if (!isOpen || !tournament?.id) {
      return undefined
    }

    const tournamentId = tournament.id
    let isMounted = true

    async function loadTournamentDetails(): Promise<void> {
      setIsLoading(true)
      setLoadError('')
      setSubmitError('')
      setTournamentDetails(null)

      try {
        const data = await getTournamentById(tournamentId)

        if (isMounted) {
          setTournamentDetails(data)
          setFormValues({
            name: data.name,
            game: data.game,
            startDate: data.startDate,
            endDate: data.endDate,
          })
        }
      } catch (error: unknown) {
        console.error(error)

        if (isMounted) {
          setLoadError('Impossible de charger le tournoi.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTournamentDetails()

    return () => {
      isMounted = false
    }
  }, [isOpen, tournament?.id])

  if (!isOpen) {
    return null
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.currentTarget

    setFormValues((currentValues) => {
      if (name === 'game') {
        const game: Game | '' = value === '' || isGame(value) ? value : ''

        return {
          ...currentValues,
          game,
        }
      }

      return {
        ...currentValues,
        [name]: value,
      }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!canSubmit || !formValues.game) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      if (isEditing && tournamentDetails) {
        await updateTournament(tournamentDetails.id, {
          name: formValues.name,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
        })
      } else {
        await createTournament({
          name: formValues.name,
          game: formValues.game,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
        })
      }

      await onTournamentSaved?.()
      closeDrawer()
    } catch (error: unknown) {
      console.error(error)
      setSubmitError(
        isEditing
          ? 'Impossible de modifier le tournoi pour le moment.'
          : 'Impossible de créer le tournoi pour le moment.',
      )
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
        aria-labelledby="tournament-drawer-title"
      >
        <header className="admin-drawer-header">
          <div>
            <p className="eyebrow">Tournois</p>
            <h2 id="tournament-drawer-title">
              {isEditing ? 'Modifier le tournoi' : 'Créer un tournoi'}
            </h2>
            <p>
              Les tournois servent de cadre aux matchs programmés dans
              l’administration.
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
                Chargement du tournoi...
              </p>
            )}

            {!isLoading && loadError && (
              <p className="page-status admin-drawer-message" role="alert">
                {loadError}
              </p>
            )}

            <label className="admin-field-full">
              Nom
              <input
                name="name"
                type="text"
                value={formValues.name}
                onChange={handleFieldChange}
                disabled={isLoading || isSubmitting}
              />
            </label>

            {isEditing ? (
              <div className="admin-readonly-field admin-field-full">
                <span>Jeu</span>
                <strong>
                  {formValues.game
                    ? getGameLabel(formValues.game)
                    : 'Non renseigné'}
                </strong>
              </div>
            ) : (
              <label className="admin-field-full">
                Jeu
                <select
                  name="game"
                  value={formValues.game}
                  onChange={handleFieldChange}
                  disabled={isLoading || isSubmitting}
                >
                  <option value="">Choisir un jeu</option>
                  {gameOptions.map((game) => (
                    <option key={game.value} value={game.value}>
                      {game.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Début
              <input
                name="startDate"
                type="date"
                value={formValues.startDate}
                onChange={handleFieldChange}
                disabled={isLoading || isSubmitting}
              />
            </label>

            <label>
              Fin
              <input
                name="endDate"
                type="date"
                value={formValues.endDate}
                onChange={handleFieldChange}
                disabled={isLoading || isSubmitting}
              />
            </label>

            {!isDateRangeValid ? (
              <p className="page-status admin-drawer-message">
                La date de fin doit être postérieure ou égale à la date de
                début.
              </p>
            ) : null}

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
              {isSubmitting
                ? 'Enregistrement...'
                : isEditing
                  ? 'Modifier le tournoi'
                  : 'Créer le tournoi'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

export default TournamentDrawer
