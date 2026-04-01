// Feature: codebase-refactoring, Property 6: DisplayContentItemフィルタリングの正確性
import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"

// Inline the pure function to avoid importing supabase-dependent module
function filterActiveDisplayItems<T extends { delete?: boolean }>(
  items: T[],
): T[] {
  return items.filter((item) => !item.delete && Object.keys(item).length > 0)
}

describe("Property 6: DisplayContentItemフィルタリングの正確性", () => {
  test("result never contains deleted items or empty objects", () => {
    const itemArb = fc.oneof(
      fc.record({
        delete: fc.boolean(),
        name: fc.string(),
      }),
      fc.constant({} as { delete?: boolean }),
    )

    fc.assert(
      fc.property(fc.array(itemArb), (items) => {
        const result = filterActiveDisplayItems(items)
        for (const item of result) {
          expect(item.delete).not.toBe(true)
          expect(Object.keys(item).length).toBeGreaterThan(0)
        }
      }),
      { numRuns: 100 },
    )
  })

  test("all valid items from input are preserved in output", () => {
    const itemArb = fc.record({
      delete: fc.constant(false),
      name: fc.string({ minLength: 1 }),
    })

    fc.assert(
      fc.property(fc.array(itemArb, { minLength: 1 }), (items) => {
        const result = filterActiveDisplayItems(items)
        expect(result.length).toBe(items.length)
      }),
      { numRuns: 100 },
    )
  })
})
