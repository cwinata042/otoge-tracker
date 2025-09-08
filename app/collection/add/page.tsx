'use client'

import Image from 'next/image'
import { COLLECTION_QUERY_KEY } from '@/lib/queryKeys'
import {
  TCurrency,
  TGameLanguages,
  TGamePlatforms,
  TStatuses,
  TGameTypes,
  TRouteTypes,
  TAddGameFormValues,
  TCopyTypes,
} from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { LuLoaderCircle } from 'react-icons/lu'
import { FaRegTrashAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Header from '@/app/_components/Header'
import { isValidLink } from '@/lib/helper'
import VNDBSearchModal from '@/app/_components/modals/VNDBSearchModal'

export default function AddToCollection() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [currTab, setCurrTab] = useState<string>('Game Details')

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    watch,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<TAddGameFormValues>({
    defaultValues: {
      orig_title: '',
      title: '',
      img_link: null,
      vndb_search: '',
      vndb_id: null,
      type: TGameTypes.Main,
      status: TStatuses[''],
      owned_copies: [],
      routes: [],
      description: '',
      route_order: '',
      started_date: null,
      completed_date: null,
      notes: '',
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

  const {
    fields: routes,
    append: appendRoute,
    remove: removeRoute,
  } = useFieldArray({
    control,
    name: 'routes',
  })

  const { mutate, status: addCopyStatus } = useMutation({
    mutationFn: async () => {
      clearErrors('root')
      const body = getValues()

      const res = await fetch('/api/collection', {
        method: 'POST',
        body: JSON.stringify({ ...body, user_id: session?.user?._id ? session?.user?._id : '' }),
      })

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION_QUERY_KEY] })
      router.push('/collection')
    },
    onError: (error) => {
      setError('root', { message: 'Failed to add game. Please try again.' })
    },
  })

  const onSubmit = (data: any) => {
    mutate()
  }

  const statusDropdown = Object.values(TStatuses).map((status) => {
    return (
      <option key={status.toString().toLowerCase()} disabled={status.toString() === ''} value={status.toString()}>
        {status}
      </option>
    )
  })
  const typeDropdown = Object.values(TGameTypes).map((type) => {
    return (
      <option key={type.toString().toLowerCase()} value={type.toString()}>
        {type}
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
        {index !== 0 && <hr className="mobile-hr" />}
        <div className="owned-copy-details">
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
        </div>
        <div className="owned-copy-prices">
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
      </div>
    )
  })

  const routesList = routes.map((route, index) => {
    return (
      <div key={route.id} className="owned-copy-field">
        {index !== 0 && <hr className="mobile-hr" />}
        <div className="form-field">
          <label htmlFor={route.id}>Status*</label>
          <select key={route.id} {...register(`routes.${index}.status`, { required: true })}>
            {statusDropdown}
          </select>
          {errors?.routes && errors.routes[index]?.status?.type === 'required' && (
            <div className="form-error">Please select a route status.</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Type*</label>
          <select key={route.id} {...register(`routes.${index}.type`, { required: true })}>
            {routeTypeDropdown}
          </select>
          {errors?.routes && errors.routes[index]?.type?.type === 'required' && (
            <div className="form-error">Please select a route type.</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Character/Route Name*</label>
          <input type="text" key={route.id} {...register(`routes.${index}.name`, { required: true })} />
          {errors?.routes && errors.routes[index]?.name?.type === 'required' && (
            <div className="form-error">Please enter a character/route name.</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Voice Actor (Romanized)</label>
          <input type="text" key={route.id} {...register(`routes.${index}.voice_actor.romanized`)} />
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Voice Actor (Original)</label>
          <input type="text" key={route.id} {...register(`routes.${index}.voice_actor.orig`)} />
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Image Link</label>
          <input type="text" key={route.id} {...register(`routes.${index}.route_img_link`)} />
        </div>
        <FaRegTrashAlt className="trash-icon" onClick={() => removeRoute(index)} />
      </div>
    )
  })

  function openModal() {
    const dialog: HTMLDialogElement | null = document.querySelector('dialog.vndb-import-container')

    if (dialog) {
      dialog.showModal()
    }
  }

  return (
    <div className="main-container">
      <Header />
      <div className="add-game-container">
        <VNDBSearchModal
          type="Game"
          setValue={setValue}
          getValues={getValues}
          dialogName="vndb-import-container"
          clearErrors={clearErrors}
          removeRoute={removeRoute}
          appendRoute={appendRoute}
        />
        <div className="add-game-header">
          <h1>Add New Game</h1>
          <button type="button" className="small main outlined" onClick={() => openModal()}>
            Import from VNDB
          </button>
        </div>
        <div className="add-game-body">
          <div className="tabs">
            <div
              className={`tab ${currTab === 'Game Details' ? 'active' : ''}`}
              onClick={() => setCurrTab('Game Details')}
            >
              Game Details
            </div>
            <div className={`tab ${currTab === 'Routes' ? 'active' : ''}`} onClick={() => setCurrTab('Routes')}>
              Routes
            </div>
          </div>
          <form autoComplete="off" className="add-game-form" onSubmit={handleSubmit(onSubmit)}>
            {currTab === 'Game Details' ? (
              <div className="game-details">
                <div className="game-details-image">
                  {isValidLink(watch('img_link')) && (
                    <Image
                      src={
                        isValidLink(watch('img_link'))
                          ? watch('img_link') ?? 'https://placehold.co/120x150/png'
                          : 'https://placehold.co/120x150/png'
                      }
                      alt={'Game Image'}
                      fill={true}
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="game-details-form">
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
                    <textarea className="large" key="description" {...register('description')} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="notes">Notes</label>
                    <textarea className="large" key="notes" {...register('notes')} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="route_order">Recommended Route Order</label>
                    <input type="text" key="route_order" {...register('route_order')} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="img_link">Link to Cover Image</label>
                    <input
                      type="text"
                      key="img_link"
                      {...register('img_link', {
                        validate: {
                          checkUrl: (url) => {
                            if (!isValidLink(url)) {
                              return 'Please enter a valid link.'
                            }
                          },
                        },
                      })}
                    />
                    {errors.img_link && <div className="form-error">{errors.img_link.message}</div>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="type">Type*</label>
                    <select key="type" {...register('type', { required: true })}>
                      {typeDropdown}
                    </select>
                    {errors.type?.type === 'required' && <div className="form-error">Please select a type.</div>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="status">Status*</label>
                    <div className="custom-select">
                      <select key="status" defaultValue={TStatuses['']} {...register('status', { required: true })}>
                        {statusDropdown}
                      </select>
                    </div>
                    {errors.status?.type === 'required' && <div className="form-error">Please select a status.</div>}
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
                    <p className="label">Owned Copies*</p>
                    <div className="owned-copies-list">
                      {ownedCopiesList}
                      {errors.owned_copies?.root && (
                        <div className="form-error">Please add at least one game copy.</div>
                      )}
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
              </div>
            ) : (
              <>
                <div className="form-field">
                  <div className="routes-list">
                    {routesList}
                    <button
                      className="add"
                      type="button"
                      onClick={() =>
                        appendRoute({ vndb_id: null, name: '', type: '', route_img_link: '', status: TStatuses[''] })
                      }
                    >
                      Add Route
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="add-game-form-buttons">
              <Link className="button outlined" href="/collection">
                Cancel
              </Link>
              {addCopyStatus === 'pending' ? (
                <button className="main disabled" disabled>
                  <p>Adding game...</p>
                  <LuLoaderCircle className="loader" />
                </button>
              ) : (
                <input className="button main" type="submit" value="Add Game" />
              )}
            </div>
            {errors.root && <div className="form-error add-game">Failed to add game. Please try again.</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
