"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { confirmCode, requestLogin } from "./actions";

type Stage = "credentials" | "setup" | "verify";

export function LoginFlow() {
  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCredentialsSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await requestLogin(email, password);
    setPending(false);

    if (!result.ok || !result.tempToken) {
      setError(result.error ?? "Giriş başarısız");
      return;
    }

    setTempToken(result.tempToken);
    if (result.stage === "setup") {
      setOtpAuthUrl(result.otpAuthUrl ?? "");
      setSecret(result.secret ?? "");
      setStage("setup");
    } else {
      setStage("verify");
    }
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await confirmCode(tempToken, code);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Doğrulama başarısız");
    }
    // Başarılı olursa confirmCode zaten yönlendiriyor.
  }

  if (stage === "credentials") {
    return (
      <form onSubmit={handleCredentialsSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: 320 }}>
        <h1>Süper Admin Girişi</h1>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={pending}>
          {pending ? "..." : "Devam et"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCodeSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: 380 }}>
      <h1>{stage === "setup" ? "İki Adımlı Doğrulama Kurulumu" : "Doğrulama Kodu"}</h1>
      {stage === "setup" && (
        <>
          <p>
            Google Authenticator / Authy gibi bir doğrulayıcı uygulamada &quot;elle gir&quot; seçeneğiyle bu sırrı
            ekleyin, sonra uygulamanın gösterdiği 6 haneli kodu girin. Bu ekranı tekrar göremeyeceksiniz.
          </p>
          <code style={{ wordBreak: "break-all", background: "rgba(128,128,128,0.15)", padding: "0.5rem", borderRadius: 4 }}>
            {secret}
          </code>
          <p style={{ fontSize: "0.75rem", opacity: 0.7, wordBreak: "break-all" }}>{otpAuthUrl}</p>
        </>
      )}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <input
        type="text"
        inputMode="numeric"
        placeholder="6 haneli kod"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
        required
        autoFocus
      />
      <button type="submit" disabled={pending}>
        {pending ? "..." : "Doğrula"}
      </button>
    </form>
  );
}
