export class SupabaseQueryError extends Error {
  constructor(
    message: string,
    public readonly code: string | null,
    public readonly details: string | null,
  ) {
    super(message)
    this.name = "SupabaseQueryError"
  }
}

export function handleSupabaseError(error: {
  message: string
  code?: string
  details?: string
}): never {
  throw new SupabaseQueryError(
    error.message,
    error.code ?? null,
    error.details ?? null,
  )
}
