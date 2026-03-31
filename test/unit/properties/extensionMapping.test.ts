import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"
import { mapExtension } from "../../../utilities/mapExtension"

describe("Property 1: Extension mapping correctness", () => {
  test("always returns .tsx when containsJsx=true", () => {
    fc.assert(
      fc.property(fc.string(), (fileName) => {
        expect(mapExtension(fileName, true)).toBe(".tsx")
      }),
      { numRuns: 100 },
    )
  })

  test("always returns .ts when containsJsx=false", () => {
    fc.assert(
      fc.property(fc.string(), (fileName) => {
        expect(mapExtension(fileName, false)).toBe(".ts")
      }),
      { numRuns: 100 },
    )
  })

  test("returns correct extension for any filename and JSX flag combination", () => {
    fc.assert(
      fc.property(fc.string(), fc.boolean(), (fileName, containsJsx) => {
        const result = mapExtension(fileName, containsJsx)
        if (containsJsx) {
          expect(result).toBe(".tsx")
        } else {
          expect(result).toBe(".ts")
        }
      }),
      { numRuns: 100 },
    )
  })
})
