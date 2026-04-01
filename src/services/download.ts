import { createClient } from "@/src/supabase/client"

const BUCKET = "signage-contents"

export const downLoadURLList = async ({
  areaId,
}: {
  areaId: string
}): Promise<string[]> => {
  const supabase = createClient()
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(areaId)
  if (error || !files) {
    return []
  }

  return files.map((file) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(`${areaId}/${file.name}`)
    return publicUrl
  })
}
