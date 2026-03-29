import dynamic from "next/dynamic"

const Upload = dynamic(
  () => import("../../components/dashboard/UplaodContents"),
  { ssr: false },
)

export async function getServerSideProps() {
  return {
    props: {
      dashboard: true,
      areaDisplay: true,
    },
  }
}

function UploadContent() {
  return <Upload />
}

export default UploadContent
