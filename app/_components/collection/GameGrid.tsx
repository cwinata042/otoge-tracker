import { TOwnedGame } from '@/lib/types'
import GameCard from './GameCard'
import Link from 'next/link'

export default function GameGrid({ collection }: { collection: TOwnedGame[] }) {
  const gameCards = collection.map((game) => {
    return <GameCard gameDetails={game} key={game.orig_title} />
  })

  const emptyCollection = (
    <div className="game-grid-empty">
      <div className="empty-container">
        <div className="empty-container-message">
          <p className="form-info-white big">No games found</p>
          <p className="center">
            Your collection is currently empty.
            <br />
            If you add a game, it will appear here.
          </p>
        </div>
        <Link className="button main outlined small" href="/collection/add">
          Add new game
        </Link>
      </div>
    </div>
  )

  return gameCards.length > 0 ? <div className="gameGrid">{gameCards}</div> : emptyCollection
}
