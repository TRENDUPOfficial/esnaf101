import { SignUp } from "@clerk/nextjs";
import { CenteredLayout } from "../../../components/CenteredLayout";

export default function SignUpPage() {
  return (
    <CenteredLayout>
      <SignUp />
    </CenteredLayout>
  );
}
