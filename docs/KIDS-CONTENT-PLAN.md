# Çocuk Dünyası içerik planı

11 Ekim 2026. Kullanıcı hedefi: dört bölümün her birinde 100 içerik, toplam 400. Bu belge araştırma ve uygulama planıdır; 400 içeriğin kurulduğu anlamına gelmez.

## Bölümler

| Bölüm | Hedef | İçerik yaklaşımı |
| --- | ---: | --- |
| Mini Oyunlar | 100 | 0–7 yaş kapsamı içinde yaş filtresi; eğlence, bulmaca, eşleştirme, sakin dokunma oyunları. Harf ve sayı öğretimi burada olmayacak. |
| Çocuk Eğitimi | 100 | Kullanıcının belirttiği 0–3 yaş; ebeveyn eşliğinde kısa sesli tanışma ve keşif etkinlikleri. Okuma, yazma veya sınav ön koşulu yok. |
| Hikâyeler | 100 | Kısa, resimli, sesli; okuma ve sahneleri izleme. Her eserin yazar, çizer ve lisansı kayıtlı. |
| Çizim ve Sanat | 100 | Siyah beyaz, kapalı bölgeli çizimler. Renk seç, alana dokun, doldur; geri al, sil, kaydet. |

Eğitim için başlangıç dağılımı: renkler 10, şekiller 10, hayvanlar 15, meyveler 10, sebzeler 10, günlük nesneler 15, sesler ve doğa 10, az/çok ve 1–3 ile tanışma 10, kelime ve harf sesleri 10. Toplam 100. Bu dağılım pedagojik onay almış bir müfredat değildir.

Boyama başlangıç dağılımı: hayvanlar 50, meyve ve sebzeler 20, doğa 15, araçlar ve günlük nesneler 15. Toplam 100. Ayrı çizimler gerekir; aynı çizimin renk varyantları yeni içerik sayılmaz.

100 mini oyun hedefinde tek oyunun seviyeleri veya farklı renkleri ayrı oyun diye sayılmayacak. Her oyun için amaç, etkileşim, kazanma/bitirme koşulu, yeniden oynama ve dokunmatik doğrulama gerekir. Mevcut 30 oyun, yeni paket doğrulandıktan sonra çocuk menüsünden değiştirilecek; ortak yetişkin oyun dosyaları gelişigüzel silinmeyecek.

## Araştırılan kaynaklar

- GCompris: https://gcompris.net/index-en.html — resmi sayfa 2–10 yaş ve 100'den fazla etkinlik belirtiyor; güncel yazılım lisansı GNU AGPL. Bu bir doğrudan yerleştirilebilir 100 HTML5 oyun paketi değildir. 0–3 yaşın tamamına uygun kabul edilmez. Eğitim yaklaşımı ve etkinlik seçimi için aday; kod aktarımı öncesi teknik ve lisans incelemesi gerekli.
- Childsplay: https://childsplay.sourceforge.net/ — okul öncesi etkinlikler; Python/PyGame tabanlı. Mevcut React uygulamasına doğrudan takılacak web paketi olarak değerlendirilmez.
- GameToLeanEnglish: https://github.com/Eyaltor/GameToLeanEnglish — yaklaşık üç yaş için hayvan, renk ve sayı kartları; HTML/CSS/JavaScript ve ses sentezi. README MIT beyan ediyor; tam lisans metni ve kaynak görselleri ayrıca doğrulanmadan içe aktarılmayacak. 100 oyun kaynağı değil, küçük bir eğitim örneği.
- StoryWeaver: https://storyweaver.org.in/en/terms-and-conditions — hikâye içerikleri CC BY 4.0; Read Along ve videolar için ayrı CC BY-NC-ND 4.0 şartları var. Kitap metni ve çizimleri ile hazır ses/video aynı lisans altında varsayılmayacak. Seçilen her kitabın künyesi ve lisansı ayrıca kontrol edilecek. Uygun kitaplardan kendi anlatım ve sahne deneyimini hazırlamak aday yaklaşım.
- HTML5 Mandala: https://github.com/ArtBIT/html5-mandala — MIT lisanslı radyal simetri ve animasyon aracı. Hazır alan doldurma boyama kitabı değildir; yetişkin mandala üretimi için teknik örnek.
- https://github.com/pflajsman/coloring-book — alan doldurma ve SVG boyama için teknik örnek. İncelenen kökte açık kod lisansı doğrulanamadı; kod kopyalanmayacak.

## Mevcut uygulamanın incelenmesi

- KidsMiniGamesView içinde eğitim ve eğlence oyunları karışık. Yeni iki kataloğa ayrılmalı.
- KidsStudyView içinde az sayıda elle tanımlanmış ders bulunuyor. Veri odaklı, yaş ve konu filtreli içerik modeli gerekli.
- KidsStoriesView mevcut görsellerde emoji ağırlıklı; istenen resimli kitap niteliği için sayfa illüstrasyonları gerekli.
- KidsDrawView serbest tuval, fırça ve çıkartmalar sağlıyor; kapalı alanı dokunarak doldurma henüz yok.
- src altında mandala adıyla mevcut bir bileşen bulunamadı. Yetişkin taraftaki hedef ekranın ayrıca belirlenmesi gerekiyor.

## Uygulama sırası ve kabul koşulları

1. Dört ayrı veri kataloğu: sabit kimlik, başlık, konu, yaş aralığı, dil, kaynak, lisans, kredi/atıf, görseller, içerik durumu. İncelenmeyen veya tamamlanmayan içerik kullanıcıya hazır olarak gösterilmez.
2. Gerçek içerikli ilk örnekler üzerinden mobil görünüm: mini oyun, sesli etkinlik, resimli hikâye, alan doldurmalı hayvan çizimi. Ortak boyama motoru yetişkin mandala için de kullanılabilir.
3. Lisansı doğrulanmış oyunları içe al veya gerekli özgün oyunları geliştir. Kart sayısı hedefi oynanabilirlik kontrolünün yerine geçmez.
4. Eğitimde kısa yönergeler, büyük dokunma hedefleri, ebeveyn eşliği; cezalandırıcı süre veya okuma zorunluluğu yok.
5. Hikâyelerde gerçek sayfa çizimleri, anlatımı durdurma/devam etme, sayfa ilerletme ve metin görünümü. Sahneli anlatımın tam animasyon film olduğu iddia edilmez.
6. Boyamada kapalı SVG bölgeleri ve bölge kimlikleri tercih edilir; piksel tabanlı görseller için ayrı taşma/kenar testi gerekir. Geri alma, resmi sıfırlama ve cihazda kaydetme doğrulanır.
7. Tüm içeriklerde reklam, izleyici ve dış site çıkışı denetimi; dili değiştirince içerik ve anlatım dili tutarlı olmalı. Cihazda bulunmayan sesler için sessiz hata yerine açık geri bildirim.
8. Dokunmatik oynanabilirlik, bölüm geçişi, yeniden başlatma, ses kapatma, kaynak atıfları ve gerçek Android/iOS cihaz kontrolleri. İçerikleri bölüm bölüm tamamlayıp 100'e ulaş.

## Güncel durum

Araştırma ve kapsam kaydı tamamlandı. 100 ayrı çocuk mini oyunu, 100 eğitim, 100 hikâye ve 100 boyama henüz seçilmiş, üretilmiş veya uygulamaya yüklenmiş değil. Mevcut çocuk oyunları bu araştırma sırasında silinmedi.
