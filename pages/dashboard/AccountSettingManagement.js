import dynamic from "next/dynamic"

const ContentsView = dynamic(
  () => import("../../components/dashboard/AccountSettingManagementComponent"),
  { ssr: false },
)

export async function getServerSideProps() {
  return {
    props: {
      dashboard: true,
    },
  }
}

function AccountSettingManagement() {
  return <ContentsView />
}

export default AccountSettingManagement
