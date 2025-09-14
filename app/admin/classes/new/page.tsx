import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ClassForm } from '@/components/admin/class-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewClassPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    redirect('/espace')
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/classes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nouveau cours</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Créez un nouveau cours de fitness
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du cours</CardTitle>
            <CardDescription>
              Remplissez les informations nécessaires pour créer un nouveau cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}