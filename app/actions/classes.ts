'use server'

import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteClass(classId: string) {
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
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/classes')
}