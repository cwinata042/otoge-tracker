'use client'

import Link from 'next/link'
import GameGrid from '../_components/collection/GameGrid'
import { useQuery } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'

export default function Collection() {
  const { data: session } = useSession()
  const {
    status,
    error,
    data: ownedGames,
  } = useQuery({
    queryKey: ['owned-games'],
    queryFn: async () => {
      const res = await fetch('/api/collection')
      return res.json()
    },
  })

  if (status === 'pending') {
    return <div>Loading...</div>
  }

  if (status === 'error') {
    return <div>Failed to fetch owned games.</div>
  }

  return (
    <div className="main-container">
      <div className="header">
        <p>{session?.user?.email}</p>
        <button onClick={() => signOut()}>Log out</button>
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
