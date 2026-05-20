'use client'

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">500</h1>
        <span className="font-medium">Oops! Something went wrong!</span>
        <p className="text-center text-muted-foreground">
          An unexpected error occurred. <br />
          Please try again later.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 