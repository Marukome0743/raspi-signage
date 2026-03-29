import dynamic from "next/dynamic"

const ContentsView = dynamic(
  () => import("../../components/dashboard/ViewPostionComponent"),
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

function ViewPosition() {
  return <ContentsView />
}

export default ViewPosition
