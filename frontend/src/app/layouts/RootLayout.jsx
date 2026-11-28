import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { LogOut, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { buttonClasses } from '../../components/ui/styles'
import { useCurrentUser, useLogout } from '../../features/auth/queries'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
      <img src="/favicon.svg" alt="" className="size-7" />
      <span className="text-lg tracking-tight">Foundly</span>
    </Link>
  )
}

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-black/5 text-ink' : 'text-muted hover:text-ink'
  }`

export function RootLayout() {
  const { user, isLoading } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const onLogout = () =>
    logout.mutate(undefined, {
      onSettled: () => {
        toast.success('Logged out')
        navigate('/')
      },
    })

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 sm:flex">
            <NavLink to="/" end className={navLinkClass}>
              Browse
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navLinkClass}>
                My activity
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {!isLoading && user && (
              <>
                <Link to="/items/new" className={buttonClasses({ size: 'sm' })}>
                  <Plus className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Report found item</span>
                  <span className="sm:hidden">Report</span>
                </Link>
                <NavLink
                  to="/dashboard"
                  className={(s) => `${navLinkClass(s)} sm:hidden`}
                >
                  Mine
                </NavLink>
                <span
                  className="hidden max-w-48 truncate text-sm text-muted md:inline"
                  title={user.email}
                >
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                  aria-label="Log out"
                >
                  <LogOut className="size-4" aria-hidden />
                </button>
              </>
            )}
            {!isLoading && !user && (
              <>
                <Link
                  to="/login"
                  className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                >
                  Log in
                </Link>
                <Link to="/register" className={buttonClasses({ size: 'sm' })}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Foundly helps lost things find their way home.
      </footer>
    </div>
  )
}
