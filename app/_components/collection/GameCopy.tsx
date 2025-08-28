import { TGameCopy, TGameLanguages, TGamePlatforms } from '@/lib/types'
import Image from 'next/image'

export default function GameCopy({ copies }: { copies: TGameCopy[] }) {
  function getPlatformIcon(platform: TGamePlatforms) {
    switch (platform) {
      case TGamePlatforms.Switch:
        return <Image src="/switch.svg" alt="Switch logo" width="18" height="18" />
      case TGamePlatforms['PS Vita']:
        return <Image src="/ps-vita.svg" alt="PS Vita logo" width="30" height="10" />
    }
  }

  function getLanguageIcon(language: TGameLanguages) {
    switch (language) {
      case TGameLanguages.JP:
        return <Image src="/jp.svg" alt="Japanese flag" width="25" height="16" />
      case TGameLanguages.EN:
        return <Image src="/us.svg" alt="US flag" width="25" height="16" />
    }
  }

  function getMoreCopies() {
    if (copies.length > 1) {
      return (
        <div className="copies">
          <p>+{copies.length - 1}</p>
          <span className="copies-tooltip">
            {copies.slice(1).map((copy, index) => {
              return (
                <div key={`copy-${index}`} className="gameCopy">
                  {getPlatformIcon(copy.platform)}
                  {getLanguageIcon(copy.language)}
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
      {getPlatformIcon(copies[0].platform)}
      {getLanguageIcon(copies[0].language)}
      {getMoreCopies()}
    </div>
  )
}
