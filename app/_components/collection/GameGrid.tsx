import GameCard from './GameCard'

export default function GameGrid() {
  const tempCollection = [
    {
      origName: 'BUSTAFELLOWS',
      type: 'Main',
      status: 'Completed',
      imgLink: 'https://t.vndb.org/cv/30/76630.jpg',
      ownedGames: [
        {
          language: 'EN',
          platform: 'Switch',
        },
      ],
    },
    {
      origName: 'Ayakashi Gohan',
      type: 'Main',
      status: 'Incomplete',
      imgLink: 'https://t.vndb.org/cv/54/106754.jpg',
      ownedGames: [
        {
          language: 'JP',
          platform: 'PS Vita',
        },
      ],
    },
    {
      origName: 'Kaeru Batake DE Tsukamaete☆',
      type: 'Main',
      status: 'Completed',
      imgLink: 'https://t.vndb.org/cv/05/97005.jpg',
      ownedGames: [
        {
          language: 'JP',
          platform: 'PS Vita',
        },
      ],
    },
    {
      origName: 'Kaeru Batake DE Tsukamaete: Natsu Chigira Sansen!',
      type: 'Fandisc',
      status: 'Playing',
      imgLink: 'https://t.vndb.org/cv/55/106755.jpg',
      ownedGames: [
        {
          language: 'JP',
          platform: 'PS Vita',
        },
      ],
    },
    {
      origName: 'BAD APPLE WARS',
      type: 'Main',
      status: 'Incomplete',
      imgLink: 'https://t.vndb.org/cv/86/26786.jpg',
      ownedGames: [
        {
          language: 'JP',
          platform: 'PS Vita',
        },
      ],
    },
    {
      origName: 'Ken ga Kimi',
      type: 'Main',
      status: 'Incomplete',
      imgLink: 'https://t.vndb.org/cv/11/85511.jpg',
      ownedGames: [
        {
          language: 'JP',
          platform: 'PS Vita',
        },
      ],
    },
  ]

  const gameCards = tempCollection.map((game) => {
    return <GameCard gameDetails={game} key={game.origName} />
  })

  return <div className="gameGrid">{gameCards}</div>
}
