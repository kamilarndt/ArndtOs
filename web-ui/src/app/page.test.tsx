import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from './page'

describe('Home', () => {
  it('renders ZeroClaw OS title', () => {
    render(<Home />)
    expect(screen.getByText('ZeroClaw OS')).toBeInTheDocument()
  })
  
  it('renders subtitle', () => {
    render(<Home />)
    expect(screen.getByText('Autonomous AI Agent Dashboard')).toBeInTheDocument()
  })
  
  it('renders description', () => {
    render(<Home />)
    expect(screen.getByText('Building the future of AI-driven systems')).toBeInTheDocument()
  })
})