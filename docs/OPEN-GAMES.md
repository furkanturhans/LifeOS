# LifeOS oyun merkezi

`/arcade` artık doğrudan 20 ücretsiz, yerel mini oyunu açar. Oyunlar kredi, ödeme, reklam, harici oyun servisi veya veritabanı istemez. Mevcut Kids oyunları korunmuştur. Önceki yetişkin oyun kataloğu ana oyun merkezinde kullanılmaz.

## Kaynak ve lisans

Zeli Web Games, Hajun Ho ve katkıda bulunanlar:
https://github.com/hajunho/zeli-web-games

Sabit kaynak sürümü: `ba9938eb222cb588ae7b0a6056ba6bdda89dcd9c`.
Gerçek lisans Apache 2.0; MIT değildir. Kaynak `src/vendor/open-games/` altında, lisans ve değişiklik bildirimi aynı klasördedir. Kullanıcı oyun merkezindeki bilgi düğmesinden lisans/kaynağa ulaşabilir. Derlenmiş dağıtımda React ve React DOM MIT lisansları da korunur.

## Paket

Yılan, Tuğla Kırma, Sonsuz Koşu, Uçan Denizanası, Masa Tenisi, Uzay Savunması, 2048, Mücevher Eşleştirme, Mayın Tarlası, Kaydırmalı Bulmaca, Kutu İtme, Işıkları Söndür, Renk Sıralama, Hanoi Kuleleri, Hafıza Eşleştirme, Dörtlü Bağlantı, Reversi, Kule Savunması, Basket Atışı, Okçuluk.

## Geliştirme

1. İlgili `src/vendor/open-games/<id>.jsx` kaynağını değiştirin.
2. `npm run build:games` çalıştırın. Statik çıktılar `public/games/open/` altında üretilir; geliştirme sunucusunda oyunu yeniden açın.
3. `npm run test:games`, `npx tsc --noEmit` ve `npm run build` çalıştırın. Üretim derlemesi `prebuild` ile oyunları da yeniden derler.

`scripts/import-open-games.cjs` ilk aktarım aracıdır; tekrar çalıştırmak uyarlanan kaynakları ezer. Günlük geliştirmede kullanmayın. Kaynak kaydı `manifest.json` içindedir. Oyun motoru ve görseller yereldir, CDN bağlantısı bulunmaz.

## Uyarlamalar

- Mobilde iki sütunlu katalog, arama, kategori ve favoriler.
- Son oynanan sekiz oyun ve oyun başına 0–100 en iyi sonuç cihazda saklanır. Bunlar rekabetçi sunucu puanı veya para değildir. Bazı oyunlar hamle/basket/kırılan blok gibi kendi oyun içi değerlerini de gösterir.
- Yerel iframe `sandbox="allow-scripts"` ile çalışır. Oyunlar LifeOS oturumuna, cüzdanına, DOM'una veya depolamasına erişemez. CSP dış ağ bağlantılarını kapatır.
- Oyun ile uygulama arasındaki mesajlar iframe kaynağı ve oturum anahtarıyla kontrol edilir. Yalnızca oyun kimliği, çeviri, duraklatma ve sonuç taşınır; hesap verisi gönderilmez.
- Duraklatma oyun durumunu ve bekleyen zamanlayıcıların kalan süresini korur. Uygulama arka plana geçince durur; kullanıcı devam ettirir. Geri çıkış/yeniden başlatma iframe'i kapatır ve zamanlayıcıları temizler.
- Yeni oyun adları ve kontrol metinleri LifeOS'un 20 dilinde yerel çeviriyle sunulur.
- 2048 yön dönüşümü ve dokunma düğmeleri; kaydırmalı bulmacanın çözülebilir karıştırması; mayın tarlasında güvenli ilk hamle ve dokunmatik bayrak modu; yılanın kuyruk çarpışması/tam tahta davranışı; dörtlü bağlantıda sıra kilidi/beraberlik; Reversi zorunlu pasları; kule savunmasında kule yerleştirirken dalganın yeniden başlamaması düzeltildi.

## Doğrulama ve sınırlar

20 oyun 390×844 tarayıcı görünümünde açılış kontrolünden geçirildi. Gerçek Android/iOS cihaz performansı ve uzun oyun oturumları ayrıca denenmelidir; bu kontrol mağaza yayını onayı değildir. Android/iOS paketleme yapısı oyun statik dosyalarını da dağıtmalı; dış URL ile açılan uygulamada ilk yükleme için bağlantı gerekir. Bulut kayıt, çok oyunculu oturum, gerçek sıralama, ses ayarı ve oyun bazlı kalıcı kaldığı yerden devam bu pakete dahil değildir.

Oyunların farklı uzunlukları vardır: bazıları kısa turlar, bazıları rastgele bulmaca veya tekrar oynanabilir refleks oyunlarıdır. Yeni bölüm, zorluk ve görsel geliştirmeleri aynı kaynaklar üzerinde yapılabilir.
