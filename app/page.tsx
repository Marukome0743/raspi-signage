import SignageClient from "@/components/SignageClient"
import {
  getContentDataAdmin,
  getContentPixelSizeAdmin,
  getOrderIdAdmin,
} from "@/src/services/contents-admin"

interface PageProps {
  searchParams: Promise<{ areaId?: string }>
}

export default async function Signage({ searchParams }: PageProps) {
  const params = await searchParams
  const areaId = params.areaId ?? "0"

  const content = await getOrderIdAdmin(areaId)
  const orderList = await getContentDataAdmin(content.orderId)
  const contentsList = orderList ? orderList.set1 : []

  let cssPixelFlg = true
  if (content.pixelSizeId) {
    const pixelData = await getContentPixelSizeAdmin(content.pixelSizeId)
    if (pixelData) {
      cssPixelFlg = pixelData.getPixelFlg
    }
  }

  return (
    <SignageClient
      contentsList={contentsList}
      orderId={content.orderId}
      pixelSizeId={content.pixelSizeId ?? ""}
      cssPixelFlg={cssPixelFlg}
    />
  )
}
