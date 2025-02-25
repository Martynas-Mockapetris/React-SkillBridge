import { useState } from 'react'

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    // Password validation
    if (!loginData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Login submitted:', loginData)
      // Here we'll add API call later
    }
  }
  
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {errors.email && <p>{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {errors.password && <p>{errors.password}</p>}
        </div>
        
        <div>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
        
        <button type="submit">Login</button>
        
        <div>
          <a href="/forgot-password">Forgot password?</a>
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </form>
    </div>
  )
}

export default Login
