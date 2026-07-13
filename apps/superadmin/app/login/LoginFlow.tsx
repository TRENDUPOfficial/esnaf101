"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import QRCode from "qrcode";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Field";
import { AlertIcon } from "../../components/icons";
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
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!otpAuthUrl) return;
    // TOTP sırrı hiçbir zaman tarayıcı dışına (üçüncü bir servise) gönderilmez —
    // QR kod tamamen istemci tarafında üretilir.
    QRCode.toDataURL(otpAuthUrl, { width: 200, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [otpAuthUrl]);

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
      <Card className="w-full max-w-sm">
        <CardHeader title="Giriş yap" description="Süper admin hesabınızla devam edin" />
        <CardBody>
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-rose-600">
                <AlertIcon className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "..." : "Devam et"}
            </Button>
          </form>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader
        title={stage === "setup" ? "İki adımlı doğrulama kurulumu" : "Doğrulama kodu"}
        description={
          stage === "setup"
            ? "Google Authenticator / Authy gibi bir uygulamada \"elle gir\" seçeneğiyle bu sırrı ekleyin, sonra kodu girin."
            : "Doğrulayıcı uygulamanızdaki 6 haneli kodu girin"
        }
      />
      <CardBody>
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          {stage === "setup" && (
            <div className="space-y-3 rounded-lg bg-slate-50 p-3">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="TOTP QR kodu" className="mx-auto h-[200px] w-[200px]" />
              )}
              <p className="text-center text-xs text-slate-500">
                Kare kodu okutamıyorsanız uygulamada &quot;elle gir&quot; ile aşağıdaki sırrı girin:
              </p>
              <code className="block break-all text-xs text-slate-700">{secret}</code>
            </div>
          )}
          <div>
            <Label htmlFor="code">6 haneli kod</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
              className="w-full text-center text-lg tracking-[0.5em]"
            />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-rose-600">
              <AlertIcon className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "..." : "Doğrula"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
