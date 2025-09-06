'use client'

import { TStatuses, TRouteTypes } from '@/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LuLoaderCircle } from 'react-icons/lu'

type TVNDBSearchModalParams = {
  type: string
  setValue: any
  getValues: any
  dialogName: string
  clearErrors: any
  removeRoute?: any
  appendRoute?: any
}

/*
  type: ['Game', 'Character'], determines what values need to be imported
  setValue: The form's setValue function
  getValues: The form's getValues function
  dialogName: The name of the dialog (ex: edit-game)
  clearErrors: Clears any form errors
  appendRoute, removeRoute: Required for type = "Game"
*/
export default function VNDBSearchModal({
  type,
  setValue,
  getValues,
  dialogName,
  clearErrors,
  removeRoute,
  appendRoute,
}: TVNDBSearchModalParams) {
  const queryClient = useQueryClient()
  // Tracks what the user is searching for
  const [vndbTitleSearch, setVNDBTitleSearch] = useState<string>('')
  const [vndbCharacterSearch, setVNDBCharacterSearch] = useState<string>('')

  // Tracks the vndb_id used to import a Game or Character
  const [vndbImportId, setVNDBImportId] = useState<string | null>(null)

  const [isLoadingVNDBSearch, setIsLoadingVNDBSearch] = useState<boolean>(false)
  const [isLoadingVNDBImport, setIsLoadingVNDBImport] = useState<boolean>(false)
  const [vndbSearchResults, setVNDBSearchResults] = useState<any | null>(null)

  // Tracks the error states for searching and importing
  const [vndbSearchError, setVNDBSearchError] = useState<string>('')
  const [vndbImportError, setVNDBImportError] = useState<string>('')

  // VNDB API Endpoint to hit
  const url = type === 'Game' ? 'https://api.vndb.org/kana/vn' : 'https://api.vndb.org/kana/ch'

  function closeModal() {
    const dialog: HTMLDialogElement | null = document.querySelector(`dialog.${dialogName}`)

    if (dialog) {
      // Resets search modal settings
      clearVNDBSearch()

      setIsLoadingVNDBSearch(false)
      setIsLoadingVNDBImport(false)
      dialog.close()
    }
  }

  const handleSearchClick = async () => {
    let filters: any[], fields: string

    if (type === 'Game') {
      if (vndbTitleSearch === '') {
        setVNDBSearchError('Please enter a game title.')
        return
      }

      filters = ['search', '=', vndbTitleSearch]
      fields = 'title, alttitle, released'
    } else if (type === 'Character') {
      if (vndbCharacterSearch === '') {
        setVNDBSearchError('Please enter a character name.')
        return
      }

      filters =
        vndbTitleSearch !== ''
          ? ['and', ['search', '=', vndbCharacterSearch], ['vn', '=', ['search', '=', vndbCharacterSearch]]]
          : ['search', '=', vndbCharacterSearch]
      fields = 'name, image.url'
    }

    setVNDBSearchError('')
    setIsLoadingVNDBSearch(true)

    try {
      const vndbSearchData = await queryClient.fetchQuery({
        queryKey: ['vndb'],
        queryFn: async () => {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filters: filters,
              fields: fields,
            }),
          })

          return res.json()
        },
        staleTime: 0,
      })

      setVNDBSearchResults(vndbSearchData)
      setIsLoadingVNDBSearch(false)
    } catch (err) {
      setVNDBSearchError('There was an error searching VNDB. Please try again.')
      setVNDBSearchResults([])
      setIsLoadingVNDBSearch(false)
    }
  }

  // TO DO
  const handleImportClick = async () => {
    if (!vndbImportId) {
      setVNDBImportError(`Please select the ${type.toLocaleLowerCase()} to import.`)
      return
    }

    setIsLoadingVNDBImport(true)
    const fields =
      type === 'Game'
        ? 'title, alttitle, image.url, va.character{name, image.url, vns.role}, va.staff{original, name}, description'
        : ''

    try {
      const vndbData = await queryClient.fetchQuery({
        queryKey: ['vndb', vndbImportId],
        queryFn: async () => {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filters: ['id', '=', vndbImportId],
              fields: fields,
            }),
          })

          return res.json()
        },
        staleTime: 0,
      })

      if (type === 'Game') {
        setValue('vndb_id', vndbData.results[0].id)
        setValue('title', vndbData.results[0].title)
        setValue('orig_title', vndbData.results[0].alttitle ? vndbData.results[0].alttitle : vndbData.results[0].title)
        setValue('img_link', vndbData.results[0].image.url)
        setValue('description', vndbData.results[0].description)
        clearErrors(['vndb_id', 'title', 'orig_title', 'img_link'])
        removeRoute()

        for (const character of vndbData.results[0].va) {
          const characterObj = character.character
          const staffObj = character.staff

          // Only pull characters with primary roles
          if (characterObj.vns[0].role === 'primary') {
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
      } else {
        // Logic to set fields for route
        setValue('vndb_id', vndbData.results[0].id)
        setValue('type', TRouteTypes.Character)
        setValue('name', vndbData.results[0].name)
        setValue('route_img_link', vndbData.results[0].image.url)
        setValue('status', TStatuses.Incomplete)
        // Voice actors don't seem to come back from /ch...?
      }

      setIsLoadingVNDBImport(false)
      closeModal()
    } catch (err) {
      setIsLoadingVNDBImport(false)
      setVNDBImportError(`There was an error importing ${type.toLocaleLowerCase()} data from VNDB.`)
    }
  }

  const vndbSearchResultHeadersData = type === 'Game' ? ['Title', 'Released', ''] : ['Name', 'Image', '']
  const vndbSearchResultHeaders = vndbSearchResultHeadersData.map((header) => {
    return <th key={header}>{header}</th>
  })
  const vndbSearchResultRows = vndbSearchResults?.results.map((result: any) => {
    return (
      <tr key={`result-${result.id}`} className={vndbImportId === result.id ? 'selected' : ''}>
        {type === 'Game' ? (
          <td>{result.title ?? 'No title available'}</td>
        ) : (
          <td>{result.name ?? 'No name available'}</td>
        )}
        {type === 'Game' ? (
          <td>{result.released ?? 'No release date available'}</td>
        ) : (
          <td>{result.img.link ?? 'No image available'}</td>
        )}
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
    setVNDBCharacterSearch('')
    setVNDBTitleSearch('')

    setVNDBImportId(null)

    setVNDBSearchResults(null)

    setVNDBSearchError('')
    setVNDBImportError('')
  }

  return (
    <dialog className="vndb-import-container">
      <div className="vndb-import-modal">
        <div className="vndb-main">
          <div className="vndb-header">
            <h2>Import from VNDB</h2>
            <div className="form-info">NOTE: This will overwrite any existing values.</div>
          </div>
          <div className="vndb-search">
            <div className="vndb-link-container">
              {type === 'Character' && (
                <input
                  id="vndb-name"
                  type="text"
                  placeholder="Character"
                  onChange={(e) => {
                    if (vndbSearchError !== '' && e.target.value.length === 1) {
                      setVNDBSearchError('')
                    }

                    setVNDBCharacterSearch(e.target.value)
                  }}
                  value={vndbCharacterSearch}
                  disabled={vndbSearchResults !== null}
                />
              )}
              <label htmlFor="vndb-title">Game Title</label>
              <input
                id="vndb-title"
                type="text"
                placeholder="BUSTAFELLOWS..."
                onChange={(e) => {
                  if (vndbSearchError !== '' && e.target.value.length === 1) {
                    setVNDBSearchError('')
                  }

                  setVNDBTitleSearch(e.target.value)
                }}
                value={vndbTitleSearch}
                disabled={vndbSearchResults !== null}
              />
              {vndbSearchError !== '' && <div className="form-error">{vndbSearchError}</div>}
            </div>
            {vndbSearchResults && (
              <button className="small nobg warn nopad" onClick={() => clearVNDBSearch()}>
                Clear search results
              </button>
            )}
          </div>
          {vndbSearchResults && (
            <>
              <hr className="solid" />
              <div className="vndb-search-results-container">
                <div className="vndb-search-result-prompt">
                  <p className="form-info-white">{`Please select the ${type.toLocaleLowerCase()} you want to import:`}</p>
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
              </div>
            </>
          )}
        </div>
        <div className="vndb-buttons">
          {!isLoadingVNDBSearch && !isLoadingVNDBImport && (
            <button autoFocus onClick={() => closeModal()}>
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
  )
}
