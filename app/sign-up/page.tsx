import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import SignUpPage from '../_components/SignUpPage'

export default async function SignUp() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('collection')
  }

  return <SignUpPage />
}
