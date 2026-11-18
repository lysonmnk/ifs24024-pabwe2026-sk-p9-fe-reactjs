import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'
import defaultUseTheme from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('initializes with default light theme or stored theme', () => {
    const { result: lightRes } = renderHook(() => useTheme())
    expect(lightRes.current.theme).toBe('light')
    expect(lightRes.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    localStorage.setItem('theme', 'dark')
    const { result: darkRes } = renderHook(() => useTheme())
    expect(darkRes.current.theme).toBe('dark')
    expect(darkRes.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles theme between light and dark', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('exports default hook', () => {
    expect(defaultUseTheme).toBe(useTheme)
  })
})
