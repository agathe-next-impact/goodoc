import type React from 'react'

/**
 * Admin header logo — rendered in the top-left and on the login page.
 * Kept in sync with the web app's brand (primary hue 201 96% 32%).
 */
export const Logo: React.FC = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--medsite-font-sans)',
      fontSize: '1.375rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--theme-elevation-1000)',
    }}
  >
    <Mark size={28} />
    <span>
      Med<span style={{ color: 'var(--medsite-brand)' }}>Site</span>
    </span>
  </div>
)

const Mark: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="32" height="32" rx="8" fill="var(--medsite-brand)" />
    <path
      d="M13 9h6v5h5v6h-5v5h-6v-5H8v-6h5z"
      fill="#fff"
    />
  </svg>
)
