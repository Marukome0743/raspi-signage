import dynamic from "next/dynamic"

const ContentsView = dynamic(
  () => import("../../components/dashboard/UserAccountManagementComponent"),
  { ssr: false },
)

export async function getServerSideProps() {
  return {
    props: {
      dashboard: true,
    },
  }
}

function UserAccountManagement() {
  return <ContentsView />
}

export default UserAccountManagement
