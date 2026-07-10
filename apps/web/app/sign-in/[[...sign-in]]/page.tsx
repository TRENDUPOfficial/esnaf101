import { SignIn } from "@clerk/nextjs";
import { CenteredLayout } from "../../../components/CenteredLayout";

export default function SignInPage() {
  return (
    <CenteredLayout>
      <SignIn />
    </CenteredLayout>
  );
}
