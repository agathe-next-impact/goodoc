import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { DoctolibWidget } from '../components/doctolib-widget'

afterEach(() => {
  cleanup()
})

describe('DoctolibWidget', () => {
  it('renders an iframe with correct src', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.doctolib.fr/iframe/jean-dupont',
    )
  })

  it('sets loading=lazy', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe).toHaveAttribute('loading', 'lazy')
  })

  it('sets allow=payment', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe).toHaveAttribute('allow', 'payment')
  })

  it('sets allowpaymentrequest attribute', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe).toHaveAttribute('allowpaymentrequest', 'true')
  })

  it('sets referrerPolicy', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'no-referrer-when-downgrade',
    )
  })

  it('has accessible title attribute', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    expect(
      screen.getByTitle('Prendre rendez-vous sur Doctolib'),
    ).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DoctolibWidget slug="jean-dupont" className="my-widget" />,
    )
    expect(container.firstElementChild).toHaveClass('my-widget')
  })

  it('sets min-height from prop', () => {
    render(<DoctolibWidget slug="jean-dupont" minHeight={800} />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe.style.minHeight).toBe('800px')
  })

  it('uses default min-height of 600', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe.style.minHeight).toBe('600px')
  })

  it('shows skeleton loader before iframe loads', () => {
    const { container } = render(<DoctolibWidget slug="jean-dupont" />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('sets width to 100% on iframe', () => {
    render(<DoctolibWidget slug="jean-dupont" />)
    const iframe = screen.getByTitle('Prendre rendez-vous sur Doctolib')
    expect(iframe.style.width).toBe('100%')
  })
})
