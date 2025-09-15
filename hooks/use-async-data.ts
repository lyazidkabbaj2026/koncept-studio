import { useState, useEffect, useCallback, useRef } from 'react'

export interface AsyncDataOptions<T> {
  initialData?: T
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  defaultErrorMessage?: string
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: AsyncDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData ?? null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const cancelledRef = useRef(false)

  const fetchData = useCallback(async () => {
    if (options.enabled === false) return

    cancelledRef.current = false
    setLoading(true)
    setError('')

    try {
      const result = await fetchFn()

      if (!cancelledRef.current) {
        setData(result)
        options.onSuccess?.(result)
      }
    } catch (err) {
      if (!cancelledRef.current) {
        const errorMessage = err instanceof Error
          ? err.message
          : options.defaultErrorMessage || 'Failed to fetch data'

        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false)
      }
    }
  }, [fetchFn, options])

  useEffect(() => {
    fetchData()

    return () => {
      cancelledRef.current = true
    }
  }, deps)

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  const reset = useCallback(() => {
    setData(options.initialData ?? null)
    setError('')
    setLoading(true)
  }, [options.initialData])

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    isSuccess: !loading && !error && data !== null,
    isEmpty: !loading && !error && (data === null || (Array.isArray(data) && data.length === 0)),
  }
}

// Specialized hook for paginated data
export function usePaginatedData<T>(
  fetchFn: (page: number, limit: number) => Promise<T[]>,
  options: AsyncDataOptions<T[]> & { pageSize?: number } = {}
) {
  const [page, setPage] = useState(1)
  const [allData, setAllData] = useState<T[]>(options.initialData ?? [])
  const [hasMore, setHasMore] = useState(true)

  const pageSize = options.pageSize ?? 20

  const { data, loading, error, refetch } = useAsyncData(
    () => fetchFn(page, pageSize),
    [page, pageSize],
    {
      ...options,
      onSuccess: (newData) => {
        if (page === 1) {
          setAllData(newData)
        } else {
          setAllData(prev => [...prev, ...newData])
        }
        setHasMore(newData.length === pageSize)
        options.onSuccess?.(newData)
      },
    }
  )

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }, [loading, hasMore])

  const reset = useCallback(() => {
    setPage(1)
    setAllData(options.initialData ?? [])
    setHasMore(true)
  }, [options.initialData])

  return {
    data: allData,
    currentPageData: data,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    refetch,
    reset,
  }
}