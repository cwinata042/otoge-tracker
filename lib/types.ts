export const CHECK_SESSION_EXP_TIME = 60 * 60

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
  vndb_id: string | null
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
  started_date?: Date | null | string
  completed_date?: Date | null | string
  notes?: string
}

export type TOwnedGame = {
  _id: string
  vndb_id: string | null
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string
  owned_copies: TGameCopy[]
  updatedAt?: Date
  started_date?: Date | null | string
  completed_date?: Date | null | string
  notes?: string
  routes?: TRoute[] | null
}

export type TRoute = {
  vndb_id: string | null
  type: TRouteTypes | string
  name: string
  route_img_link: string
  status: TStatuses
  review?: TCategoryReview[]
  game_id?: string
  _id?: string
  final_score?: number
  notes?: string
  started_date?: Date | null
  completed_date?: Date | null
  voice_actor?: {
    romanized: string
    orig: string
  }
}

export type TAddGameFormValues = {
  vndb_search: string
  vndb_id: string | null
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string | null
  owned_copies: TGameCopy[]
  routes: TRoute[]
  description: string
  route_order: string
  started_date?: Date | null | string
  completed_date?: Date | null | string
  notes?: string
}

export type TAddReviewFormValues = {
  review: TCategoryReview[]
  notes: string
}

export type TEditRouteFormValues = {
  vndb_id?: string | null
  type: TRouteTypes | string
  name: string
  route_img_link: string | null
  status: TStatuses
  review?: TCategoryReview[]
  notes?: string
  started_date?: Date | null | string
  completed_date?: Date | null | string
  voice_actor?: {
    romanized: string
    orig: string
  }
}

export type TEditGameFormValues = {
  orig_title: string
  title: string
  type: TGameTypes
  status: TStatuses
  img_link: string | null
  owned_copies: TGameCopy[]
  description: string
  route_order: string
  started_date?: Date | null | string
  completed_date?: Date | null | string
  notes?: string
  routes?: TRoute[]
  vndb_id?: string | null
}

export type TCategoryReview = {
  category: string
  score: number
  review_score?: number
  total_score: number
  note?: string
}

export type TFilters = {
  status: string[]
  platform: string[]
  language: string[]
}

export type TSort = {
  name?: string
  isDesc?: boolean
}
