'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconBell } from '@tabler/icons-react'

export function NotificationDebug() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button asChild className="shadow-lg">
        <Link href="/test-notifications" className="gap-2">
          <IconBell className="w-4 h-4" />
          Test Notifications
        </Link>
      </Button>
    </div>
  )
}