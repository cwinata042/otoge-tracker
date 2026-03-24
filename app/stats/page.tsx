'use client'

import { useSession } from 'next-auth/react'
import Header from '../_components/Header'
import { STATS_CHARACTERS_QUERY_KEY } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { LuLoaderCircle } from 'react-icons/lu'
import { TRoute } from '@/lib/types'
import StatsCard from '../_components/collection/StatsCard'

export default function Stats() {
  const { data: session } = useSession()

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
        return characters.map((char: TRoute) => {
          return <StatsCard key={char._id} route={char} />
        })
    }
  }

  return (
    <div className="main-container">
      <Header />
      <div className="body">
        <div className="single-game-routes">{getCharacters()}</div>
      </div>
    </div>
  )
}
