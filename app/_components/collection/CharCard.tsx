import { TRoute } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import GameStatus from './GameStatus'
import { isValidLink } from '@/lib/helper'
import Link from 'next/link'

export default function CharCard({ route }: { route: TRoute }) {
  return (
    <Link key={route._id} href={`/collection/${route.game_id}`} className="route-card">
      <div className="route-img-container">
        <Image
          src={isValidLink(route.route_img_link) ? route.route_img_link : 'https://placehold.co/120x150/png'}
          alt={'Game Image'}
          fill={true}
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 120px) 100vw"
        />
      </div>
      <div className="route-info">
        <div className="route-header">
          <div className="route-header-stats">
            <div className="route-header-main">
              <h2>{route.name}</h2>
              <GameStatus status={route.status} />
              {route.voice_actor?.orig !== '' && (
                <div className="voice-actor">
                  <p>{route.voice_actor?.orig}</p>
                  <p>/</p>
                  <p>{route.voice_actor?.romanized}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
