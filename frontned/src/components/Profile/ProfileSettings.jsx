import React from 'react'

const ProfileSettings = () => {
  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold theme-text'>Profile Settings</h2>

      <form>
        {/* Basic Information */}
        <div className='mb-8 p-6 rounded-lg bg-light/5'>
          <h3 className='text-xl font-semibold theme-text mb-4'>Basic Information</h3>
          <div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>Full Name</label>
              <input type='text' name='fullName' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>Email</label>
              <input type='email' name='email' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>Bio</label>
              <textarea name='bio' rows='4' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className='mb-8 p-6 rounded-lg bg-light/5'>
          <h3 className='text-xl font-semibold theme-text mb-4'>Social Links</h3>
          <div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>Website</label>
              <input type='url' name='website' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>GitHub</label>
              <input type='text' name='github' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>LinkedIn</label>
              <input type='text' name='linkedin' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
            <div className='mb-4'>
              <label className='block mb-2 theme-text-secondary text-sm'>Twitter</label>
              <input type='text' name='twitter' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
            </div>
          </div>
        </div>

        <div>
          <button type='submit' className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300'>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileSettings
