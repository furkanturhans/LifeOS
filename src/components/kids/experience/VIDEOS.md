# Çocuk videoları

## Bugünkü durum

Çocuk Filmleri yeni video kütüphanesini kullanır. Kaynak arama, taslak, inceleme, yayın ve arşivleme gerçek sunucu kayıtlarıdır. Başlangıçta 100 benzersiz kaynak adayı vardır: 92 Wikimedia Commons ve 8 NASA kaydı. Bunlar 100 yayınlanmış veya baştan sona incelenmiş eğitim bölümü değildir. Bir kelebek gözlem videosu tarayıcıda 8,3 saniye boyunca baştan sona oynatılarak yayınlandı; kalan 99 kayıt taslaktır. Lisans süzgeci editoryal veya uzman gelişim değerlendirmesi yerine geçmez. NASA sonuçlarının süreleri bilinmediğinden taslakta 0 bırakılır; oynatıcıdan doğrulanmadan yayınlanamaz.

## Kaynak bağlantıları

- Wikimedia Commons: API anahtarı gerekmez. Videoinfo üzerinden doğrudan oynatma, transcode, poster ve eser/lisans metadata alınır. CC0, kamu malı, CC BY ve CC BY-SA kaynakları kayıt başına değerlendirilir. Paylaşım şartları ve değişiklik bildirimleri korunmalıdır.
  https://commons.wikimedia.org/w/api.php
- NASA Images: API anahtarı gerekmez. Arama ve video manifestinden resmi HTTPS MP4 sürümleri alınır. NASA etiketi tüm ses ve görüntülerin NASA'ya ait olduğu anlamına gelmez; üçüncü taraf müzik ve görsel kredileri mutlaka incelenir.
  https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
  https://www.nasa.gov/nasa-brand-center/images-and-media/
- Pexels: adaptör hazırdır; KIDS_PEXELS_API_KEY sunucu ortam değişkeni gerekir. Anahtar henüz kurulmadı ve bu sağlayıcının canlı uçtan uca testi yapılmadı. Yayın öncesinde güncel Pexels kullanım/atıf koşullarına göre sağlayıcı bağlantısını görünür tutun; ticari stok görüntü, bitmiş eğitim bölümü değildir.
  https://www.pexels.com/api/
  https://www.pexels.com/license/
- Pixabay: adaptör hazırdır; KIDS_PIXABAY_API_KEY sunucu ortam değişkeni gerekir. Anahtar henüz kurulmadı ve canlı uçtan uca testi yapılmadı. Safe search kullanılır fakat çocuk uygunluğu garantisi değildir. API/medya bağlantı ve lisans koşullarını kayıt başına inceleyin.
  https://pixabay.com/api/docs/
  https://pixabay.com/service/license-summary/

API anahtarları istemciye veya tarayıcıya verilmez. Anahtarları sohbet yerine yerel .env.local veya üretim ortamının özel ayarlarına koyun; ardından sunucuyu yeniden başlatın. Bu çalışma .env dosyasını değiştirmedi ve harici hesap oluşturmadı. Sağlayıcı aramalarında 24 saatlik, 100 sorguyla sınırlı bellek önbelleği vardır. Çoklu sunucu üretim ortamında paylaşılan önbellek ve kota takibi ayrıca gerekir.

Korumalı ortamda çalışan mevcut Next geliştirme sunucusundan canlı API araması erişim hatası verdi. Aynı resmi API'lere yetkili kaynak içe alma aracıyla erişilip metadata doğrulandı. Arama rotası erişim yokken eşleşen katalog kayıtlarına döner ve sourceMode=cached ile açık bir uyarı verir; yeni arama sonucu gelmiş gibi göstermez. Normal ağ erişimi olan sunucuda sourceMode=live kullanılır. Çocuk kataloğunun açılması ve yayınlanmış videonun oynatılması bu canlı aramalara bağlı değildir. İnternet bağlantısı oynatma için yine gereklidir.

YouTube reklam/öneri/harici oynatıcı davranışı ve eser bazında lisans gerektirdiğinden otomatik çocuk yayınına bağlanmadı. Her ücretsiz video sağlayıcısının eğitim içeriği veya yeniden yayınlama hakkı sunduğu varsayılmaz.

## Yönetici akışı

/kids/admin → Videolar. Bu alan özel yönetici oturumu gerektirir. Sağlayıcıdan aday arayın veya başlangıç kayıtlarından birini açın. Video önizlemesini sonuna kadar izleyin; yaş, öğrenme amacı, süre, ses dili, kaynak, eser sahibi ve lisans alanlarını tamamlayın. Kaynak ses dilini bilmiyorsanız bilinmiyor olarak açıklayın; konuşma yokmuş veya çevrilmiş gibi sunmayın. İnceleme notu ve iki inceleme kutusu tamamlanmadan yayınlama sunucuda reddedilir. Arşivlenen videolar çocuk listesinde yer almaz.

Başlık ve açıklama çevirileri dil kodlarına göre saklanır. Örnek:
{"tr":{"title":"Başlık","description":"Açıklama"},"en":{"title":"Title","description":"Description"}}

Altyazılar WebVTT adresi, language ve label alanlarıyla eklenir. Altyazı sunucusunun CORS izni gerekir. Örnek:
[{"language":"tr","label":"Türkçe","url":"https://your-cdn.example/video.tr.vtt"}]

Gerçek dublajlı sürümler mediaVariants alanında dil veya ülke varyantı koduyla eklenir. Örnek:
{"tr":{"sources":[{"url":"https://your-cdn.example/video.tr.mp4","mime":"video/mp4"}],"audioLanguages":["tr"]}}

Kullanıcı öneri formuna Video seçeneği eklendi. Gerçek ebeveyn başvurusu önceki karara uygun olarak Supabase hesap bağlantısı kurulana kadar kapalıdır. Öneriler otomatik yayınlanmaz.

## Dil ve ülke desteği

Video arayüzünün yeni metinleri LifeOS'un mevcut 20 dilinde hazırlanmıştır; seçili ana dili useThemeStore üzerinden alır. Arapçada RTL yerleşim kullanılır. Ülke/bölge kodu olan metadata önce tam dil kodunu, ardından ana dil kodunu eşleştirir (ör. tr-TR → tr). Sistemdeki ülke seçimini değiştirmez veya yeni ülke ayarı oluşturmaz; mevcut dil tercihi önceliklidir.

Başlık, açıklama, altyazı ve mevcut dublaj sürümü bu sıraya göre seçilir. İncelenen başlangıç videosunun başlık/açıklaması 20 dilde vardır. Diğer adayların çevirileri ve ses bilgileri henüz incelenmemiştir. Gerçek dublaj/altyazı bulunmuyorsa kaynak sürüm kullanılır ve mevcut ses dili gösterilir. Otomatik çeviri veya dublaj üretilmiş gibi davranılmaz. Yönetici arayüzü Türkçedir; çocuk video arayüzü ana dil tercihine bağlıdır.

## Oynatma ve mobil

HTML5 video, kullanıcı başlatması, playsInline, 3–5/6–7 yaş ve konu filtreleri, cihaz ses ayarı, kaldığı yerden devam, arka planda duraklatma ve yeniden deneme vardır. Reklam/öneri/yorum bileşeni eklenmedi. Akış sağlayıcının doğrudan medya adresinden oynar; videolar indirilmedi veya uygulama paketine kopyalanmadı.

Wikimedia adayları ağırlıklı WebM'dir. Gerçek Android/iOS sürümlerinde codec desteği ayrıca doğrulanmalıdır; tüm cihazlarda oynar garantisi verilmez. Yetkili ve uygun lisanslı MP4 sürümleri sources veya mediaVariants alanına eklenebilir. Kütüphanede video oynatma hatası görünürdür, boş ekranda takılmaz. Üretimde mevcut özel/kalıcı KIDS_DATA_DIR ve yönetici anahtarı şartları sürer.

## Doğrulama

node --test src/components/kids/experience/content.test.mjs src/components/kids/experience/videos.test.mjs
npx tsc --noEmit
node src/components/kids/experience/verify-video-live.mjs

10 otomatik test geçti: önceki 400 içerik, 100 özel aday, yayın inceleme şartları, geçersiz adres/lisansların reddi, 20 dil metinleri, bölgesel dil ve dublaj seçimi. İlgili dosyaların lint kontrolü ve TypeScript geçti. Canlı yerel API denemesinde yönetici yetkisi, taslak gizliliği, yayınlama/arşivleme, CSRF ve sahte kimlik reddi; Wikimedia/NASA aramasının önbellek modu doğrulandı. Pexels/Pixabay canlı araması anahtar olmadığı için denenmedi.

390×844 tarayıcıda yeni video arayüzü, oynatma ve gerçek süre doğrulandı. Bu gerçek Android/iOS paket testi veya 100 videonun tam editoryal incelemesi değildir. validation/video-mobil.jpg örnek ekran kaydıdır.

Eski KIDS_MOVIES_CATALOG dışa aktarımı yalnızca eski yönetici/demo kodunun derlenmesi için boş uyumluluk listesi olarak bırakıldı. Gerçek video yönetimi /kids/admin içindeki Videolar sekmesidir; eski yerel demo paneli bu kataloğu yayınlamaz.
