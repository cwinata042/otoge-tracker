import Image from 'next/image'

interface GameCopyProps {
  platform: string
  language: string
}

export default function GameCopy({ platform, language }: GameCopyProps) {
  function getPlatformIcon() {
    switch (platform) {
      case 'Switch':
        return <Image src="/switch.svg" alt="Switch logo" width="18" height="18" />
      case 'PS Vita':
        return <Image src="/ps-vita.svg" alt="PS Vita logo" width="30" height="10" />
    }
  }

  function getLanguageIcon() {
    switch (language) {
      case 'JP':
        return <Image src="/jp.svg" alt="Japanese flag" width="25" height="16" />
      case 'EN':
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
