// Feature: codebase-refactoring, Property 4: Supabaseクエリのエラー伝播
import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"
import { handleSupabaseError, SupabaseQueryError } from "@/src/services/errors"

describe("Property 4: Supabaseクエリのエラー伝播", () => {
  test("handleSupabaseError always throws SupabaseQueryError with correct fields", () => {
    const errorArb = fc.record({
      message: fc.string({ minLength: 1 }),
      code: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
      details: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
    })

    fc.assert(
      fc.property(errorArb, (error) => {
        try {
          handleSupabaseError(error)
          // Should never reach here
          expect(true).toBe(false)
        } catch (e) {
          expect(e).toBeInstanceOf(SupabaseQueryError)
          const sqe = e as SupabaseQueryError
          expect(sqe.message).toBe(error.message)
          expect(sqe.code).toBe(error.code ?? null)
          expect(sqe.details).toBe(error.details ?? null)
        }
      }),
      { numRuns: 100 },
    )
  })

  test("SupabaseQueryError has name 'SupabaseQueryError'", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (msg) => {
        const err = new SupabaseQueryError(msg, null, null)
        expect(err.name).toBe("SupabaseQueryError")
        expect(err).toBeInstanceOf(Error)
      }),
      { numRuns: 100 },
    )
  })
})
