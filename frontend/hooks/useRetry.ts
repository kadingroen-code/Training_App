import { useState, useCallback } from 'react'

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  onRetry?: (attempt: number) => void
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): [T, { retrying: boolean; retryCount: number }] {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options
  const [retrying, setRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const retryFn = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      let lastError: Error | null = null
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            setRetrying(true)
            setRetryCount(attempt)
            onRetry?.(attempt)
            await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt))
          }
          
          const result = await fn(...args)
          setRetrying(false)
          setRetryCount(0)
          return result
        } catch (error) {
          lastError = error as Error
          if (attempt === maxRetries) {
            setRetrying(false)
            throw lastError
          }
        }
      }
      
      setRetrying(false)
      throw lastError || new Error('Retry failed')
    },
    [fn, maxRetries, retryDelay, onRetry]
  ) as T

  return [retryFn, { retrying, retryCount }]
}
