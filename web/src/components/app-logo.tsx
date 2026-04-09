import { Link } from 'react-router-dom'

type AppLogoProps = {
  to?: string
  className?: string
}

export function AppLogo({ to = '/', className = '' }: AppLogoProps) {
  const img = (
    <img
      src="/brevly-logo.svg"
      alt="Brevly"
      className={`h-6 w-24 ${className}`}
      width={96}
      height={24}
    />
  )

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {img}
      </Link>
    )
  }

  return img
}
