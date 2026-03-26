'use client'

import { useSession } from 'next-auth/react'
import Header from '../_components/Header'
import { CHARACTERS_QUERY_KEY } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { LuLoaderCircle } from 'react-icons/lu'
import { TRoute, TSort } from '@/lib/types'
import { useState } from 'react'
import CharCard from '../_components/collection/CharCard'

export default function Characters() {
  const { data: session } = useSession()
  const [currSort, setCurrSort] = useState<TSort>({ name: 'Total Score', isDesc: true })
  const [currSearch, setCurrSearch] = useState<string>('')

  const sortOptions = ['Total Score', 'Story', 'Personality', 'Romance', 'Appearance']

  // User settings, should be stored somewhere else long term (local browser storage?)

  // Whether the same character with multiple routes should have one score
  const combineMultipleRoutes = true

  const {
    status,
    error,
    data: characters,
  } = useQuery({
    queryKey: [CHARACTERS_QUERY_KEY],
    queryFn: async () => {
      const res = await fetch(`/api/characters`, {
        headers: {
          UserId: session?.user._id ? session?.user._id : '',
        },
      })
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
  })

  const displayedCharacters = characters
    ?.filter((char: TRoute) => {
      const search =
        currSearch !== ''
          ? char.name.toLocaleLowerCase().includes(currSearch.toLocaleLowerCase()) ||
            char.voice_actor?.romanized.toLocaleLowerCase().includes(currSearch.toLocaleLowerCase()) ||
            char.voice_actor?.orig.toLocaleLowerCase().includes(currSearch.toLocaleLowerCase())
          : true

      return search
    })
    .sort(sortFn)

  const uniqueCharacters = getUniqueCharacters()

  function getUniqueCharacters() {
    const uniqueChar = new Set()

    return displayedCharacters?.filter((char: TRoute) => {
      const charName = char.name

      if (uniqueChar.has(charName)) {
        //TODO: Add the game to the char's list of game appearances

        return false
      }
      uniqueChar.add(charName)
      return true
    })
  }

  function sortFn(a: TRoute, b: TRoute) {
    let aValue: number | undefined, bValue: number | undefined

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
        const chars = combineMultipleRoutes ? uniqueCharacters : displayedCharacters
        return chars.map((char: TRoute) => {
          return <CharCard key={char._id} route={char} />
        })
    }
  }

  function handleSearch() {
    const searchText: string = (document.getElementById('character-search') as HTMLInputElement)?.value
    setCurrSearch(searchText)
  }

  const search = document?.getElementsByClassName('search')[0]
  search?.addEventListener('keyup', function (e: any) {
    if (e.key === 'Enter') {
      const searchText: string = (document.getElementById('collection-search') as HTMLInputElement)?.value
      setCurrSearch(searchText)
    }
  })

  return (
    <div className="main-container">
      <Header />
      <div className="body">
        <div className="stats-container">
          <div className="collection-search-container">
            <input id="character-search" className="search" type="search" placeholder="Mozu..."></input>
            <button onClick={() => handleSearch()} className="small">
              Search
            </button>
          </div>
          <div className="single-game-routes characters">{getCharacters()}</div>
        </div>
      </div>
    </div>
  )
}
