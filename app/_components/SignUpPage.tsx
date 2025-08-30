'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LuLoaderCircle } from 'react-icons/lu'

export default function SignUpPage() {
  const {
    reset,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const router = useRouter()

  const [passHide, setPassHide] = useState<boolean>(true)
  const [passConfirmHide, setPassConfirmHide] = useState<boolean>(true)
  const [signingUp, setSigningUp] = useState<boolean>(false)

  const { mutate } = useMutation({
    mutationFn: async () => {
      setSigningUp(true)
      const body = JSON.stringify({
        email: getValues('email'),
        password: getValues('password'),
      })

      const res = await fetch('/api/sign-up', { method: 'POST', body: body })

      if (!res.ok) {
        setSigningUp(false)
        throw new Error('A user with this email already exists.')
      }

      setSigningUp(false)
      return res.json()
    },
    onSuccess: () => {
      reset()
      router.push('/')
    },
    onError: (error) => {
      setError('email', { message: error.message })
    },
  })

  const onSubmit = (data: any) => {
    mutate()
  }

  function togglePassword(passField: string) {
    if (passField === 'password') {
      setPassHide(!passHide)
    } else {
      setPassConfirmHide(!passConfirmHide)
    }
  }

  function getPassIcon(passField: string) {
    if (passField === 'password') {
      return passHide ? (
        <IoEyeOutline className="password-toggle" onClick={() => togglePassword('password')} />
      ) : (
        <IoEyeOffOutline className="password-toggle" onClick={() => togglePassword('password')} />
      )
    } else {
      return passConfirmHide ? (
        <IoEyeOutline className="password-toggle" onClick={() => togglePassword('confirmPassword')} />
      ) : (
        <IoEyeOffOutline className="password-toggle" onClick={() => togglePassword('confirmPassword')} />
      )
    }
  }

  return (
    <div className="main">
      <div className="sign-up-container">
        <h1>Sign up</h1>
        <form className="sign-up-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              {...register('email', {
                validate: {
                  checkEmail: (email) => {
                    if (email === '' || !email) {
                      return 'Please enter an email.'
                    }
                    if (!email.match(/\S+@\S+\.\S+/)) {
                      return 'Invalid email format.'
                    }
                  },
                },
              })}
            />
            {errors.email && <div className="form-error">{errors.email.message}</div>}
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                id="password"
                type={passHide ? 'password' : 'text'}
                {...register('password', {
                  validate: {
                    checkPassword: (pass) => {
                      if (pass === '' || !pass) {
                        return 'Please enter a password.'
                      }
                      if (pass.length < 12) {
                        return 'Passwords must be at least 12 characters long.'
                      }
                      if (!pass.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*?[#?!@$%^&*-])')) {
                        return 'Passwords must contain at least one uppercase letter, lowercase letter, number, and special character.'
                      }
                    },
                  },
                })}
              />
              {getPassIcon('password')}
            </div>
            {errors.password && <div className="form-error">{errors.password.message}</div>}
          </div>
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-container">
              <input
                id="confirmPassword"
                type={passConfirmHide ? 'password' : 'text'}
                {...register('confirmPassword', {
                  validate: {
                    confirmPassword: (pass) => {
                      if (pass === '' || !pass) {
                        return 'Please confirm your password.'
                      }
                      if (pass !== getValues('password')) {
                        return 'Passwords must match.'
                      }
                    },
                  },
                })}
              />
              {getPassIcon('confirmPassword')}
            </div>
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword.message}</div>}
          </div>
          <Link href="/">Log in with your account</Link>
          <div className="submit-button-container">
            {signingUp ? (
              <button className="main disabled" disabled>
                <p>Signing up</p>
                <LuLoaderCircle className="loader" />
              </button>
            ) : (
              <input className="button main" type="submit" value="Sign up" />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
