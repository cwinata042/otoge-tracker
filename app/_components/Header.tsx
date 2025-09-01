import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()
  return (
    <div className="header">
      <Link href="/collection">
        <Image className="logo" src="/otoge-tracker-logo.svg" alt="Otoge Tracker logo" width={256} height={256} />
      </Link>
      <div className="user-details">
        <p>{session?.user.username}</p>
        <button className="small" onClick={() => signOut()}>
          Log out
        </button>
      </div>
    </div>
  )
}
