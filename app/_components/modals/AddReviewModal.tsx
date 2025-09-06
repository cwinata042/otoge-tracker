import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { TAddReviewFormValues, TRoute } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'

export default function AddReviewModal({ route }: { route: TRoute }) {
  const { data: session } = useSession()
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
  } = useForm<TAddReviewFormValues>({
    defaultValues: {
      review: categories.map((category) => {
        return {
          category: category.name,
          score: 0,
          total_score: category.total,
        }
      }),
      notes: route.notes,
    },
  })

  const addReviewCategories = categories.map((category, index) => {
    return (
      <div
        key={`${route._id}-${category.name.toLowerCase()}`}
        className={`form-category ${category.name.toLowerCase()}`}
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
                {...register(`review.${index}.review_score`, {
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
              {...register(`review.${index}.note`)}
            />
          </div>
        </div>
        {errors?.review && errors.review[index]?.review_score && (
          <div className="form-error">{errors.review[index].review_score.message}</div>
        )}
        {index !== categories.length - 1 && <hr className="mt" />}
      </div>
    )
  })

  const { mutate: mutateAddReview, status: addRouteStatus } = useMutation({
    mutationFn: async () => {
      clearErrors('root')
      const body = getValues()
      const calcScore = body.review.map((review) => {
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
          game_id: route.game_id,
          notes: body.notes,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, route.game_id] })
      closeModal()
    },
    onError: (error: any) => {
      setError('root', { message: 'Failed to add review. Please try again.' })
    },
  })

  const onAddReviewSubmit = (data: any) => {
    mutateAddReview()
  }

  function closeModal() {
    const dialog: HTMLDialogElement | null = document.querySelector(`.add-review-container.route-${route._id}`)

    if (dialog) {
      reset()
      clearErrors()

      dialog.close()
    }
  }

  return (
    <dialog className={`add-review-container route-${route._id}`} tabIndex={-1}>
      <div className="add-review-modal">
        <h2>Add Review</h2>
        <form className="form-container" onSubmit={handleSubmit(onAddReviewSubmit)}>
          <div className="form">
            {
              <>
                {addReviewCategories}
                <div className="form-field">
                  <label htmlFor="route_img_link">Other Notes</label>
                  <textarea {...register('notes')}></textarea>
                </div>
              </>
            }
          </div>
          <div className="form-buttons">
            <div className="form-buttons-main">
              <button type="button" autoFocus onClick={() => closeModal()}>
                Cancel
              </button>
              <button className="main">Add</button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
}
