import { describe, it, expect, vi } from 'vitest'
import {
  loginUser,
  registerUser,
  getProfile,
  logoutUser,
} from './authApi'
import defaultAuthApi from './authApi'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  get: vi.fn(),
  post: vi.fn(),
}))

describe('authApi', () => {
  it('calls correct endpoints with parameters', async () => {
    apiHelper.post.mockResolvedValue({ status: 'success' })
    apiHelper.get.mockResolvedValue({ status: 'success' })

    await loginUser({ username: 'user', password: 'password' })
    expect(apiHelper.post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'user',
      password: 'password',
    })

    await registerUser({ username: 'newuser', email: 'a@b.com', password: 'pass' })
    expect(apiHelper.post).toHaveBeenCalledWith('/api/auth/register', {
      username: 'newuser',
      email: 'a@b.com',
      password: 'pass',
    })

    await getProfile()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/auth/profile')

    await logoutUser()
    expect(apiHelper.post).toHaveBeenCalledWith('/api/auth/logout', {})

    expect(defaultAuthApi.loginUser).toBe(loginUser)
    expect(defaultAuthApi.registerUser).toBe(registerUser)
    expect(defaultAuthApi.getProfile).toBe(getProfile)
    expect(defaultAuthApi.logoutUser).toBe(logoutUser)
  })
})
