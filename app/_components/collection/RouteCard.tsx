import { TAddRouteFormValues, TRoute } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import GameStatus from './GameStatus'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'

export default function RouteCard({ route }: { route: TRoute }) {
  const { data: session } = useSession()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const categories = [
    { name: 'Story', total: 10 },
    { name: 'Personality', total: 10 },
    { name: 'Romance', total: 5 },
    { name: 'Appearance', total: 10 },
  ]

  const queryClient = useQueryClient()

  const {
    reset,
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<TAddRouteFormValues>({
    defaultValues: {
      reviews: categories.map((category) => {
        return {
          category: category.name,
          score: 0,
          total_score: category.total,
        }
      }),
    },
  })

  function toggleModal(show: boolean) {
    const dialog = document.querySelector('dialog')

    if (dialog && show) {
      dialog.showModal()
    } else if (dialog && !show) {
      reset()
      clearErrors()
      dialog.close()
    }
  }

  const categoriesList = categories.map((category, index) => {
    return (
      <div
        key={`${route._id}-${category.name.toLowerCase()}`}
        className={`add-route-category ${category.name.toLowerCase()}`}
      >
        <h3>{category.name}</h3>
        <div className="category-fields">
          <div className="category-score">
            <label htmlFor={`${category.name.toLowerCase()}-score`}>Score*</label>
            <div className="category-score-number">
              <input
                type="number"
                step=".1"
                className={category.name.toLowerCase()}
                key={`${category.name.toLowerCase()}-score`}
                {...register(`reviews.${index}.review_score`, {
                  validate: {
                    checkScore: (score) => {
                      if (!score) {
                        return 'Please enter a score.'
                      }
                      if (score > category.total || score < 0) {
                        return 'Please enter a valid score.'
                      }
                    },
                  },
                })}
              />
              <p>/ {category.total}</p>
            </div>
          </div>
          <div className="category-notes">
            <label htmlFor={`${category.name.toLowerCase()}-notes`}>Notes</label>
            <textarea
              className={category.name.toLowerCase()}
              key={`${category.name.toLowerCase()}-notes`}
              {...register(`reviews.${index}.note`)}
            />
          </div>
        </div>
        {errors?.reviews && errors.reviews[index]?.review_score && (
          <div className="form-error">{errors.reviews[index].review_score.message}</div>
        )}
        {index !== categories.length - 1 && <hr />}
      </div>
    )
  })

  const { mutate, status: addRouteStatus } = useMutation({
    mutationFn: async () => {
      clearErrors('root')
      const body = getValues()
      const calcScore = body.reviews.map((review) => {
        return {
          ...review,
          score: review.review_score && review.review_score !== 0 ? review.review_score / review.total_score : null,
          review_score: Number(review.review_score),
        }
      })

      const res = await fetch(`/api/collection/${route.game_id}/route/${route._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          review: calcScore,
          user_id: session?.user?._id ? session?.user?._id : '',
          route_id: route._id,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      toggleModal(false)
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, route.game_id] })
    },
    onError: (error: any) => {
      setError('root', { message: 'Failed to add route. Please try again.' })
    },
  })

  const onSubmit = (data: any) => {
    mutate()
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
      <dialog className="add-route-container">
        <div className="add-route-modal">
          <h2>Add Review</h2>
          <form className="add-route-form-container" onSubmit={handleSubmit(onSubmit)}>
            <div className="add-route-form">{categoriesList}</div>
            <div className="add-route-buttons">
              <button autoFocus onClick={() => toggleModal(false)}>
                Cancel
              </button>
              <button className="main">Add</button>
            </div>
          </form>
        </div>
      </dialog>
      <div className="route-img-container">
        <Image src={route.route_img_link ?? ''} alt={'Game Image'} fill={true} style={{ objectFit: 'cover' }} />
      </div>
      <div className="route-info">
        <div className="route-header">
          <h2>{route.name}</h2>
          <GameStatus status={route.status} />
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
              <button onClick={() => toggleModal(true)}>Add Review</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
