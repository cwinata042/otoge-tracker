'use client'

import { COLLECTION_QUERY_KEY } from '@/lib/queryKeys'
import { TCurrency, TGameLanguages, TGamePlatforms, TGameStatuses, TGameTypes } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useFieldArray, useForm } from 'react-hook-form'

export default function AddToCollection() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm()

  const {
    fields: ownedCopies,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'owned_copies',
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

  const statusDropdown = Object.values(TGameStatuses).map((status) => {
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

  const ownedCopiesList = ownedCopies.map((copy, index) => {
    return (
      <div key={copy.id} className="owned-copy-field">
        <div className="form-field">
          <label htmlFor={copy.id}>Language</label>
          <select key={copy.id} {...register(`owned_copies.${index}.language`)}>
            {langDropdown}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor={copy.id}>Platform</label>
          <select key={copy.id} {...register(`owned_copies.${index}.platform`)}>
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
          <select key={copy.id} {...register(`owned_copies.${index}.price_currency`)}>
            {currDropdown}
          </select>
        </div>
        <button className="remove-copy-button" type="button" onClick={() => remove(index)}>
          Remove
        </button>
      </div>
    )
  })

  return (
    <div className="main-container">
      <div className="header">
        Cool header here
        <Link href="/collection">Back</Link>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-field">
          <label htmlFor="orig_title">Original Title</label>
          <input key="orig_title" {...register('orig_title')} />
        </div>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input key="title" {...register('title')} />
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
          <label htmlFor="type">Type</label>
          <select key="type" {...register('type')}>
            {typeDropdown}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select key="status" {...register('status')}>
            {statusDropdown}
          </select>
        </div>
        <div className="form-field">
          <p>Owned Copies</p>
          {ownedCopiesList}
          <button
            className="add-copy-button"
            type="button"
            onClick={() => append({ language: '', platform: '', orig_price: null, price: null, price_currency: '' })}
          >
            Add Copy
          </button>
        </div>
        <input type="submit" value="Add Game" />
      </form>
    </div>
  )
}
