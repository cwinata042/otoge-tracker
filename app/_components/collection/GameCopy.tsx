import { TGameLanguages, TGamePlatforms } from '@/lib/types'
import Image from 'next/image'

interface GameCopyProps {
  platform: string
  language: string
}

export default function GameCopy({ platform, language }: { platform: TGamePlatforms; language: TGameLanguages }) {
  function getPlatformIcon() {
    switch (platform) {
      case TGamePlatforms.Switch:
        return <Image src="/switch.svg" alt="Switch logo" width="18" height="18" />
      case TGamePlatforms['PS Vita']:
        return <Image src="/ps-vita.svg" alt="PS Vita logo" width="30" height="10" />
    }
  }

  function getLanguageIcon() {
    switch (language) {
      case TGameLanguages.JP:
        return <Image src="/jp.svg" alt="Japanese flag" width="25" height="16" />
      case TGameLanguages.EN:
        return <Image src="/us.svg" alt="US flag" width="25" height="16" />
    }
  }

  return (
    <div className={`gameCopy`}>
      {getPlatformIcon()}
      {getLanguageIcon()}
    </div>
  )
}
