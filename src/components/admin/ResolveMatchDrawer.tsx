import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react'
import { getMatchById, updateMatch } from '../../services/matches'
import type { MatchDetail, MatchSummary } from '../../types/match'
import MatchSummaryChip from './MatchSummaryChip'
import useEscapeKey from './useEscapeKey'

type ResolveMatchFormValues = {
  team1Score: string
  team2Score: string
  winnerTeamId: string
}

type ResolveMatchDrawerProps = {
  isOpen: boolean
  match: MatchSummary | null
  onClose: () => void
  onMatchResolved?: () => void | Promise<void>
}

const initialFormValues: ResolveMatchFormValues = {
  team1Score: '',
  team2Score: '',
  winnerTeamId: '',
}

function getScoreWinnerTeamId(match: MatchDetail, team1Score: number, team2Score: number): string {
  if (team1Score > team2Score) {
    return match.team1Id
  }

  if (team2Score > team1Score) {
    return match.team2Id
  }

  return ''
}

function ResolveMatchDrawer({
  isOpen,
  match,
  onClose,
  onMatchResolved,
}: ResolveMatchDrawerProps) {
  const [matchDetails, setMatchDetails] = useState<MatchDetail | null>(null)
  const [formValues, setFormValues] = useState<ResolveMatchFormValues>(initialFormValues)
  const [isLoadingMatch, setIsLoadingMatch] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [matchError, setMatchError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const closeDrawer = useCallback((): void => {
    setMatchDetails(null)
    setFormValues(initialFormValues)
    setMatchError('')
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

    async function loadMatchDetails(): Promise<void> {
      setIsLoadingMatch(true)
      setMatchError('')
      setSubmitError('')
      setMatchDetails(null)

      try {
        const data = await getMatchById(matchId)

        if (isMounted) {
          setMatchDetails(data)
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setMatchError('Impossible de charger le détail du match.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingMatch(false)
        }
      }
    }

    void loadMatchDetails()

    return () => {
      isMounted = false
    }
  }, [isOpen, match?.id])

  if (!isOpen || !match) {
    return null
  }

  const score1 = Number(formValues.team1Score)
  const score2 = Number(formValues.team2Score)
  const hasScores = formValues.team1Score !== '' && formValues.team2Score !== ''
  const scoresAreValid =
    hasScores && Number.isInteger(score1) && Number.isInteger(score2) && score1 >= 0 && score2 >= 0
  const isDraw = scoresAreValid && score1 === score2
  const expectedWinnerTeamId =
    matchDetails && scoresAreValid && !isDraw
      ? getScoreWinnerTeamId(matchDetails, score1, score2)
      : ''
  const winnerMatchesScore =
    Boolean(expectedWinnerTeamId) && formValues.winnerTeamId === expectedWinnerTeamId

  const validationMessage = getValidationMessage()
  const canSubmit =
    matchDetails !== null &&
    scoresAreValid &&
    !isDraw &&
    Boolean(formValues.winnerTeamId) &&
    winnerMatchesScore &&
    !isSubmitting

  function getValidationMessage(): string {
    if (!hasScores || !formValues.winnerTeamId) {
      return ''
    }

    if (!scoresAreValid) {
      return 'Les scores doivent être des nombres entiers positifs.'
    }

    if (isDraw) {
      return 'Un match terminé doit avoir un gagnant.'
    }

    if (!winnerMatchesScore) {
      return 'Le gagnant doit correspondre au score le plus élevé.'
    }

    return ''
  }

  function handleFieldChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = event.currentTarget

    setFormValues((currentValues) => {
      if (name === 'team1Score') {
        return {
          ...currentValues,
          team1Score: value,
        }
      }

      if (name === 'team2Score') {
        return {
          ...currentValues,
          team2Score: value,
        }
      }

      if (name === 'winnerTeamId') {
        return {
          ...currentValues,
          winnerTeamId: value,
        }
      }

      return currentValues
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!canSubmit || !matchDetails) {
      return
    }

    const matchId = matchDetails.id

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await updateMatch(matchId, {
        status: 'FINISHED',
        team1Score: score1,
        team2Score: score2,
        winnerTeamId: formValues.winnerTeamId,
      })

      await onMatchResolved?.()
      closeDrawer()
    } catch (error: unknown) {
      console.error(error)
      setSubmitError('Impossible de terminer le match pour le moment.')
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
        aria-labelledby="resolve-match-title"
      >
        <header className="admin-drawer-header">
          <div>
            <p className="eyebrow">Résultat</p>
            <h2 id="resolve-match-title">Terminer le match</h2>
            <p>
              Saisir le score final et le gagnant. Le backend résoudra ensuite
              les paris liés à ce match.
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
            {isLoadingMatch && (
              <p
                className="page-status admin-drawer-message"
                role="status"
                aria-live="polite"
              >
                Chargement du match...
              </p>
            )}

            {!isLoadingMatch && matchError && (
              <p className="page-status admin-drawer-message" role="alert">
                {matchError}
              </p>
            )}

            {matchDetails && (
              <>
                <MatchSummaryChip
                  team1Name={matchDetails.team1Name}
                  team2Name={matchDetails.team2Name}
                  status={matchDetails.status}
                />

                <label>
                  Score {matchDetails.team1Name}
                  <input
                    min="0"
                    name="team1Score"
                    step="1"
                    type="number"
                    value={formValues.team1Score}
                    onChange={handleFieldChange}
                    disabled={isSubmitting}
                  />
                </label>

                <label>
                  Score {matchDetails.team2Name}
                  <input
                    min="0"
                    name="team2Score"
                    step="1"
                    type="number"
                    value={formValues.team2Score}
                    onChange={handleFieldChange}
                    disabled={isSubmitting}
                  />
                </label>

                <label className="admin-field-full">
                  Gagnant
                  <select
                    name="winnerTeamId"
                    value={formValues.winnerTeamId}
                    onChange={handleFieldChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Choisir le gagnant</option>
                    <option value={matchDetails.team1Id}>{matchDetails.team1Name}</option>
                    <option value={matchDetails.team2Id}>{matchDetails.team2Name}</option>
                  </select>
                </label>

                {validationMessage && (
                  <p className="page-status admin-drawer-message">
                    {validationMessage}
                  </p>
                )}
              </>
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
              {isSubmitting ? 'Résolution...' : 'Terminer le match'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  )
}

export default ResolveMatchDrawer
