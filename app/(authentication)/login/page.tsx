import { SignInPage } from "@/components/auth/Login";
import authPic from "../../../public/auth.jpg";

const page = () => {
  return <SignInPage heroImageSrc={authPic.src} />;
};

export default page;
