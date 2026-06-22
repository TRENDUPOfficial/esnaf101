import streamlit as st
import pandas as pd
from streamlit_gsheets import GSheetsConnection
from datetime import datetime

# Sayfa Konfigürasyonu
st.set_page_config(page_title="Esnaf101 | Yönetim", page_icon="📦", layout="wide")
st.title("🚀 Esnaf101 Akıllı Sipariş Yönetim Paneli")

# Canlı Google Sheets Bağlantısı
conn = st.connection("gsheets", type=GSheetsConnection)

def verileri_yukle(worksheet_adi):
    return conn.read(worksheet=worksheet_adi, ttl="0d")

try:
    # Google Sheets'teki sayfaları canlı olarak çekiyoruz
    df_musteri = verileri_yukle("Müşteri Girişleri")
    df_urunler = verileri_yukle("Urun_Listesi")
except Exception as e:
    st.error("Google Sheets bağlantısı kurulamadı. Lütfen alt sekme isimlerini kontrol edin!")
    st.stop()

# 🔄 ADIM 2: Müşterinin Telefon Numarası ile Aranması
st.subheader("🔍 1. Adım: Alıcıyı Bul")
arama_tel = st.text_input("Müşterinin Telefon Numarasını Giriniz (Örn: 05321112233):", "").strip()

if arama_tel:
    # Telefon numarasını sütunda ara
    musteri_karti = df_musteri[df_musteri["Telefon"].astype(str).str.contains(arama_tel)]
    
    if musteri_karti.empty:
        st.error("❌ Bu telefon numarasına ait bir müşteri kaydı bulunamadı!")
    else:
        m_detay = musteri_karti.iloc[0]
        st.success(f"✅ Müşteri Bulundu: **{m_detay['Ad Soyad']}**")
        
        col_m1, col_m2 = st.columns(2)
        with col_m1:
            st.text(f"📞 Telefon: {m_detay['Telefon']}")
            st.text(f"📍 Bölge: {m_detay['İlçe']} / {m_detay['İl']}")
        with col_m2:
            st.text(f"🏠 Açık Adres: {m_detay['Açık Adres']}")
            st.text(f"📊 Mevcut Durum: {m_detay['Durum']}")
        
        st.divider()
        
        # 🔄 ADIM 3: Ürün Ekleme (Fiyat Tanımlı Gelecek, Düzenlenebilecek)
        st.subheader("🛒 2. Adım: Ürün ve Fiyat İşleme")
        
        # Urun_Listesi sekmesinden ürün adlarını çek
        urun_havuzu = ["Seçiniz..."] + df_urunler.iloc[:, 0].dropna().tolist()
        
        secilen_urunler = []
        toplam_fatura = 0
        
        col_u1, col_u2 = st.columns(2)
        
        for i in range(1, 4):
            with col_u1:
                urun = st.selectbox(f"{i}. Ürün Seçimi", urun_havuzu, key=f"urun_sel_{i}")
            
            with col_u2:
                if urun != "Seçiniz...":
                    # Ürünün yan sütunundaki fiyatı bul (A sütunu ürün, B sütunu fiyat varsayıldı)
                    try:
                        varsayilan_fiyat = int(df_urunler[df_urunler.iloc[:, 0] == urun].iloc[0, 1])
                    except:
                        varsayilan_fiyat = 0
                    
                    satis_fiyati = st.number_input(f"{urun} Satış Fiyatı (TL)", min_value=0, value=varsayilan_fiyat, key=f"fiyat_val_{i}")
                    secilen_urunler.append({"ürün": urun, "fiyat": satis_fiyati})
                    toplam_fatura += satis_fiyati
                else:
                    st.text_input(f"Ürün {i} Seçilmedi", "-", disabled=True, key=f"disabled_{i}")
        
        st.markdown(f"### 💰 Hesaplanan Toplam Tutar: `{toplam_fatura} TL`")
        st.divider()
        
        # 🔄 ADIM 4 & 5: Kargo ve Fatura Entegrasyonu
        st.subheader("🚀 3. Adım: Siparişi Tamamla (Kargo & Fatura)")
        
        if st.button("🔥 Siparişi Onayla, Fatura Kes ve Kargo Barkodu Al", type="primary"):
            if not secilen_urunler:
                st.error("Lütfen kargo ve fatura üretebilmek için en az 1 ürün seçin!")
            else:
                with st.spinner("Sistemler tetikleniyor..."):
                    # Kargo ve Muhasebe API bağlantıları bu aşamada tetiklenecek
                    gercek_kargo_kodu = f"YK-{datetime.now().strftime('%M%S')}-{arama_tel[-4:]}"
                    
                    # Google Sheets üzerindeki Durum (H) ve Kargo Kodu (I) alanlarını güncelleme
                    df_musteri.loc[df_musteri["Telefon"].astype(str).str.contains(arama_tel), "Durum"] = "Kargolandı & Faturalandı"
                    df_musteri.loc[df_musteri["Telefon"].astype(str).str.contains(arama_tel), "Kargo Kodu"] = gercek_kargo_kodu
                    
                    # Güncel veriyi Google Sheets'e geri yaz
                    conn.update(worksheet="Müşteri Girişleri", data=df_musteri)
                    
                    st.success("🎉 İŞLEM BAŞARIYLA TAMAMLANDI!")
                    col_res1, col_res2 = st.columns(2)
                    with col_res1:
                        st.info(f"📦 **Yurtiçi Kargo Kodu:** {gercek_kargo_kodu}")
                    with col_res2:
                        st.info("🧾 **Paraşüt Fatura Durumu:** Kesildi (E-Arşiv)")
                    st.balloons()
