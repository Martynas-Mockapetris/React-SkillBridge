import Notification from '../models/Notification.js'

const truncateText = (value, limit) => {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!normalizedValue) {
    return ''
  }

  return normalizedValue.length > limit ? `${normalizedValue.slice(0, limit - 1).trimEnd()}...` : normalizedValue
}

export const createNotification = async ({ recipient, actor = null, type, title, body, link = '/profile', metadata = {} }) => {
  try {
    if (!recipient || !type || !title || !body) {
      return null
    }

    if (actor && actor.toString() === recipient.toString()) {
      return null
    }

    return await Notification.create({
      recipient,
      actor,
      type,
      title: truncateText(title, 140),
      body: truncateText(body, 500),
      link,
      metadata: metadata && typeof metadata === 'object' ? metadata : {}
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

export const notifyConnectionRequested = async ({ requester, recipient, connectionId, requesterName = 'Someone' }) => {
  return createNotification({
    recipient,
    actor: requester,
    type: 'connection_requested',
    title: 'New connection request',
    body: `${truncateText(requesterName, 80)} sent you a connection request.`,
    link: '/profile',
    metadata: {
      connectionId,
      requesterId: requester
    }
  })
}

export const notifyConnectionAccepted = async ({ actor, recipient, connectionId, actorName = 'Someone' }) => {
  return createNotification({
    recipient,
    actor,
    type: 'connection_accepted',
    title: 'Connection request accepted',
    body: `${truncateText(actorName, 80)} accepted your connection request.`,
    link: `/freelancer/${actor}`,
    metadata: {
      connectionId,
      userId: actor
    }
  })
}

export const notifyMessageReceived = async ({ sender, recipient, messageId, projectId = null, senderName = 'Someone', subject = '' }) => {
  const normalizedSubject = truncateText(subject, 90)

  return createNotification({
    recipient,
    actor: sender,
    type: 'message_received',
    title: normalizedSubject ? `New message: ${normalizedSubject}` : 'New message received',
    body: normalizedSubject ? `${truncateText(senderName, 80)} sent you a new message about ${normalizedSubject}.` : `${truncateText(senderName, 80)} sent you a new message.`,
    link: '/profile',
    metadata: {
      messageId,
      projectId,
      senderId: sender
    }
  })
}

export const notifyProjectAssigned = async ({ actor, recipient, projectId, projectTitle = 'Project', actorName = 'A client', isReassignment = false }) => {
  return createNotification({
    recipient,
    actor,
    type: 'project_assigned',
    title: isReassignment ? 'Project assignment updated' : 'You were assigned to a project',
    body: isReassignment
      ? `${truncateText(actorName, 80)} updated the assignment for "${truncateText(projectTitle, 90)}" and selected you.`
      : `${truncateText(actorName, 80)} assigned you to "${truncateText(projectTitle, 90)}".`,
    link: `/project/${projectId}`,
    metadata: {
      projectId,
      isReassignment
    }
  })
}

export const notifyProjectSubmitted = async ({ actor, recipient, projectId, projectTitle = 'Project', actorName = 'A freelancer' }) => {
  return createNotification({
    recipient,
    actor,
    type: 'project_submitted',
    title: 'Project ready for review',
    body: `${truncateText(actorName, 80)} submitted work for "${truncateText(projectTitle, 90)}".`,
    link: `/project/${projectId}`,
    metadata: {
      projectId
    }
  })
}

export const notifyProjectReviewed = async ({ actor, recipient, projectId, projectTitle = 'Project', actorName = 'A client', decision = 'accepted' }) => {
  return createNotification({
    recipient,
    actor,
    type: 'project_reviewed',
    title: decision === 'accepted' ? 'Project submission approved' : 'Changes requested on project',
    body:
      decision === 'accepted'
        ? `${truncateText(actorName, 80)} approved your submission for "${truncateText(projectTitle, 90)}".`
        : `${truncateText(actorName, 80)} requested changes for "${truncateText(projectTitle, 90)}".`,
    link: `/project/${projectId}`,
    metadata: {
      projectId,
      decision
    }
  })
}
