import { CreateOrganization } from "@clerk/nextjs";

export default function CreateOrganizationPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1rem", gap: "1rem" }}>
      <h1>İşletmenizi oluşturun</h1>
      <p>Esnaf101&apos;i kullanabilmek için önce işletmenizi (satıcı hesabınızı) tanımlamanız gerekiyor.</p>
      <CreateOrganization afterCreateOrganizationUrl="/onboarding/settings" skipInvitationScreen />
    </main>
  );
}
