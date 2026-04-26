export class DataAccessError extends Error {
  constructor(
    message: string,
    public readonly code: string | null = null,
    public readonly details: string | null = null,
  ) {
    super(message)
    this.name = "DataAccessError"
  }
}

export function handleDataError(error: {
  message: string
  code?: string
  details?: string
}): never {
  throw new DataAccessError(
    error.message,
    error.code ?? null,
    error.details ?? null,
  )
}
