import type { ChangeEvent } from 'react'
import type { TeamSummary } from '../../types/team'
import type { TournamentSummary } from '../../types/tournament'
import { formatDate } from '../../utils/formatters'
import { gameOptions, type MatchFormValues } from './matchFormOptions'

type MatchFormFieldsProps = {
  values: MatchFormValues
  teams: TeamSummary[]
  tournaments: TournamentSummary[]
  disabled: boolean
  onFieldChange: (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => void
}

function MatchFormFields({
  values,
  teams,
  tournaments,
  disabled,
  onFieldChange,
}: MatchFormFieldsProps) {
  const filteredTeams = values.game
    ? teams.filter((team) => team.game === values.game)
    : []

  const filteredTournaments = values.game
    ? tournaments.filter((tournament) => tournament.game === values.game)
    : []

  const selectedTournament = filteredTournaments.find(
    (tournament) => tournament.id === values.tournamentId,
  )

  const team2Options = filteredTeams.filter(
    (team) => team.id !== values.team1Id,
  )

  return (
    <>
      <label className="admin-field-full">
        Jeu
        <select
          name="game"
          value={values.game}
          onChange={onFieldChange}
          disabled={disabled}
        >
          <option value="">Choisir un jeu</option>
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-field-full">
        Tournoi
        <select
          name="tournamentId"
          value={values.tournamentId}
          onChange={onFieldChange}
          disabled={disabled || !values.game}
        >
          <option value="">Choisir un tournoi</option>
          {filteredTournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </label>

      {selectedTournament ? (
        <p className="page-status admin-drawer-message">
          Période du tournoi : {formatDate(selectedTournament.startDate)} -{' '}
          {formatDate(selectedTournament.endDate)}.
        </p>
      ) : null}

      <label>
        Équipe 1
        <select
          name="team1Id"
          value={values.team1Id}
          onChange={onFieldChange}
          disabled={disabled || !values.game}
        >
          <option value="">Choisir une équipe</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Équipe 2
        <select
          name="team2Id"
          value={values.team2Id}
          onChange={onFieldChange}
          disabled={disabled || !values.game || !values.team1Id}
        >
          <option value="">Choisir une équipe</option>
          {team2Options.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          name="date"
          type="date"
          value={values.date}
          onChange={onFieldChange}
          disabled={disabled}
          min={selectedTournament?.startDate}
          max={selectedTournament?.endDate}
        />
      </label>

      <label>
        Heure
        <input
          name="time"
          type="time"
          value={values.time}
          onChange={onFieldChange}
          disabled={disabled}
        />
      </label>
    </>
  )
}

export default MatchFormFields
