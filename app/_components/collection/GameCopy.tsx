import { TGameCopy, TGameLanguages, TGamePlatforms } from '@/lib/types'
import PlatformIcon from '../PlatformIcon'
import LanguageIcon from '../LanguageIcon'

export default function GameCopy({ copies }: { copies: TGameCopy[] }) {
  function getMoreCopies() {
    if (copies.length > 1) {
      return (
        <div className="copies">
          <p>+{copies.length - 1}</p>
          <span className="copies-tooltip">
            {copies.slice(1).map((copy, index) => {
              return (
                <div key={`copy-${index}`} className="gameCopy">
                  <PlatformIcon platform={copy.platform} />
                  <LanguageIcon language={copy.language} />
                </div>
              )
            })}
          </span>
        </div>
      )
    }
  }

  return (
    <div className={`gameCopy`}>
      <PlatformIcon platform={copies[0].platform} />
      <LanguageIcon language={copies[0].language} />
      {getMoreCopies()}
    </div>
  )
}
