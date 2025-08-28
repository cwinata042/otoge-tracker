'use client'

import { TCurrency, TGameLanguages, TGamePlatforms, TGameStatuses, TGameTypes } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

export default function AddToCollection() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm()

  const { mutate } = useMutation({
    mutationFn: async () => {
      const body = JSON.stringify(getValues())
      console.log(body)
      const res = await fetch('/api/collection', { method: 'POST', body: body })

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owned-games'] })
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
          <div className="owned-copy-field">
            <div className="form-field">
              <label htmlFor="owned_copies.0.language">Language</label>
              <select key="owned_copies.0.language" {...register('owned_copies.0.language')}>
                {langDropdown}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="owned_copies.0.platform">Platform</label>
              <select key="owned_copies.0.platform" {...register('owned_copies.0.platform')}>
                {platDropdown}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="owned_copies.0.price">Price</label>
              <input type="number" {...register('owned_copies.0.price')} />
            </div>
            <div className="form-field">
              <label htmlFor="owned_copies.0.currency">Currency</label>
              <select key="owned_copies.0.platform" {...register('owned_copies.0.currency')}>
                {currDropdown}
              </select>
            </div>
          </div>
        </div>
        <input type="submit" value="Add Game" />
      </form>
    </div>
  )
}
