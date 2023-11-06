import dynamic from "next/dynamic";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ContentsView = dynamic(() => import("../../components/dashboard/PasswordResetComponent"), { ssr: false });

export async function getServerSideProps() {
    return {
        props: {
            dashboard: true,
            isPass: true,
        }
    }
}

const theme = createTheme();

function PasswordReset() {


  return (
    <ThemeProvider theme={theme}>
       <ContentsView />
    </ThemeProvider>
  );
}

export default PasswordReset;