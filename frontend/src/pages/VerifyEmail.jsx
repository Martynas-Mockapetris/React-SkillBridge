import { useEffect, useMemo, useRef, useState } from 'react'
import { FaEnvelopeOpenText, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import PageBackground from '../components/shared/PageBackground'
import { confirmEmailVerification as confirmEmailVerificationService, requestEmailVerification as requestEmailVerificationService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const { currentUser, getUserProfile } = useAuth()

  const [status, setStatus] = useState(token ? 'verifying' : 'idle')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [contentHeight, setContentHeight] = useState('100vh')
  const pageRef = useRef(null)

  useEffect(() => {
    const calculateHeight = () => {
      const footerElement = document.querySelector('footer')
      if (footerElement) {
        const footerHeight = footerElement.offsetHeight
        setContentHeight(`calc(100vh - ${footerHeight}px)`)
      }
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => {
      window.removeEventListener('resize', calculateHeight)
    }
  }, [])

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        return
      }

      try {
        const response = await confirmEmailVerificationService(token)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully.')
        toast.success(response.message || 'Email verified successfully.')

        if (currentUser) {
          try {
            await getUserProfile()
          } catch (profileError) {
            console.warn('Failed to refresh profile after verification:', profileError)
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Verification link is invalid or has expired.'
        setStatus('error')
        setMessage(errorMessage)
        toast.error(errorMessage)
      }
    }

    runVerification()
  }, [token, currentUser, getUserProfile])

  const handleResend = async () => {
    try {
      setIsResending(true)
      const response = await requestEmailVerificationService()
      const responseMessage = response.message || 'Verification email sent.'
      setStatus('resent')
      setMessage(responseMessage)
      toast.success(responseMessage)

      if (currentUser) {
        try {
          await getUserProfile()
        } catch (profileError) {
          console.warn('Failed to refresh profile after resend:', profileError)
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email.'
      setStatus('error')
      setMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  const isVerified = Boolean(currentUser?.isEmailVerified)

  return (
    <div ref={pageRef} className='flex items-center justify-center px-6 theme-bg relative z-[1]' style={{ minHeight: contentHeight }}>
      <PageBackground variant='auth' />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='w-full max-w-md z-10 relative'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold theme-text'>Verify Your Email</h2>
          <p className='mt-2 text-sm theme-text-secondary'>Confirm your SkillBridge email address to complete account verification.</p>
        </div>

        <div className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-8 shadow-lg'>
          {status === 'verifying' && (
            <div className='space-y-5 text-center'>
              <div className='flex justify-center text-accent'>
                <FaEnvelopeOpenText size={40} />
              </div>
              <p className='theme-text'>Verifying your email link...</p>
            </div>
          )}

          {status === 'success' && (
            <div className='space-y-6 text-center'>
              <div className='flex justify-center text-green-500'>
                <FaCheckCircle size={44} />
              </div>
              <div>
                <p className='font-semibold theme-text'>Email verified</p>
                <p className='mt-2 text-sm theme-text-secondary'>{message}</p>
              </div>
              <div className='flex flex-col gap-3'>
                <Link to={currentUser ? '/profile' : '/login'} className='w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center'>
                  Continue to {currentUser ? 'Profile' : 'Login'}
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className='space-y-6 text-center'>
              <div className='flex justify-center text-red-500'>
                <FaExclamationTriangle size={42} />
              </div>
              <div>
                <p className='font-semibold theme-text'>Verification failed</p>
                <p className='mt-2 text-sm theme-text-secondary'>{message || 'Verification link is invalid or has expired.'}</p>
              </div>

              {currentUser && !isVerified ? (
                <button
                  type='button'
                  onClick={handleResend}
                  disabled={isResending}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${isResending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-accent text-white hover:bg-accent/90'}`}>
                  {isResending ? 'Sending...' : 'Send New Verification Email'}
                </button>
              ) : (
                <div className='flex flex-col gap-3'>
                  <Link to='/login' className='w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center'>
                    Back to login
                  </Link>
                </div>
              )}
            </div>
          )}

          {(status === 'idle' || status === 'resent') && !token && (
            <div className='space-y-6 text-center'>
              <div className='flex justify-center text-accent'>
                <FaEnvelopeOpenText size={40} />
              </div>

              {isVerified ? (
                <>
                  <div>
                    <p className='font-semibold theme-text'>Email already verified</p>
                    <p className='mt-2 text-sm theme-text-secondary'>Your account email is already verified.</p>
                  </div>
                  <Link to='/profile' className='w-full inline-block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center'>
                    Back to profile
                  </Link>
                </>
              ) : currentUser ? (
                <>
                  <div>
                    <p className='font-semibold theme-text'>Need a new verification email?</p>
                    <p className='mt-2 text-sm theme-text-secondary'>{message || 'You can resend the verification email to your account address.'}</p>
                  </div>

                  <button
                    type='button'
                    onClick={handleResend}
                    disabled={isResending}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${isResending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-accent text-white hover:bg-accent/90'}`}>
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </button>

                  <Link to='/profile' className='text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                    Back to profile
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    <p className='font-semibold theme-text'>Open your verification link</p>
                    <p className='mt-2 text-sm theme-text-secondary'>Use the link from your email, or log in to request a new verification message.</p>
                  </div>
                  <div className='flex flex-col gap-3'>
                    <Link to='/login' className='w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center'>
                      Go to login
                    </Link>
                    <Link to='/register' className='text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                      Create a new account
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmail
