'use client'

import Link from 'next/link'
import GameGrid from '../_components/collection/GameGrid'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { COLLECTION_QUERY_KEY } from '@/lib/queryKeys'
import { LuLoaderCircle } from 'react-icons/lu'
import Dropdown from '../_components/collection/Dropdown'
import { useState } from 'react'
import { TFilters, TGameLanguages, TGamePlatforms, TOwnedGame, TSort, TStatuses } from '@/lib/types'
import Header from '../_components/Header'
import Sort from '../_components/collection/Sort'
import { RxCross2 } from 'react-icons/rx'

export default function Collection() {
  const { data: session } = useSession()
  const [currFilters, setCurrFilters] = useState<TFilters>({ status: [], platform: [], language: [] })
  const [currSort, setCurrSort] = useState<TSort>({})
  const filters = [
    { name: 'Status', options: Object.keys(TStatuses) },
    { name: 'Platform', options: Object.keys(TGamePlatforms) },
    { name: 'Language', options: Object.keys(TGameLanguages) },
  ]
  const sortOptions = ['Language', 'Last Updated', 'Name', 'Platform', 'Status']
  const filterDropdowns = filters.map((filter) => {
    return (
      <Dropdown
        key={filter.name}
        dropdownName={filter.name}
        dropdownOptions={filter.options}
        allowMulti={true}
        currSelected={currFilters[filter.name.toLowerCase() as keyof TFilters]}
        setSelected={setFilter}
      />
    )
  })

  const {
    status,
    error,
    data: ownedGames,
  } = useQuery({
    queryKey: [COLLECTION_QUERY_KEY],
    queryFn: async () => {
      const res = await fetch(`/api/collection`, {
        headers: {
          UserId: session?.user._id ? session?.user._id : '',
        },
      })
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
  })

  function getCollection() {
    switch (status) {
      case 'pending':
        return (
          <div className="game-grid-empty">
            <div className="loading-page">
              <p className="form-info-white lg">Grabbing your collection...</p>
              <LuLoaderCircle className="loader lg" />
            </div>
          </div>
        )
      case 'error':
        return (
          <div className="game-grid-empty">
            <div className="loading-page">
              <p className="form-info-white lg">There was an error grabbing your collection. Try reloading the page!</p>
            </div>
          </div>
        )
      default:
        return (
          <GameGrid
            hasFilters={ownedGames.length !== displayedGames.length && ownedGames.length > 0}
            collection={displayedGames}
          />
        )
    }
  }

  function setFilter(name: string, newFilters: string[]) {
    setCurrFilters({
      ...currFilters,
      [name]: newFilters,
    })
  }

  const displayedGames = ownedGames
    ?.filter((game: TOwnedGame) => {
      const platform =
        currFilters.platform.length > 0
          ? currFilters.platform.some((platform) =>
              game.owned_copies.map((game) => game.platform.toString()).includes(platform)
            )
          : true
      const status = currFilters.status.length > 0 ? currFilters.status.includes(game.status) : true
      const language =
        currFilters.language.length > 0
          ? currFilters.language.some((lang) =>
              game.owned_copies.map((game) => game.language.toString()).includes(lang)
            )
          : true

      return platform && status && language
    })
    .sort(sortFn)

  function sortFn(a: TOwnedGame, b: TOwnedGame) {
    let aValue: any, bValue: any, type: string
    switch (currSort.name) {
      case 'Language':
        aValue = a.owned_copies[0].language
        bValue = b.owned_copies[0].language
        type = 'alphabetical'
        break
      case 'Last Updated':
        aValue = a.updatedAt
        bValue = b.updatedAt
        type = 'date'
        break
      case 'Name':
        aValue = a.title
        bValue = b.title
        type = 'alphabetical'
        break
      case 'Platform':
        aValue = a.owned_copies[0].platform
        bValue = b.owned_copies[0].platform
        type = 'alphabetical'
        break
      case 'Status':
        aValue = a.status
        bValue = b.status
        type = 'alphabetical'
        break
      default:
        aValue = a.title
        bValue = b.title
        type = 'alphabetical'
    }

    switch (type) {
      case 'date':
        return currSort.isDesc
          ? new Date(bValue).getTime() - new Date(aValue).getTime()
          : new Date(aValue).getTime() - new Date(bValue).getTime()
      case 'alphabetical':
        return currSort.isDesc
          ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
          : bValue.toLowerCase().localeCompare(aValue.toLowerCase())
      default:
        return currSort.isDesc
          ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
          : bValue.toLowerCase().localeCompare(aValue.toLowerCase())
    }
  }

  function hasNoFiltersSort() {
    const status = currFilters.status.length === 0
    const platform = currFilters.platform.length === 0
    const language = currFilters.language.length === 0
    const sort = Object.keys(currSort).length === 0

    return status && platform && language && sort
  }

  return (
    <div className="main-container">
      <Header />
      <div className="body">
        <div className="collection-header-container">
          <div className="collection-header">
            <div className="collection-title">
              <div className="title">{`Collection (${displayedGames?.length ? displayedGames?.length : 0})`}</div>
              {ownedGames?.length > 0 && (
                <Link className="button main outlined small" href="/collection/add">
                  Add new game
                </Link>
              )}
            </div>
            <div className="filter-sort">
              <div className="dropdowns">{filterDropdowns}</div>
              <Sort sortOptions={sortOptions} currSort={currSort} setCurrSort={setCurrSort} />
            </div>
          </div>
          {!hasNoFiltersSort() && (
            <button
              className="small nobg warn nopad"
              onClick={() => {
                setCurrFilters({ status: [], platform: [], language: [] })
                setCurrSort({})
              }}
            >
              Reset
            </button>
          )}
        </div>
        {getCollection()}
      </div>
    </div>
  )
}
