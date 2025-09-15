import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContactedUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contacted Users to Assign</h2>
        <p className="text-muted-foreground">
          Users who have been contacted and are ready for subscription assignment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contacted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will show users with subscription_status = 'contacted'
          </p>
        </CardContent>
      </Card>
    </div>
  )
}