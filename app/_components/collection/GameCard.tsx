import GameStatus from './GameStatus'
import GameCopy from './GameCopy'
import Image from 'next/image'

interface OwnedGame {
  language: string
  platform: string
}

interface GameCardProps {
  gameDetails: {
    origName: string
    type: string
    status: string
    imgLink: string
    ownedGames: OwnedGame[]
  }
}

export default function GameCard({ gameDetails }: GameCardProps) {
  return (
    <div className="gameCard">
      <div className="squareContainer">
        <Image src={gameDetails.imgLink} alt={`Game cover for ${gameDetails.origName}`} fill={true} objectFit="cover" />
      </div>
      <div className="gameInfo">
        <div className="gameDetails">
          <GameStatus status={gameDetails.status} />
          <GameCopy platform={gameDetails.ownedGames[0].platform} language={gameDetails.ownedGames[0].language} />
        </div>
        <div className="gameTitle">{gameDetails.origName}</div>
      </div>
    </div>
  )
}
