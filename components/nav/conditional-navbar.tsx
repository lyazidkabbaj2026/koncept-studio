import Navbar from './navbar'

interface ConditionalNavbarProps {
  pathname: string
}

export async function ConditionalNavbar({ pathname }: ConditionalNavbarProps) {
  // Don't show navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  return <Navbar />
}