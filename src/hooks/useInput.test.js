import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInput } from './useInput'
import defaultUseInput from './useInput'

describe('useInput', () => {
  it('initializes with default value and provided value', () => {
    const { result: defaultRes } = renderHook(() => useInput())
    expect(defaultRes.current[0]).toBe('')

    const { result: customRes } = renderHook(() => useInput('initial text'))
    expect(customRes.current[0]).toBe('initial text')
  })

  it('updates value using event target and direct value', () => {
    const { result } = renderHook(() => useInput('hello'))

    act(() => {
      // Event object
      result.current[1]({ target: { value: 'world' } })
    })
    expect(result.current[0]).toBe('world')

    act(() => {
      // Direct value
      result.current[1]('direct value')
    })
    expect(result.current[0]).toBe('direct value')

    act(() => {
      // setValue setter directly
      result.current[2]('setter value')
    })
    expect(result.current[0]).toBe('setter value')

    act(() => {
      // reset
      result.current[3]()
    })
    expect(result.current[0]).toBe('hello')
  })

  it('exports default function', () => {
    expect(defaultUseInput).toBe(useInput)
  })
})
