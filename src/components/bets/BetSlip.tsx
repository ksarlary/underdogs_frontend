import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../contexts/useCurrentUser'
import { createBet } from '../../services/bets'
import { ApiError } from '../../services/httpClient'
import type { TeamOdds } from '../../types/match'

type BetSlipProps = {
    matchId: string
    selection: TeamOdds
    onClear: () => void
}

type ConfirmedBet = {
    teamName: string
    amount: number
}

function BetSlip({ matchId, selection, onClear }: BetSlipProps) {
    const { refreshCurrentUser } = useCurrentUser()
    const [amount, setAmount] = useState<number>(50)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [submitError, setSubmitError] = useState<string>('')
    const [confirmedBet, setConfirmedBet] = useState<ConfirmedBet | null>(null)

    const safeAmount = Number.isFinite(amount) ? Math.max(Math.floor(amount), 0) : 0
    const potentialReturn = Math.round(safeAmount * selection.coefficient)
    const netGain = potentialReturn - safeAmount

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault()
        setSubmitError('')

        if (confirmedBet || isSubmitting) {
            return
        }

        if (safeAmount < 1) {
            setSubmitError('La mise doit etre superieure a 0.')
            return
        }

        try {
            setIsSubmitting(true)

            await createBet({
                matchId,
                teamId: selection.id,
                amount: safeAmount,
            })

            setConfirmedBet({
                teamName: selection.name,
                amount: safeAmount,
            })

            try {
                await refreshCurrentUser()
            } catch (refreshError: unknown) {
                console.error('Unable to refresh current user after bet creation', refreshError)
            }
        } catch (error: unknown) {
            console.error(error)

            if (!(error instanceof ApiError)) {
                setSubmitError('Impossible de placer ce pari pour le moment.')
                return
            }

            if (error.code === 'AUTHENTICATION_REQUIRED') {
                setSubmitError('Tu dois etre connecte pour placer un pari.')
                return
            }

            if (error.code === 'SESSION_EXPIRED') {
                setSubmitError('Ta session a expiré. Reconnecte-toi pour continuer.')
                return
            }

            if (error.code === 'BET_ALREADY_EXISTS') {
                setSubmitError('Tu as deja place un pari sur ce match.')
                return
            }

            if (error.code === 'INSUFFICIENT_KIBBLES') {
                setSubmitError('Solde de kibbles insuffisant.')
                return
            }

            if (error.code === 'MATCH_NOT_OPEN_FOR_BETS') {
                setSubmitError('Les paris sont fermes pour ce match.')
                return
            }

            if (error.code === 'USER_BLOCKED') {
                setSubmitError('Votre compte est bloque. Vous ne pouvez pas placer de pari.')
                return
            }

            setSubmitError('Impossible de placer ce pari pour le moment.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (confirmedBet) {
        return (
            <section className="bet-slip" aria-labelledby="bet-success-title">
                <div className="bet-slip-header">
                    <div>
                        <p className="eyebrow">Ticket de pari</p>
                        <h2 id="bet-success-title">Pari enregistre</h2>
                    </div>

                    <button className="secondary-button" type="button" onClick={onClear}>
                        Fermer
                    </button>
                </div>

                <p className="page-status">Ton pari a bien ete enregistre.</p>

                <div className="bet-slip-selection">
                    <span>Equipe</span>
                    <strong>{confirmedBet.teamName}</strong>
                </div>

                <div className="bet-slip-summary">
                    <span>Mise</span>
                    <strong>{confirmedBet.amount.toLocaleString('fr-FR')} kibbles</strong>
                </div>

                <p className="page-status">
                    La cote definitive et le retour potentiel enregistre sont disponibles dans Mes paris.
                </p>

                <Link className="primary-button bet-slip-submit" to="/my-bets">
                    Voir mes paris
                </Link>
            </section>
        )
    }

    return (
        <form className="bet-slip" aria-labelledby="bet-slip-title" onSubmit={handleSubmit}>
            <div className="bet-slip-header">
                <div>
                    <p className="eyebrow">Ticket de pari</p>
                    <h2 id="bet-slip-title">Mise en kibbles</h2>
                </div>

                <button className="secondary-button" type="button" onClick={onClear}>
                    Annuler
                </button>
            </div>

            <div className="bet-slip-selection">
                <span>Selection</span>
                <strong>{selection.name}</strong>
            </div>

            <div className="bet-slip-selection">
                <span>Cote estimee</span>
                <strong>x{selection.coefficient}</strong>
            </div>

            <label className="bet-slip-field">
                <span>Mise</span>
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                />
            </label>

            <div className="bet-slip-quick-actions" aria-label="Montants rapides">
                {[10, 25, 50, 100].map((value) => (
                    <button
                        key={value}
                        className="secondary-button"
                        type="button"
                        onClick={() => setAmount((currentAmount) => currentAmount + value)}
                    >
                        +{value}
                    </button>
                ))}
            </div>

            <div className="bet-slip-summary">
                <span>Retour potentiel estime</span>
                <strong>{potentialReturn} kibbles</strong>
            </div>

            <div className="bet-slip-summary">
                <span>Gain net estime</span>
                <strong>{netGain} kibbles</strong>
            </div>

            <p className="page-status">
                La cote et les gains affichés sont estimatifs. Les montants définitifs seront confirmés lors de l’enregistrement du pari.
            </p>

            {submitError && <p className="page-status">{submitError}</p>}

            <button className="primary-button bet-slip-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Validation...' : 'Confirmer le pari'}
            </button>
        </form>
    )
}

export default BetSlip
