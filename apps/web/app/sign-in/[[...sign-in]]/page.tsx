import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "3rem 1rem" }}>
      <SignIn />
    </main>
  );
}
