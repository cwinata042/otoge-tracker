import { TAddReviewFormValues, TRoute } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import GameStatus from './GameStatus'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { CiEdit } from 'react-icons/ci'
import { isValidLink } from '@/lib/helper'
import EditRouteModal from '../modals/EditRouteModal'
import AddReviewModal from '../modals/AddReviewModal'

export default function RouteCard({ route }: { route: TRoute }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  function openModal(modal: string) {
    const dialog: HTMLDialogElement | null = document.querySelector(`.${modal}.route-${route._id}`)

    if (dialog) {
      dialog.showModal()
    }
  }

  const reviewCategories = route.review?.map((review) => {
    return (
      <div key={`${route._id}-${review.category}`} className={`review ${review.category.toLowerCase()}`}>
        <p className="review-category">{review.category}</p>
        <div className="review-score">
          <p className="review-total-score">{review.review_score}</p>
          <p className="review-score-details">{`/${review.total_score}`}</p>
        </div>
      </div>
    )
  })

  return (
    <div key={route.name} className="route-card" onClick={() => setIsExpanded(!isExpanded)}>
      <AddReviewModal route={route} />
      <EditRouteModal route={route} />
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
          <div className="route-header-main">
            <h2>{route.name}</h2>
            <GameStatus status={route.status} />
          </div>
          <CiEdit className="edit-button-icon" onClick={() => openModal('edit-route-container')} />
        </div>
        <div className="review-container">
          <div className="reviews">
            {route.review && route.review.length > 0 ? reviewCategories : <div>No review found</div>}
          </div>
          <div className="total-score">
            {route.review && route.review.length > 0 ? (
              <div className="final-score">
                <p className="final-score-title">Total</p>
                <p className="final-score-total">{route.final_score}</p>
              </div>
            ) : (
              <button onClick={() => openModal('add-review-container')}>Add Review</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
