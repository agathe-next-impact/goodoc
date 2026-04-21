import type React from 'react'

/**
 * Admin nav icon — small square mark shown next to the logo in the sidebar.
 */
export const Icon: React.FC = () => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="32" height="32" rx="8" fill="var(--medsite-brand)" />
    <path d="M13 9h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="#fff" />
  </svg>
)
