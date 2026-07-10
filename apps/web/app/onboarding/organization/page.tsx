import { CreateOrganization } from "@clerk/nextjs";
import { CenteredLayout } from "../../../components/CenteredLayout";

export default function CreateOrganizationPage() {
  return (
    <CenteredLayout>
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-slate-900">İşletmenizi oluşturun</h1>
        <p className="mt-1 text-sm text-slate-500">
          Esnaf101&apos;i kullanabilmek için önce işletmenizi (satıcı hesabınızı) tanımlamanız gerekiyor.
        </p>
      </div>
      <CreateOrganization afterCreateOrganizationUrl="/onboarding/settings" skipInvitationScreen />
    </CenteredLayout>
  );
}
