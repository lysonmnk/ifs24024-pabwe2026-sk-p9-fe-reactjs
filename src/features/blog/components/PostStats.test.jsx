import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PostStats } from './PostStats'
import defaultPostStats from './PostStats'

describe('PostStats', () => {
  it('renders 3 stat cards with provided values', () => {
    const stats = { total: 10, published: 7, drafts: 3 }
    render(<PostStats stats={stats} />)

    expect(screen.getByTestId('post-stats')).toBeInTheDocument()
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Total Selesai / Terbit')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai / Draf')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(defaultPostStats).toBe(PostStats)
  })

  it('renders zero counts with default props', () => {
    render(<PostStats />)
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBe(3)
  })
})
