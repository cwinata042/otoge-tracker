import { TOwnedGame } from '@/lib/types'
import GameCard from './GameCard'

export default function GameGrid({ collection }: { collection: TOwnedGame[] }) {
  const gameCards = collection.map((game) => {
    return <GameCard gameDetails={game} key={game.orig_title} />
  })

  return <div className="gameGrid">{gameCards}</div>
}
