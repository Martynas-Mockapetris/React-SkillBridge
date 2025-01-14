import React from 'react'

const ProfileSettings = () => {
  // This will come from user context/auth later
  const userRole = 'freelancer' // possible values: 'freelancer', 'client', 'both'

  const showFreelancerSection = userRole === 'freelancer' || userRole === 'both';

  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold theme-text'>Profile Settings</h2>

      <form>
        <div className='grid lg:grid-cols-2 gap-6 mb-8'>
          {/* Basic Information */}
          <div className='p-6 rounded-lg bg-light/5'>
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
                <label className='block mb-2 theme-text-secondary text-sm'>Phone Number</label>
                <input type='tel' name='phone' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Location</label>
                <input type='text' name='location' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Skills</label>
                <textarea name='skills' rows='2' placeholder='Separate skills with commas' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Bio</label>
                <textarea name='bio' rows='4' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className='h-fit p-6 rounded-lg bg-light/5'>
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
        </div>

        {showFreelancerSection && (
          <div className='p-6 rounded-lg bg-light/5 mb-8'>
            <h3 className='text-xl font-semibold theme-text mb-4'>Freelancer Details</h3>
            <div className='grid gap-6'>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block mb-2 theme-text-secondary text-sm'>Hourly Rate</label>
                  <input type='number' name='hourlyRate' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' placeholder='$ per hour' />
                </div>
                <div>
                  <label className='block mb-2 theme-text-secondary text-sm'>Experience Level</label>
                  <select className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent'>
                    <option value='entry'>Entry Level</option>
                    <option value='intermediate'>Intermediate</option>
                    <option value='expert'>Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Languages</label>
                <textarea name='languages' rows='2' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' placeholder='English (Native), Spanish (Fluent), etc.' />
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Certifications</label>
                <textarea name='certifications' rows='2' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' placeholder='List your relevant certifications' />
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Service Categories</label>
                <textarea
                  name='serviceCategories'
                  rows='2'
                  className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent'
                  placeholder='Web Development, Mobile Apps, UI/UX Design, etc.'
                />
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Platform Links</label>
                <div className='grid md:grid-cols-2 gap-4'>
                  <input type='url' name='upworkProfile' placeholder='Upwork Profile URL' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                  <input type='url' name='fiverrProfile' placeholder='Fiverr Profile URL' className='w-full p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
            </div>
          </div>
        )}

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
