import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use the admin check function to bypass RLS issues
  const isAdmin = await isUserAdmin(user.id)
  
  if (!isAdmin) {
    redirect('/espace')
  }

  // Get pending users
  const { data: pendingUsers } = await supabase
    .from('profiles')
    .select('*')
    .eq('subscription_status', 'pending')
    .order('created_at', { ascending: false })

  // Get all users
  const { data: allUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Administration
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Gestion des utilisateurs et des comptes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-lg">{pendingUsers?.length || 0}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-muted-foreground">Comptes en attente</h3>
                <p className="text-2xl font-semibold text-foreground">{pendingUsers?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">
                    {allUsers?.filter(u => u.subscription_status === 'active').length || 0}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-muted-foreground">Comptes actifs</h3>
                <p className="text-2xl font-semibold text-foreground">
                  {allUsers?.filter(u => u.subscription_status === 'active').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">{allUsers?.length || 0}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total utilisateurs</h3>
                <p className="text-2xl font-semibold text-foreground">{allUsers?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comptes en attente d&apos;activation</CardTitle>
            <CardDescription>
              Utilisateurs ayant créé un compte et attendant une validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers && pendingUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Abonnement souhaité</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone || 'Non renseigné'}</TableCell>
                      <TableCell>{user.desired_plan || 'Non renseigné'}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="text-green-600">
                            Activer
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            Rejeter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Aucun compte en attente d'activation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les utilisateurs</CardTitle>
            <CardDescription>
              Vue d'ensemble de tous les comptes utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allUsers && allUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.subscription_status === 'active' 
                              ? 'default' 
                              : user.subscription_status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {user.subscription_status === 'active' ? 'Actif' : 
                           user.subscription_status === 'pending' ? 'En attente' : 
                           user.subscription_status === 'contacted' ? 'Contacté' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.desired_plan || 'Non défini'}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Aucun utilisateur trouvé
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}