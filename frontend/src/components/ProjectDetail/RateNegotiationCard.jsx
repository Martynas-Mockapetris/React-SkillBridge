import { motion } from 'framer-motion'
import { FaCheck } from 'react-icons/fa'

const RateNegotiationCard = ({ project, currentUser, rateAmount, setRateAmount, rateType, setRateType, rateLoading, rateError, handleProposeRate, handleCounterRate, handleAcceptRate }) => {
  const isOwner = currentUser?._id === project?.user?._id
  const isAssignee = currentUser?._id === project?.assignee?._id
  const currentOffer = project?.rateNegotiation?.currentOffer
  const isRateProposedByMe = currentOffer?.proposedBy?.toString() === currentUser?._id
  const negotiationHistory = project?.rateNegotiation?.history || []

  // Helper Functions
  const getOfferLabel = (userId) => {
    if (!userId) return 'User'
    if (project?.user?._id && userId.toString() === project.user._id.toString()) return 'Client'
    if (project?.assignee?._id && userId.toString() === project.assignee._id.toString()) return 'Freelancer'
    return 'User'
  }

  const formatOfferType = (type) => (type === 'fixed' ? 'fixed' : '/hr')

  // Only show if user is owner or assignee with an active project
  if (!(isOwner || isAssignee) || !project.assignee || ['completed', 'archived', 'cancelled'].includes(project.status)) {
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className='theme-card p-6 rounded-lg space-y-4 border border-accent/20'>
      <h3 className='text-xl font-semibold theme-text'>Rate Negotiation</h3>

      {rateError && <div className='p-2 bg-red-100 text-red-700 rounded text-sm'>{rateError}</div>}

      {/* Show Accepted Status */}
      {project.rateNegotiation?.status === 'accepted' && (
        <div className='bg-green-500/10 border border-green-500/30 p-4 rounded-lg'>
          <div className='flex items-center gap-2 text-green-600 font-semibold mb-2'>
            <FaCheck />
            <span>Rate Accepted</span>
          </div>
          <p className='text-lg font-bold theme-text'>
            €{currentOffer?.amount} {currentOffer?.type === 'hourly' ? '/hr' : 'fixed'}
          </p>
          <p className='text-xs theme-text-secondary mt-1'>Agreed on {project.rateNegotiation.agreedAt ? new Date(project.rateNegotiation.agreedAt).toLocaleDateString() : ''}</p>
        </div>
      )}

      {/* Show Current Offer when not accepted */}
      {project.rateNegotiation?.status !== 'accepted' && (
        <>
          {currentOffer ? (
            <div className='bg-accent/10 p-3 rounded-lg'>
              <p className='text-sm theme-text-secondary'>Current Offer</p>
              <p className='text-lg font-semibold theme-text'>
                €{currentOffer.amount} {currentOffer.type === 'hourly' ? '/hr' : 'fixed'}
              </p>
              <p className='text-xs theme-text-secondary mt-1'>Proposed by {getOfferLabel(currentOffer.proposedBy)}</p>
            </div>
          ) : (
            <p className='text-sm theme-text-secondary'>No offer yet</p>
          )}

          {/* Input fields for new offer */}
          <div className='grid grid-cols-2 gap-3'>
            <input type='number' value={rateAmount} onChange={(e) => setRateAmount(e.target.value)} className='p-2 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text' placeholder='Amount' />
            <select value={rateType} onChange={(e) => setRateType(e.target.value)} className='p-2 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text'>
              <option value='hourly'>Hourly</option>
              <option value='fixed'>Fixed</option>
            </select>
          </div>

          {/* Propose button for owner */}
          {isOwner && (
            <button
              onClick={handleProposeRate}
              disabled={rateLoading || ['in_progress', 'under_review'].includes(project.status)}
              className='w-full py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50'>
              Propose Rate
            </button>
          )}

          {/* Counter button for assignee */}
          {isAssignee && (
            <button
              onClick={handleCounterRate}
              disabled={rateLoading || ['in_progress', 'under_review'].includes(project.status)}
              className='w-full py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-50'>
              Counter Offer
            </button>
          )}

          {/* Accept button - show if offer exists and not proposed by me */}
          {currentOffer && !isRateProposedByMe && (
            <button
              onClick={handleAcceptRate}
              disabled={rateLoading || ['in_progress', 'under_review'].includes(project.status)}
              className='w-full py-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50 font-semibold'>
              Accept Offer
            </button>
          )}
        </>
      )}

      {/* Negotiation History */}
      {negotiationHistory.length > 0 && (
        <div className='pt-3 border-t dark:border-light/10 border-primary/10'>
          <p className='text-sm font-semibold theme-text mb-2'>Negotiation History</p>
          <div className='space-y-2 max-h-32 overflow-y-auto'>
            {negotiationHistory.map((offer, idx) => (
              <div key={idx} className='text-sm theme-text-secondary flex justify-between gap-2'>
                <span>
                  {getOfferLabel(offer.proposedBy)}: €{offer.amount} {formatOfferType(offer.type)}
                </span>
                <span className='text-xs'>{offer.proposedAt ? new Date(offer.proposedAt).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default RateNegotiationCard
