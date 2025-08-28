export enum TGameTypes {
  'Main' = 'Main',
  'Fandisc' = 'Fandisc',
}

export enum TStatuses {
  'Incomplete' = 'Incomplete',
  'Playing' = 'Playing',
  'Completed' = 'Completed',
  'On Hold' = 'On Hold',
  'Dropped' = 'Dropped',
}

export enum TGameLanguages {
  'EN' = 'EN',
  'JP' = 'JP',
}

export enum TGamePlatforms {
  'Switch' = 'Switch',
  'PS Vita' = 'PS Vita',
  'PC' = 'PC',
}

export type TGameCopy = {
  language: TGameLanguages
  platform: TGamePlatforms
  orig_price?: number | null
  price?: number | null
  price_currency?: TCurrency | null
}

export enum TRouteTypes {
  'Character' = 'Character',
  'Other' = 'Other',
}

export enum TCurrency {
  'USD' = 'USD',
  'JPY' = 'JPY',
}

export type TOwnedGame = {
  vndb_id: string
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string
  owned_copies: [
    {
      language: TGameLanguages
      platform: TGamePlatforms
    }
  ]
  price: number
  price_currency: TCurrency
}
