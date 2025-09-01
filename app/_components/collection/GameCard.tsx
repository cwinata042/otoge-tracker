import GameStatus from './GameStatus'
import GameCopy from './GameCopy'
import Image from 'next/image'
import { TOwnedGame } from '@/lib/types'
import Link from 'next/link'
import { isValidLink } from '@/lib/helper'

export default function GameCard({ gameDetails }: { gameDetails: TOwnedGame }) {
  return (
    <Link href={`/collection/${gameDetails._id}`} className="gameCard">
      <div className="squareContainer">
        <Image
          src={isValidLink(gameDetails.img_link) ? gameDetails.img_link : 'https://placehold.co/114x114/png'}
          alt={`Game cover for ${gameDetails.title}`}
          fill
          sizes="(max-width: 114px) 100vw"
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
    </Link>
  )
}
