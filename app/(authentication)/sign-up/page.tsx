import authPic from "../../../public/auth.jpg";
import { SignUpPage } from "@/components/auth/SignUp";

const page = () => {
  return <SignUpPage heroImageSrc={authPic.src} />;
};

export default page;
