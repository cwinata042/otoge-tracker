import GameStatus from './GameStatus'
import GameCopy from './GameCopy'
import Image from 'next/image'
import { TOwnedGame } from '@/lib/types'

export default function GameCard({ gameDetails }: { gameDetails: TOwnedGame }) {
  return (
    <div className="gameCard">
      <div className="squareContainer">
        <Image
          src={gameDetails.img_link}
          alt={`Game cover for ${gameDetails.title}`}
          fill={true}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="gameInfo">
        <div className="gameDetails">
          <GameStatus status={gameDetails.status} />
          <GameCopy copies={gameDetails.owned_copies} />
        </div>
        <div className="gameTitle">{gameDetails.title}</div>
      </div>
    </div>
  )
}
