import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PendingUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pending Users to Contact</h2>
        <p className="text-muted-foreground">
          Users who have signed up but haven't been contacted yet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will show users with subscription_status = 'pending'
          </p>
        </CardContent>
      </Card>
    </div>
  )
}