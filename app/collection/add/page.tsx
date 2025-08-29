'use client'

import { COLLECTION_QUERY_KEY } from '@/lib/queryKeys'
import {
  TCurrency,
  TGameLanguages,
  TGamePlatforms,
  TStatuses,
  TGameTypes,
  TRouteTypes,
  TAddGameFormValues,
} from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

export default function AddToCollection() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [currTab, setCurrTab] = useState<string>('Game Details')
  const [vndbImportType, setVNDBImportType] = useState<string>('VNDB Link')

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<TAddGameFormValues>({
    defaultValues: {
      orig_title: '',
      title: '',
      img_link: '',
      vndb_link: '',
      vndb_id: '',
      type: TGameTypes.Main,
      status: TStatuses.Incomplete,
      owned_copies: [],
      routes: [],
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

  const { refetch: refetchVNDB } = useQuery({
    queryKey: ['vndb', getValues('vndb_link').split('/').pop()],
    queryFn: async () => {
      const res = await fetch('https://api.vndb.org/kana/vn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: ['id', '=', getValues('vndb_link').split('/').pop()],
          fields: 'title, alttitle, image.url, va.character{name, image.url, vns.role}',
        }),
      })

      return res.json()
    },
    enabled: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { mutate } = useMutation({
    mutationFn: async () => {
      const body = getValues()

      const res = await fetch('/api/collection', {
        method: 'POST',
        body: JSON.stringify({ ...body, user_id: session?.user?._id ? session?.user?._id : '' }),
      })

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION_QUERY_KEY] })
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const onSubmit = (data: any) => {
    mutate()
  }

  const statusDropdown = Object.values(TStatuses).map((status) => {
    return (
      <option key={status.toString().toLowerCase()} value={status.toString()}>
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
      <option key={lang.toString().toLowerCase()} value={lang.toString()}>
        {lang}
      </option>
    )
  })
  const platDropdown = Object.values(TGamePlatforms).map((plat) => {
    return (
      <option key={plat.toString().toLowerCase()} value={plat.toString()}>
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
      <option key={route.toString().toLowerCase()} value={route.toString()}>
        {route}
      </option>
    )
  })

  const ownedCopiesList = ownedCopies.map((copy, index) => {
    return (
      <div key={copy.id} className="owned-copy-field">
        <div className="form-field">
          <label htmlFor={copy.id}>Language*</label>
          <select key={copy.id} {...(register(`owned_copies.${index}.language`), { required: true })}>
            {langDropdown}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Platform*</label>
          <select key={copy.id} {...(register(`owned_copies.${index}.platform`), { required: true })}>
            {platDropdown}
          </select>
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
        <button className="remove-copy-button" type="button" onClick={() => remove(index)}>
          Remove
        </button>
      </div>
    )
  })

  const routesList = routes.map((route, index) => {
    return (
      <div key={route.id} className="owned-copy-field">
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
          <input key={route.id} {...register(`routes.${index}.name`, { required: true })} />
          {errors?.routes && errors.routes[index]?.name?.type === 'required' && (
            <div className="form-error">Please enter a character/route name.</div>
          )}
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Image Link</label>
          <input key={route.id} {...register(`routes.${index}.route_img_link`)} />
        </div>
        <div className="form-field">
          <label htmlFor={route.id}>Status*</label>
          <select key={route.id} {...register(`routes.${index}.status`, { required: true })}>
            {statusDropdown}
          </select>
          {errors?.routes && errors.routes[index]?.status?.type === 'required' && (
            <div className="form-error">Please select a route status.</div>
          )}
        </div>
        <button className="remove-route-button" type="button" onClick={() => removeRoute(index)}>
          Remove
        </button>
      </div>
    )
  })

  function toggleModal(show: boolean) {
    const dialog = document.querySelector('dialog')

    if (dialog && show) {
      dialog.showModal()
    } else if (dialog && !show) {
      setValue('vndb_link', '')
      dialog.close()
    }
  }

  async function fetchVNDBData() {
    const vndbId = getValues('vndb_link').split('/').pop()
    const vndbIdFormat = /^[v]\d+$/
    if (vndbId && vndbIdFormat.test(vndbId)) {
      const res = await refetchVNDB()
      const vndbData = res.data

      if (vndbData && vndbData.results.length === 1) {
        setValue('vndb_id', vndbData.results[0].id)
        setValue('title', vndbData.results[0].title)
        setValue('orig_title', vndbData.results[0].alttitle)
        setValue('img_link', vndbData.results[0].image.url)
        removeRoute()

        for (const character of vndbData.results[0].va) {
          const characterObj = character.character
          // Only pull characters with primary roles
          if (characterObj.vns[0].role === 'primary') {
            appendRoute({
              type: TRouteTypes.Character,
              name: characterObj.name,
              route_img_link: characterObj.image.url,
              status: TStatuses.Incomplete,
            })
          }
        }

        toggleModal(false)
      }
    }
  }

  return (
    <div className="main-container">
      <div className="header">
        Cool header here
        <Link href="/collection">Back</Link>
      </div>
      <dialog className="vndb-import-container">
        <div className="vndb-import-modal">
          <div className="vndb-main">
            <h2>Import from VNDB</h2>
            <div className="vndb-search">
              <p>Search by</p>
              <div className="vndb-search-options">
                <div className="vndb-search-option">
                  <input
                    name="vndb-search-by"
                    type="radio"
                    id="vndb-link"
                    value="VNDB Link"
                    checked={vndbImportType === 'VNDB Link'}
                    onChange={() => setVNDBImportType('VNDB Link')}
                  />
                  <label htmlFor="vndb-link">VNDB Link</label>
                </div>
                <div className="vndb-search-option">
                  <input
                    name="vndb-search-by"
                    type="radio"
                    id="game-title"
                    value="Game Title"
                    checked={vndbImportType === 'Game Title'}
                    onChange={() => setVNDBImportType('Game Title')}
                  />
                  <label htmlFor="game-title">Game Title</label>
                </div>
              </div>
            </div>
            <input id="vndb-link" type="text" placeholder="https://vndb.org/v25197" {...register('vndb_link')} />
          </div>
          <div className="vndb-buttons">
            <button autoFocus onClick={() => toggleModal(false)}>
              Cancel
            </button>
            <button className="vndb-search-button" onClick={() => fetchVNDBData()}>
              Search
            </button>
          </div>
        </div>
      </dialog>
      <div className="tabs">
        <div className={`tab ${currTab === 'Game Details' ? 'active' : ''}`} onClick={() => setCurrTab('Game Details')}>
          Game Details
        </div>
        <div className={`tab ${currTab === 'Routes' ? 'active' : ''}`} onClick={() => setCurrTab('Routes')}>
          Routes
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <button type="button" onClick={() => toggleModal(true)}>
          Import from VNDB
        </button>
        {currTab === 'Game Details' ? (
          <>
            <div className="form-field">
              <label htmlFor="orig_title">Original Title*</label>
              <input
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
              <label htmlFor="title">Title*</label>
              <input
                key="title"
                {...register('title', {
                  required: true,
                })}
              />
              {errors.title?.type === 'required' && <div className="form-error">Please enter the title.</div>}
            </div>
            <div className="form-field">
              <label htmlFor="img_link">Link to Cover Image</label>
              <input key="img_link" {...register('img_link')} />
            </div>
            <div className="form-field">
              <label htmlFor="vndb_id">VNDB ID</label>
              <input key="vndb_id" {...register('vndb_id')} />
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
              <select key="status" {...register('status')}>
                {statusDropdown}
              </select>
              {errors.status?.type === 'required' && <div className="form-error">Please select a status.</div>}
            </div>
            <div className="form-field">
              <p>Owned Copies*</p>
              {ownedCopiesList}
              {errors.owned_copies?.root && <div className="form-error">Please add at least one game copy.</div>}
              <button
                className="add-copy-button"
                type="button"
                onClick={() =>
                  append({ language: '', platform: '', orig_price: null, price: null, price_currency: '' })
                }
              >
                Add Copy
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-field">
              <p>Routes</p>
              {routesList}
              <button
                className="add-route-button"
                type="button"
                onClick={() => appendRoute({ name: '', type: '', route_img_link: '', status: TStatuses.Incomplete })}
              >
                Add Route
              </button>
            </div>
          </>
        )}
        <input type="submit" value="Add Game" />
      </form>
    </div>
  )
}
