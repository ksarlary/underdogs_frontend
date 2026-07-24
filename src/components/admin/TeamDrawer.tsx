import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  createTeam,
  getTeamById,
  updateTeam,
} from '../../services/teams'
import type { Game } from '../../types/common'
import type {
  TeamDetail,
  TeamSummary,
} from '../../types/team'
import { getGameLabel } from '../../utils/displayLabels'
import { gameOptions, isGame } from './matchFormOptions'
import useEscapeKey from './useEscapeKey'

type TeamFormValues = {
  name: string
  tag: string
  game: Game | ''
}

type TeamDrawerProps = {
  isOpen: boolean
  team: TeamSummary | null
  onClose: () => void
  onTeamSaved?: () => void | Promise<void>
}

const initialFormValues: TeamFormValues = {
  name: '',
  tag: '',
  game: '',
}

function TeamDrawer({
  isOpen,
  team,
  onClose,
  onTeamSaved,
}: TeamDrawerProps) {
  const [teamDetails, setTeamDetails] = useState<TeamDetail | null>(null)
  const [formValues, setFormValues] =
    useState<TeamFormValues>(initialFormValues)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const isEditing = team !== null
  const isFormComplete = isEditing
    ? formValues.name.trim().length > 0 && formValues.tag.trim().length > 0
    : Object.values(formValues).every(Boolean)
  const canSubmit = isFormComplete && !isLoading && !isSubmitting

  const closeDrawer = useCallback((): void => {
    setTeamDetails(null)
    setFormValues(initialFormValues)
    setLoadError('')
    setSubmitError('')
    onClose()
  }, [onClose])

  useEscapeKey(isOpen, closeDrawer)

  useEffect(() => {
    if (!isOpen || !team?.id) {
      return undefined
    }

    const teamId = team.id
    let isMounted = true

    async function loadTeamDetails(): Promise<void> {
      setIsLoading(true)
      setLoadError('')
      setSubmitError('')
      setTeamDetails(null)

      try {
        const data = await getTeamById(teamId)

        if (isMounted) {
          setTeamDetails(data)
          setFormValues({
            name: data.name,
            tag: data.tag,
            game: data.game,
          })
        }
      } catch (error: unknown) {
        console.error(error)

        if (isMounted) {
          setLoadError('Impossible de charger l’équipe.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTeamDetails()

    return () => {
      isMounted = false
    }
  }, [isOpen, team?.id])

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
      if (isEditing && teamDetails) {
        await updateTeam(teamDetails.id, {
          name: formValues.name.trim(),
          tag: formValues.tag.trim(),
        })
      } else {
        await createTeam({
          name: formValues.name.trim(),
          tag: formValues.tag.trim(),
          game: formValues.game,
        })
      }

      await onTeamSaved?.()
      closeDrawer()
    } catch (error: unknown) {
      console.error(error)
      setSubmitError(
        isEditing
          ? 'Impossible de modifier l’équipe pour le moment.'
          : 'Impossible de créer l’équipe pour le moment.',
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
        aria-labelledby="team-drawer-title"
      >
        <header className="admin-drawer-header">
          <div>
            <p className="eyebrow">Équipes</p>
            <h2 id="team-drawer-title">
              {isEditing ? 'Modifier l’équipe' : 'Créer une équipe'}
            </h2>
            <p>
              Les équipes sont les références utilisées lors de la programmation
              des matchs.
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
                Chargement de l’équipe...
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

            <label>
              Tag
              <input
                name="tag"
                type="text"
                value={formValues.tag}
                onChange={handleFieldChange}
                disabled={isLoading || isSubmitting}
              />
            </label>

            {isEditing ? (
              <div className="admin-readonly-field">
                <span>Jeu</span>
                <strong>
                  {formValues.game ? getGameLabel(formValues.game) : 'Non renseigné'}
                </strong>
              </div>
            ) : (
              <label>
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

            {teamDetails ? (
              <p className="page-status admin-drawer-message">
                Joueurs rattachés : {teamDetails.players.length}
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
                  ? 'Modifier l’équipe'
                  : 'Créer l’équipe'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

export default TeamDrawer
