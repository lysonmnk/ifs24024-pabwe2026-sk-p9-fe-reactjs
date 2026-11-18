import { get } from '../../../helpers/apiHelper'

export const getAllUsers = async () => {
  return await get('/api/admin/users')
}

export const getAllPosts = async () => {
  return await get('/api/admin/posts')
}

export const getUserPosts = async (userId) => {
  return await get(`/api/admin/users/${userId}/posts`)
}

export default {
  getAllUsers,
  getAllPosts,
  getUserPosts,
}
