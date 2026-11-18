import { describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import {
  showAlert,
  showConfirm,
  showToast,
  formatDate,
  formatDateTime,
} from './toolsHelper'
import toolsHelper from './toolsHelper'

vi.mock('sweetalert2', () => {
  const fireMock = vi.fn().mockResolvedValue({ isConfirmed: true })
  const mixinMock = vi.fn(() => ({
    fire: fireMock,
  }))
  return {
    default: {
      fire: fireMock,
      mixin: mixinMock,
    },
  }
})

describe('toolsHelper', () => {
  it('showAlert calls Swal.fire with default or custom icon', () => {
    showAlert('Info Title', 'Info Text')
    expect(Swal.fire).toHaveBeenCalledWith({
      title: 'Info Title',
      text: 'Info Text',
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
    })

    showAlert('Custom Title', 'Custom Text', 'success')
    expect(Swal.fire).toHaveBeenCalledWith({
      title: 'Custom Title',
      text: 'Custom Text',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
    })
  })

  it('showConfirm calls Swal.fire and returns isConfirmed', async () => {
    const res = await showConfirm('Confirm Title', 'Confirm Text')
    expect(res).toBe(true)
    expect(Swal.fire).toHaveBeenCalledWith({
      title: 'Confirm Title',
      text: 'Confirm Text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    })
  })

  it('showToast calls Swal.mixin fire', () => {
    showToast('Berhasil')
    expect(Swal.mixin).toHaveBeenCalledWith({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    })
  })

  it('formatDate formats valid and invalid dates properly', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
    expect(formatDate('invalid-date')).toBe('-')

    const dateStr = '2026-11-18T00:00:00Z'
    const formatted = formatDate(dateStr)
    expect(formatted).toContain('2026')
    expect(formatted).toContain('November')
  })

  it('formatDateTime formats date and time properly', () => {
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime('')).toBe('-')
    expect(formatDateTime('invalid-date')).toBe('-')

    const dateStr = '2026-11-18T09:30:00Z'
    const formatted = formatDateTime(dateStr)
    expect(formatted).toContain('2026')
    expect(formatted).toContain('November')
  })

  it('default export matches named exports', () => {
    expect(toolsHelper.showAlert).toBe(showAlert)
    expect(toolsHelper.showConfirm).toBe(showConfirm)
    expect(toolsHelper.showToast).toBe(showToast)
    expect(toolsHelper.formatDate).toBe(formatDate)
    expect(toolsHelper.formatDateTime).toBe(formatDateTime)
  })
})
