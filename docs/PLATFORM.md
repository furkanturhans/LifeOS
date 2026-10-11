# LifeOS meslek, hizmet, kredi ve Lifechat altyapısı

## Bu çalışmada bağlanan ekranlar

- `/profile/professions`: meslek/kategori seçimi, yasal ad, hizmet bölgesi ve özel belge yükleme. Takside araç ve plaka bilgisi de istenir.
- `/profile/professions/review`: yalnızca sunucuda inceleme izni bulunan kullanıcılar için belge görüntüleme, gerekçeli onay/ret/askıya alma ve geçerlilik tarihi.
- `/services/moving`, `/services/craftsman`: müşteri talepleri, herkese açık iş özeti, onaylı hizmet verenin ücretli teklif/iletişim erişimi, ücretsiz teklif düzenleme, müşteri seçimi ve tamamlandı/iptal durumları.
- `/services/taxi`: sürücünün 24 saatlik erişimi, isteğe bağlı konum izni, çevrimiçi çalışma, yakın çağrıların mesafeye göre sıralanması ve tek sürücünün çağrı kabulü. Müşteri eşleşen sürücü/araç/plaka bilgisini ve güncel konuma harita bağlantısını görür.
- `/services/travel`: otobüs arama, kontenjan/koltuk görünümü, şirket oluşturma, sefer ekleme, satış açma/kapatma ve ödeme yapılmış yolcu listesi. Şirket yetkisi LifeOS meslek onayına bağlıdır.
- `/chat` ve `/connect`: aynı kalıcı Lifechat gelen kutusu. Kişisel, iş ve sınıf filtreleri, iş/sınıfa dönüş kartı, okunma durumu, sessize alma, arşivleme, geçmiş mesajlar ve tekrar gönderimde tek mesaj kaydı.
- `/courses`: öğretmen/eğitimci meslek onayı sınıf oluşturma ve ders başlatma yetkisidir. Onaylanmış yasal ad sınıf kartında kullanılır. Sınıf grubu Lifechat içinde açılır; kayıt süresi biten öğrenci erişemez.
- `/finance`: tek `CreditAccount` bakiyesi; ders, teklif, taksi ve kredi satın alma kayıtları aynı işlem geçmişindedir. Yetersiz kredi için Finans bağlantısı ve güvenli dönüş bağlantısı vardır.

Nodes içerikleri ve mevcut Nodes API'leri bu birleşmeye dahil edilmedi. Yeni Lifechat API'si Nodes bağlamı oluşturmaz.

## Kesin ücret kuralları

Nakliye/usta için kullanıcıdaki belirsiz "sabit 10" ifadesi **talep başına 10 kredi** olarak uygulandı. Bu değerin 10 TL olması istenirse merkezi `SERVICE_FEE_MILLI` değeri 5000 yapılır. 1 kredi 2 TL; kredi satın alma ek bedeli %10'dur. İlk teklif ile iletişim erişimi birlikte açılır. Aynı talebe ikinci giriş/yeniden deneme veya teklif düzenleme tekrar ücret kesmez.

Taksi sürücüsü ilk çalışma erişimi için 100 kredi öder; erişim 24 saat sürer, otomatik yenilenmez. Aktif geçişte tekrar ödeme yapılmaz. Çağrı kabulünde ayrıca 10 kredi kesilmez. Ücret ve yetkiler istemcinin gönderdiği kullanıcı/fiyat alanlarından türetilmez.

Seyahat: 2000 TL bilet = 160 TL platform komisyonu + 1840 TL firma alacağı. Sağlayıcı işlem ücreti henüz bu paylaşımın dışında; gerçek sözleşmede belirlenmelidir. Kuruşlarla hesaplanır. Bilet alacağı kullanım kredisine dönüştürülmez.

## Gizlilik ve onay

Meslek seçimi yetki vermez. Yalnızca onaylı, süresi dolmamış meslek/kategori kaydı teklif veya öğretmenlik yetkisini açar. Bir kişi birden fazla kategoriye başvurabilir. Onay, belgenin gerçekten incelendiği anlamına gelmelidir; otomatik meslek tespiti veya resmi kurum doğrulaması yapılmıyor. Belge listeleri kategoriye göre kurumsal operasyon tarafından kesinleştirilmelidir.

Telefon isteğe bağlıdır. Açık adres ve Lifechat kimliği talep sahibine ve ücret ödemiş onaylı hizmet verene gösterilir. Herkese açık liste JSON'unda müşteri adı, kullanıcı adı, telefon, açık adres ve kesin koordinat yoktur. Ödeme, erişim kaydı ve konuşma oluşturma tek Serializable transaction içindedir; herhangi bir hata hepsini geri alır.

Açıklama/başlık/bölgedeki telefon, e-posta, URL, Lifechat kullanıcı adı, yazıyla rakam dizileri, farklı rakam alfabeleri ve görünmez ayırıcılar kontrol edilir. Bu sezgisel filtre her kaçırma girişimini yakalamaz. Bu sürümde talep fotoğrafı yükleme açılmadı; görsel/OCR moderasyonu ve özel fotoğraf depolama tamamlanmadan açılmamalıdır. Mesleki belgeler bu filtreden ayrı özel depolamadadır.

Belge yükleme: PDF/JPEG/PNG imzası kontrol edilir, dosya en fazla 5 MB, başvuru en fazla 5 belge. Hesapta en fazla 30 saklanan yükleme sınırı vardır. Belge güncelleme/silme istemciye verilmez. İnceleyiciye verilen imzalı bağlantı 60 saniyedir. Kötü amaçlı dosya taraması ve kullanılmayan belge temizleme işi üretim operasyonuna eklenmelidir.

## Kurulum sırası

1. Gerçek Supabase Auth ve erişilebilir PostgreSQL bağlantısı sağlanır. Geliştirme çerezi API yetkisi değildir.
2. Mevcut User/permission tabloları üzerine önce önceki `prisma/academy.sql`, ardından `prisma/platform.sql`, `prisma/platform-guards.sql` ve `prisma/profession-storage.sql` incelenip uygulanır. Bunlar boş veritabanının tüm başlangıç şeması değildir. Veri silme/reset komutu çalıştırılmadı ve SQL canlı veritabanına uygulanmadı.
3. Prisma'nın sunucu DB rolü tabloları kullanabilmeli; `anon`/`authenticated` rollerinin doğrudan PostgREST erişimi kapalı olmalıdır. Koruma dosyası bunu sağlar. Özel belge politikaları denetlenen SECURITY DEFINER fonksiyonu üzerinden hesap/inceleyici eşleşmesini kontrol eder.
4. Gerçek kullanıcıya yönetici tarafından `UserPermission(userId, moduleId="platform", resource="profession-review", granted=true)` kaydı verilir. Ad/e-posta benzerliği, URL, rol seçimi veya tarayıcı yerel deposu yetki kazandırmaz. İnceleyici kendisini onaylayamaz. Bu izin, doğrulanmış hesap kimliğine göre güvenilir DB yönetiminde verilmeli.
5. Meslek başvuruları incelenip onaylanır. Öğretmen için eski `courses/instructor` izni yeterli değildir.
6. Gerçek ödeme kuruluşunun imza, işlem sorgusu, tutar, para birimi ve callback tekrarları doğrulanarak merkezi kredi settlement fonksiyonuna bağlanır. Bilet için şirket alt hesapları, tahsilat, iade ve mutabakat bağlanır.

## Henüz üretime açık olmayan alanlar

Kullanıcı canlı kurulumun sonraki gün birlikte yapılmasını istedi. Bu çalışma temel ve ekranlarla sınırlıdır. Mevcut ortamda PostgreSQL `ECONNREFUSED`, Supabase yapılandırması örnek; gerçek kullanıcılar arası işlem, RLS ve PostgreSQL yarış koşulları canlı olarak doğrulanamadı. Sahte kayıt/bakiye gösterilmiyor. Kart bilgisi alınmıyor, bilet/kredi satın alma düğmeleri kapalı.

Gerçek ödeme adaptörü yoktur. `reserveTravelSeat` ve `settleVerifiedTicket` sunucu entegrasyon noktalarıdır; ödeme uçları açılmadı. Koltuk rezervasyonu 10 dakika, fiyat snapshot'ı ve %8 paylaşım içerir; ödeme yapılmış aynı koltuk için DB unique index vardır. Firma özel kontenjan ayırmalıdır; gişe/başka platform satışlarıyla envanter senkronizasyonu henüz yoktur. Otobüs dışındaki uçak/otel/kiralama sonraki sağlayıcı entegrasyonudur.

Lifechat metin mesajları kalıcıdır; açık konuşma 5 saniyede, gelen kutusu 15 saniyede güncellenir. WebSocket/push, sesli/görüntülü arama, ek dosya, engelleme/şikâyet operasyonu ve uçtan uca şifreleme bu sürümde tamamlanmış değildir. Varsayılan TLS ve sunucu erişim kontrolleri, uçtan uca şifreleme olarak tanıtılmamalıdır.

Taksi konumu açık ekranda Geolocation ile çalışır; arka plan konumu ve Android/iOS izinleri gerçek cihazda ayrıca entegre/test edilmelidir. Entegre harita, yol güzergâhı, taksimetre/nihai ücret, sürücünün tahmini varış süresi ve yolculuk PIN'i henüz yoktur. Mesafe kuş uçuşudur; rota süresi değildir. Çevrimiçi konum 2 dakikadan eskiyse yeni çağrı listesi kapanır. Bu sürüm tam Uber işlevleri sunuyor diye tanıtılmamalıdır.

Kazanılan ders kredisi tek merkezi bakiyeye eklenir; nakit çekim/vergisel ayrım ve gerçek iade henüz yoktur. Satın alınan ve kazanılan tutarlar işlem türlerinde ayrıdır. Eski yönetici finans ekranları örnek defter kullanmaya devam eder, gerçek merkezi mutabakat raporu değildir.

Eski `/api/connect/*` ve `/api/education/*` örnek kayıt uçları 410 döndürür. Eski `/api/wallet` doğrulanmış merkezi hesabı okur; bellek içi cüzdan yazmaları ve checkout process/refund uçları kapalıdır. Eski bileşenler depoda tutulur fakat yeni giriş ekranlarına bağlı değildir.

## Doğrulama

`npm run test:platform`, `npm run test:academy`, `npm run test:explore`, `npm run test:i18n`; Prisma validate/generate, TypeScript, değişen yeni dosyalarda ESLint ve üretim derlemesi. Ücret/idempotency/geri alma/erişim testleri veritabanı taklitleri kullanır; gerçek DB ve gerçek cihaz kabul testi yerine geçmez.
