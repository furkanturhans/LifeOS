# Dersler — kalıcı sınıf sistemi

## Kullanım

`/courses` ve `/education` aynı yeni arayüzü açar. Sınıflar, kişisel notlar, tartışmalar, makaleler ve yazılılar ana sekmelerdir. Sınıfa girildiğinde içerik o sınıfa göre daralır; öğretmen öğrenci ve sonuç sekmelerini de görür. Notlar hiçbir zaman diğer üyelerle paylaşılmaz. Makale/tartışma okuyucuları yorumla cevap verebilir. Öğretmen tartışmaları yalnızca doğrulanmış eğitmenlere görünür.

Öğretmen çevrimiçi, fiziksel veya hibrit sınıf açabilir. Fiziksel/hibrit sınıfa öğrencinin mevcut LifeOS kullanıcı adıyla, 1–365 gün süreli kayıt ekler. Öğrencinin bakiyesinden otomatik ücret alınmaz. Kapasite ve koltuklar kayıt işleminde denetlenir. LifeOS hesabı olmayan kişilere çevrimiçi yazılı atanmaz; isim/telefon listesi bu sürümde yoktur.

Öğrenci günlük veya 30 günlük paketi ve bir koltuğu seçer. Günlük erişim Türkiye saatiyle sonraki gece yarısına kadar geçerlidir. Aylık paket başlangıçtan itibaren 30 gündür; otomatik yenileme/tahsilat yoktur. Aktif kayıt tekrar ücretlendirilmez. Süresi dolan kayıtların koltukları yeni kayıtta serbest bırakılır. Çevrimiçi günlük ödeme yalnızca canlı sınıf gerçekten çalışırken alınır. Aylık paket gelecek derslere erişim için ön ödemedir; çevrimiçi altyapı kurulmadan aylık ücret de çekilmez.

Canlı derste mevcut BigBlueButton sağlayıcısı kullanılır. Öğretmen başlatıp moderatör olarak katılır; kayıtlı ve erişim süresi geçerli öğrenciler izleyici olarak katılır. Günlük ödemeden ve öğrenci girişinden önce `isMeetingRunning` kontrol edilir. [Resmî BigBlueButton API belgesi](https://docs.bigbluebutton.org/dev/api.html/) esas alınmıştır. Toplantı sonlandırma isteği asenkrondur; tekrar girişte çalışma durumu yeniden denetlenir. Çevrimiçi sınıf kapasitesi öğretmen dahil 70 kişi sınırına uygun olarak en fazla 69 öğrencidir. Fiziksel sınıflar 70 öğrencidir.

## Kredi modeli

| İşlem | Öğrenci | Öğretmen | Platform |
|---|---:|---:|---:|
| 100 kredi satın alma | 220 TL ödeme, 100 kredi | — | 20 TL satın alma komisyonu |
| 100 kredilik ders | −100 kredi | +90 kredi | 10 kredi ders komisyonu |

Kredi taban fiyatı 2 TL'dir. Satın alma komisyonu taban tutarın %10'u olarak ayrıca eklenir; bu örnekte 200 + 20 TL. Ders komisyonu harcanan kredinin %10'udur. Kredi ve komisyonun yuvarlama farklarından etkilenmemesi için bakiye 1/1000 kredi tam sayı biriminde saklanır; bakiye alanı büyük tutarlar için PostgreSQL BIGINT kullanır. Öğretmen payı ve platform payının toplamı her zaman öğrencinin harcadığı miktardır.

`credit_accounts` ortak kalıcı hesaptır. Yeni Dersler ve Finans cüzdan görünümü aynı hesabı okur. `academy_charges` öğrenci, öğretmen ve komisyonu tek kayıtla muhasebeleştirir. Koltuk, bakiye düşümü, öğretmen bakiyesi ve işlem kaydı Serializable transaction içindedir; bir adım başarısız olursa tamamı geri alınır. İstek anahtarı tekrarlanan ücretlendirmeyi engeller. Başlangıç bakiyesi sıfırdır; eski bellek içi 150 kredilik demo bakiye aktarılmaz.

`credit_purchases` doğrulanmış gerçek satın alma kayıtları için hazırlanmıştır. `academy-credit.ts` sunucu entegrasyon noktasında tutar/para birimi/referans eşleşmesi ve tek seferlik bakiye ekleme uygulanır. Bu fonksiyona HTTP endpoint verilmemiştir; gerçek ödeme sağlayıcısı imza ve işlem sorgusunu doğruladıktan sonra çağırmalıdır. Mevcut iyzico/PayTR adaptörleri sahte işlem/URL üreten iskelettir. Bu nedenle satın alma düğmesi kapalıdır ve eski `PaymentEngine.purchaseCredits` üzerinden doğrulanmamış kredi dağıtımı da kapatılmıştır. Kart bilgisi alınmaz, gerçek tahsilat yapılmaz.

Eski `/api/wallet` artık doğrulanmış hesaptan merkezi bakiyeyi okur. Eski cüzdan/checkout işlem uçlarının bellek içi tahsilatları kapatıldı. Eski `/api/education` ve yönetici finans raporlarının tümü yeni kalıcı sisteme taşınmış değildir. Eski hizmet ödemeleri, iade, öğretmene nakit çekim ve yönetici finans raporları bu yeni defterle henüz bütünleşmez. Bu sürüm bu alanların üretime hazır olduğunu iddia etmez. Eski demo işlemler gerçek ödeme/gerçek bakiye kabul edilmez. Nakit çekim ve otomatik iadeler sonraki ödeme sağlayıcısı entegrasyonunda ayrıca ele alınmalıdır.

## Yazılılar

Öğretmen sınıfına 1–50 çoktan seçmeli soru, doğru seçenek, açılış/kapanış ve 1–180 dakika süre atar. Cevap anahtarı öğrenci API yanıtlarından çıkarılır. Fiziksel kayıtlı öğrenci de aynı sınavı çevrimiçi alır. Öğrenci başına tek deneme, kalıcı cevaplar, sunucu tarafından belirlenen son süre ve 100 üzerinden otomatik puan uygulanır. Süre dolduktan sonra gönderilen yeni cevaplar kabul edilmez; önceki kayıtlı cevaplar puanlanır. Öğrenci/öğretmen sınav listesi okunurken süresi dolmuş denemeler sonuçlandırılır. Not: bu bir arka plan zamanlayıcısı değildir. Yeni sınav için yeni sınav kaydı oluşturulur; yeniden deneme ve açık uçlu soru bu sürümde yoktur.

## Sunucu kurulumu ve yetki

1. Gerçek Supabase kimlik doğrulama projesi ve çalışan PostgreSQL kurulmalıdır. Geliştirme çerezi yeterli değildir.
2. Var olan User/permission tabloları üzerine `prisma/academy.sql` incelenip uygulanmalıdır. SQL yalnızca yeni tabloları ekler; mevcut verileri silmez. Boş veritabanını sıfırdan kuran migration değildir. Bu çalışma SQL'i üretmiştir, canlı veritabanına uygulamamıştır.
3. Eğitmen LifeOS profilindeki Meslek ve Yetkilerim bölümünden belge yükler. Yetkili inceleyici başvuruyu onaylar. Aktif, süresi dolmamış `ProfessionApplication(profession="teacher", status="approved")` kaydı sınıf ve canlı ders yetkisini açar. Eski bellek içi onaylar ve courses/instructor permission tek başına yetki vermez. Kurulum ve inceleyici yetkisi için `docs/PLATFORM.md` dosyasına bakın.
4. `BBB_BASE_URL` ve `BBB_SECRET` sunucuda ayarlanır. Gizli anahtar istemciye gönderilmez.
5. Gerçek ödeme sağlayıcı adaptörü, doğrulanmış callback ve mutabakat kurulmadan kredi satışını açmayın.

Şu an PostgreSQL bağlantısı başarısız, Supabase yapılandırması örnek ve canlı ders/ödeme servisleri bağlı değildir. Bu yüzden gerçek üyelik, yazılı, makale ve not kaydı uçtan uca doğrulanmadı. Bağlantı yokken kullanıcı formu açıp inceleyebilir; kayıt başarılıymış gibi gösterilmez. Sınıflar ekranındaki **Önizle** açıkça örnek koltuk/ücret ekranıdır; ödeme/gerçek kayıt kapalıdır.

## Doğrulama

`npm run test:academy`: fiyat/komisyon, Türkiye günü, 30 gün erişim, doğrulanmış rol, gövde boyutu, tekrar ücretlendirme, koltuk çakışması, başarısız transaction geri alma, soru puanlama, tek seferlik kredi yükleme, canlı hizmet kapandıktan sonra ödeme isteği tekrarı ve bağlı olmayan canlı sınıfta ücret çekilmemesi. Testler sağlayıcı/veritabanı taklitleri kullanır; gerçek PostgreSQL eşzamanlılık testi yerine geçmez.

`npm run test:i18n`: 20 dilde yeni etiketler ve mevcut çeviri bütünlüğü. `npx tsc --noEmit`, ilgili dosyalarda ESLint ve `npm run build`.
