import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { FaBell } from 'react-icons/fa'
import PageBackground from '../shared/PageBackground'
import ThemeToggle from './ThemeToggle'
import NotificationDropdown from './NotificationDropdown'
import { useAuth } from '../../context/AuthContext'
import { hasAdminPanelAccess } from '../../utils/accessRoles'
import useNotificationCount from '../../hooks/useNotificationCount'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)
  const { currentUser, logout } = useAuth()
  const { unreadCount, refreshUnreadCount } = useNotificationCount(Boolean(currentUser))

  const canAccessAdmin = currentUser && hasAdminPanelAccess(currentUser)

  const desktopLinkStyles = `relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px]
    after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full theme-text`

  const mobileLinkStyles = 'text-2xl hover:text-accent transition-colors theme-text'
  const notificationButtonStyles =
    'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors duration-300 hover:border-accent/40 hover:text-accent theme-text'

  const notificationBadge = unreadCount > 99 ? '99+' : unreadCount

  useEffect(() => {
    if (!isNotificationsOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isNotificationsOpen])

  return (
    <nav className='fixed w-full p-4 z-50 transition-all duration-300 theme-bg'>
      <div className='container mx-auto flex justify-between items-center'>
        {/* Logo and Brand */}
        <Link to='/' className='flex items-center space-x-2'>
          <span className='text-xl font-heading font-bold'>
            <span className='theme-text'>Skill</span>
            <span className='text-accent'>Bridge</span>
          </span>
          <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
        </Link>

        {/* Hamburger Button */}
        <button className='lg:hidden text-2xl z-50 theme-text' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* Desktop Menu */}
        <div className='hidden lg:flex items-center space-x-6'>
          <Link to='/' className={desktopLinkStyles}>
            Home
          </Link>

          <Link to='/about' className={desktopLinkStyles}>
            About
          </Link>

          <Link to='/listings' className={desktopLinkStyles}>
            Listings
          </Link>

          <Link to='/blog' className={desktopLinkStyles}>
            Blog
          </Link>

          {/* Only show Profile link if user is logged in */}
          {currentUser && (
            <Link to='/profile' className={desktopLinkStyles}>
              Profile
            </Link>
          )}

          {/* Only show Admin link if user is admin */}
          {canAccessAdmin && (
            <Link to='/admin' className={desktopLinkStyles}>
              Admin
            </Link>
          )}

          {currentUser && (
            <div className='relative' ref={notificationRef}>
              <button type='button' onClick={() => setIsNotificationsOpen((prev) => !prev)} className={notificationButtonStyles} aria-label='Notifications' aria-expanded={isNotificationsOpen}>
                <FaBell className='text-sm' />
                {unreadCount > 0 && (
                  <span className='absolute -right-1.5 -top-1.5 min-w-[1.2rem] rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white'>{notificationBadge}</span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                unreadCount={unreadCount}
                onUnreadCountChange={() => {
                  refreshUnreadCount()
                }}
              />
            </div>
          )}

          {currentUser ? (
            // Show logout button when user is logged in
            <button onClick={logout} className='text-accent font-semibold transition-colors duration-300 hover:opacity-80'>
              Logout
            </button>
          ) : (
            // Show login/register links when user is not logged in
            <>
              <Link to='/login' className={desktopLinkStyles}>
                Login
              </Link>
              <Link to='/register' className='text-accent font-semibold transition-colors duration-300 hover:opacity-80'>
                Register
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden fixed inset-0 transition-all duration-500 ease-in-out theme-bg
            ${isOpen ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible translate-x-full'}`}>
          <PageBackground variant='home' />

          <div className='flex flex-col items-center justify-center h-screen space-y-8 relative z-20'>
            <Link to='/' className={mobileLinkStyles}>
              Home
            </Link>

            <Link to='/about' className={mobileLinkStyles}>
              About
            </Link>

            <Link to='/listings' className={mobileLinkStyles}>
              Listings
            </Link>

            <Link to='/blog' className={mobileLinkStyles}>
              Blog
            </Link>

            {/* Only show Profile link if user is logged in */}
            {currentUser && (
              <Link to='/profile' className={mobileLinkStyles}>
                Profile
              </Link>
            )}

            {/* Only show Admin link if user is admin */}
            {canAccessAdmin && (
              <Link to='/admin' className={desktopLinkStyles}>
                Admin
              </Link>
            )}

            {currentUser && (
              <div className='relative' ref={notificationRef}>
                <button type='button' onClick={() => setIsNotificationsOpen((prev) => !prev)} className={notificationButtonStyles} aria-label='Notifications' aria-expanded={isNotificationsOpen}>
                  <FaBell className='text-sm' />
                  {unreadCount > 0 && (
                    <span className='absolute -right-1.5 -top-1.5 min-w-[1.2rem] rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white'>{notificationBadge}</span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                  unreadCount={unreadCount}
                  onUnreadCountChange={() => {
                    refreshUnreadCount()
                  }}
                />
              </div>
            )}

            {currentUser ? (
              // Show logout button when user is logged in
              <button onClick={logout} className='text-2xl text-accent font-semibold hover:opacity-80'>
                Logout
              </button>
            ) : (
              // Show login/register links when user is not logged in
              <>
                <Link to='/login' className={mobileLinkStyles}>
                  Login
                </Link>
                <Link to='/register' className='text-2xl text-accent font-semibold hover:opacity-80'>
                  Register
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
