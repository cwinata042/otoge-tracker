'use client'

import GameStatus from '@/app/_components/collection/GameStatus'
import Header from '@/app/_components/Header'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { TGameDetails } from '@/lib/types'
import { QueryObserverRefetchErrorResult, QueryStatus, useQuery, UseQueryResult } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { LuLoaderCircle } from 'react-icons/lu'

export default function GameViewer() {
  const { data: session } = useSession()
  const params = useParams()

  const [currTab, setCurrTab] = useState<string>('Details')

  const {
    status,
    error,
    data: gameDetails,
  }: { status: string; error: any | null; data: undefined | TGameDetails } = useQuery({
    queryKey: [SINGLE_GAME_QUERY_KEY, params.id],
    queryFn: async () => {
      const res = await fetch(`/api/collection/${params.id}`, {
        headers: {
          UserId: session?.user._id ? session?.user._id : '',
        },
      })
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
  })

  console.log(gameDetails)

  if (status === 'pending') {
    return (
      <div className="main-container">
        <Header />
        <div className="body">
          <div className="game-grid-empty">
            <div className="loading-page">
              <p className="form-info-white lg">Grabbing game details...</p>
              <LuLoaderCircle className="loader lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' || !gameDetails) {
    return (
      <div className="main-container">
        <Header />
        <div className="body">
          <div className="game-grid-empty">
            <div className="loading-page">
              <p className="form-info-white lg">There was an error grabbing your collection. Try reloading the page!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <Header />
      <div className="body">
        <div className="single-game-header">
          <div className="header-main">
            <h1>{gameDetails.title}</h1>
            <button className="small main outlined">Edit</button>
          </div>
          <Link href="/collection" className="button small nobg">
            Back
          </Link>
        </div>
        <div className="single-game-main">
          <div className="tabs">
            <div className={`tab ${currTab === 'Details' ? 'active' : ''}`} onClick={() => setCurrTab('Details')}>
              Details
            </div>
            <div className={`tab ${currTab === 'Routes' ? 'active' : ''}`} onClick={() => setCurrTab('Routes')}>
              Routes
            </div>
          </div>
          {currTab === 'Details' ? (
            <div className="single-game-details">
              <div className="single-game-details-image">
                <Image src={gameDetails.img_link} alt={'Game Image'} fill={true} style={{ objectFit: 'cover' }} />
              </div>
              <div className="single-game-details-main">
                <div className="form-field horizontal">
                  <GameStatus status={gameDetails.status} />
                  <div className={'gameType ' + gameDetails.type}>{gameDetails.type}</div>
                </div>
                <div className="form-field"></div>
              </div>
            </div>
          ) : (
            <div className="single-game-details">Routes</div>
          )}
        </div>
      </div>
    </div>
  )
}
