import dynamic from "next/dynamic"

const ContentsView = dynamic(
  () => import("../../components/dashboard/AreaManagementComponent"),
  { ssr: false },
)

export async function getServerSideProps() {
  return {
    props: {
      dashboard: true,
    },
  }
}

function AreaManagement() {
  return <ContentsView />
}

export default AreaManagement
