# Esnaf101 — Mezat/Canlı Yayın Sipariş Otomasyonu (Çok Kiracılı SaaS) Planı

> Bu dosya, Claude Code ile önceden yapılan planlama oturumunun tam kaydıdır.
> Yeni bir Claude Code oturumu (örn. GitHub Codespaces içinde) başladığında
> önce bu dosyayı oku — proje bağlamı, mimari kararlar ve yapım sırası burada.

## Bağlam (Context)

Kullanıcı, TikTok gibi platformlarda canlı yayınla mezat usulü ürün satan işletmelerin
(kendi işi değil, bir tanıdığının iş akışından esinlenerek) sipariş sürecini uçtan uca
otomatikleştiren bir sistemi **ürünleştirip başka satıcılara abonelik ile satmak** istiyor.
Yani bu bir SaaS ürünü olacak — her satıcı (tenant) kendi WhatsApp hattı, kendi muhasebe/
kargo entegrasyonu ve kendi müşteri kaydıyla platformu kullanacak.

Mevcut iş akışı (otomatikleştirilecek kısım):
1. Müşteri canlı yayında gördüğü ürünün ekran görüntüsüyle WhatsApp'tan yazıyor.
2. Sistem müşteriyi telefon numarasından (WhatsApp wa_id) tanıyor — daha önce kayıtlıysa
   isim/adres tekrar sorulmuyor; yeni müşteriyse ad-soyad ve açık adres toplanıyor.
3. Satıcı (insan) canlı yayında ürünün fiyatını sesli söylüyor; bu fiyat sisteme
   (personel panelinden) giriliyor ve siparişe bağlanıyor.
4. Belirlenen fiyat üzerinden muhasebe/e-fatura API'si ile fatura kesiliyor.
5. Müşteriye ödeme için IBAN bilgisi WhatsApp üzerinden otomatik gönderiliyor; müşteri
   havale/EFT ile ödemeyi kendisi yapıyor (sistem içi online ödeme entegrasyonu yok).
   Ödeme yapıldıktan sonra ürün gönderimi gerçekleşiyor ve bu noktadan sonra sipariş
   iptal edilemiyor (iade/iptal akışı MVP kapsamı dışında, iş kuralı olarak kilitli).
6. Kargo firması/entegratör API'si ile etiket oluşturuluyor, sipariş kargoya veriliyor
   ve takip numarası/linki WhatsApp üzerinden müşteriye otomatik bildiriliyor.

Hedef: Bu akışın tamamını (uçtan uca) kapsayan, birden fazla satıcının (tenant) abone
olup kullanabileceği bir web tabanlı ürün inşa etmek. İlk aşamada MVP kapsamı uçtan uca
otomasyonun tamamını içerecek (WhatsApp + müşteri tanıma + fiyat girişi + fatura + kargo).

Ürün adı **Esnaf101** olacak; kullanıcının halihazırda sahip olduğu **www.esnaf101.com**
alan adı üzerinden yayına alınacak. Kod, kullanıcının GitHub hesabındaki
`TRENDUPOfficial/esnaf101` deposunda barındırılıyor. Geliştirme ortamı olarak yerel
Windows makinesi yerine **GitHub Codespaces** kullanılıyor (yerel makinede git/node/
docker kurulu değildi ve kurulum sorunları yaşandı — Codespaces bu araçları hazır
getirdiği için tercih edildi).

**Not:** Depoda halihazırda basit bir Streamlit + Google Sheets prototipi (`app.py`,
`requirements.txt`) bulunuyordu — telefonla müşteri arama, ürün/fiyat seçme ve simüle
(gerçek API'siz) fatura/kargo sonucu gösteren tek kullanıcılı bir deneme paneli. Kullanıcı
bunun eski/deneme amaçlı olduğunu, sıfırdan başlanmasını istediğini belirtti — bu dosyalar
kaldırılıp yerine aşağıdaki NestJS/Next.js/PostgreSQL çok kiracılı mimarisi kurulacak.

Alan adı yapısı: `esnaf101.com` pazarlama/tanıtım sitesi, `app.esnaf101.com` tenant
(satıcı) admin paneli, `admin.esnaf101.com` süper admin (platform sahibi) paneli,
`api.esnaf101.com` backend API — tek bir domain altında subdomain ayrımıyla tenant
paneli ile süper admin paneli birbirinden ağ seviyesinde de ayrılmış olacak.

## Mimari Kararlar

- **Dil/Framework**: TypeScript tüm yığında.
  - Backend API: **NestJS** (modüler yapı, multi-tenant için guard/middleware desteği,
    queue entegrasyonu kolay).
  - Admin/Panel arayüzü: **Next.js** (satıcıların sipariş, müşteri, entegrasyon
    ayarlarını yönettiği web paneli).
  - Arka plan işleri: **BullMQ + Redis** (WhatsApp webhook işleme, fatura kesme, kargo
    etiketi oluşturma gibi API çağrılarını asenkron ve tekrar denenebilir yapmak için —
    üçüncü parti API'ler zaman zaman başarısız olur, senkron çağırmak kullanıcı deneyimini
    ve güvenilirliği bozar).
  - Veritabanı: **PostgreSQL**, her tabloda `tenant_id` ile satır bazlı çok kiracılı
    izolasyon (Row-Level Security ile desteklenecek).
  - Dosya depolama: Ekran görüntüleri için S3 uyumlu obje depolama (örn. Cloudflare R2 —
    ucuz ve S3 API uyumlu).

- **WhatsApp entegrasyonu**: **Meta WhatsApp Business Platform (Cloud API)** resmi API.
  Üçüncü parti sarmalayıcılar (Twilio vb.) yerine doğrudan Meta API önerilir çünkü:
  her tenant'ın kendi WhatsApp numarasını bağlayabilmesi (Embedded Signup akışı) resmi
  API ile daha native destekleniyor ve uzun vadede maliyet daha düşük. Konuşma başına
  ücretlendirme modeli tenant'lara yansıtılacak maliyet kalemi olarak planlanmalı.

- **Muhasebe/e-Fatura**: Adaptör deseni (`InvoiceProvider` interface) ile başlangıçta
  **Paraşüt API** desteklenecek (Türkiye'de yaygın, iyi dokümante edilmiş REST API'si var).
  Adaptör deseni sayesinde ileride Nilvera, Logo, Mikro gibi sağlayıcılar eklenebilir —
  her tenant kendi muhasebe sağlayıcısını panelden seçip API anahtarını girecek.

- **Kargo**: Adaptör deseni ile başlangıçta **Shipentegra** (çoklu kargo firmasını tek
  API ile destekleyen entegratör — tenant'ların farklı kargo firmalarıyla anlaşmalı
  olması ihtimaline karşı tek entegrasyonla çoklu firma desteği sağlar). Aynı adaptör
  deseniyle ileride doğrudan Yurtiçi/Aras API'leri eklenebilir.

- **Kimlik doğrulama**: Tenant + kullanıcı (satıcı personeli) modeli. Panel girişi için
  **Auth.js (NextAuth)** veya **Clerk** (organizasyon/multi-tenant desteği hazır gelir,
  geliştirme hızını artırır) — Clerk önerilir çünkü WhatsApp/fatura/kargo entegrasyonlarına
  odaklanmak gerekiyor, kimlik doğrulamayı sıfırdan yazmaya gerek yok.

- **Tenant abonelik faturalama (süper admin)**: Sizin (platform sahibi) tenant'lardan
  (satıcılardan) otomatik kredi kartı ile abonelik ücreti tahsil etmeniz için **iyzico
  Abonelik (Subscription) API**'si kullanılacak (Türkiye'de TL ile kart saklama/otomatik
  tekrarlı tahsilat için Stripe'a göre daha uygun — Stripe'ın Türkiye'de kart saklama ve
  yerel banka desteği kısıtlı). Başarılı otomatik tahsilatta tenant'ın erişim bitiş
  tarihi (`active_until`) otomatik olarak bir sonraki döneme uzatılacak; ödeme
  başarısız olursa tenant'a bildirim gidecek ve birkaç deneme sonrası erişim
  askıya alınacak (dunning mantığı).

- **Barındırma**: Başlangıçta **Railway** veya **Render** (Postgres + Redis + Node
  servisleri tek platformda, Docker Compose ile yerelde birebir simüle edilir). Hacim
  büyüdükçe AWS/DigitalOcean'a taşınabilir. CI/CD GitHub Actions ile bağlanacak. DNS
  esnaf101.com üzerinde yukarıdaki subdomain'lere (app/admin/api) yönlendirilecek şekilde
  yapılandırılacak.

## Veri Modeli (özet)

- `tenants` — satıcı işletmeler (ad, plan, ayarlar)
- `tenant_integrations` — her tenant için WhatsApp numarası, seçilen fatura/kargo
  sağlayıcısı ve şifrelenmiş API anahtarları
- `customers` — `tenant_id` + `whatsapp_wa_id` (unique per tenant) + ad-soyad + açık adres
- `products` — tenant'ın ürün master datası: ad, SKU/kod, açıklama, (varsa) barkod,
  varsayılan/liste fiyatı, kategori, ve **opsiyonel** stok adedi (tenant, stok takibini
  kurulum sırasında açıp açmayacağını seçer — bkz. `tenant_integrations`/ayarlar).
  Personel fiyat girişi ekranında bu listeden arama yaparak veya yeni ürün ekleyerek
  siparişe bağlanacak; stok takibi açıksa ürün satıldığında stok otomatik düşecek ve
  stok tükenince bot yeni siparişlerde "stok tükendi" bilgisini verecek.
- `orders` — `tenant_id`, `customer_id`, `product_id` (nullable — eşleşme yapılana kadar
  boş kalabilir), ekran görüntüsü URL'si, serbest metin ürün açıklaması (ilk mesajdan),
  fiyat (personel girişi), durum (yeni → ürün/fiyat bekliyor → fatura kesildi → ödeme
  bekleniyor → ödendi (kilitli, iptal edilemez) → kargolandı)
- `invoices` — `order_id`, sağlayıcı, dış referans no, PDF/URL
- `shipments` — `order_id`, kargo firması, takip no, etiket URL'si
- `conversation_states` — WhatsApp bot'un müşteriyle nerede kaldığını takip eden basit
  durum makinesi (örn. `awaiting_screenshot`, `awaiting_name`, `awaiting_address`, `done`)
- `tenant_settings` — tenant bazlı açma/kapama tercihleri: stok takibi aktif mi, IBAN
  bilgisi (ödeme talimatı mesajında kullanılacak), kargo bildirim mesaj şablonu vb.
- `platform_admins` — sizin (platform sahibi) süper admin panelinize giriş yapabilecek
  kullanıcılar; tenant kullanıcılarından tamamen ayrı bir kimlik/rol alanı.
- `subscription_plans` — süper adminin tanımladığı paketler (ad, aylık ücret, limitler).
- `subscriptions` — `tenant_id`, `plan_id`, durum (aktif/askıda/iptal), `active_until`,
  iyzico'da saklanan kart referansı (kart bilgisi kendi veritabanınızda tutulmaz, sadece
  iyzico'nun döndürdüğü token saklanır).
- `subscription_payments` — her otomatik tahsilat denemesinin kaydı (başarılı/başarısız,
  tutar, tarih) — süper admin panelinde denetim ve gelir raporlaması için.

## Uygulama Yapısı (repo iskeleti)

```
/apps
  /api        (NestJS — webhook, tenant/customer/order yönetimi, queue producer)
  /worker     (BullMQ worker — fatura kesme, kargo etiketi, WhatsApp mesaj gönderimi)
  /web        (Next.js admin paneli — tenant kullanıcıları için)
  /superadmin (Next.js süper admin paneli — sizin için: tenant yönetimi + abonelik
               faturalama; tenant panelinden tamamen ayrı bir uygulama, ayrı auth)
/packages
  /db         (Prisma şema + migration'lar, paylaşılan tip tanımları)
  /integrations
    /whatsapp     (Meta Cloud API client + webhook doğrulama)
    /invoicing    (InvoiceProvider interface + Parasut adaptörü)
    /shipping     (ShippingProvider interface + Shipentegra adaptörü)
    /billing      (iyzico Abonelik API client — kart saklama, otomatik tahsilat, webhook)
docker-compose.yml
```

## MVP Uçtan Uca Akış — Yapım Sırası

0. **GitHub bağlantısı** — tamamlandı: repo `TRENDUPOfficial/esnaf101`, geliştirme
   GitHub Codespaces üzerinde yapılacak (yerel araç kurulum sorunları nedeniyle).
1. **Temel iskelet**: Eski prototip dosyalarının (`app.py`, `requirements.txt`)
   kaldırılması, monorepo kurulumu (pnpm workspaces), Prisma şema (yukarıdaki veri
   modeli), Docker Compose (Postgres+Redis).
2. **Tenant & auth**: Tenant kayıt/onboarding akışı (bu adımda stok takibi
   aktif/pasif tercihi ve IBAN bilgisi de alınacak), Clerk entegrasyonu, tenant bazlı
   yetkilendirme middleware'i.
3. **WhatsApp webhook + konuşma botu**: Meta webhook alıcı, imza doğrulama, gelen mesajı
   `conversation_states`'e göre yönlendiren durum makinesi:
   - Telefon numarasından müşteri var mı sorgusu (varsa isim/adres adımını atla)
   - Ekran görüntüsü alma → obje depolamaya yükleme
   - Yeni müşteriyse ad-soyad + açık adres toplama
   - Sipariş kaydı oluşturma (durum: fiyat bekliyor)
4. **Ürün master data + personel fiyat girişi**: Tenant'ın ürünlerini (ad, kod, liste
   fiyatı, opsiyonel stok adedi) yönetebileceği basit bir ürün tanımlama ekranı. Admin
   panelinde bekleyen siparişler listesinde personel, ekran görüntüsüne bakarak ürünü
   listeden arayıp seçiyor (veya listede yoksa hızlıca yeni ürün ekliyor) ve o anki
   satış fiyatını girip siparişi onaylıyor (durum: fatura bekliyor). Ürün seçimi arama/
   otomatik tamamlama (autocomplete) ile yapılacak. Stok takibi açık tenant'larda ürün
   siparişe bağlanınca stok bir düşürülecek; stok 0'a inince ürün aramada "stok yok"
   etiketiyle gösterilecek.
5. **Fatura + ödeme talimatı**: `InvoiceProvider` interface + Parasut adaptörü, worker
   üzerinden asenkron fatura kesme, hata durumunda retry ve panelde hata gösterimi.
   Fatura kesildikten hemen sonra müşteriye WhatsApp üzerinden IBAN/ödeme talimatı
   mesajı otomatik gönderilecek (tenant ayarlarındaki IBAN bilgisi kullanılarak).
   Personelin ödemenin geldiğini panelden "ödendi" olarak işaretlemesiyle sipariş
   kargo aşamasına geçecek ve bu noktadan sonra iptal edilemeyecek şekilde kilitlenecek.
6. **Kargo entegrasyonu**: `ShippingProvider` interface + Shipentegra adaptörü, etiket
   oluşturma, takip numarası/linkinin müşteriye WhatsApp üzerinden otomatik bildirilmesi.
7. **Panel tamamlama**: Sipariş/müşteri/entegrasyon ayarları ekranları, tenant bazlı
   API anahtarı yönetimi (şifreli saklama).
8. **Raporlama/analitik**: Tenant paneline günlük/haftalık/aylık ciro, sipariş sayısı,
   en çok satan ürünler ve (stok takibi açıksa) düşük stok uyarıları gösteren basit bir
   dashboard.
9. **Süper admin paneli + abonelik faturalama**: Tenant kullanıcı panelinden tamamen
   ayrı, güvenli (2FA zorunlu) bir süper admin uygulaması:
   - Tenant listesi, tenant detay/durum yönetimi (aktif/askıya al/iptal et)
   - Abonelik planı atama, kart tanımlama (iyzico kart saklama akışı — kart bilgisi
     doğrudan iyzico'ya gider, sizin sunucunuzdan geçmez/saklanmaz — PCI-DSS kapsamını
     daraltmak için önemli)
   - Otomatik tekrarlı tahsilat işleyici (worker, `subscriptions.active_until`
     tarihine göre günlük tetiklenir): başarılı tahsilatta `active_until` otomatik
     olarak bir sonraki döneme uzatılır; başarısız denemede tenant'a bildirim + birkaç
     tekrar deneme + nihayetinde erişim askıya alma
   - Platform geneli gelir raporlaması (aylık tekrarlayan gelir, churn vb.)

## Doğrulama (Verification)

- Docker Compose ile yerel ortamı ayağa kaldırıp NestJS + Next.js + worker'ın birlikte
  çalıştığını doğrulama.
- Meta'nın test WhatsApp numarası ve webhook test aracıyla uçtan uca bir sipariş akışını
  (mesaj → müşteri tanıma → ekran görüntüsü → fiyat girişi → test modunda fatura →
  test modunda kargo etiketi) simüle etme.
- Parasut ve Shipentegra'nın sandbox/test ortamlarını kullanarak gerçek API çağrılarını
  hata senaryolarıyla (geçersiz API anahtarı, zaman aşımı) birlikte test etme.
- Prisma migration'ların temiz bir veritabanında sorunsuz çalıştığını doğrulama.

## Canlıya Alma (Deploy) Checklist

Kod ve altyapı tanımı (Dockerfile'lar, `render.yaml`) hazır ve yerel olarak
doğrulandı — ama gerçek bir barındırma/DNS/üçüncü parti hesabı bağlanmadan
hiçbiri kendiliğinden aktifleşmez. Sırayla:

1. **Render hesabı + Blueprint**: Render Dashboard'da "New > Blueprint",
   `TRENDUPOfficial/esnaf101` repo'sunu bağla. Render kök dizindeki
   `render.yaml`'ı okuyup Postgres + Redis + 3 servisi (api/web/superadmin)
   ücretsiz planda otomatik oluşturur — kart bilgisi gerektirmez. İlk canlı
   denemede gerçek Render parser'ıyla karşılaşılan ve düzeltilen sorunlar:
   - Render'ın Blueprint şemasında servis seviyesinde ayrı bir
     `envVarGroups:` alanı yok ("field envVarGroups not found in type
     file.Service") — bu yüzden paylaşılan değişkenler `esnaf101-api`
     servisine doğrudan gömüldü, ayrı bir env var group tanımı kaldırıldı.
   - `apps/worker` (BullMQ arka plan işçisi) Render'da ücretsiz planı
     desteklemiyor (yalnızca web servisleri, Postgres ve Key Value ücretsiz) —
     bu yüzden ilk deploy'dan çıkarıldı. Onsuz panel/giriş/CRUD çalışır,
     sadece kuyruğa atılan işler (fatura/kargo oluşturma, WhatsApp gönderimi)
     işlenmez. Kart eklenip gerçek arka plan işleme istendiğinde
     `apps/worker`'ı starter (veya üzeri) planla `render.yaml`'a geri eklemek
     gerekir — o zaman `APP_ENCRYPTION_KEY`'in api ile worker'da birebir aynı
     olması gerektiği unutulmamalı (elle kopyalanmalı ya da env var group'a
     geri dönülmeli).
2. **`sync: false` işaretli env değişkenlerini gir** (Render Dashboard'dan,
   servis servis): `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`,
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `ALLOWED_ORIGINS` (prod domain'ler,
   virgülle ayrılmış), `NEXT_PUBLIC_API_URL` (her iki panel için de api'nin
   gerçek URL'si) — bunlar olmadan servisler ayağa kalkmaz/yanlış çalışır.
   `WHATSAPP_*`/`IYZICO_*`/`S3_*` şu an boş bırakılabilir (ilgili özellikler
   pasif kalır, sistemin geri kalanı çalışır) — gerçek hesaplar açılınca
   doldurulur.
3. **DNS**: `esnaf101.com` üzerinde `app.`/`admin.`/`api.` alt alan adlarını
   Render'ın verdiği hedeflere yönlendir (Render, custom domain eklenince
   CNAME/A kaydı talimatını gösterir).
4. **Clerk prod ortamı**: Clerk Dashboard'da development instance'tan ayrı
   bir production instance oluşturulmalı (gerçek domain doğrulaması ister),
   webhook endpoint'i `https://api.esnaf101.com/webhooks/clerk`e
   (organization.created olayına abone) yeniden tanımlanmalı.
5. **İlk süper admin**: `platform_admins` tablosuna hiçbir self-servis kayıt
   akışı yok (bilinçli — bkz. Adım 9 güvenlik notu). İlk admin, prod
   veritabanına elle bir satır eklenerek (bcrypt hash'lenmiş şifreyle)
   oluşturulmalı; ilk girişte 2FA kurulumu otomatik tetiklenir.
6. **Üçüncü parti hesaplar** (WhatsApp Business Cloud API, Paraşüt,
   Shipentegra, iyzico) — hiçbiri henüz açılmadı, bkz. yukarıdaki adım
   notları. Bunlar olmadan sistem ayakta durur ve panel kullanılabilir,
   sadece WhatsApp/fatura/kargo/abonelik tahsilatı akışları pasif kalır.

**Ücretsiz plan uykuya alma**: Render'ın ücretsiz web servisleri ~15 dakika
hareketsizlikten sonra uykuya geçiyor, ilk isteği 50+ saniye geciktiriyor.
`.github/workflows/keep-alive.yml` her 10 dakikada bir üç servise de (api
`/health`, web `/sign-in`, superadmin `/login`) hafif bir istek atarak
uyanık tutuyor — harici bir hesap/servis gerektirmiyor, mevcut GitHub
Actions üzerinden çalışıyor. Ücretli plana geçilince bu iş artık gerekmez,
kaldırılabilir.

## Sonraki Adım

**1. adım ("Temel iskelet") tamamlandı** — eski `app.py`/`requirements.txt` daha önce
kaldırılmıştı. Bu oturumda kurulanlar:

- pnpm workspace monorepo (`pnpm-workspace.yaml`, kök `package.json`, `tsconfig.base.json`)
- `docker-compose.yml` — Postgres 16 + Redis 7 (healthcheck'li), `.env.example`
- `packages/db` — yukarıdaki veri modelinin tamamını kapsayan Prisma şeması
  (tenants, tenant_integrations, tenant_settings, customers, products, orders,
  invoices, shipments, conversation_states, platform_admins, subscription_plans,
  subscriptions, subscription_payments) + `prisma migrate dev` ile gerçek bir
  Postgres'e uygulanıp doğrulandı (`migrations/20260709205239_init`)
- `packages/integrations/{whatsapp,invoicing,shipping,billing}` — Meta Cloud API
  istemcisi + webhook imza doğrulama; `InvoiceProvider`/`ShippingProvider` adaptör
  arayüzleri ve ilk somut adaptörler (Parasut, Shipentegra); iyzico abonelik
  istemcisi iskeleti (metotlar henüz "not implemented" — gerçek HMAC imzalama
  9. adımda eklenecek)
- `apps/api` — NestJS iskeleti, `/health` endpoint'i ile ayağa kalktığı doğrulandı
- `apps/worker` — BullMQ worker iskeleti, üç kuyruk tanımlı
  (`invoice-create`, `shipment-create`, `whatsapp-send`), Redis'e bağlanıp
  başladığı doğrulandı
- `apps/web` (tenant paneli) ve `apps/superadmin` — Next.js App Router iskeletleri,
  ikisi de `next build` ile temiz derleniyor

Tüm workspace `pnpm install` ile kuruluyor, `pnpm -r build` ile deriliyor;
Docker Compose servisleri `docker compose up -d` ile ayağa kalkıyor (şu an
`docker compose stop` ile durduruldu, veriler volume'lerde duruyor).

**2. adım ("Tenant & auth") tamamlandı.** Bu oturumda kurulanlar:

- **Prisma şeması**: `Tenant`e `clerkOrgId` (unique) ve `status` (`pending_onboarding` |
  `active` | `suspended`) eklendi — tenant kimliği Clerk Organization ile eşleşiyor.
  Migration: `migrations/20260710000000_tenant_clerk_org` (gerçek Postgres'e uygulanıp
  doğrulandı).
- **apps/api — Clerk entegrasyonu + tenant bazlı yetkilendirme middleware'i**:
  - `ClerkAuthGuard` (global, `APP_GUARD`): her istekte Clerk oturum JWT'sini
    `@clerk/backend`'in `verifyToken`'ı ile doğrular, aktif Clerk organizasyonundan
    (`org_id`) tenant'ı çözümleyip request'e ekler, askıya alınmış tenant'ları reddeder.
    `@Public()` (health check, webhook) ve `@SkipTenant()` (org henüz yokken) decorator'ları
    ile route bazlı muafiyet var. `@CurrentTenant()` param decorator'ı ile controller'lara
    enjekte ediliyor.
  - `POST /webhooks/clerk`: svix imza doğrulaması + `organization.created` olayında
    Tenant satırı oluşturma (`status: pending_onboarding`).
  - `GET /tenants/me`, `PATCH /tenants/me/onboarding`: onboarding'in son adımı — stok
    takibi aç/kapa + IBAN + hesap sahibi bilgisini `TenantSettings`'e yazıp tenant'ı
    `active`e alıyor.
  - Runtime'da doğrulandı: `/health` herkese açık (200), `/tenants/me` auth'suz 401,
    geçersiz token 401, `/webhooks/clerk` eksik svix header'ında 400.
- **apps/web — onboarding akışı**: `@clerk/nextjs` ile `ClerkProvider` + `middleware.ts`
  (`clerkMiddleware` — oturum zorunlu, aktif organizasyon yoksa `/onboarding/organization`a
  yönlendirir). Sayfalar: `/sign-in`, `/sign-up` (Clerk hosted bileşenleri),
  `/onboarding/organization` (`<CreateOrganization />` — Clerk organizasyonu = tenant),
  `/onboarding/settings` (stok takibi + IBAN formu, `PATCH /tenants/me/onboarding`'e
  gönderiyor). Ana sayfa `GET /tenants/me`'den tenant durumunu okuyup `pending_onboarding`
  ise ayarlar adımına yönlendiriyor.
  - **Not**: `@clerk/nextjs` en güncel majör sürümü (v7) Next.js 15+ gerektirdiği için
    hem `apps/web` hem `apps/superadmin` Next.js 14→15 ve React 18→19'a yükseltildi
    (superadmin henüz Clerk kullanmıyor ama tek React sürümü tutmak için birlikte
    yükseltildi).
  - **Gerçek Clerk hesabı olmadan test edilemeyen kısım**: middleware sahte
    (placeholder) publishable key ile doğru şekilde Clerk'in hosted auth akışına
    yönlendirdiği doğrulandı, ama gerçek oturum açma/organizasyon oluşturma akışı
    ancak `.env`'e gerçek `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` /
    `CLERK_WEBHOOK_SIGNING_SECRET` girilip Clerk Dashboard'da webhook endpoint'i
    (`/webhooks/clerk`, `organization.created` olayına abone) tanımlanınca uçtan uca
    test edilebilir.
- **Build altyapısı düzeltmesi**: `packages/db` ve tüm `packages/integrations/*` artık
  `tsc` ile `dist/`e derleniyor ve `package.json`'da `main`/`types` `dist/`i gösteriyor
  (öncesinde ham `.ts` kaynağını işaret ediyorlardı). Bunun nedeni: `apps/api` bu
  paketleri gerçekten import etmeye başlayınca (`@esnaf101/db`), TypeScript'in ham
  kaynağı derlemeye dahil etmesi `rootDir` çıkarımını bozup `nest build`'in çıktısını
  sessizce yanlış dizine (`dist/apps/api/src/...`) yazmasına yol açıyordu.

**3. adım ("WhatsApp webhook + konuşma botu") tamamlandı.** Bu oturumda kurulanlar:

- **Mimari**: Platform tek bir Meta App üzerinden çalışıyor (Embedded Signup ile her
  tenant kendi numarasını bağlar) — webhook URL'si tek, tenant gelen mesajdaki
  `phone_number_id`den `tenant_integrations` tablosu üzerinden çözümleniyor.
  `apps/api`deki webhook controller kasıtlı olarak ince: imzayı doğrulayıp tenant'ı
  çözer ve gerçek işi `whatsapp-inbound` BullMQ kuyruğuna devredip hemen 200 döner.
  Gerçek durum makinesi ve gönderim `apps/worker`da çalışıyor (`whatsapp-inbound` işlenir
  → üretilen yanıt `whatsapp-send` kuyruğuna eklenir → oradan gerçekten gönderilir).
- **`packages/integrations/whatsapp`**: `WhatsAppClient`e `getMediaUrl`/`downloadMedia`
  eklendi (Meta Media API — iki adımlı: medya URL'si al, sonra o URL'den indir).
  Webhook payload tipleri (`WhatsAppWebhookPayload`, `WhatsAppInboundMessage`) ve
  `extractInboundEvents` ayrıştırma yardımcısı eklendi.
- **`packages/integrations/storage`** (yeni paket): `ObjectStorage` arayüzü +
  `S3ObjectStorage` (Cloudflare R2 için, S3 API uyumlu) + `LocalObjectStorage` (S3
  kimlik bilgileri tanımlı değilken devreye giren yerel disk adaptörü — bu sayede
  gerçek R2 hesabı olmadan da ekran görüntüsü yükleme akışı uçtan uca test edilebiliyor).
  `createObjectStorageFromEnv()` hangisinin kullanılacağına `.env`e göre karar veriyor.
  `apps/api`, `S3_ENDPOINT` tanımlı değilken `LOCAL_STORAGE_DIR`i `/uploads` altında
  statik olarak servis ediyor.
- **`apps/api`**: `POST /webhooks/whatsapp` (svix değil, Meta'nın kendi
  `X-Hub-Signature-256` HMAC imzası — `WHATSAPP_APP_SECRET` ile doğrulanıyor) ve
  `GET /webhooks/whatsapp` (Meta'nın abonelik doğrulama challenge'ı). Her ikisi de
  `@Public()`. `QueueModule` (`bullmq` + `ioredis`) eklendi — `apps/api` artık
  kuyruk producer'ı da (bkz. repo iskeleti yorumu).
- **`apps/worker` — konuşma durum makinesi** (`whatsapp/conversation.service.ts`):
  - Müşteri `(tenantId, waId)` ile tanınır/oluşturulur; `conversation_states`
    tablosunda durum tutulur (`awaiting_screenshot` → `awaiting_name` →
    `awaiting_address` → `done`).
  - Ekran görüntüsü (image mesajı) geldiğinde: müşteri zaten tanınıyorsa (ad-soyad +
    adres kayıtlıysa) direkt sipariş oluşturulur (durum: `awaiting_product_price`);
    yeni müşteriyse ekran görüntüsü URL'si `conversation_states.context`e geçici
    olarak yazılır ve ad-soyad sorulur.
  - Ad-soyad ve adres metin mesajlarıyla toplanır; adres alınınca bekleyen ekran
    görüntüsüyle birlikte sipariş kaydı oluşturulur (tek transaction).
  - `whatsapp-send` kuyruğu artık gerçekten `WhatsAppClient.sendTextMessage`
    çağırıyor (öncesinde sadece console.log placeholder'dı); tenant'ın
    `tenant_integrations.whatsappAccessToken`ı varsa onu, yoksa platform genelindeki
    `WHATSAPP_ACCESS_TOKEN`ı kullanıyor.
- **Runtime'da uçtan uca doğrulandı** (gerçek bir test tenant + `tenant_integrations`
  satırı seed edilip, Meta'nın gerçek webhook payload formatına uygun, placeholder
  `WHATSAPP_APP_SECRET` ile imzalanmış istekler gönderilerek):
  - `GET` doğrulama challenge'ı doğru/yanlış token ile 200/403.
  - Geçersiz imza → 400; bilinmeyen `phone_number_id` → sessizce atlanıyor (200).
  - İlk metin mesajı → müşteri + `conversation_state` oluşturuluyor
    (`awaiting_screenshot`), doğru "ekran görüntüsü gönderin" yanıtı `whatsapp-send`
    kuyruğuna ekleniyor.
  - `awaiting_name` → ad-soyad kaydediliyor, `awaiting_address`e geçiyor.
  - `awaiting_address` → adres kaydediliyor + sipariş (`awaiting_product_price`,
    doğru `screenshotUrl`/`rawDescription`) tek transaction'da oluşuyor, durum `done`a
    dönüyor.
  - `whatsapp-send` worker'ı doğru tenant/phoneNumberId'yi çözüp gerçek Meta API'sini
    çağırmaya çalışıyor ve **beklendiği gibi** `WHATSAPP_ACCESS_TOKEN tanımlı değil`
    hatasıyla başarısız oluyor (gerçek erişim token'ı olmadığı için) — worker
    process'i çökmüyor, job düzgün `failed` durumuna geçiyor.
  - **Gerçek Meta kimlik bilgileri olmadan test edilemeyen tek kısım**: medya indirme
    (`WhatsAppClient.downloadMedia`) ve gerçek mesaj gönderimi — bunlar gerçek
    `WHATSAPP_ACCESS_TOKEN` + gerçek bir WABA/telefon numarası gerektiriyor. Sahte bir
    `media.id` ile gönderilen image mesajının, beklendiği gibi (worker çökmeden)
    `failed` job olarak sonuçlandığı doğrulandı.
- **`.devcontainer/devcontainer.json`** (yeni dosya — önceden yoktu, Codespace
  varsayılan image ile çalışıyordu): `apps/api`nin 3001 portu için `forwardPorts` +
  `portsAttributes` (`visibility: public`) eklendi. Bu değişiklik **mevcut çalışan
  Codespace'e değil, bir sonraki rebuild/yeni Codespace'e** yansıyacak.
- **`.env` dosyaları** (gitignore'lu, gerçek değerlerle): `apps/api/.env` ve
  `apps/worker/.env` artık gerçek Clerk anahtarları + placeholder WhatsApp
  değerleriyle (`dev_placeholder_app_secret`/`dev_placeholder_verify_token`) dolu.
  Gerçek bir Meta WABA bağlanınca bu üçü Meta Dashboard'daki gerçek değerlerle
  değiştirilmeli: `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`,
  `WHATSAPP_ACCESS_TOKEN` (+ ilgili tenant'ın `tenant_integrations.whatsapp_phone_number_id`'si
  panelden/DB'den girilmeli — bu adımın kendisi henüz kurulmadı, bkz. Adım 7).

**4-9. adımların tamamı ("MVP Uçtan Uca Akış"ın geri kalanı) tek oturumda tamamlandı.**
Kullanıcı "hızlıca tamamla, sonra düzenleme yaparız" dediği için bu geçiş hız öncelikli
yapıldı — mekanik olarak eksiksiz ama üçüncü parti API'lerin gerçek doğrulaması
(Parasut/Shipentegra/iyzico) sandbox kimlik bilgisi olmadığı için yapılamadı.

**Prisma şeması**: `OrderStatus`e `awaiting_invoice` eklendi (fiyat onaylandıktan sonra,
fatura kesilene kadarki ara durum). `Order`e `lastErrorMessage` (worker hatalarının
panelde gösterilmesi için) ve `paidAt` (raporlama için) eklendi. `TenantIntegration`de
`invoiceApiKey`/`shippingApiKey` düz metin alanları kaldırılıp yerine
`invoiceCredentials`/`shippingCredentials` (sağlayıcıya özel çoklu alanı JSON olarak
tutan, tamamı şifrelenmiş string alanlar) kondu. Migration:
`migrations/20260710010000_order_lifecycle_and_encrypted_creds`.

**Yeni paket — `packages/crypto`**: `encryptSecret`/`decryptSecret`/`encryptJson`/
`decryptJson` (AES-256-GCM, `APP_ENCRYPTION_KEY` env'inden türetilen anahtar).
`apps/api` (yazarken şifreler) ve `apps/worker` (kullanırken çözer) aynı anahtarı
kullanmalı — ikisinin `.env`'inde de birebir aynı `APP_ENCRYPTION_KEY` var.

- **Adım 4 (Ürün + fiyat girişi)**: `apps/api`ye `ProductsModule` (CRUD, SKU'ya göre
  arama) ve `OrdersModule` (`GET /orders?status=`, `PATCH /orders/:id/assign-price`)
  eklendi. `assign-price`: ürünü/fiyatı sipariş üzerine yazar, stok takibi açıksa ve
  ürün stokta yoksa reddeder, kapanınca stoktan 1 düşer, sipariş durumunu
  `awaiting_invoice`e çeker ve `invoice-create` kuyruğuna iş ekler. `apps/web`e
  `/products` (liste + ekleme formu) ve `/orders` (fiyat bekleyen siparişler — ekran
  görüntüsü + ürün seçimi + fiyat girişi formu) eklendi.
- **Adım 5 (Fatura + ödeme talimatı)**: `apps/worker/src/invoicing/invoice.service.ts`
  — `awaiting_invoice` durumundaki siparişler için tenant'ın seçtiği sağlayıcıyı
  (`ParasutInvoiceProvider`, kimlik bilgileri `@esnaf101/crypto` ile çözülerek) çağırır,
  `Invoice` satırı oluşturur, sipariş durumunu `invoiced`e çeker, IBAN/ödeme talimatı
  mesajını `whatsapp-send` kuyruğuna ekler ve durumu `awaiting_payment`e taşır. Her iki
  aşama da idempotent (BullMQ retry güvenli). `PATCH /orders/:id/mark-paid` — personel
  ödemeyi işaretler, sipariş `paid`e kilitlenir (`paidAt` yazılır) ve `shipment-create`
  kuyruğuna iş eklenir. `apps/web` `/orders` sayfasında "ödeme bekliyor" bölümü ve
  "Ödendi olarak işaretle" butonu var.
- **Adım 6 (Kargo)**: `apps/worker/src/shipping/shipment.service.ts` — `paid`
  siparişler için `ShipentegraShippingProvider`i çağırır, `Shipment` satırı oluşturur,
  sipariş durumunu `shipped`e çeker, takip numarasını WhatsApp'tan bildirir. Hata
  durumunda `lastErrorMessage` yazılır, sipariş `paid`de kalır (yanlışlıkla `shipped`
  işaretlenmez).
- **Adım 7 (Panel tamamlama)**: `apps/api`ye `IntegrationsModule`
  (`GET/PATCH /integrations/me` — WhatsApp/Paraşüt/Shipentegra kimlik bilgilerini
  şifreleyerek yazar, okurken sadece "tanımlı mı" boole'u döner, ham şifreli değer asla
  response'a girmez) ve `CustomersModule` (`GET /customers`, arama) eklendi. `apps/web`e
  `/integrations` (üç ayrı form) ve `/customers` (liste) eklendi.
- **Adım 8 (Raporlama)**: `apps/api`ye `ReportsModule` (`GET /reports/summary` — bu ay
  ciro, sipariş sayısı, en çok satan 5 ürün, düşük stoklu (≤5) ürünler) eklendi.
  `apps/web`e `/dashboard` eklendi; ana sayfaya tüm yeni ekranlara giden nav eklendi.
- **Adım 9 (Süper admin + abonelik faturalama)**: `apps/api`ye tenant panelinden
  (Clerk) **tamamen ayrı** bir kimlik doğrulama katmanı eklendi —
  `platform_admins` tablosuna karşı email+şifre (bcrypt) ile giriş, oturum
  `PLATFORM_ADMIN_JWT_SECRET` ile imzalanan bir JWT (`PlatformAdminAuthGuard`,
  global `ClerkAuthGuard`dan `@Public()` ile muaf). Uçlar: `POST /admin/auth/login`,
  `GET /admin/tenants`, `GET /admin/tenants/:id`, `PATCH /admin/tenants/:id/status`,
  `POST /admin/tenants/:id/subscription`, `GET/POST /admin/subscription-plans`,
  `GET /admin/revenue-summary`. `apps/superadmin`: `/login` (Server Action ile
  `apps/api`den token alıp httpOnly cookie'ye yazıyor), `middleware.ts` (cookie yoksa
  `/login`e yönlendirir — gerçek doğrulama her istekte API tarafında), `/tenants`
  (liste + askıya al/aktifleştir), `/tenants/[id]` (detay + abonelik atama +
  tahsilat geçmişi), `/subscription-plans` (liste + oluşturma), ana sayfa (MRR/aktif/
  askıda özet).
  - **`apps/worker/src/billing/subscription-billing.service.ts`**: her gün 03:00'te
    (BullMQ repeatable job, `jobId` sabit — tekrar eklenmez) süresi dolan aktif
    abonelikler için iyzico'dan tahsilat dener. Kart tanımlı değilse veya
    `IYZICO_API_KEY`/`IYZICO_SECRET_KEY` eksikse direkt başarısız kaydedilir.
    **3 ardışık başarısız denemeden sonra hem abonelik hem tenant otomatik askıya
    alınır (dunning)** — bu mantık gerçek verilerle test edildi (bkz. aşağı).
  - **Kalan bilinçli kapsam daraltması**: **iyzico gerçek imzalama yok.**
    `@esnaf101/integrations-billing`daki `IyzicoBillingClient.storeCard`/
    `chargeSubscription` hâlâ (Adım 1'den beri) "henüz implemente edilmedi" hatası
    fırlatıyor — gerçek HMAC imzalama sandbox kimlik bilgisi olmadan anlamlı şekilde
    yazılıp doğrulanamaz. Dunning/job planlama mekanizmasının tamamı gerçek ve test
    edildi; sadece "iyzico'ya gerçek istek at" kısmı stub.

**Runtime'da gerçek verilerle doğrulanan kısımlar** (Clerk gerektiren tenant panel
uçları için gerçek bir Clerk oturumu kurulamadığından — headless ortamda gerçek
sign-in yapılamıyor — HTTP katmanı yerine derlenmiş servis sınıfları doğrudan
gerçek Postgres/Redis'e karşı çalıştırıldı; auth/guard katmanı zaten Adım 2'de ayrıca
doğrulanmıştı):
- Ürün oluşturma/listeleme, entegrasyon kimlik bilgilerinin şifrelenip
  "tanımlı" olarak raporlanması (ham değer asla dönmüyor).
- `assign-price`: stok 10 → 9 (doğru düşüş), sipariş durumu `awaiting_invoice`e geçti.
- Fatura worker'ı gerçek (sahte kimlik bilgili) bir Paraşüt API çağrısı yaptı, gerçek
  `401 Unauthorized` aldı, `lastErrorMessage`e yazdı, sipariş durumunu bozmadı.
- `mark-paid`: sipariş `paid`e geçti, `paidAt` yazıldı, kargo kuyruğuna iş eklendi;
  kargo worker'ı gerçek bir Shipentegra çağrısı denedi, ağ hatası aldı, düzgün
  başarısız oldu (sipariş yanlışlıkla `shipped` olmadı).
- Raporlama: ciro/sipariş sayısı/en çok satan ürün gerçek verilerle doğru hesaplandı.
- Süper admin: **gerçek HTTP** üzerinden — yanlış şifreyle 401, doğru şifreyle JWT,
  token'sız `/admin/tenants`e 401, token'lı istekle tenant/plan/abonelik
  oluşturma/listeleme/askıya alma çalıştı, gelir özeti (MRR) doğru hesaplandı.
- Dunning: bir aboneliğin `active_until` tarihini geçmişe çekip billing worker'ını
  3 kez elle tetikleyerek, 3. denemede hem `subscription.status` hem `tenant.status`in
  otomatik `suspended`e geçtiği doğrulandı.
- `apps/web` ve `apps/superadmin` dev sunucuları hatasız ayağa kalktı, middleware'ler
  (Clerk oturumu / admin cookie'si) doğru yönlendirme yaptı.

**MVP'nin "Uçtan Uca Akış" bölümündeki 9 adımın tamamı artık mekanik olarak var.**
Kullanıcı "sonra düzenleme yaparız, hızlıca tamamla" dedikten sonra "push et ve devam
et, ben uyuyorum" diyerek gözetimsiz devam etmeyi onayladı — bu oturumda, önceki
geçişte bilinçli olarak ertelenen/basitleştirilen parçalar tamamlandı, her adımdan
sonra ayrı commit + push yapıldı:

- **Ürün arama autocomplete** (`apps/web/app/orders/ProductAutocomplete.tsx`):
  Adım 4'ün belirttiği "arama/otomatik tamamlama" — önceki geçişte zaman kısıtı
  nedeniyle basit bir `<select>`e düşülmüştü. Artık personel ürün adı/SKU'ya göre
  yazarken arıyor; stoksuz ürünler "stok yok" etiketiyle işaretleniyor. Backend
  arama sorgusu (`ProductsService.list` — name/sku/barcode, case-insensitive) gerçek
  verilerle doğrulandı.
- **`.github/workflows/ci.yml`** (yeni): her push/PR'da pnpm install → Prisma
  generate → migrasyonları temiz bir Postgres service container'a uygula → tüm
  workspace'i derle. Migration zincirinin (4 migration) gerçekten sıfırdan bir
  veritabanında baştan sona çalıştığı yerel olarak da doğrulandı. Lint henüz yok
  (hiçbir pakette eslint config dosyası yok — ayrı bir iş).
- **Dockerfile'lar** (`apps/{api,worker,web,superadmin}/Dockerfile`, kök `.dockerignore`):
  PLANNING.md'nin hosting kararı (Railway/Render) için gerekliydi. Her biri repo
  kökünden build edilmeli (`docker build -f apps/api/Dockerfile .`) çünkü pnpm
  workspace bağımlılıkları yüzünden context tüm monorepo olmak zorunda. `apps/api`
  ve `apps/worker` imajları gerçekten build edilip docker-compose'daki Postgres/
  Redis'e karşı çalıştırılarak doğrulandı — bu sırada Alpine'in musl libc'sinde
  Prisma engine binary'sinin ihtiyaç duyduğu OpenSSL'in eksik olduğu ortaya çıktı
  (`libssl.so.1.1 not found`), `apk add openssl` ile düzeltildi (4 Dockerfile'ın
  hepsine uygulandı). `apps/web`/`apps/superadmin` aynı deseni kullanıyor, ayrıca
  imaj olarak build edilip çalıştırılmadı.
- **Süper admin 2FA** (PLANNING.md'nin "2FA zorunlu" gereksinimi — önceki geçişte
  bilinçli olarak atlanmıştı, artık tamamlandı): `PlatformAdmin`e `twoFactorSecret`/
  `twoFactorEnabled` eklendi (migration). Harici bağımlılık olmadan (`node:crypto`
  ile) standart RFC 6238 TOTP implementasyonu — `apps/api/src/platform-admin/auth/totp.ts`
  (base32 encode/decode + HMAC-SHA1 HOTP, 30sn periyot, 6 hane, ±1 adım tolerans).
  Giriş artık iki aşamalı: `POST /admin/auth/login` şifre doğruysa asla tam yetkili
  token vermez — `twoFactorSecret` yoksa otomatik üretip `stage: "setup"` (sır +
  `otpauth://` URI) döner, varsa `stage: "verify"` döner; her iki durumda da sadece
  10 dakikalık bir `tempToken`. `POST /admin/auth/confirm-2fa` bu `tempToken` + 6
  haneli kodu doğrulayıp (ilk seferse `twoFactorEnabled=true` yapıp) gerçek 12 saatlik
  oturum JWT'sini veriyor. `apps/superadmin/app/login/`: `LoginFlow.tsx` (client
  component, kimlik bilgisi → kurulum/doğrulama iki aşamasını yönetir; QR kod imajı
  yok — sır elle girilecek şekilde metin olarak gösteriliyor) + Server Actions
  (`requestLogin`, `confirmCode` — ikincisi cookie'yi set edip yönlendiriyor).
  **Gerçek bir TOTP secret ile uçtan uca doğrulandı**: ilk giriş → `stage=setup` +
  sır döndü → o sırdan elle hesaplanan 6 haneli kod ile yanlış kod reddedildi (401),
  doğru kod kabul edildi ve `twoFactorEnabled=true` oldu → ikinci giriş artık
  `stage=verify` döndü → yeni bir kod ile tekrar doğrulanıp alınan tam yetkili
  token'ın gerçekten `/admin/tenants`e erişebildiği doğrulandı.

**Kalan tek bilinçli kapsam daraltması: iyzico'nun gerçek HMAC imzalaması.** Sandbox
kimlik bilgisi olmadan anlamlı şekilde yazılıp doğrulanamaz — dunning/job planlama
mekanizmasının geri kalanı tamamen gerçek ve test edilmiş durumda.

**Panel tasarımından sonra "sistemi hazır et" istendi** — üçüncü parti hesaplar
(WhatsApp/Paraşüt/Shipentegra/iyzico) hâlâ yok ve gerçek hosting/DNS erişimi bu
ortamda mevcut değil, o yüzden "hazır etmek" somut olarak şu anlama geldi:
production güvenlik sertleştirmesi + tek dosyadan deploy edilebilir hale getirme
(gerçek deploy'un kendisi kullanıcının Render hesabını gerektiriyor, bkz. yukarıdaki
"Canlıya Alma" bölümü).

- **`apps/api` güvenlik sertleştirmesi**:
  - CORS artık `*` değil — `ALLOWED_ORIGINS` env değişkeninden (virgülle
    ayrılmış) okunuyor; production'da bu değişken tanımsızsa uygulama
    **başlamayı reddediyor** (sessizce açık CORS'a düşmesin diye). Dev'de
    değişken yoksa sadece `localhost:*`e izin veriyor.
  - `helmet()` eklendi (HSTS, X-Content-Type-Options, X-Frame-Options vb.).
  - `@nestjs/throttler` global guard olarak eklendi (dk. başına IP başına 100
    istek varsayılan). `admin/auth/login` ve `admin/auth/confirm-2fa`
    dk. başına 5 istekle çok daha sıkı sınırlandı (TOTP kodu brute-force'una
    karşı — 6 haneli bir kod deneme uzayı kısıtlı, rate limit olmadan
    pratikte kaba kuvvetle kırılabilir). Clerk/WhatsApp webhook'ları ise
    imza doğrulamasıyla zaten güvenli olduğundan ve paylaşılan gönderici
    IP'lerinden gelebileceğinden (bir tenant'ın trafiği başka bir tenant'ı
    etkilemesin diye) belirgin şekilde daha yüksek bir limitle işaretlendi.
  - Hepsi gerçek HTTP istekleriyle doğrulandı: helmet başlıkları göründü,
    izin verilmeyen origin'den istek CORS header'sız döndü, 6. login denemesi
    429 ile reddedildi, ClerkAuthGuard'ın hâlâ doğru çalıştığı (throttler
    guard'ın onu ezmediği) doğrulandı.
- **`apps/web`/`apps/superadmin`**: `next.config.mjs`e temel güvenlik
  başlıkları eklendi (X-Frame-Options: DENY — clickjacking'e karşı, özellikle
  süper admin paneli için önemli). Ayrıca ikisinin de hiç kullanmadığı
  `@esnaf101/db` bağımlılığı kaldırıldı (kod hiçbir yerde import etmiyordu) —
  bu, Dockerfile'larını basitleştirdi (artık Prisma generate/OpenSSL adımı
  gerekmiyor, build gözle görülür şekilde hızlandı) ve gereksiz bir
  attack-surface/dependency'yi ortadan kaldırdı.
- **`render.yaml`** (yeni, repo kökünde): Render Blueprint — Postgres, Redis,
  ve 4 servisin (api/worker/web/superadmin) tamamını tek dosyadan tanımlıyor.
  Paylaşılan sırlar (`APP_ENCRYPTION_KEY` vb.) bir Environment Group'ta
  (`esnaf101-shared`) tutulup api+worker arasında otomatik senkron ediliyor.
  **Gerçek bir Render hesabına karşı test edilemedi** (bu ortamda erişim yok)
  — dosyanın başındaki not bunu açıkça belirtiyor; Render'ın Blueprint akışı
  ilk bağlandığında söz dizimini kendi tarafında doğruluyor, küçük
  düzeltmeler gerekebilir.

Bundan sonraki doğal iş: kullanıcının gerçek bir Render hesabı açıp
`render.yaml`'ı deneyip geri bildirim vermesi (yukarıdaki "Canlıya Alma"
checklist'i), gerçek sağlayıcı hesaplarının (Meta WABA, Paraşüt, Shipentegra,
iyzico) bağlanıp sandbox'ta uçtan uca test edilmesi, ve iyzico'nun gerçek
imzalama mantığının yazılması.

## Render'da ilk canlı deploy — bulunan/düzeltilen sorunlar

Kullanıcı gerçek bir Render hesabı açıp Blueprint'i denedi; sırayla şu gerçek
sorunlar bulunup düzeltildi (hepsi commit geçmişinde ayrı ayrı görülebilir):

- Render'ın Blueprint şemasında servis seviyesinde `envVarGroups` alanı yok —
  paylaşılan env değişkenleri `esnaf101-api`'ye doğrudan gömüldü.
- `apps/worker`'ın Render'da ücretsiz planı yok (yalnızca web servisleri,
  Postgres ve Key Value ücretsiz) — kart istemeden ilk deploy'u yapabilmek
  için `render.yaml`'dan çıkarıldı; kart eklenip gerçek arka plan işleme
  istendiğinde starter+ planla geri eklenmesi gerekiyor.
- CI'da `pnpm/action-setup@v4`'ün `version` girdisiyle `package.json`daki
  `packageManager` alanı çakışıyordu ("Multiple versions of pnpm specified") —
  action'ın `version` girdisi kaldırıldı.
- `ClerkAuthGuard` yalnızca eski düz `org_id`/`org_role` JWT claim'lerine
  bakıyordu; Clerk'in yeni (v2) oturum token formatı bunu iç içe `o: {id, rol}`
  nesnesine taşıyor ve `org_id`'yi `never` tipine sabitliyor — bu Clerk
  projesi yeni formatı kullandığı için organizasyon hep "seçilmemiş"
  görünüyordu. Guard artık her iki biçimi de okuyor.
- **En büyük bulgu**: `apps/api/Dockerfile` `prisma generate` çalıştırıyordu
  ama hiçbir zaman `prisma migrate deploy` çalıştırmıyordu — Render'daki
  production Postgres'te tablolar hiç oluşmamıştı. API "ayakta" görünüyordu
  çünkü çoğu hata `ClerkAuthGuard`da, hiç DB sorgusuna ulaşmadan patlıyordu.
  Container başlangıcına `pnpm --filter @esnaf101/db exec prisma migrate
  deploy && node dist/main.js` eklendi (idempotent, her restart'ta güvenli).

İlk süper admin kaydı da prod veritabanına aynı şekilde elle eklendi (bkz.
"Canlıya Alma Checklist" madde 5) — kullanıcının onayıyla, connection string
paylaşılıp `platform_admins`e tek satır INSERT edildi.

## Onboarding akışı sadeleştirildi: IBAN artık zorunlu bir ilk-ekran değil

Kullanıcı geri bildirimi: satıcı organizasyon oluşturduktan hemen sonra
karşısına çıkan zorunlu "işletme ayarları" (stok takibi + IBAN) formu, ilk
izlenim için kötü bir karşılama ekranıydı — bunun yerine kullanıcı doğrudan
gerçek panele (Panel/anasayfa) düşmeli, IBAN gibi ayarlar da WhatsApp/Paraşüt/
Shipentegra gibi Entegrasyonlar sayfasından istenildiği zaman doldurulmalı.

Yapılan değişiklik:
- Clerk webhook'u artık tenant'ı doğrudan `active` durumda oluşturuyor
  (`pending_onboarding` durumu artık yeni tenant'lar için kullanılmıyor,
  enum'da geriye dönük uyumluluk için duruyor).
- `apps/web/app/(app)/layout.tsx`deki zorunlu `/onboarding/settings`
  yönlendirmesi kaldırıldı; `app/onboarding/settings/` sayfası tamamen
  silindi. `<CreateOrganization afterCreateOrganizationUrl="/" />` — artık
  organizasyon oluşturunca doğrudan panele düşülüyor.
- IBAN/stok takibi formu `apps/web/app/(app)/integrations/page.tsx`e "İşletme
  ayarları" kartı olarak taşındı (`updateBusinessSettings` server action,
  `PATCH /tenants/me/settings` — eski `PATCH /tenants/me/onboarding`dan
  yeniden adlandırıldı, `UpdateTenantSettingsDto`daki tüm alanlar artık
  isteğe bağlı).
- IBAN girilmemişse `AppShell` üstte "IBAN bilginiz eksik..." uyarı şeridi
  gösteriyor (Entegrasyonlar sayfasına link veriyor, o sayfadayken
  gizleniyor) — WhatsApp/Paraşüt/Shipentegra'daki "tanımlı değil" rozeti ile
  aynı felsefe: eksik ayar sistemi durdurmuyor, sadece ilgili özelliği pasif
  bırakıyor ve kullanıcıyı nazikçe uyarıyor.
