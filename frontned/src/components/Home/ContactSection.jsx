const ContactSection = () => {
  return (
    <section className='w-full py-20 bg-primary relative z-[1]'>
      <div className='container mx-auto px-4 relative z-10'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>Get In</span>
            <span className='text-accent'> Touch</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto mb-12'>Have a question or want to collaborate? Drop us a message, and we'll get back to you soon.</p>
        </div>

        <div className='max-w-3xl mx-auto'>
          <form className='bg-light/5 p-8 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <div>
                <label className='block text-light mb-2'>Name</label>
                <input type='text' className='w-full bg-light/10 rounded-lg px-4 py-3 text-light' placeholder='Enter your name' />
              </div>
              <div>
                <label className='block text-light mb-2'>Email</label>
                <input type='email' className='w-full bg-light/10 rounded-lg px-4 py-3 text-light' placeholder='Enter your email' />
              </div>
            </div>
            <div className='mb-6'>
              <label className='block text-light mb-2'>Subject</label>
              <input type='text' className='w-full bg-light/10 rounded-lg px-4 py-3 text-light' placeholder='Enter subject' />
            </div>
            <div className='mb-6'>
              <label className='block text-light mb-2'>Message</label>
              <textarea className='w-full bg-light/10 rounded-lg px-4 py-3 text-light min-h-[150px]' placeholder='Enter your message'></textarea>
            </div>
            <button type='submit' className='w-full bg-accent text-primary font-medium py-3 px-6 rounded-lg'>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
