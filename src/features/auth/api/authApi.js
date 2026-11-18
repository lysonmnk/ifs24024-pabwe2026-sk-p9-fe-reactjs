import { post, get } from '../../../helpers/apiHelper'

export const loginUser = async (credentials) => {
  return await post('/api/auth/login', credentials)
}

export const registerUser = async (payload) => {
  return await post('/api/auth/register', payload)
}

export const getProfile = async () => {
  return await get('/api/auth/profile')
}

export const logoutUser = async () => {
  return await post('/api/auth/logout', {})
}

export default {
  loginUser,
  registerUser,
  getProfile,
  logoutUser,
}
