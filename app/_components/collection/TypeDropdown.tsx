import { TCopyTypes, TCurrency, TGameLanguages, TGamePlatforms, TGameTypes, TRouteTypes, TStatuses } from '@/lib/types'

export default function TypeDropdown({ type }: { type: string }) {
  let enumType
  switch (type) {
    case 'TRouteTypes':
      enumType = TRouteTypes
      break
    case 'TStatuses':
      enumType = TStatuses
      break
    case 'TGameTypes':
      enumType = TGameTypes
      break
    case 'TGameLanguages':
      enumType = TGameLanguages
      break
    case 'TGamePlatforms':
      enumType = TGamePlatforms
      break
    case 'TCurrency':
      enumType = TCurrency
      break
    case 'TCopyTypes':
      enumType = TCopyTypes
      break
    default:
      enumType = TStatuses
      break
  }

  const dropdown = Object.values(enumType).map((route) => {
    return (
      <option key={route.toString().toLowerCase()} value={route.toString()} disabled={route.toString() === ''}>
        {route}
      </option>
    )
  })

  return dropdown
}
