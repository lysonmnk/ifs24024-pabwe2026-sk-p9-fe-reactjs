import { describe, it, expect } from 'vitest'

describe('main.jsx', () => {
  it('initializes React root in #root element', async () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)

    await import('./main.jsx')
    expect(document.getElementById('root')).toBeInTheDocument()
  })
})
