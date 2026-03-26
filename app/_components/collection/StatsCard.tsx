import { TRoute } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import GameStatus from './GameStatus'
import { isValidLink } from '@/lib/helper'

export default function RouteCard({ route }: { route: TRoute }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const reviewCategories = route.review?.map((review) => {
    return (
      <div key={`${route._id}-${review.category}`} className={`review ${review.category.toLowerCase()} stats`}>
        <div className="review-stats">
          <p className="review-category">{review.category}</p>
          <div className="review-score">
            <p className="review-total-score">{review.review_score}</p>
            <p className="review-score-details">{`/${review.total_score}`}</p>
          </div>
        </div>
        <p className="review-notes">{review.note}</p>
      </div>
    )
  })

  return (
    <div key={route.name} className="route-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="route-img-container">
        <Image
          src={isValidLink(route.route_img_link) ? route.route_img_link : 'https://placehold.co/120x150/png'}
          alt={'Game Image'}
          fill={true}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="route-info">
        <div className="route-header">
          <div className="route-header-stats">
            <div className="route-header-main">
              <h2>{route.name}</h2>
              <GameStatus status={route.status} />
            </div>
            <div className="total-score">
              <div className="final-score">
                <p className="final-score-title">Total</p>
                <p className="final-score-total">{route.final_score}</p>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div>
            <div className="reviews">{reviewCategories}</div>
          </div>
        )}
      </div>
    </div>
  )
}
