import { isValidLink } from '@/lib/helper'
import { SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import { TEditRouteFormValues, TRouteTypes, TStatuses } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuLoaderCircle } from 'react-icons/lu'

export default function AddRouteModal({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [isSaving, setIsSaving] = useState<boolean>(false)

  const {
    reset,
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<TEditRouteFormValues>({
    defaultValues: {
      type: TRouteTypes[''],
      name: '',
      route_img_link: null,
      status: TStatuses[''],
      review: [],
      notes: '',
      started_date: null,
      completed_date: null,
    },
  })
  const onSubmit = (data: any) => {
    mutate()
  }
  const { mutate, status: addRouteStatus } = useMutation({
    mutationFn: async () => {
      setIsSaving(true)
      clearErrors('root')
      const body = getValues()

      const res = await fetch(`/api/collection/${gameId}/route`, {
        method: 'POST',
        body: JSON.stringify({
          route: body,
          user_id: session?.user?._id ? session?.user?._id : '',
          game_id: gameId,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      setIsSaving(false)
      toggleModal(false)
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, gameId] })
    },
    onError: (error: any) => {
      setIsSaving(false)
      setError('root', { message: 'Failed to add route. Please try again.' })
    },
  })

  function toggleModal(show: boolean) {
    const dialog: HTMLDialogElement | null = document.querySelector('dialog.add-route-container')

    if (dialog && show) {
      dialog.showModal()
    } else if (dialog && !show) {
      setIsSaving(false)
      reset()
      clearErrors()
      dialog.close()
    }
  }

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

  return (
    <dialog className="add-route-container">
      <div className="add-route-modal">
        <h2>Add Route</h2>
        <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
          <h3>Route Details</h3>
          <hr className="mt" />
          <div className="form-fields">
            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="new-route-type">Type*</label>
                <select key="new-route-type" {...register('type', { required: true })}>
                  {routeTypeDropdown}
                </select>
                {errors.type?.type === 'required' && <div className="form-error">Please select a route type.</div>}
              </div>
              <div className="form-field">
                <label htmlFor="new-route-status">Status*</label>
                <select key="new-route-status" {...register('status', { required: true })}>
                  {statusDropdown}
                </select>
                {errors?.status?.type === 'required' && <div className="form-error">Please select a route status.</div>}
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="new-route-name">
                {watch('type') === 'Character' ? 'Character Name*' : 'Route Name*'}
              </label>
              <input
                key="new-route-name"
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
            <div className="form-field-group">
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
              <label htmlFor="new-route-route_img_link">Route Image Link</label>
              <input
                key="new-route-route_img_link"
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
          </div>
          <div className="form-buttons">
            <button type="button" autoFocus onClick={() => toggleModal(false)}>
              Cancel
            </button>
            <button className="main">
              <p>{isSaving ? 'Adding...' : 'Add'}</p>
              {isSaving && <LuLoaderCircle className="loader" />}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
