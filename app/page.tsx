import { getServerSession } from 'next-auth'
import LoginPage from './_components/LoginPage'
import { authOptions } from '@/lib/configs/authOptions'
import { redirect } from 'next/navigation'

export default async function Login() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('collection')
  }

  return <LoginPage />
}
