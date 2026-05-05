import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"
import { mapContentToListItem } from "@/src/services/content-helpers"

describe("Property 5: Content to ContentListItem mapping consistency", () => {
  test("for any Content, mapping preserves all field values", () => {
    const contentArb = fc.record({
      area_id: fc.string({ minLength: 1 }),
      area_name: fc.string({ minLength: 1 }),
      order_id: fc.string({ minLength: 1 }),
      pixel_size_id: fc.oneof(fc.string({ minLength: 1 }), fc.constant(null)),
      deleted: fc.boolean(),
    })

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = mapContentToListItem(content)
        expect(result.areaId).toBe(content.area_id)
        expect(result.areaName).toBe(content.area_name)
        expect(result.orderId).toBe(content.order_id)
        expect(result.pixelSizeId).toBe(content.pixel_size_id)
        expect(result.delete).toBe(content.deleted)
      }),
      { numRuns: 100 },
    )
  })
})
