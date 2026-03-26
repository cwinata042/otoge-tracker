import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const logout = useCallback(() => {
    signOut()
  }, [session])

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    if (session?.error === 'AccessTokenError') {
      logout()
    }
  }, [session, logout])

  return (
    <div className="header">
      <Link href="/collection">
        <Image className="logo" src="/otoge-tracker-logo.svg" alt="Otoge Tracker logo" width={256} height={256} />
      </Link>
      <Link href="/collection" className={pathname === '/collection' ? 'active' : ''}>
        Collection
      </Link>
      <Link href="/characters" className={pathname === '/characters' ? 'active' : ''}>
        Characters
      </Link>
      <Link href="/stats" className={pathname === '/stats' ? 'active' : ''}>
        Stats
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
