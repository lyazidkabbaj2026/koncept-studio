'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface ColumnDefinition<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface ActionDefinition<T> {
  label: string
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: (item: T) => boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface DataTableProps<T> {
  title?: string
  description?: string
  data: T[]
  columns: ColumnDefinition<T>[]
  actions?: ActionDefinition<T>[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  keyExtractor: (item: T) => string
}

export function DataTable<T>({
  title,
  description,
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "Aucun élément trouvé",
  className = "",
  keyExtractor
}: DataTableProps<T>) {
  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item as any)
    }
    return item[key as keyof T]
  }

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((column, index) => (
                    <th
                      key={`header-${index}`}
                      className={`text-left py-3 px-4 font-medium text-sm text-muted-foreground ${column.className || ''}`}
                    >
                      {column.header}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIndex) => (
                  <tr key={keyExtractor(item)} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    {columns.map((column, colIndex) => (
                      <td key={`cell-${rowIndex}-${colIndex}`} className={`py-3 px-4 ${column.className || ''}`}>
                        {column.render ? column.render(item) : String(getValue(item, column.key) || '-')}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {actions.map((action, actionIndex) => {
                            const isDisabled = action.disabled ? action.disabled(item) : false
                            const IconComponent = action.icon

                            return (
                              <Button
                                key={`action-${actionIndex}`}
                                size="sm"
                                variant={action.variant || 'outline'}
                                onClick={() => action.onClick(item)}
                                disabled={isDisabled}
                              >
                                {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                                {action.label}
                              </Button>
                            )
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DataTable