import { formatDate, isValidLink } from '@/lib/helper'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { TEditRouteFormValues, TRoute } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import TypeDropdown from '../collection/TypeDropdown'
import { LuLoaderCircle } from 'react-icons/lu'

export default function EditRouteModal({ route }: { route: TRoute }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [isDeletingRoute, setIsDeletingRoute] = useState<boolean>(false)
  const [isSavingRoute, setIsSavingRoute] = useState<boolean>(false)

  const categories = [
    { name: 'Story', total: 10 },
    { name: 'Personality', total: 10 },
    { name: 'Romance', total: 5 },
    { name: 'Appearance', total: 10 },
  ]

  const {
    reset,
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
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
      voice_actor: route.voice_actor,
    },
  })

  const { mutate } = useMutation({
    mutationFn: async () => {
      setIsSavingRoute(true)
      const scores: any[] | undefined = getValues('review')?.map((review) => review.review_score)

      clearErrors('root')
      const body = getValues()
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
      closeModal()
    },
    onError: (error: any) => {
      setIsSavingRoute(false)
      setError('root', { message: 'Failed to edit route. Please try again.' })
    },
  })

  function closeModal() {
    const dialog: HTMLDialogElement | null = document.querySelector(`.edit-route-container.route-${route._id}`)

    if (dialog) {
      reset({
        type: route.type,
        name: route.name,
        route_img_link: route.route_img_link,
        status: route.status,
        review: route.review,
        notes: route.notes,
        started_date: route.started_date ? formatDate(route.started_date) : route.started_date,
        completed_date: route.completed_date ? formatDate(route.completed_date) : route.completed_date,
        voice_actor: route.voice_actor,
      })
      clearErrors()
      dialog.close()
    }
  }

  const onSubmit = (data: any) => {
    mutate()
  }

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
      closeModal()
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, route.game_id] })
    },
    onError: (err) => {
      setIsDeletingRoute(false)
      setError('root', { message: 'Failed to delete route. Please try again.' })
    },
  })

  const handleDeleteRoute = async () => {
    setIsDeletingRoute(true)

    deleteRoute()
  }

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
                  {...register(`review.${index}.review_score`, {
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
                {...register(`review.${index}.note`)}
              />
            </div>
          </div>
          {errors?.review && errors.review[index]?.review_score && (
            <div className="form-error">{errors.review[index].review_score.message}</div>
          )}
        </div>
      )
    })

  return (
    <dialog className={`edit-route-container route-${route._id}`} tabIndex={-1}>
      <div className="edit-route-modal">
        <h2>Edit Route</h2>
        <form autoComplete="off" className="form-container" onSubmit={handleSubmit(onSubmit)}>
          <h3>Route Details</h3>
          <hr className="mt" />
          <div className="form-fields">
            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="type">Type*</label>
                <select key="type" {...register('type', { required: true })}>
                  <TypeDropdown type="TRouteTypes" />
                </select>
                {errors.type?.type === 'required' && <div className="form-error">Please select a route type.</div>}
              </div>
              <div className="form-field">
                <label htmlFor="status">Status*</label>
                <select key="status" {...register('status', { required: true })}>
                  <TypeDropdown type="TStatuses" />
                </select>
                {errors?.status?.type === 'required' && <div className="form-error">Please select a route status.</div>}
              </div>
            </div>
            <div className="form-field-group breakable">
              <div className="form-field">
                <label htmlFor="new-route-type">Started</label>
                <input key="new-route-name" type="date" {...register('started_date')}></input>
              </div>
              <div className="form-field">
                <label htmlFor="new-route-type">Completed</label>
                <input key="new-route-name" type="date" {...register('completed_date')}></input>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="name">{getValues('type') === 'Character' ? 'Character Name*' : 'Route Name*'}</label>
              <input
                type="text"
                {...register('name', {
                  validate: {
                    checkName: (name) => {
                      if (name === '') return 'Please enter a name.'
                    },
                  },
                })}
              ></input>
              {errors?.name && <div className="form-error">{errors.name.message}</div>}
            </div>
            <div className="form-field-group breakable">
              <div className="form-field">
                <label htmlFor="new-route-va_romanized">Voice Actor (Romanized)</label>
                <input key="new-route-va_romanized" type="text" {...register('voice_actor.romanized')}></input>
              </div>
              <div className="form-field">
                <label htmlFor="new-route-va_orig">Voice Actor (Original)</label>
                <input key="new-route-va_orig" type="text" {...register('voice_actor.orig')}></input>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="route_img_link">Route Image Link</label>
              <input
                type="text"
                {...register('route_img_link', {
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
                <textarea {...register('notes')}></textarea>
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
            <div className="form-buttons-main">
              <button type="button" autoFocus onClick={() => closeModal()}>
                Cancel
              </button>
              <button disabled={isSavingRoute} className="main">
                <p>{isSavingRoute ? 'Saving...' : 'Save'}</p>
                {isSavingRoute && <LuLoaderCircle className="loader" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
}
