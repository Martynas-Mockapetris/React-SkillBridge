import React from 'react'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaBook, FaGlobe, FaGithub, FaLinkedin, FaTwitter,  FaStar, FaLanguage, FaCertificate, FaList, FaBriefcase } from 'react-icons/fa'

const ProfileSettings = () => {
  // This will come from user context/auth later
  const userRole = 'freelancer' // possible values: 'freelancer', 'client', 'both'

  const showFreelancerSection = userRole === 'freelancer' || userRole === 'both'

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
                <div className='relative'>
                  <FaUser className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='text' name='fullName' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Email</label>
                <div className='relative'>
                  <FaEnvelope className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='email' name='email' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Phone Number</label>
                <div className='relative'>
                  <FaPhone className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='tel' name='phone' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Location</label>
                <div className='relative'>
                  <FaMapMarkerAlt className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='text' name='location' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Skills</label>
                <div className='relative'>
                  <FaTools className='absolute left-3 top-3 text-accent' />
                  <textarea name='skills' rows='2' placeholder='Separate skills with commas' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Bio</label>
                <div className='relative'>
                  <FaBook className='absolute left-3 top-3 text-accent' />
                  <textarea name='bio' rows='4' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className='h-fit p-6 rounded-lg bg-light/5'>
            <h3 className='text-xl font-semibold theme-text mb-4'>Social Links</h3>
            <div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Website</label>
                <div className='relative'>
                  <FaGlobe className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='url' name='website' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>GitHub</label>
                <div className='relative'>
                  <FaGithub className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='text' name='github' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>LinkedIn</label>
                <div className='relative'>
                  <FaLinkedin className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='text' name='linkedin' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-2 theme-text-secondary text-sm'>Twitter</label>
                <div className='relative'>
                  <FaTwitter className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                  <input type='text' name='twitter' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
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
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-accent'>€</span>
                    <input type='number' name='hourlyRate' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' placeholder='€ per hour' />
                  </div>
                </div>
                <div>
                  <label className='block mb-2 theme-text-secondary text-sm'>Experience Level</label>
                  <div className='relative'>
                    <FaStar className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                    <select className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent appearance-none'>
                      <option value='entry'>Entry Level</option>
                      <option value='intermediate'>Intermediate</option>
                      <option value='expert'>Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Languages</label>
                <div className='relative'>
                  <FaLanguage className='absolute left-3 top-3 text-accent' />
                  <textarea
                    name='languages'
                    rows='2'
                    className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent'
                    placeholder='English (Native), Spanish (Fluent), etc.'
                  />
                </div>
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Certifications</label>
                <div className='relative'>
                  <FaCertificate className='absolute left-3 top-3 text-accent' />
                  <textarea
                    name='certifications'
                    rows='2'
                    className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent'
                    placeholder='List your relevant certifications'
                  />
                </div>
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Service Categories</label>
                <div className='relative'>
                  <FaList className='absolute left-3 top-3 text-accent' />
                  <textarea
                    name='serviceCategories'
                    rows='2'
                    className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent'
                    placeholder='Web Development, Mobile Apps, UI/UX Design, etc.'
                  />
                </div>
              </div>

              <div>
                <label className='block mb-2 theme-text-secondary text-sm'>Platform Links</label>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='relative'>
                    <FaBriefcase className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                    <input type='url' name='upworkProfile' placeholder='Upwork Profile URL' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                  </div>
                  <div className='relative'>
                    <FaBriefcase className='absolute left-3 top-1/2 -translate-y-1/2 text-accent' />
                    <input type='url' name='fiverrProfile' placeholder='Fiverr Profile URL' className='w-full pl-10 p-3 rounded-lg bg-light/5 theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                  </div>
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
