'use client'

import { useSession } from 'next-auth/react'
import Header from '../_components/Header'
import { STATS_CHARACTERS_QUERY_KEY } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { LuLoaderCircle } from 'react-icons/lu'
import { TRoute, TSort } from '@/lib/types'
import StatsCard from '../_components/collection/StatsCard'
import Sort from '../_components/collection/Sort'
import { useState } from 'react'

export default function Stats() {
  const { data: session } = useSession()
  const [currSort, setCurrSort] = useState<TSort>({ name: 'Total Score', isDesc: true })

  const sortOptions = ['Total Score', 'Story', 'Personality', 'Romance', 'Appearance']

  // User settings, should be stored somewhere else long term (local browser storage?)

  // Whether the same character with multiple routes should have one score
  const combineMultipleRoutes = false

  const {
    status,
    error,
    data: characters,
  } = useQuery({
    queryKey: [STATS_CHARACTERS_QUERY_KEY],
    queryFn: async () => {
      const res = await fetch(`/api/characters`, {
        headers: {
          UserId: session?.user._id ? session?.user._id : '',
          Mode: 'stats',
        },
      })
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
  })

  const displayedCharacters = characters?.sort(sortFn)

  function sortFn(a: TRoute, b: TRoute) {
    let aValue: number | undefined, bValue: number | undefined

    switch (currSort.name) {
      case 'Total Score':
        aValue = a.final_score
        bValue = b.final_score
        break
      case 'Story':
      case 'Personality':
      case 'Romance':
      case 'Appearance':
        aValue = a.review?.filter((review) => review.category === currSort.name)[0].review_score
        bValue = b.review?.filter((review) => review.category === currSort.name)[0].review_score
        break
    }

    if (!aValue || !bValue) {
      return 0
    }

    return currSort.isDesc ? bValue - aValue : aValue - bValue
  }

  function getCharacters() {
    switch (status) {
      case 'pending':
        return (
          <div className="game-grid-empty">
            <div className="loading-page">
              <p className="form-info-white lg">Fetching characters...</p>
              <LuLoaderCircle className="loader lg" />
            </div>
          </div>
        )
      case 'error':
        return (
          <div className="game-grid-empty">
            <div className="loading-page">
              <p className="form-info-white lg">There was an error fetching characters. Try reloading the page!</p>
            </div>
          </div>
        )
      default:
        return displayedCharacters.map((char: TRoute) => {
          return <StatsCard key={char._id} route={char} />
        })
    }
  }

  return (
    <div className="main-container">
      <Header />
      <div className="body">
        <div className="stats-container">
          <div className="filter-sort">
            <Sort sortOptions={sortOptions} currSort={currSort} setCurrSort={setCurrSort} />
          </div>
          <div className="single-game-routes">{getCharacters()}</div>
        </div>
      </div>
    </div>
  )
}
