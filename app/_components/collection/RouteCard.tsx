import { TAddReviewFormValues, TEditRouteFormValues, TRoute, TRouteTypes, TStatuses } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import GameStatus from './GameStatus'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { CiEdit } from 'react-icons/ci'
import { LuLoaderCircle } from 'react-icons/lu'
import { formatDate, isValidLink } from '@/lib/helper'

export default function RouteCard({ route }: { route: TRoute }) {
  const { data: session } = useSession()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const categories = [
    { name: 'Story', total: 10 },
    { name: 'Personality', total: 10 },
    { name: 'Romance', total: 5 },
    { name: 'Appearance', total: 10 },
  ]
  const [isDeletingRoute, setIsDeletingRoute] = useState<boolean>(false)
  const [isSavingRoute, setIsSavingRoute] = useState<boolean>(false)

  const queryClient = useQueryClient()

  const {
    reset: resetAddReview,
    register: registerAddReview,
    handleSubmit: handleAddReviewSubmit,
    getValues: getAddReviewValues,
    setError: setAddReviewError,
    clearErrors: clearAddReviewErrors,
    formState: { errors: addReviewErrors },
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

  const {
    reset: resetEditRoute,
    register: registerEditRoute,
    handleSubmit: handleEditRouteSubmit,
    getValues: getEditRouteValues,
    setError: setEditRouteError,
    clearErrors: clearEditRouteErrors,
    formState: { errors: editRouteErrors },
  } = useForm<TEditRouteFormValues>({
    defaultValues: {
      type: route.type,
      name: route.name,
      route_img_link: route.route_img_link,
      status: route.status,
      review: route.review && route.review.length > 0 ? route.review : [],
      started_date: route.started_date ? formatDate(route.started_date) : route.started_date,
      completed_date: route.completed_date ? formatDate(route.completed_date) : route.completed_date,
      notes: route.notes,
    },
  })

  function toggleModal(show: boolean, modal: string) {
    const dialog: HTMLDialogElement | null = document.querySelector(`.${modal}.route-${route._id}`)

    if (dialog && show) {
      resetEditRoute({
        type: route.type,
        name: route.name,
        route_img_link: route.route_img_link,
        status: route.status,
        review: route.review,
        notes: route.notes,
        started_date: route.started_date ? formatDate(route.started_date) : route.started_date,
        completed_date: route.completed_date ? formatDate(route.completed_date) : route.completed_date,
      })
      dialog.showModal()
    } else if (dialog && !show) {
      if (modal === 'add-review-container') {
        resetAddReview()
        clearAddReviewErrors()
      } else {
        resetEditRoute({
          type: route.type,
          name: route.name,
          route_img_link: route.route_img_link,
          status: route.status,
          review: route.review,
          notes: route.notes,
          started_date: route.started_date ? formatDate(route.started_date) : route.started_date,
          completed_date: route.completed_date ? formatDate(route.completed_date) : route.completed_date,
        })
        clearEditRouteErrors()
      }
      dialog.close()
    }
  }
  console.log(route)
  console.log(getEditRouteValues())

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
                {...registerAddReview(`review.${index}.review_score`, {
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
              {...registerAddReview(`review.${index}.note`)}
            />
          </div>
        </div>
        {addReviewErrors?.review && addReviewErrors.review[index]?.review_score && (
          <div className="form-error">{addReviewErrors.review[index].review_score.message}</div>
        )}
        {index !== categories.length - 1 && <hr className="mt" />}
      </div>
    )
  })
  const editRouteReviewCategories =
    route.review &&
    route.review.length > 0 &&
    categories.map((category, index) => {
      return (
        <div
          key={`${route._id}-${category.name.toLowerCase()}`}
          className={`form-category ${category.name.toLowerCase()}`}
        >
          <h4>{category.name}</h4>
          <div className="category-fields">
            <div className="category-score">
              <label htmlFor={`${category.name.toLowerCase()}-score`}>Score*</label>
              <div className="category-score-number">
                <input
                  type="number"
                  step=".1"
                  className={category.name.toLowerCase()}
                  key={`${category.name.toLowerCase()}-score`}
                  {...registerEditRoute(`review.${index}.review_score`, {
                    validate: {
                      checkScore: (score) => {
                        if (score && (score > category.total || score < 0)) {
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
                {...registerEditRoute(`review.${index}.note`)}
              />
            </div>
          </div>
          {editRouteErrors?.review && editRouteErrors.review[index]?.review_score && (
            <div className="form-error">{editRouteErrors.review[index].review_score.message}</div>
          )}
        </div>
      )
    })

  const { mutate: mutateAddReview, status: addRouteStatus } = useMutation({
    mutationFn: async () => {
      clearAddReviewErrors('root')
      const body = getAddReviewValues()
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
      resetEditRoute({
        type: route.type,
        name: route.name,
        route_img_link: route.route_img_link,
        status: route.status,
        review: route.review,
        notes: route.notes,
        started_date: route.started_date ? formatDate(route.started_date) : route.started_date,
        completed_date: route.completed_date ? formatDate(route.completed_date) : route.completed_date,
      })
      toggleModal(false, 'add-review-container')
    },
    onError: (error: any) => {
      setAddReviewError('root', { message: 'Failed to add review. Please try again.' })
    },
  })

  const { mutate: mutateEditRoute, status: editRouteStatus } = useMutation({
    mutationFn: async () => {
      setIsSavingRoute(true)
      const scores: any[] | undefined = getEditRouteValues('review')?.map((review) => review.review_score)

      clearEditRouteErrors('root')
      const body = getEditRouteValues()
      const calcScore = body.review?.map((review) => {
        return {
          ...review,
          score: review.review_score && review.review_score !== 0 ? review.review_score / review.total_score : null,
          review_score: Number(review.review_score),
        }
      })

      const res = await fetch(`/api/collection/${route.game_id}/route/${route._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          route: { ...body, review: scores?.includes('') ? [] : calcScore ?? [] },
          user_id: session?.user?._id ? session?.user?._id : '',
          route_id: route._id,
          game_id: route.game_id,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      setIsSavingRoute(false)
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, route.game_id] })
      toggleModal(false, 'edit-route-container')
    },
    onError: (error: any) => {
      setIsSavingRoute(false)
      setEditRouteError('root', { message: 'Failed to edit route. Please try again.' })
    },
  })

  const onAddReviewSubmit = (data: any) => {
    mutateAddReview()
  }

  const onEditRouteSubmit = (data: any) => {
    mutateEditRoute()
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

  const routeTypeDropdown = Object.values(TRouteTypes).map((route) => {
    return (
      <option key={route.toString().toLowerCase()} value={route.toString()} disabled={route.toString() === ''}>
        {route}
      </option>
    )
  })
  const statusDropdown = Object.values(TStatuses).map((status) => {
    return (
      <option key={status.toString().toLowerCase()} disabled={status.toString() === ''} value={status.toString()}>
        {status}
      </option>
    )
  })

  const { mutate: deleteRoute } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/collection/${route.game_id}/route/${route._id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          user_id: session?.user?._id ? session?.user?._id : '',
          route_id: route._id,
          game_id: route.game_id,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      setIsDeletingRoute(false)
      toggleModal(false, 'edit-route-container')
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, route.game_id] })
    },
    onError: (err) => {
      setIsDeletingRoute(false)
      setEditRouteError('root', { message: 'Failed to delete route. Please try again.' })
    },
  })

  const handleDeleteRoute = async () => {
    setIsDeletingRoute(true)

    deleteRoute()
  }

  return (
    <div key={route.name} className="route-card" onClick={() => setIsExpanded(!isExpanded)}>
      <dialog className={`add-review-container route-${route._id}`} tabIndex={-1}>
        <div className="add-review-modal">
          <h2>Add Review</h2>
          <form className="form-container" onSubmit={handleAddReviewSubmit(onAddReviewSubmit)}>
            <div className="form">
              {
                <>
                  {addReviewCategories}
                  <div className="form-field">
                    <label htmlFor="route_img_link">Other Notes</label>
                    <textarea {...registerAddReview('notes')}></textarea>
                  </div>
                </>
              }
            </div>
            <div className="form-buttons">
              <button type="button" autoFocus onClick={() => toggleModal(false, 'add-review-container')}>
                Cancel
              </button>
              <button className="main">Add</button>
            </div>
          </form>
        </div>
      </dialog>
      <dialog className={`edit-route-container route-${route._id}`} tabIndex={-1}>
        <div className="edit-route-modal">
          <h2>Edit Route</h2>
          <form className="form-container" onSubmit={handleEditRouteSubmit(onEditRouteSubmit)}>
            <h3>Route Details</h3>
            <hr className="mt" />
            <div className="form-fields">
              <div className="form-field-group">
                <div className="form-field">
                  <label htmlFor="type">Type*</label>
                  <select key="type" {...registerEditRoute('type', { required: true })}>
                    {routeTypeDropdown}
                  </select>
                  {editRouteErrors.type?.type === 'required' && (
                    <div className="form-error">Please select a route type.</div>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="status">Status*</label>
                  <select key="status" {...registerEditRoute('status', { required: true })}>
                    {statusDropdown}
                  </select>
                  {editRouteErrors?.status?.type === 'required' && (
                    <div className="form-error">Please select a route status.</div>
                  )}
                </div>
              </div>
              <div className="form-field-group">
                <div className="form-field">
                  <label htmlFor="new-route-type">Started</label>
                  <input key="new-route-name" type="date" {...registerEditRoute('started_date')}></input>
                </div>
                <div className="form-field">
                  <label htmlFor="new-route-type">Completed</label>
                  <input key="new-route-name" type="date" {...registerEditRoute('completed_date')}></input>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="name">
                  {getEditRouteValues('type') === 'Character' ? 'Character Name*' : 'Route Name*'}
                </label>
                <input
                  type="text"
                  {...registerEditRoute('name', {
                    validate: {
                      checkName: (name) => {
                        if (name === '') return 'Please enter a name.'
                      },
                    },
                  })}
                ></input>
                {editRouteErrors?.name && <div className="form-error">{editRouteErrors.name.message}</div>}
              </div>
              <div className="form-field">
                <label htmlFor="route_img_link">Route Image Link</label>
                <input
                  type="text"
                  {...registerEditRoute('route_img_link', {
                    validate: {
                      checkUrl: (url) => {
                        if (url && url !== '' && !isValidLink(url)) {
                          return 'Please enter a valid link.'
                        }
                      },
                    },
                  })}
                ></input>
              </div>
              {route.review && route.review.length > 0 && (
                <div className="form-field">
                  <label htmlFor="route_img_link">Other Notes</label>
                  <textarea {...registerEditRoute('notes')}></textarea>
                </div>
              )}
            </div>
            {route.review && route.review.length > 0 && (
              <>
                <h3>Review</h3>
                <hr className="mt mb" />
                {<div className="form">{editRouteReviewCategories}</div>}
              </>
            )}
            <div className="form-buttons">
              <button
                type="button"
                className="delete-button small nobg warn"
                disabled={isDeletingRoute}
                onClick={() => handleDeleteRoute()}
              >
                <p>{isDeletingRoute ? 'Deleting...' : 'Delete Route'}</p>
                {isDeletingRoute && <LuLoaderCircle className="loader" />}
              </button>
              <button type="button" autoFocus onClick={() => toggleModal(false, 'edit-route-container')}>
                Cancel
              </button>
              <button disabled={isSavingRoute} className="main">
                <p>{isSavingRoute ? 'Saving...' : 'Save'}</p>
                {isSavingRoute && <LuLoaderCircle className="loader" />}
              </button>
            </div>
          </form>
        </div>
      </dialog>
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
          <CiEdit className="edit-button-icon" onClick={() => toggleModal(true, 'edit-route-container')} />
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
              <button onClick={() => toggleModal(true, 'add-review-container')}>Add Review</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
