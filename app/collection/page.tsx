'use client'

import Link from 'next/link'
import Image from 'next/image'
import GameGrid from '../_components/collection/GameGrid'
import { useQuery } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import { COLLECTION_QUERY_KEY } from '@/lib/queryKeys'

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

  if (status === 'pending') {
    return <div>Loading...</div>
  }

  if (status === 'error' || error) {
    return <div>Failed to fetch owned games.</div>
  }

  return (
    <div className="main-container">
      <div className="header">
        <Image className="logo" src="/otoge-tracker-logo.svg" alt="Otoge Tracker logo" width={256} height={256} />
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
            <div className="title">Collection (30)</div>
            <Link href="/collection/add">Add new game</Link>
          </div>
          <div className="filter-sort">filter and sort</div>
        </div>
        <GameGrid collection={ownedGames} />
      </div>
    </div>
  )
}
