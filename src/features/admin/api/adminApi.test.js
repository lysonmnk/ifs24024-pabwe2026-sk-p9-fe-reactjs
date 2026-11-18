import { describe, it, expect, vi } from 'vitest'
import { getAllUsers, getAllPosts, getUserPosts } from './adminApi'
import defaultAdminApi from './adminApi'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  get: vi.fn(),
}))

describe('adminApi', () => {
  it('calls correct admin endpoints', async () => {
    apiHelper.get.mockResolvedValue({ status: 'success' })

    await getAllUsers()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/admin/users')

    await getAllPosts()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/admin/posts')

    await getUserPosts(5)
    expect(apiHelper.get).toHaveBeenCalledWith('/api/admin/users/5/posts')

    expect(defaultAdminApi.getAllUsers).toBe(getAllUsers)
    expect(defaultAdminApi.getAllPosts).toBe(getAllPosts)
    expect(defaultAdminApi.getUserPosts).toBe(getUserPosts)
  })
})
