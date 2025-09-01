import { TGamePlatforms } from '@/lib/types'
import Image from 'next/image'

export default function PlatformIcon({
  platform,
  width,
  height,
}: {
  platform: TGamePlatforms
  width?: number
  height?: number
}) {
  switch (platform) {
    case TGamePlatforms.Switch:
      return (
        <Image
          src="/switch.svg"
          alt="Switch logo"
          width={width ? `${width}` : '18'}
          height={height ? `${height}` : '18'}
        />
      )
    case TGamePlatforms['PS Vita']:
      return (
        <Image
          src="/ps-vita.svg"
          alt="PS Vita logo"
          width={width ? `${width}` : '30'}
          height={height ? `${height}` : '10'}
        />
      )
    case TGamePlatforms['PC']:
      return <p className="pc-icon">PC</p>
  }
}
