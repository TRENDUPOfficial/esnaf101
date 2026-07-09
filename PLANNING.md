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

Bir sonraki oturum **2. adım ("Tenant & auth")** ile devam etmeli: tenant kayıt/
onboarding akışı (stok takibi aç/kapa + IBAN bilgisi bu adımda toplanacak),
Clerk entegrasyonu, tenant bazlı yetkilendirme middleware'i (NestJS guard +
Next.js middleware). Ardından 3. adımdaki WhatsApp webhook/konuşma botuna geçilecek.
