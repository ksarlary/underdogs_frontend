import type { TeamDetail } from '../../types/team'
import { getGameLabel } from '../../utils/displayLabels'

type TeamRosterModalProps = {
  team: TeamDetail | null
  isLoading: boolean
  error: string
  onClose: () => void
}

function normalizeCountryCode(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) {
    return ''
  }

  return countryCode.toLowerCase()
}

function TeamRosterModal({
  team,
  isLoading,
  error,
  onClose,
}: TeamRosterModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="roster-modal"
        aria-labelledby="roster-title"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {team ? getGameLabel(team.game) : 'Roster'}
            </p>
            <h2 id="roster-title">{team?.name ?? 'Joueurs'}</h2>
          </div>

          <button className="secondary-button" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>

        {isLoading && (
          <p className="page-status" role="status" aria-live="polite">
            Chargement des joueurs...
          </p>
        )}

        {!isLoading && error && (
          <p className="page-status" role="alert">
            {error}
          </p>
        )}

        {!isLoading && team && team.players.length === 0 && (
          <p className="page-status">
            Aucun joueur associé à cette équipe.
          </p>
        )}

        {!isLoading && team && team.players.length > 0 && (
          <div className="team-roster-grid">
            {team.players.map((player) => {
              const normalizedCountryCode = normalizeCountryCode(
                player.countryCode,
              )

              return (
                <article
                  className="tournament-card compact-card"
                  key={player.id}
                >
                  <div className="player-card-content">
                    <span className="player-card-label">Joueur</span>
                    <h3>{player.nickname}</h3>

                    {normalizedCountryCode ? (
                      <span
                        className={`fi fi-${normalizedCountryCode} player-flag-icon`}
                        aria-label={player.countryCode}
                      />
                    ) : (
                      <span className="player-flag-fallback">??</span>
                    )}

                    <span className="player-country-code">
                      {player.countryCode}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default TeamRosterModal
