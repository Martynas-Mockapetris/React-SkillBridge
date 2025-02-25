import { useState } from 'react'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    <div className="p-6 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Login</h2>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
              />
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={loginData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              type="submit" 
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Login
            </button>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">
              Forgot password?
            </Link>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
