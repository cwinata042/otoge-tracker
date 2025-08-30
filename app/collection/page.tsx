'use client'

import Link from 'next/link'
import Image from 'next/image'
import GameGrid from '../_components/collection/GameGrid'
import { useQuery } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import { COLLECTION_QUERY_KEY } from '@/lib/queryKeys'
import { LuLoaderCircle } from 'react-icons/lu'

export default function Collection() {
  const { data: session } = useSession()

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
          <div className="loading-page">
            <p className="form-info-white lg">Grabbing your collection...</p>
            <LuLoaderCircle className="loader lg" />
          </div>
        )
      case 'error':
        return (
          <div className="loading-page">
            <p className="form-info-white lg">There was an error grabbing your collection. Try reloading the page!</p>
          </div>
        )
      default:
        return <GameGrid collection={ownedGames} />
    }
  }

  return (
    <div className="main-container">
      <div className="header">
        <Link href="/collection">
          <Image className="logo" src="/otoge-tracker-logo.svg" alt="Otoge Tracker logo" width={256} height={256} />
        </Link>
        <div className="user-details">
          <p>{session?.user.email}</p>
          <button className="small" onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </div>
      <div className="body">
        <div className="collection-header">
          <div className="collection-title">
            <div className="title">{`Collection (${ownedGames?.length ? ownedGames?.length : 0})`}</div>
            {ownedGames?.length > 1 && (
              <Link className="button main outlined small" href="/collection/add">
                Add new game
              </Link>
            )}
          </div>
          <div className="filter-sort">filter and sort</div>
        </div>
        {getCollection()}
      </div>
    </div>
  )
}
