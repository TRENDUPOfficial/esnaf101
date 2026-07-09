import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem" }}>
      <form action={login} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: 320 }}>
        <h1>Süper Admin Girişi</h1>
        {error && <p style={{ color: "crimson" }}>E-posta veya şifre hatalı.</p>}
        <input name="email" type="email" placeholder="E-posta" required />
        <input name="password" type="password" placeholder="Şifre" required />
        <button type="submit">Giriş yap</button>
      </form>
    </main>
  );
}
