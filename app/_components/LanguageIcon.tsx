import { TGameLanguages } from '@/lib/types'
import Image from 'next/image'

export default function LanguageIcon({
  language,
  width,
  height,
}: {
  language: TGameLanguages
  width?: number
  height?: number
}) {
  switch (language) {
    case TGameLanguages.JP:
      return (
        <Image
          src="/jp.svg"
          alt="Japanese flag"
          width={width ? `${width}` : '25'}
          height={height ? `${height}` : '16'}
        />
      )
    case TGameLanguages.EN:
      return (
        <Image src="/us.svg" alt="US flag" width={width ? `${width}` : '25'} height={height ? `${height}` : '16'} />
      )
  }
}
