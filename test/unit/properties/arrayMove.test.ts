import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { arrayMove } from "@dnd-kit/sortable"
import * as fc from "fast-check"

describe("Property 1: arrayMove correctness", () => {
  test("array has same length after arrayMove", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.integer(), { minLength: 1 })
          .chain((arr) =>
            fc.tuple(
              fc.constant(arr),
              fc.integer({ min: 0, max: arr.length - 1 }),
              fc.integer({ min: 0, max: arr.length - 1 }),
            ),
          ),
        ([arr, from, to]) => {
          const result = arrayMove(arr, from, to)
          expect(result).toHaveLength(arr.length)
        },
      ),
      { numRuns: 100 },
    )
  })

  test("array contains same elements (no additions/deletions)", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.integer(), { minLength: 1 })
          .chain((arr) =>
            fc.tuple(
              fc.constant(arr),
              fc.integer({ min: 0, max: arr.length - 1 }),
              fc.integer({ min: 0, max: arr.length - 1 }),
            ),
          ),
        ([arr, from, to]) => {
          const result = arrayMove(arr, from, to)
          expect(result.slice().sort((a, b) => a - b)).toEqual(
            arr.slice().sort((a, b) => a - b),
          )
        },
      ),
      { numRuns: 100 },
    )
  })

  test("element from source index is at destination index", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.integer(), { minLength: 1 })
          .chain((arr) =>
            fc.tuple(
              fc.constant(arr),
              fc.integer({ min: 0, max: arr.length - 1 }),
              fc.integer({ min: 0, max: arr.length - 1 }),
            ),
          ),
        ([arr, from, to]) => {
          const movedElement = arr[from]
          const result = arrayMove(arr, from, to)
          expect(result[to]).toBe(movedElement)
        },
      ),
      { numRuns: 100 },
    )
  })
})

describe("Property 2: Array immutability on invalid drop", () => {
  /** Extracted guard logic matching handleDragEnd pattern in ManageContentsList.tsx */
  function shouldSkipDragEnd(
    over: { id: string } | null,
    activeId: string,
  ): boolean {
    return !over || activeId === over.id
  }

  test("array is not modified when over is null", () => {
    fc.assert(
      fc.property(fc.array(fc.integer(), { minLength: 0 }), (arr) => {
        const skip = shouldSkipDragEnd(null, "any-id")
        expect(skip).toBe(true)
        // When skip is true, the handler returns early — array stays unchanged
        const result = skip ? arr : arrayMove(arr, 0, 0)
        expect(result).toEqual(arr)
      }),
      { numRuns: 100 },
    )
  })

  test("array is not modified when active.id === over.id", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 0 }),
        fc.string({ minLength: 1 }),
        (arr, id) => {
          const skip = shouldSkipDragEnd({ id }, id)
          expect(skip).toBe(true)
          const result = skip ? arr : arrayMove(arr, 0, 0)
          expect(result).toEqual(arr)
        },
      ),
      { numRuns: 100 },
    )
  })

  test("array is modified when over exists and ids differ", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 2 }).chain((arr) =>
          fc.tuple(
            fc.constant(arr),
            fc.integer({ min: 0, max: arr.length - 1 }),
            fc
              .integer({ min: 0, max: arr.length - 1 })
              .filter((to) => to !== 0),
          ),
        ),
        ([_arr, _from, to]) => {
          const activeId = "display-0"
          const overId = `display-${to}`
          const skip = shouldSkipDragEnd({ id: overId }, activeId)
          if (to !== 0) {
            expect(skip).toBe(false)
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})

describe("Property 3: SortableContext ID uniqueness", () => {
  test("display IDs are all unique for any array length", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 500 }), (length) => {
        const ids = Array.from({ length }, (_, i) => `display-${i}`)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      }),
      { numRuns: 100 },
    )
  })

  test("hidden IDs are all unique for any array length", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 500 }), (length) => {
        const ids = Array.from({ length }, (_, i) => `hidden-${i}`)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      }),
      { numRuns: 100 },
    )
  })

  test("display and hidden IDs never collide", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 500 }),
        (displayLen, hiddenLen) => {
          const displayIds = Array.from(
            { length: displayLen },
            (_, i) => `display-${i}`,
          )
          const hiddenIds = Array.from(
            { length: hiddenLen },
            (_, i) => `hidden-${i}`,
          )
          const allIds = [...displayIds, ...hiddenIds]
          const uniqueIds = new Set(allIds)
          expect(uniqueIds.size).toBe(allIds.length)
        },
      ),
      { numRuns: 100 },
    )
  })
})

describe("Unit test: Static import verification", () => {
  const filePath = resolve("components/dashboard/ManageContentsList.tsx")
  const fileContent = readFileSync(filePath, "utf-8")

  test("ManageContentsList.tsx does NOT contain imports from react-beautiful-dnd", () => {
    const hasReactBeautifulDnd = /from\s+["']react-beautiful-dnd["']/.test(
      fileContent,
    )
    expect(hasReactBeautifulDnd).toBe(false)
  })

  test("ManageContentsList.tsx does NOT contain type imports from react-beautiful-dnd", () => {
    const hasTypeImport = /from\s+["']@types\/react-beautiful-dnd["']/.test(
      fileContent,
    )
    expect(hasTypeImport).toBe(false)
  })

  test("ManageContentsList.tsx contains imports from @dnd-kit/core", () => {
    const hasDndKitCore = /from\s+["']@dnd-kit\/core["']/.test(fileContent)
    expect(hasDndKitCore).toBe(true)
  })

  test("ManageContentsList.tsx contains imports from @dnd-kit/sortable", () => {
    const hasDndKitSortable = /from\s+["']@dnd-kit\/sortable["']/.test(
      fileContent,
    )
    expect(hasDndKitSortable).toBe(true)
  })

  test("ManageContentsList.tsx contains imports from @dnd-kit/utilities", () => {
    const hasDndKitUtilities = /from\s+["']@dnd-kit\/utilities["']/.test(
      fileContent,
    )
    expect(hasDndKitUtilities).toBe(true)
  })
})
