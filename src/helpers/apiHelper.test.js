import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
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
} from './apiHelper'
import apiHelper from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('handles token in localStorage and sessionStorage', () => {
    expect(getToken()).toBeNull()

    setToken('token-local', true)
    expect(getToken()).toBe('token-local')

    removeToken()
    expect(getToken()).toBeNull()

    setToken('token-session', false)
    expect(getToken()).toBe('token-session')

    removeToken()
    expect(getToken()).toBeNull()
  })

  it('handles user in localStorage and sessionStorage', () => {
    expect(getUser()).toBeNull()

    const mockUser = { id: 1, username: 'testuser' }
    setUser(mockUser, true)
    expect(getUser()).toEqual(mockUser)

    removeUser()
    expect(getUser()).toBeNull()

    setUser(mockUser, false)
    expect(getUser()).toEqual(mockUser)

    removeUser()
    expect(getUser()).toBeNull()

    // Corrupted user json
    localStorage.setItem('auth_user', 'invalid-json')
    expect(getUser()).toBeNull()
  })

  it('performs apiRequest successfully with token and without token', async () => {
    const mockData = { status: 'success', data: { id: 1 } }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const resWithoutToken = await apiRequest('/api/test')
    expect(resWithoutToken).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      headers: { 'Content-Type': 'application/json' },
    })

    setToken('my-bearer-token', true)
    const resWithToken = await apiRequest('/api/test-token')
    expect(resWithToken).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith('/api/test-token', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer my-bearer-token',
      },
    })
  })

  it('throws error when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ status: 'fail', message: 'Bad Request' }),
    })

    await expect(apiRequest('/api/fail')).rejects.toThrow('Bad Request')

    // Non-JSON error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Not JSON')
      },
    })

    await expect(apiRequest('/api/error')).rejects.toThrow('Request failed with status 500')
  })

  it('supports get, post, put, del helper methods', async () => {
    const mockData = { status: 'success' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    await get('/api/get')
    expect(global.fetch).toHaveBeenCalledWith('/api/get', expect.objectContaining({ method: 'GET' }))

    await post('/api/post', { name: 'item' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/post',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'item' }) })
    )

    await put('/api/put', { name: 'updated' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/put',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ name: 'updated' }) })
    )

    await del('/api/del')
    expect(global.fetch).toHaveBeenCalledWith('/api/del', expect.objectContaining({ method: 'DELETE' }))

    // default export coverage
    expect(apiHelper.getToken).toBe(getToken)
    expect(apiHelper.setToken).toBe(setToken)
    expect(apiHelper.removeToken).toBe(removeToken)
    expect(apiHelper.getUser).toBe(getUser)
    expect(apiHelper.setUser).toBe(setUser)
    expect(apiHelper.removeUser).toBe(removeUser)
    expect(apiHelper.apiRequest).toBe(apiRequest)
    expect(apiHelper.get).toBe(get)
    expect(apiHelper.post).toBe(post)
    expect(apiHelper.put).toBe(put)
    expect(apiHelper.del).toBe(del)
  })
})
