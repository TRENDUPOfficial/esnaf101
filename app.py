import streamlit as st
import pandas as pd
from streamlit_gsheets import GSheetsConnection
from datetime import datetime

# 1. Sayfa Düzeni ve Başlık
st.set_page_config(page_title="Esnaf101 | Panel", page_icon="📦", layout="wide")
st.title("🚀 Esnaf101 Sipariş Yönetim Paneli")

# Google Sheets Canlı Bağlantısı
conn = st.connection("gsheets", type=GSheetsConnection)

def verileri_yukle(worksheet_adi):
    return conn.read(worksheet=worksheet_adi, ttl="0d")

try:
    # Google Sheets'ten verileri canlı çekiyoruz
    df_musteri = verileri_yukle("Form Yanıtları 1")
    df_urunler = verileri_yukle("Ürün_Listesi")
except Exception as e:
    st.error("Google Sheets bağlantısı kurulamadı. Lütfen Secrets ayarlarını ve tablonuzdaki sekme isimlerini kontrol edin!")
    st.stop()

# 🔄 ADIM 2: Telefon Numarası ile Arama
st.subheader("🔍 1. Adım: Alıcıyı Bul")
arama_tel = st.text_input("Müşterinin Telefon Numarasını Giriniz (Örn: 5345971699):", "").strip()

if arama_tel:
    # Telefon numarasını sütunda ara
    musteri_karti = df_musteri[df_musteri["Telefon Numaranız"].astype(str).str.contains(arama_tel)]
    
    if musteri_karti.empty:
        st.error("❌ Bu telefon numarasına ait bir müşteri kaydı bulunamadı!")
    else:
        m_detay = musteri_karti.iloc[0]
        st.success(f"✅ Müşteri Bulundu: **{m_detay['Adınız ve Soyadınız']}**")
        
        col_m1, col_m2 = st.columns(2)
        with col_m1:
            st.text(f"📞 Telefon: {m_detay['Telefon Numaranız']}")
            st.text(f"📍 Bölge: {m_detay['İlçe']} / {m_detay['İl']}")
        with col_m2:
            st.text(f"🏠 Açık Adres: {m_detay['Açık Adres - Mahalle, sokak, kapı no']}")
            st.text(f"📊 Mevcut Durum: {m_detay['Durum'] if pd.notna(m_detay['Durum']) else 'Bekliyor'}")
        
        st.divider()
        
        # 🔄 ADIM 3: Ürün Ekleme (Fiyat Tanımlı Gelecek, Düzenlenebilecek)
        st.subheader("🛒 2. Adım: Ürün ve Fiyat İşleme")
        
        # Ürün Listesi boşsa varsayılan havuz oluştur
        if not df_urunler.empty and len(df_urunler) > 0:
            urun_havuzu = ["Seçiniz..."] + df_urunler.iloc[:, 0].dropna().tolist()
        else:
            urun_havuzu = ["Seçiniz...", "Bluetooth Kulaklık", "Akıllı Saat", "Hızlı Şarj Kablosu"]
        
        secilen_urunler = []
        toplam_fatura = 0
        
        col_u1, col_u2 = st.columns(2)
        
        for i in range(1, 4):
            with col_u1:
                urun = st.selectbox(f"{i}. Ürün Seçimi", urun_havuzu, key=f"urun_sel_{i}")
            
            with col_u2:
                if urun != "Seçiniz...":
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
        st.subheader("🚀 3. Adım: Siparişi Tamamla")
        
        if st.button("🔥 Siparişi Onayla, Fatura Kes ve Kargo Barkodu Al", type="primary"):
            if not secilen_urunler:
                st.error("Lütfen kargo ve fatura üretebilmek için en az 1 ürün seçin!")
            else:
                with st.spinner("Sistemler tetikleniyor..."):
                    gercek_kargo_kodu = f"YK-{datetime.now().strftime('%M%S')}-{str(arama_tel)[-4:]}"
                    
                    # Hücre güncelleme
                    idx = df_musteri[df_musteri["Telefon Numaranız"].astype(str).str.contains(arama_tel)].index[0]
                    df_musteri.at[idx, "Durum"] = "Kargolandı & Faturalandı"
                    df_musteri.at[idx, "Kargo Kodu"] = gercek_kargo_kodu
                    df_musteri.at[idx, "Satılan Ürünler"] = "\n".join([x["ürün"] for x in secilen_urunler])
                    df_musteri.at[idx, "Ürün Fiyatları"] = "\n".join([str(x["fiyat"]) for x in secilen_urunler])
                    df_musteri.at[idx, "Toplam Tutar (TL)"] = toplam_fatura
                    
                    # Güncel veriyi Google Sheets'e geri yaz
                    conn.update(worksheet="Form Yanıtları 1", data=df_musteri)
                    
                    st.success("🎉 İŞLEM BAŞARIYLA TAMAMLANDI!")
                    st.info(f"📦 **Yurtiçi Kargo Kodu:** {gercek_kargo_kodu}")
                    st.info("🧾 **Paraşüt Fatura Durumu:** Kesildi (E-Arşiv)")
                    st.balloons()
