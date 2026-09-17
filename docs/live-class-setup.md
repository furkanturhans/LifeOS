# LifeOS Canlı Dersler: BigBlueButton Kurulum ve Entegrasyon Kılavuzu

Bu belge, LifeOS **Dersler > Canlı Dersler** modülünün BigBlueButton (BBB) açık kaynaklı web konferans ve sanal sınıf altyapısıyla nasıl bağlanacağını açıklar.

---

## 1. Yönetilen BigBlueButton Hizmetinden Alınacak İki Değer

Kendi kurduğunuz veya yönetilen (managed) bir BigBlueButton sunucusundan (örneğin Blindside Networks, BigBlueMeeting, Scaleway, Hetzner veya kendi Linux sunucunuz) aşağıdaki **iki değere** ihtiyacınız vardır:

1. **`BBB_BASE_URL`**: BigBlueButton API ana URL'i  
   *Örnek format:* `https://bbb.sirketiniz.com/bigbluebutton` veya `https://test-install.blindsidenetworks.com/bigbluebutton`
2. **`BBB_SECRET`**: Sunucunun paylaşılan gizli anahtarı (Shared Secret / Salt)  
   *Örnek format:* `8cd8ef52e8e101574e400365b55e11a6`

> **Güvenlik Notu:** `BBB_SECRET` anahtarı **yalnızca LifeOS sunucu tarafında (Node.js API)** okunur. Hiçbir koşulda istemciye (tarayıcıya), hata mesajlarına veya log kayıtlarına iletilmez. Tüm toplantı oluşturma ve katılım bağlantıları SHA-1 sağlama toplamı (`checksum`) ile sunucu tarafında imzalanır.

---

## 2. Ortam Değişkenlerinin Tanımlanması

Projenin kök dizinindeki `.env.local` dosyasını açın (yoksa `.env.example` dosyasından kopyalayarak oluşturun) ve aldığınız iki değeri ekleyin:

```env
# BigBlueButton Canlı Sınıf Entegrasyonu
LIVE_CLASS_PROVIDER=bigbluebutton
BBB_BASE_URL=https://bbb.alanadiniz.com/bigbluebutton
BBB_SECRET=sunucudan_aldiginiz_gizli_anahtar
```

Kaydettikten sonra geliştirme sunucusunu yeniden başlatmanız yeterlidir:
```bash
npm run dev
```

---

## 3. Test ve Kullanıcı Akışı

### Adım 1: Eğitmen Olarak Canlı Ders Oluşturma ve Başlatma
1. LifeOS ana ekranından **Dersler** modülüne girin.
2. **Eğitmen Ol / Eğitmen Stüdyosu** ekranına geçiş yapın (Test modunda *"Başvuruyu Onayla & Stüdyoyu Aç"* butonuyla doğrulanmış eğitmen rolüne geçebilirsiniz).
3. Üst bardaki **Canlı Sınıf Altyapısı** durumunu kontrol edin (Yeşil: `BigBlueButton Aktif`).
4. **Canlı Ders Planla** butonuna tıklayın:
   - Başlık, tarih, saat, yaş grubu belirleyin.
   - Varsayılan **50 Kredi** ve **Maksimum 70 Katılımcı** kuralları otomatik uygulanır.
5. Planlanan ders kartında **Dersi Başlat (BBB)** butonuna tıklayın.
   - LifeOS sunucusu BigBlueButton üzerinde toplantıyı oluşturur ve eğitmene **MODERATOR** yetkisiyle imzalı katılım bağlantısı üretir.
   - Ders durumu `Canlı Yayında` olarak güncellenir.

### Adım 2: Öğrenci Olarak Canlı Derse Katılma
1. Öğrenci hesabıyla **Dersler > Canlı Dersler** ekranına girin.
2. Açık olan canlı dersi seçin ve **50 Kredi ile Katıl** butonuna tıklayın:
   - Kredi bakiyeniz (varsayılan 150 kredi) doğrulanır ve 50 kredi düşülerek değiştirilemez deftere işlenir.
   - 70 kişilik kontenjan sınırı atomik olarak denetlenir.
3. Kayıt tamamlandığında **Canlı Sınıfa Gir (BBB)** butonuna tıklayın.
   - Sunucu, öğrencinin kaydını ve dersin durumunu teyit ederek **VIEWER (İzleyici/Katılımcı)** rolüyle imzalı BigBlueButton bağlantısı açar.

### Adım 3: Dersi Bitirme ve İptal/İade Güvencesi
- **Dersi Bitir:** Eğitmen stüdyosundan **Dersi Bitir** dediğinde BigBlueButton toplantısı kapatılır ve ders `Tamamlandı` durumuna geçer.
- **Dersi İptal Et:** Eğitmen dersi iptal ederse, sisteme kayıt olmuş tüm öğrencilerin 50 kredisi muhasebe defteri (`refund`) üzerinden hesaplarına eksiksiz ve otomatik iade edilir.

---

## 4. Yapılandırma Olmadığında Hata Yönetimi
- Sunucuda `BBB_BASE_URL` ve `BBB_SECRET` tanımlanmadığında:
  - **Öğrencilere:** Asla teknik hata/kod sızdırılmaz; *"Canlı sınıf bağlantısı hazırlanıyor. Lütfen eğitmenin oturumu başlatmasını bekleyiniz."* mesajı gösterilir.
  - **Eğitmenlere:** Stüdyo ekranında *"Canlı sınıf bağlantısı henüz yapılandırılmadı (BBB_BASE_URL ve BBB_SECRET eksik)"* uyarısı verilir.
