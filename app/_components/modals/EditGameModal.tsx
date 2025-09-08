import { formatDate, isValidLink } from '@/lib/helper'
import { COLLECTION_QUERY_KEY, SINGLE_GAME_QUERY_KEY } from '@/lib/queryKeys'
import {
  TCopyTypes,
  TCurrency,
  TEditGameFormValues,
  TGameDetails,
  TGameLanguages,
  TGamePlatforms,
  TRoute,
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
import TypeDropdown from '../collection/TypeDropdown'

export default function EditGameModal({ gameData }: { gameData: TGameDetails }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isDeletingGame, setIsDeletingGame] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const {
    reset,
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TEditGameFormValues>({
    disabled: isFetching,
    defaultValues: {
      vndb_id: gameData.vndb_id,
      orig_title: gameData.orig_title,
      title: gameData.title,
      type: gameData.type,
      status: gameData.status,
      img_link: gameData.img_link,
      owned_copies: gameData.owned_copies,
      description: gameData.description,
      route_order: gameData.route_order,
      started_date: gameData.started_date ? formatDate(gameData.started_date) : gameData.started_date,
      completed_date: gameData.completed_date ? formatDate(gameData.completed_date) : gameData.completed_date,
      notes: gameData.notes,
      routes: gameData.routes,
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
  const {
    fields: routes,
    append: appendRoute,
    remove: removeRoute,
  } = useFieldArray({
    control,
    name: 'routes',
  })

  function toggleModal(show: boolean) {
    const dialog: HTMLDialogElement | null = document.querySelector('dialog.edit-game-container')

    if (dialog && show) {
      dialog.showModal()
    } else if (dialog && !show) {
      setIsSaving(false)
      reset({
        vndb_id: gameData.vndb_id,
        orig_title: gameData.orig_title,
        title: gameData.title,
        type: gameData.type,
        status: gameData.status,
        img_link: gameData.img_link,
        owned_copies: gameData.owned_copies,
        description: gameData.description,
        route_order: gameData.route_order,
        started_date: gameData.started_date ? formatDate(gameData.started_date) : gameData.started_date,
        completed_date: gameData.completed_date ? formatDate(gameData.completed_date) : gameData.completed_date,
        notes: gameData.notes,
        routes: gameData.routes,
      })
      clearErrors()
      dialog.close()
    }
  }

  const ownedCopiesList = ownedCopies.map((copy, index) => {
    return (
      <div key={copy.id} className="owned-copy-field">
        {index !== 0 && <hr className="mobile-hr" />}
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
            <TypeDropdown type="TGameLanguages" />
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
            <TypeDropdown type="TGamePlatforms" />
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
            <TypeDropdown type="TCopyTypes" />
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
            <TypeDropdown type="TCurrency" />
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

  const refetchFromVNDB = async () => {
    setIsFetching(true)

    try {
      const vndbData = await queryClient.fetchQuery({
        queryKey: ['vndb', gameData.vndb_id],
        queryFn: async () => {
          const res = await fetch('https://api.vndb.org/kana/vn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filters: ['id', '=', gameData.vndb_id],
              fields:
                'title, alttitle, image.url, va.character{name, image.url, vns.role}, va.staff{original, name}, description',
            }),
          })

          return res.json()
        },
        staleTime: 0,
      })

      setValue('vndb_id', vndbData.results[0].id)
      setValue('title', vndbData.results[0].title)
      setValue('orig_title', vndbData.results[0].alttitle ? vndbData.results[0].alttitle : vndbData.results[0].title)
      setValue('img_link', vndbData.results[0].image.url)
      setValue('description', vndbData.results[0].description)
      clearErrors(['vndb_id', 'title', 'orig_title', 'img_link'])

      for (const character of vndbData.results[0].va) {
        const characterObj = character.character
        const staffObj = character.staff

        // Only pull characters with primary roles
        if (characterObj.vns[0].role === 'primary') {
          // Checks if route already exists
          const routes: TRoute[] = getValues('routes') ?? []
          const existingChar = routes.filter(
            (route) => route.vndb_id === characterObj.id || route.name === characterObj.name
          )

          // If route exists
          if (existingChar && existingChar.length > 0) {
            setValue(
              'routes',
              routes.map((route) => {
                if (route.name === characterObj.name || route.vndb_id === characterObj.id) {
                  return {
                    ...route,
                    vndb_id: characterObj.id,
                    type: TRouteTypes.Character,
                    name: characterObj.name,
                    route_img_link: characterObj.image.url,
                    status: TStatuses.Incomplete,
                    voice_actor: {
                      romanized: staffObj.name,
                      orig: staffObj.original ? staffObj.original : staffObj.name,
                    },
                  }
                } else {
                  return route
                }
              })
            )
          } else {
            appendRoute({
              vndb_id: characterObj.id,
              type: TRouteTypes.Character,
              name: characterObj.name,
              route_img_link: characterObj.image.url,
              status: TStatuses.Incomplete,
              voice_actor: {
                romanized: staffObj.name,
                orig: staffObj.original ? staffObj.original : staffObj.name,
              },
            })
          }
        }
      }

      setIsFetching(false)
    } catch (err) {
      setIsFetching(false)
      setError('root', { message: 'There was an error refetching from VNDB.' })
    }
  }

  return (
    <dialog className="edit-game-container">
      <div className="edit-game-modal">
        <div className="edit-game-header">
          <h2>Edit Game Details</h2>
          {gameData.vndb_id && gameData.vndb_id !== '' && (
            <button disabled={isFetching} className="small outlined" onClick={() => refetchFromVNDB()}>
              {!isFetching ? 'Refetch from VNDB' : 'Refetching...'}
              {isFetching && <LuLoaderCircle className="loader" />}
            </button>
          )}
        </div>
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
              <label htmlFor="route_img_link">Notes</label>
              <textarea {...register('notes')}></textarea>
            </div>
            <div className="form-field">
              <label htmlFor="route_order">Recommended Route Order</label>
              <input type="text" key="title" {...register('route_order')} />
            </div>
            <div className="form-field-group">
              <div className="form-field">
                <label htmlFor="edit-game-type">Type*</label>
                <select key="edit-game-type" {...register('type', { required: true })}>
                  <TypeDropdown type="TGameTypes" />
                </select>
                {errors.type?.type === 'required' && <div className="form-error">Please select a route type.</div>}
              </div>
              <div className="form-field">
                <label htmlFor="new-route-status">Status*</label>
                <select key="new-route-status" {...register('status', { required: true })}>
                  <TypeDropdown type="TStatuses" />
                </select>
                {errors?.status?.type === 'required' && <div className="form-error">Please select a route status.</div>}
              </div>
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
            <div className="form-buttons-main">
              <button type="button" autoFocus onClick={() => toggleModal(false)}>
                Cancel
              </button>
              <button className="main">
                <p>{isSaving ? 'Saving...' : 'Save'}</p>
                {isSaving && <LuLoaderCircle className="loader" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
}
