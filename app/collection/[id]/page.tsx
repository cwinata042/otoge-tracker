'use client'

import AddRouteModal from '@/app/_components/modals/AddRouteModal'
import EditGameModal from '@/app/_components/modals/EditGameModal'
import GameStatus from '@/app/_components/collection/GameStatus'
import RouteCard from '@/app/_components/collection/RouteCard'
import Header from '@/app/_components/Header'
import LanguageIcon from '@/app/_components/LanguageIcon'
import PlatformIcon from '@/app/_components/PlatformIcon'
import { formatDate, isValidLink } from '@/lib/helper'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { TEditRouteFormValues, TGameDetails, TRouteTypes, TStatuses } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuLoaderCircle } from 'react-icons/lu'

export default function GameViewer() {
  const { data: session } = useSession()
  const params = useParams()

  const [currTab, setCurrTab] = useState<string>('Details')

  const { status, data: gameDetails }: { status: string; error: any | null; data: undefined | TGameDetails } = useQuery(
    {
      queryKey: [SINGLE_GAME_QUERY_KEY, params.id],
      queryFn: async () => {
        const res = await fetch(`/api/collection/${params.id}`, {
          headers: {
            UserId: session?.user._id ? session?.user._id : '',
          },
        })

        if (!res.ok) {
          const response = await res.json()
          throw new Error('Game not found!')
        }

        return await res.json()
      },
      staleTime: 1000 * 60 * 5,
      enabled: !!session,
    }
  )

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
              <p className="form-info-white lg">
                There was an error fetching this game. Try reloading the page or doublechecking that this game exists in
                your collection!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ownedCopies = gameDetails.owned_copies.map((copy) => {
    return (
      <div key={`${copy.platform}-${copy.language}`} className="owned-copy">
        <LanguageIcon language={copy.language} />
        <PlatformIcon platform={copy.platform} />
        <div className="vertical-break"></div>
        <p>{copy.type}</p>
        <div className="vertical-break"></div>
        <p>{`${copy.price} ${copy.price_currency}`}</p>
      </div>
    )
  })

  const routes = gameDetails.routes.map((route) => {
    return <RouteCard key={route._id} route={route} />
  })

  function openAddRouteModal() {
    const dialog: HTMLDialogElement | null = document.querySelector('dialog.add-route-container')

    if (dialog) {
      dialog.showModal()
    }
  }

  function openEditGameModal() {
    const dialog: HTMLDialogElement | null = document.querySelector('dialog.edit-game-container')

    if (dialog) {
      dialog.showModal()
    }
  }

  return (
    <div className="main-container">
      <Header />
      <div className="body">
        <AddRouteModal gameId={gameDetails?._id} />
        <EditGameModal gameData={gameDetails} />
        <div className="single-game-header">
          <div className="header-main">
            <h1>{gameDetails.title}</h1>
            <div className="button-group">
              <button className="small main outlined" onClick={() => openEditGameModal()}>
                Edit
              </button>
            </div>
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
                <Image
                  src={isValidLink(gameDetails.img_link) ? gameDetails.img_link : 'https://placehold.co/300x405/png'}
                  alt={'Game Image'}
                  fill={true}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="single-game-details-main">
                <div className="form-field horizontal">
                  <GameStatus status={gameDetails.status} />
                  <div className={'gameType ' + gameDetails.type}>{gameDetails.type}</div>
                </div>
                <div className="form-field">
                  <p className="form-info-white">Original Title</p>
                  <p className="game-info-field">{gameDetails.orig_title ?? 'No original title'}</p>
                </div>
                <div className="form-field">
                  <p className="form-info-white">Description</p>
                  <p className="game-info-field large">{gameDetails.description}</p>
                </div>
                <div className="form-field">
                  <p className="form-info-white">Notes</p>
                  <p className="game-info-field large">{gameDetails.notes}</p>
                </div>
                <div className="form-field">
                  <p className="form-info-white">Owned Copies</p>
                  <div className="owned-copies">{ownedCopies}</div>
                </div>
                <div className="form-field">
                  <p className="form-info-white">Recommended Route Order</p>
                  <p className="game-info-field">{gameDetails.route_order}</p>
                </div>
                <div className="form-field-group">
                  <div className="form-field">
                    <p className="form-info-white">Started</p>
                    <p className="game-info-field">
                      {gameDetails.started_date ? formatDate(gameDetails.started_date) : ''}
                    </p>
                  </div>
                  <div className="form-field">
                    <p className="form-info-white">Completed</p>
                    <p className="game-info-field">
                      {gameDetails.completed_date ? formatDate(gameDetails.completed_date) : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="single-game-routes-container">
              <div className="single-game-routes">{routes}</div>
              <button type="button" className="add" onClick={() => openAddRouteModal()}>
                Add Route
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
