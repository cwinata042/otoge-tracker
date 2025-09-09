'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { LuLoaderCircle } from 'react-icons/lu'

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const router = useRouter()

  const [passHide, setPassHide] = useState<boolean>(true)
  const [loggingIn, setLoggingIn] = useState<boolean>(false)

  const onSubmit = async (data: any) => {
    try {
      setLoggingIn(true)
      const res = await signIn('credentials', {
        email: getValues('email'),
        password: getValues('password'),
        redirect: false,
      })

      if (res && res.error) {
        setLoggingIn(false)
        setError('password', { message: 'Invalid email or password.' })
        return
      }

      setLoggingIn(false)
      router.replace('collection')
    } catch (err) {
      console.log(err)
      setLoggingIn(false)
    }
  }

  function togglePassword(passField: string) {
    setPassHide(!passHide)
  }

  function getPassIcon(passField: string) {
    return passHide ? (
      <IoEyeOutline className="password-toggle" onClick={() => togglePassword('password')} />
    ) : (
      <IoEyeOffOutline className="password-toggle" onClick={() => togglePassword('password')} />
    )
  }

  return (
    <div className="main">
      <div className="login-container">
        <h1>Log in</h1>
        <form autoComplete="off" className="sign-up-form" onSubmit={handleSubmit(onSubmit)}>
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
                        return 'Please enter your password.'
                      }
                    },
                  },
                })}
              />
              {getPassIcon('password')}
            </div>
            {errors.password && <div className="form-error">{errors.password.message}</div>}
          </div>
          <Link href="/sign-up">Sign up for an account</Link>
          <div className="submit-button-container">
            {loggingIn ? (
              <button className="main disabled" disabled>
                <p>Logging in</p>
                <LuLoaderCircle className="loader" />
              </button>
            ) : (
              <input className="button main" type="submit" value="Log in" />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
