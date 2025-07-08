# Infofluencer Projesi - Teknik Mimari ve Modülerlik

## Genel Bakış
Bu proje, GA4 ve YouTube ile entegre çalışan, modüler ve sürdürülebilir bir analytics dashboard uygulamasıdır. Kod tabanı hem backend (Django) hem frontend (React) tarafında tamamen modüler olacak şekilde tasarlanmıştır.

---

## Backend (Django)

- **apps/company/views_dashboard.py**: Dashboard, kitle, trafik, cihaz ve influencer analytics endpointleri.
- **apps/company/views_property.py**: GA4 property ID yönetimi ve bağlantı durumu endpointleri.
- **apps/company/views_auth.py**: GA4/YouTube OAuth, bağlantı ve token yönetimi endpointleri.
- **apps/company/helpers.py**: Ortak yardımcı fonksiyonlar.
- **apps/company/scripts/**: GA4 ve YouTube veri çekme ve kaydetme yardımcıları.
- **apps/company/urls.py**: Tüm endpointlerin modüler olarak yönlendirildiği dosya.
- **apps/accounts/**: Kullanıcı, şirket ve influencer modelleri, serializer ve ilgili endpointler.

**Modülerlik Prensipleri:**
- Her işlevsel grup ayrı dosyada.
- Yardımcı fonksiyonlar tek yerde.
- Açıklayıcı dosya ve fonksiyon isimleri.
- Her dosyanın başında ve fonksiyonlarda açıklama.

---

## Frontend (React)

- **src/components/**: Her UI parçası ayrı component klasöründe (Dashboard, Analytics, Common, Auth).
- **src/services/api.js**: Tüm API çağrıları merkezi olarak burada.
- **src/utils/**: Tekrarlanan yardımcı fonksiyonlar burada.
- **src/pages/**: Her ana sayfa (Dashboard, Analytics, Login, Register) ayrı dosyada.

**Modülerlik Prensipleri:**
- Her component ve yardımcı fonksiyon açıklamalı.
- API ve yardımcılar merkezi dosyalarda.
- Açıklayıcı ve kısa componentler.
- Her dosyanın başında açıklama.

---

## Geliştirme ve Test
- Kodun tamamı Prettier ve Black ile otomatik formatlanmıştır.
- ESLint ile kullanılmayan importlar ve kodlar kolayca tespit edilebilir.
- Her yeni özellik, modülerlik ve açıklama standartlarına uygun eklenmelidir.

---

## Klasör Yapısı (Özet)

```
backend/
  infofluencer/
    apps/
      company/
        views_dashboard.py
        views_property.py
        views_auth.py
        helpers.py
        scripts/
      accounts/
        models.py
        serializers.py
        views.py
      ...

infofluencer-frontend/
  src/
    components/
      Dashboard/
      Analytics/
      Common/
      Auth/
    services/
    utils/
    pages/
```

---

## Katkı ve Geliştirme
- Kodun modülerliğini ve açıklamalarını koruyun.
- Her yeni dosya ve fonksiyonun başına kısa açıklama ekleyin.
- Yardımcı fonksiyonları ve API çağrılarını merkezi dosyalarda toplayın.
- Kodunuzu Prettier/Black ile formatlayın. 