import { redirect } from 'next/navigation'

export default async function AdminPage() {
  // Redirect to /admin/users as the default admin landing page
  // Auth check is handled by the layout AdminRouteGuard
  redirect('/admin/users')
}