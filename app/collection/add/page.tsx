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
} from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { LuLoaderCircle } from 'react-icons/lu'
import { FaRegTrashAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function AddToCollection() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [currTab, setCurrTab] = useState<string>('Game Details')
  const [vndbImportType, setVNDBImportType] = useState<string>('VNDB Link')
  const [vndbImportId, setVNDBImportId] = useState<string | null>(null)
  const [vndbImportError, setVNDBImportError] = useState<string>('')
  const [isLoadingVNDBSearch, setIsLoadingVNDBSearch] = useState<boolean>(false)
  const [vndbSearchResults, setVNDBSearchResults] = useState<any | null>(null)
  const [isLoadingVNDBImport, setIsLoadingVNDBImport] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<TAddGameFormValues>({
    defaultValues: {
      orig_title: '',
      title: '',
      img_link: '',
      vndb_search: '',
      vndb_id: '',
      type: TGameTypes.Main,
      status: TStatuses[''],
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
      <option key={lang.toString().toLowerCase()} disabled={lang.toString() === 'Language'} value={lang.toString()}>
        {lang}
      </option>
    )
  })
  const platDropdown = Object.values(TGamePlatforms).map((plat) => {
    return (
      <option key={plat.toString().toLowerCase()} disabled={plat.toString() === 'Platform'} value={plat.toString()}>
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
        <FaRegTrashAlt className="trash-icon" onClick={() => removeRoute(index)} />
      </div>
    )
  })

  function toggleModal(show: boolean) {
    const dialog = document.querySelector('dialog')

    if (dialog && show) {
      dialog.showModal()
    } else if (dialog && !show) {
      clearVNDBSearch()
      setIsLoadingVNDBSearch(false)
      setIsLoadingVNDBImport(false)
      dialog.close()
    }
  }

  const handleSearchClick = async () => {
    if (vndbImportType === 'VNDB Link') {
      const vndbId = getValues('vndb_search').split('/').pop()
      const vndbIdFormat = /^[v]\d+$/

      if (vndbId && vndbIdFormat.test(vndbId)) {
        setIsLoadingVNDBSearch(true)

        try {
          const vndbSearchData = await queryClient.fetchQuery({
            queryKey: ['vndb', vndbId],
            queryFn: async () => {
              const res = await fetch('https://api.vndb.org/kana/vn', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  filters: ['id', '=', vndbId],
                  fields: 'title, alttitle, released',
                }),
              })

              return res.json()
            },
            staleTime: 0,
          })

          setVNDBSearchResults(vndbSearchData)
          setIsLoadingVNDBSearch(false)
        } catch (err) {
          setVNDBSearchResults([])
          setIsLoadingVNDBSearch(false)
        }
      } else {
        setError('vndb_search', { message: 'Please enter a valid VNDB link.' })
      }
    } else {
      const vndbName = getValues('vndb_search')

      if (vndbName && vndbName !== '') {
        setIsLoadingVNDBSearch(true)

        try {
          const vndbSearchData = await queryClient.fetchQuery({
            queryKey: ['vndb', vndbName],
            queryFn: async () => {
              const res = await fetch('https://api.vndb.org/kana/vn', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  filters: ['search', '=', vndbName],
                  fields: 'title, alttitle, released',
                }),
              })

              return res.json()
            },
            staleTime: 0,
          })

          setVNDBSearchResults(vndbSearchData)
          setIsLoadingVNDBSearch(false)
        } catch (err) {
          setVNDBSearchResults([])
          setIsLoadingVNDBSearch(false)
        }
      } else {
        setError('vndb_search', { message: 'Please enter a search value.' })
      }
    }
  }

  const handleImportClick = async () => {
    // Only fetch if valid VNDB link
    if (vndbImportId) {
      setIsLoadingVNDBImport(true)
      try {
        const vndbData = await queryClient.fetchQuery({
          queryKey: ['vndb', vndbImportId],
          queryFn: async () => {
            const res = await fetch('https://api.vndb.org/kana/vn', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                filters: ['id', '=', vndbImportId],
                fields: 'title, alttitle, image.url, va.character{name, image.url, vns.role}',
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
        clearErrors(['vndb_id', 'title', 'orig_title', 'img_link'])
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
        setIsLoadingVNDBImport(false)
        toggleModal(false)
      } catch (err) {
        setIsLoadingVNDBImport(false)
      }
    } else {
      setVNDBImportError('Select a game to import.')
    }
  }

  const vndbSearchResultHeadersData = ['Title', 'Released', '']
  const vndbSearchResultHeaders = vndbSearchResultHeadersData.map((header) => {
    return <th key={header}>{header}</th>
  })
  const vndbSearchResultRows = vndbSearchResults?.results.map((result: any) => {
    return (
      <tr key={`result-${result.id}`} className={vndbImportId === result.id ? 'selected' : ''}>
        <td>{result.title ?? 'No title available'}</td>
        <td>{result.released ?? 'No release date available'}</td>
        <td className="checkbox">
          <input
            type="checkbox"
            checked={vndbImportId === result.id}
            onChange={() => {
              if (vndbImportId === result.id) {
                setVNDBImportId(null)
              } else {
                setVNDBImportId(result.id)
                setVNDBImportError('')
              }
            }}
          />
        </td>
      </tr>
    )
  })

  function clearVNDBSearch() {
    setValue('vndb_search', '')
    setVNDBImportId(null)
    setVNDBSearchResults(null)
    setVNDBImportType('VNDB Link')
  }

  return (
    <div className="main-container">
      <div className="header">
        <Image className="logo" src="/otoge-tracker-logo.svg" alt="Otoge Tracker logo" width={256} height={256} />
        <div className="user-details">
          <p>{session?.user.email}</p>
          <button className="small" onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </div>
      <div className="add-game-container">
        <dialog className="vndb-import-container">
          <div className="vndb-import-modal">
            <div className="vndb-main">
              <div className="vndb-header">
                <h2>Import from VNDB</h2>
                <div className="form-info">NOTE: This will overwrite any existing values.</div>
              </div>
              <div className="vndb-search">
                <div className="vndb-search-options-container">
                  <p className="form-info-white">Search by</p>
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
                      <label htmlFor="vndb-link">VNDB Link/ID</label>
                    </div>
                    <div className="vndb-search-option">
                      <input
                        name="vndb-search-by"
                        type="radio"
                        id="game-title"
                        value="Game Title"
                        checked={vndbImportType === 'Game Title'}
                        onChange={() => {
                          clearErrors('vndb_search')
                          setVNDBImportType('Game Title')
                        }}
                      />
                      <label htmlFor="game-title">Game Title</label>
                    </div>
                  </div>
                </div>
                <div className="vndb-link-container">
                  <input
                    id="vndb-link"
                    type="text"
                    placeholder={
                      vndbImportType === 'VNDB Link' ? 'https://vndb.org/v25197, v25197...' : 'BUSTAFELLOWS...'
                    }
                    {...register('vndb_search')}
                    onChange={(e) => {
                      if (errors.vndb_search && e.target.value.length === 1) {
                        clearErrors('vndb_search')
                      }
                    }}
                    disabled={vndbSearchResults !== null}
                  />
                  {errors.vndb_search && <div className="form-error">{errors.vndb_search.message}</div>}
                </div>
              </div>
              {vndbSearchResults && (
                <>
                  <hr className="solid" />
                  <div className="vndb-search-results-container">
                    <div className="vndb-search-result-prompt">
                      <p className="form-info-white">Please select the game you want to import:</p>
                      <p className="form-info-pale">
                        {vndbSearchResults.more
                          ? 'More than 10 results'
                          : `${vndbSearchResults.results.length} ${
                              vndbSearchResults.results.length > 1 ? 'results' : 'result'
                            }`}
                      </p>
                    </div>
                    <table className="vndb-search-result-table">
                      <thead>
                        <tr>{vndbSearchResultHeaders}</tr>
                      </thead>
                      <tbody>{vndbSearchResultRows}</tbody>
                    </table>
                    <button className="small nobg warn" onClick={() => clearVNDBSearch()}>
                      Clear search results
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="vndb-buttons">
              {!isLoadingVNDBSearch && !isLoadingVNDBImport && (
                <button autoFocus onClick={() => toggleModal(false)}>
                  Cancel
                </button>
              )}
              {!vndbSearchResults &&
                (!isLoadingVNDBSearch ? (
                  <button className="main outlined" onClick={handleSearchClick}>
                    Search
                  </button>
                ) : (
                  <button className="main outlined disabled" disabled>
                    <p>Searching...</p>
                    <LuLoaderCircle className="loader" />
                  </button>
                ))}
              {vndbSearchResults &&
                (!isLoadingVNDBImport ? (
                  <button
                    className={`main ${!vndbImportId ? 'disabled' : ''}`}
                    onClick={handleImportClick}
                    disabled={!vndbImportId}
                  >
                    Import
                  </button>
                ) : (
                  <button className="main disabled" disabled>
                    <p>Importing...</p>
                    <LuLoaderCircle className="loader" />
                  </button>
                ))}
            </div>
          </div>
        </dialog>
        <div className="add-game-header">
          <h1>Add New Game</h1>
          <button type="button" className="small main outlined" onClick={() => toggleModal(true)}>
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
          <form className="add-game-form" onSubmit={handleSubmit(onSubmit)}>
            {currTab === 'Game Details' ? (
              <div className="game-details">
                <div className="game-details-image">
                  {getValues('img_link') !== '' && (
                    <Image src={getValues('img_link')} alt={'Game Image'} fill={true} style={{ objectFit: 'cover' }} />
                  )}
                </div>
                <div className="game-details-form">
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
                    <label htmlFor="img_link">Link to Cover Image</label>
                    <input key="img_link" {...register('img_link')} />
                    <button
                      type="button"
                      className="small"
                      onClick={() => setValue('img_link', 'https://t.vndb.org/cv/30/45430.jpg')}
                    >
                      Load image
                    </button>
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
                      onClick={() => appendRoute({ name: '', type: '', route_img_link: '', status: TStatuses[''] })}
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
