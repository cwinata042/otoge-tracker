export enum TGameTypes {
  'Main' = 'Main',
  'Fandisc' = 'Fandisc',
}

export enum TStatuses {
  '' = '',
  'Incomplete' = 'Incomplete',
  'Playing' = 'Playing',
  'Completed' = 'Completed',
  'On Hold' = 'On Hold',
  'Dropped' = 'Dropped',
}

export enum TGameLanguages {
  '' = '',
  'EN' = 'EN',
  'JP' = 'JP',
}

export enum TGamePlatforms {
  '' = '',
  'Switch' = 'Switch',
  'PC' = 'PC',
  'PS Vita' = 'PS Vita',
}

export enum TCopyTypes {
  '' = '',
  'Digital' = 'Digital',
  'Physical' = 'Physical',
}

export type TGameCopy = {
  language: TGameLanguages
  platform: TGamePlatforms
  orig_price?: number | null
  price?: number | null
  price_currency: TCurrency | string
  type: TCopyTypes
}

export enum TRouteTypes {
  '' = '',
  'Character' = 'Character',
  'Other' = 'Other',
}

export enum TCurrency {
  'USD' = 'USD',
  'JPY' = 'JPY',
}

export type TGameDetails = {
  _id: string
  vndb_id: string
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string
  owned_copies: TGameCopy[]
  price: number
  price_currency: TCurrency
  routes: TRoute[]
  description?: string
  route_order?: string
}

export type TOwnedGame = {
  _id: string
  vndb_id: string
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string
  owned_copies: TGameCopy[]
  price: number
  price_currency: TCurrency
}

export type TRoute = {
  type: TRouteTypes | string
  name: string
  route_img_link: string
  status: TStatuses
  review?: TCategoryReview[]
  game_id?: string
  _id?: string
  final_score?: number
}

export type TAddGameFormValues = {
  vndb_search: string
  vndb_id: string
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string | null
  owned_copies: TGameCopy[]
  routes: TRoute[]
  price: number
  price_currency: TCurrency
  description: string
  route_order: string
}

export type TAddReviewFormValues = {
  review: TCategoryReview[]
}

export type TEditRouteFormValues = {
  type: TRouteTypes | string
  name: string
  route_img_link: string | null
  status: TStatuses
  review?: TCategoryReview[]
}

export type TCategoryReview = {
  category: string
  score: number
  review_score?: number
  total_score: number
  note?: string
}
