const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
}

export const setToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (!user) return null
  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

export const setUser = (user, remember = true) => {
  const str = JSON.stringify(user)
  if (remember) {
    localStorage.setItem(USER_KEY, str)
  } else {
    sessionStorage.setItem(USER_KEY, str)
  }
}

export const removeUser = () => {
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(endpoint, config)
  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) ? data.message : `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const get = (url, options = {}) => apiRequest(url, { ...options, method: 'GET' })
export const post = (url, body, options = {}) => apiRequest(url, { ...options, method: 'POST', body: JSON.stringify(body) })
export const put = (url, body, options = {}) => apiRequest(url, { ...options, method: 'PUT', body: JSON.stringify(body) })
export const del = (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' })

export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  apiRequest,
  get,
  post,
  put,
  del,
}
