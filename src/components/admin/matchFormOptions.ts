import type { Game } from '../../types/common'

type GameOption = {
  value: Game
  label: string
}

export const gameOptions: GameOption[] = [
  {
    value: 'COUNTER_STRIKE',
    label: 'Counter-Strike 2',
  },
  {
    value: 'LEAGUE_OF_LEGENDS',
    label: 'League of Legends',
  },
  {
    value: 'VALORANT',
    label: 'Valorant',
  },
  {
    value: 'DOTA_2',
    label: 'Dota 2',
  },
]

export function isGame(value: string): value is Game {
  return gameOptions.some((option) => option.value === value)
}

export type MatchFormValues = {
  game: Game | ''
  tournamentId: string
  team1Id: string
  team2Id: string
  date: string
  time: string
}

export function updateMatchFormValues(
  currentValues: MatchFormValues,
  name: string,
  value: string,
): MatchFormValues {
  if (name === 'game') {
    const game: Game | '' = value === '' || isGame(value) ? value : ''

    return {
      ...currentValues,
      game,
      tournamentId: '',
      team1Id: '',
      team2Id: '',
    }
  }

  if (name === 'tournamentId') {
    return { ...currentValues, tournamentId: value }
  }

  if (name === 'team1Id') {
    return {
      ...currentValues,
      team1Id: value,
      team2Id: value === currentValues.team2Id ? '' : currentValues.team2Id,
    }
  }

  if (name === 'team2Id') {
    return { ...currentValues, team2Id: value }
  }

  if (name === 'date') {
    return { ...currentValues, date: value }
  }

  if (name === 'time') {
    return { ...currentValues, time: value }
  }

  return currentValues
}
