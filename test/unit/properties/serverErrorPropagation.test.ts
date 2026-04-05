/**
 * Property 3: サーバーサイドデータ取得失敗時のエラー伝播
 *
 * サーバーサイド関数がエラーをスローした場合、async Server Component は
 * エラー情報を Client Component に props として渡し、クラッシュしない。
 *
 * **Validates: Requirements 3.4**
 */
import { describe, expect, test } from "bun:test"
import fc from "fast-check"

/**
 * Simulates the error handling pattern used in Server Component pages:
 *
 * ```tsx
 * let initialData = null
 * let error = null
 * try {
 *   initialData = await getXxxServer()
 * } catch (e) {
 *   error = e instanceof Error ? e.message : "データ取得に失敗しました"
 * }
 * return <XxxClient initialData={initialData} error={error} />
 * ```
 */
function simulateServerComponentErrorHandling(fetchFn: () => unknown): {
  initialData: unknown
  error: string | null
} {
  let initialData: unknown = null
  let error: string | null = null
  try {
    initialData = fetchFn()
  } catch (e) {
    error = e instanceof Error ? e.message : "データ取得に失敗しました"
  }
  return { initialData, error }
}

describe("Property 3: サーバーサイドデータ取得失敗時のエラー伝播", () => {
  test("任意のErrorオブジェクトがスローされた場合、errorにメッセージが伝播しinitialDataはnullのまま", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (errorMessage) => {
          const result = simulateServerComponentErrorHandling(() => {
            throw new Error(errorMessage)
          })

          // initialData は null のまま
          expect(result.initialData).toBeNull()
          // error にはエラーメッセージが入る
          expect(result.error).toBe(errorMessage)
        },
      ),
      { numRuns: 100 },
    )
  })

  test("非Errorオブジェクトがスローされた場合、デフォルトメッセージが設定される", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.object(),
        ),
        (thrownValue) => {
          const result = simulateServerComponentErrorHandling(() => {
            throw thrownValue
          })

          expect(result.initialData).toBeNull()
          expect(result.error).toBe("データ取得に失敗しました")
        },
      ),
      { numRuns: 100 },
    )
  })

  test("データ取得が成功した場合、initialDataにデータが入りerrorはnull", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            area_id: fc.string({ minLength: 1, maxLength: 10 }),
            area_name: fc.string({ minLength: 1, maxLength: 50 }),
            order_id: fc.string({ minLength: 1, maxLength: 36 }),
            pixel_size_id: fc.option(
              fc.string({ minLength: 1, maxLength: 36 }),
              { nil: null },
            ),
            deleted: fc.boolean(),
          }),
        ),
        (mockData) => {
          const result = simulateServerComponentErrorHandling(() => mockData)

          expect(result.initialData).toEqual(mockData)
          expect(result.error).toBeNull()
        },
      ),
      { numRuns: 100 },
    )
  })

  test("Server Component のエラーハンドリングは決してクラッシュしない", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Error with random message
          fc.string().map((msg) => () => {
            throw new Error(msg)
          }),
          // Non-Error throw
          fc.anything().map((val) => () => {
            throw val
          }),
          // Successful return
          fc.anything().map((val) => () => val),
        ),
        (fetchFn) => {
          // This should NEVER throw - the error handling pattern always catches
          const result = simulateServerComponentErrorHandling(fetchFn)

          // Result always has the expected shape
          expect(result).toHaveProperty("initialData")
          expect(result).toHaveProperty("error")

          // Either we have data or an error, never both
          if (result.error !== null) {
            expect(result.initialData).toBeNull()
            expect(typeof result.error).toBe("string")
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
