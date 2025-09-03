import { isValidLink } from '@/lib/helper'
import { COLLECTION_QUERY_KEY, SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import {
  TCopyTypes,
  TCurrency,
  TEditGameFormValues,
  TGameDetails,
  TGameLanguages,
  TGamePlatforms,
  TGameTypes,
  TRouteTypes,
  TStatuses,
} from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { FaRegTrashAlt } from 'react-icons/fa'
import { LuLoaderCircle } from 'react-icons/lu'

export default function AddRouteModal({ gameData }: { gameData: TGameDetails }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isDeletingGame, setIsDeletingGame] = useState<boolean>(false)

  const {
    reset,
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm<TEditGameFormValues>({
    defaultValues: {
      orig_title: gameData.orig_title,
      title: gameData.title,
      type: gameData.type,
      status: gameData.status,
      img_link: gameData.img_link,
      owned_copies: gameData.owned_copies,
      description: gameData.description,
      route_order: gameData.route_order,
    },
  })
  const {
    fields: ownedCopies,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'owned_copies',
    rules: {
      required: true,
    },
  })
  const onSubmit = (data: any) => {
    editGameMutation()
  }
  const { mutate: editGameMutation, status: addRouteStatus } = useMutation({
    mutationFn: async () => {
      setIsSaving(true)
      clearErrors('root')
      const body = getValues()

      const res = await fetch(`/api/collection/${gameData._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          game: body,
          user_id: session?.user?._id ? session?.user?._id : '',
          game_id: gameData._id,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      setIsSaving(false)
      toggleModal(false)
      queryClient.invalidateQueries({ queryKey: [SINGLE_GAME_QUERY_KEY, gameData._id] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION_QUERY_KEY] })
    },
    onError: (error: any) => {
      setIsSaving(false)
      setError('root', { message: 'Failed to edit game. Please try again.' })
    },
  })
  const { mutate: deleteGame } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/collection/${gameData._id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          user_id: session?.user?._id ? session?.user?._id : '',
          game_id: gameData._id,
        }),
      })

      return res.json()
    },
    onSuccess: () => {
      setIsDeletingGame(false)
      queryClient.invalidateQueries({ queryKey: [COLLECTION_QUERY_KEY] })
      // Navigate to collection page
      router.replace('/collection')
    },
    onError: (err) => {
      setIsDeletingGame(false)
      setError('root', { message: 'Failed to delete game. Please try again.' })
    },
  })

  function toggleModal(show: boolean) {
    const dialog: HTMLDialogElement | null = document.querySelector('dialog.edit-game-container')

    if (dialog && show) {
      dialog.showModal()
    } else if (dialog && !show) {
      setIsSaving(false)
      reset()
      clearErrors()
      dialog.close()
    }
  }

  const gameTypeDropdown = Object.values(TGameTypes).map((game) => {
    return (
      <option key={game.toString().toLowerCase()} value={game.toString()} disabled={game.toString() === ''}>
        {game}
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
  const langDropdown = Object.values(TGameLanguages).map((lang) => {
    return (
      <option key={lang.toString().toLowerCase()} disabled={lang.toString() === ''} value={lang.toString()}>
        {lang}
      </option>
    )
  })
  const platDropdown = Object.values(TGamePlatforms).map((plat) => {
    return (
      <option key={plat.toString().toLowerCase()} disabled={plat.toString() === ''} value={plat.toString()}>
        {plat}
      </option>
    )
  })
  const currDropdown = Object.values(TCurrency).map((curr) => {
    return (
      <option key={curr.toString().toLowerCase()} value={curr.toString()}>
        {curr}
      </option>
    )
  })
  const routeTypeDropdown = Object.values(TRouteTypes).map((route) => {
    return (
      <option key={route.toString().toLowerCase()} value={route.toString()} disabled={route.toString() === ''}>
        {route}
      </option>
    )
  })
  const copyTypeDropdown = Object.values(TCopyTypes).map((type) => {
    return (
      <option key={type.toString().toLowerCase()} value={type.toString()} disabled={type.toString() === ''}>
        {type}
      </option>
    )
  })

  const ownedCopiesList = ownedCopies.map((copy, index) => {
    return (
      <div key={copy.id} className="owned-copy-field">
        <div className="form-field">
          <label htmlFor={copy.id}>Language*</label>
          <select
            key={copy.id}
            {...register(`owned_copies.${index}.language`, {
              validate: {
                checkLang: (lang) => {
                  if (lang === TGameLanguages['']) {
                    return 'Please select a language.'
                  }
                },
              },
            })}
          >
            {langDropdown}
          </select>
          {errors?.owned_copies && errors.owned_copies[index]?.language && (
            <div className="form-error">{errors.owned_copies[index]?.language.message}</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Platform*</label>
          <select
            key={copy.id}
            {...register(`owned_copies.${index}.platform`, {
              validate: {
                checkPlatform: (platform) => {
                  if (platform === TGamePlatforms['']) {
                    return 'Please select a platform.'
                  }
                },
              },
            })}
          >
            {platDropdown}
          </select>
          {errors?.owned_copies && errors.owned_copies[index]?.platform && (
            <div className="form-error">{errors.owned_copies[index]?.platform.message}</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Type*</label>
          <select
            key={copy.id}
            {...register(`owned_copies.${index}.type`, {
              validate: {
                checkType: (type) => {
                  if (type === '') {
                    return 'Please select a type.'
                  }
                },
              },
            })}
          >
            {copyTypeDropdown}
          </select>
          {errors?.owned_copies && errors.owned_copies[index]?.type && (
            <div className="form-error">{errors.owned_copies[index]?.type.message}</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Original Price</label>
          <input key={copy.id} type="number" min={0} step=".01" {...register(`owned_copies.${index}.orig_price`)} />
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Price</label>
          <input key={copy.id} type="number" min={0} step=".01" {...register(`owned_copies.${index}.price`)} />
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Currency</label>
          <select
            key={copy.id}
            {...register(`owned_copies.${index}.price_currency`, {
              validate: {
                checkCurrency: (currency: TCurrency | string) => {
                  if (getValues(`owned_copies.${index}.price`) && (currency === '' || !currency)) {
                    return 'Please enter a currency.'
                  }
                },
              },
            })}
          >
            {currDropdown}
          </select>
          {errors?.owned_copies && errors.owned_copies[index]?.price_currency && (
            <div className="form-error">Please select a currency.</div>
          )}
        </div>
        <FaRegTrashAlt className="trash-icon" onClick={() => remove(index)} />
      </div>
    )
  })

  const handleDeleteGame = async () => {
    setIsDeletingGame(true)

    deleteGame()
  }

  return (
    <dialog className="edit-game-container">
      <div className="edit-game-modal">
        <h2>Edit Game Details</h2>
        <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
          <h3>Game Details</h3>
          <hr className="mt" />
          <div className="form-fields">
            <div className="form-field">
              <label htmlFor="title">Title*</label>
              <input
                type="text"
                key="title"
                {...register('title', {
                  required: true,
                })}
              />
              {errors.title?.type === 'required' && <div className="form-error">Please enter the title.</div>}
            </div>
            <div className="form-field">
              <label htmlFor="orig_title">Original Title*</label>
              <input
                type="text"
                key="orig_title"
                {...register('orig_title', {
                  required: true,
                })}
              />
              {errors.orig_title?.type === 'required' && (
                <div className="form-error">Please enter the original title.</div>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea className="large" key="title" {...register('description')} />
            </div>
            <div className="form-field">
              <label htmlFor="route_order">Recommended Route Order</label>
              <input type="text" key="title" {...register('route_order')} />
            </div>
            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="edit-game-type">Type*</label>
                <select key="edit-game-type" {...register('type', { required: true })}>
                  {gameTypeDropdown}
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
              <label htmlFor="edit-game-img_link">Game Image Link</label>
              <input
                key="edit-game-img_link"
                type="text"
                {...register('img_link', {
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
            <div className="form-field">
              <p className="label">Owned Copies*</p>
              <div className="owned-copies-list">
                {ownedCopiesList}
                {errors.owned_copies?.root && <div className="form-error">Please add at least one game copy.</div>}
                <button
                  className="add"
                  type="button"
                  onClick={() =>
                    append({
                      language: TGameLanguages[''],
                      platform: TGamePlatforms[''],
                      orig_price: null,
                      price: null,
                      price_currency: '',
                      type: TCopyTypes[''],
                    })
                  }
                >
                  Add Copy
                </button>
              </div>
            </div>
          </div>
          <div className="form-buttons">
            <button
              type="button"
              className="delete-button small nobg warn"
              disabled={isDeletingGame}
              onClick={() => handleDeleteGame()}
            >
              <p>{isDeletingGame ? 'Deleting...' : 'Delete Game'}</p>
              {isDeletingGame && <LuLoaderCircle className="loader" />}
            </button>
            <button type="button" autoFocus onClick={() => toggleModal(false)}>
              Cancel
            </button>
            <button className="main">
              <p>{isSaving ? 'Saving...' : 'Save'}</p>
              {isSaving && <LuLoaderCircle className="loader" />}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
