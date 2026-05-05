import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"
import { DataAccessError, handleDataError } from "@/src/services/errors"

describe("Property 4: Data access error propagation", () => {
  test("handleDataError always throws DataAccessError with correct fields", () => {
    const errorArb = fc.record({
      message: fc.string({ minLength: 1 }),
      code: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
      details: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
    })

    fc.assert(
      fc.property(errorArb, (error) => {
        try {
          handleDataError(error)
          // Should never reach here
          expect(true).toBe(false)
        } catch (e) {
          expect(e).toBeInstanceOf(DataAccessError)
          const dae = e as DataAccessError
          expect(dae.message).toBe(error.message)
          expect(dae.code).toBe(error.code ?? null)
          expect(dae.details).toBe(error.details ?? null)
        }
      }),
      { numRuns: 100 },
    )
  })

  test("DataAccessError has name 'DataAccessError'", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (msg) => {
        const err = new DataAccessError(msg, null, null)
        expect(err.name).toBe("DataAccessError")
        expect(err).toBeInstanceOf(Error)
      }),
      { numRuns: 100 },
    )
  })
})
