# Çocuk Dünyası · 400 içerik

Yalnızca Çocuk Dünyası kapsamı değiştirildi. Katalogda 100 ayrı mini oyun, 100 ebeveyn eşliğinde eğitim etkinliği, 100 resimli kısa hikâye ve 100 çizim vardır. Bölüm sayıları yayınlanmış kayıtlarla güncellenir; seviyeler ve renk seçenekleri ayrı içerik sayılmaz.

## İçerikler ve lisanslar

- Oyunlar: Jaehyun Shin'in MIT lisanslı açık kaynak koleksiyonundan 100 ayrı yerel HTML oyun. 3–4 yaş için daha basit kontroller, 5–7 yaş için tüm koleksiyon filtresi. Süreli oyunlar da vardır; bütün oyunlar bebeklere uygun diye sunulmaz. Türkçe başlıklar ve yönergeler eklendi. Her oyunda kaynak ve tam MIT bildirimi korunur.
- Eğitim: LifeOS için yazılmış 100 özgün kısa etkinlik, her birinde tanışma ve birlikte deneme kartı. Renkler, şekiller, hayvanlar, yiyecekler, nesneler, doğa, duygular, ilk bilim keşifleri, sayı ve seslerle tanışma. 0–3 yaşta ebeveynin okuyarak gerçek dünyada uygulaması amaçlanır; sınav veya gelişim ölçümü yapılmaz.
- Hikâyeler: African Storybook / Global ASP kaynaklarından 65 resimli CC BY 3.0 veya 4.0 eser ve 35 özgün Türkçe kısa hikâye. Uyarlamalarda yapılan sadeleştirmeler belirtilir. Her kaynak eserin yazarı, çizeri, kaynağı ve tam lisans bağlantısı içerik künyesinde korunur. Özgün hikâyelerin metinleri ve sahne düzenleri LifeOS'a; Noto karakter görselleri Apache 2.0 lisansı altında Google'a aittir. Görseller hareketli film değildir.
- Çizim: 60 hayvan/yiyecek boyaması, 29 Türkçe harf, 10 rakam ve bir çizgi takip sayfası. Noto çizimleri siyah beyaz kapalı alanlara uyarlandı; Apache 2.0 lisansı ve değişiklik bildirimi korunur. Harf ve çizgi çalışmaları 4–7 yaş için etiketlendi. Ayrıca sayıma dahil olmayan boş tuval vardır.

Kaynaklar:
https://github.com/shinjaehyun20/jangyoon-s-game
https://github.com/global-asp/asp-source
https://github.com/global-asp/asp-imagebank
https://global-asp.github.io/stories/master.html
https://github.com/googlefonts/noto-emoji/tree/main/2D/svg

Bunlar lisanslı eserlerdir; “hiçbir telif hakkı yok” şeklinde sunulmaz. Kaynakların sabit Git sürümleri catalog/source-versions.json dosyasındadır. Ticari kullanıma izin vermeyen kaynaklar pakete alınmadı.

## Oynatma, ses ve çizim

Oyunlar allow-scripts iframe içinde açılır; ana hesabın çerezlerine/depolamasına erişemez, dış ağ bağlantısı ve kamera/mikrofon/konum/ödeme izni yoktur. Kaynak oyunların depolaması yalnızca iframe içindeki geçici bellektir. Reklam servisi veya harici oyun sunucusu kullanılmaz.

Cihazın yerel Web Speech sesi kullanılır; ses kapatma, hikâye ayarı, dil değişimi, arka plana geçiş ve bölümden çıkış konuşmayı durdurur. Kullanıcı kendi cihazında sesin çalıştığını doğruladı. Türkçe içerik paketi hazırdır; diğer uygulama dillerine 400 içeriğin editoryal çevirisi tamamlanmış değildir. Ses motoru/yerel dil sesi cihaz desteğine bağlıdır.

Boyamada alan doldurma bir worker'da çalışır; siyah sınırları korur. Serbest fırça, beyaz silgi, 20 adımlık geri alma, yineleme, temizleme, fırça boyutu ve PNG indirme bulunur. Çizim kendiliğinden sunucuya gönderilmez. Oturumdan ayrılmadan PNG indirilerek korunabilir. Yerel Android/iOS galerisine doğrudan kayıt entegrasyonu yapılmadı.

## Yönetici

Gizli adres: /kids/admin. Normal çocuk menüsünde bağlantı bulunmaz. Giriş ayrı yönetici anahtarıyla yapılır; ebeveyn PIN'i yönetici yetkisi vermez. İki saatlik HttpOnly oturum, aynı origin denetimi ve giriş hız sınırı uygulanır. İstemciden gelen kullanıcı kimliği veya rol başlıkları kabul edilmez.

Yerel geliştirmede ilk erişimde özel anahtar .next/cache/kids-content/admin-key.txt dosyasında oluşturulur. Anahtar tarayıcıya veya API cevabına eklenmez. Üretimde KIDS_ADMIN_KEY en az 32 karakterlik özel bir değer olmalıdır; yöneticiyle güvenli şekilde paylaşılır.

İçerikler sekmesinde oyun, eğitim, hikâye veya çizim seçerek başlık, yaş, kaynak, lisans, dosya ve metinleri ekleyin. Hikâyeye sayfa; eğitime kart eklenebilir. Önce taslak olarak kaydedin. İnceleme kutusu ve açıklama tamamlanmadan yayınlama kabul edilmez. Yayın durumunu değiştirerek arşivleyebilirsiniz. Katalog ve sayılar sonraki yüklemede güncellenir.

Yüklemeler PNG/JPEG/WebP, güvenli SVG ve dış ağ kullanmayan tek dosyalık HTML kabul eder. HTML oyunları ve görseller özel depoda tutulur; yalnızca yayınlanan içeriğe ait dosyalar halka açılır. Taslakların sahibi önizleme yapabilir. Karmaşık çok dosyalı oyun için geliştirme sürecinde dosyaların ayrı paketlenmesi gerekir.

Öneriler sekmesi ebeveyn başvurularının kabul/ret kuyruğudur. Kabul, otomatik yayınlama değildir; yönetici içerik kaydını ayrıca oluşturup inceler.

Çizim etkinliklerinde konu, yaş, son tarih, hediye, teslim koşulları ve değerlendirme kuralları belirlenir. Taslak/katılıma açık/kapalı durumları vardır. Katılımlar özel tutulur; herkese açık çocuk profili veya oylama yoktur. Kazanan yalnızca kapalı etkinlikte kabul edilmiş çizimlerden seçilebilir. Hediye teslimi yöneticinin sorumluluğundadır; sahte açık etkinlik veya hediye oluşturulmadı.

## Bağlantı ve depolama

Kullanıcının isteği doğrultusunda Supabase kurulumu ertelendi. Katalog, oyunlar, çizim ve yerel yönetici şu anda çalışır. Gerçek ebeveyn başvurusu ve yarışma katılımı, Supabase üzerinden sunucunun doğruladığı hesap gerektirir. Bağlantı yokken 401 döner; başarılı kayıt yapmış gibi gösterilmez. Uygulamadaki yerel demo kimliği bu işlemleri açamaz.

Üretimde KIDS_DATA_DIR kalıcı ve özel, tek yazıcıyı paylaşan disk konumuna ayarlanmalıdır. İçerik değişiklikleri atomik JSON kaydı ve yazma kilidiyle tutulur; özel görseller/oyunlar/katılımlar aynı depodadır. Varsayılan geliştirme konumu .next/cache/kids-content olduğundan .next temizliği yerel yönetici kayıtlarını silebilir. Üretimde geçici/serverless disk veya birbirinden bağımsız çoklu sunucu uygun değildir; yarınki veritabanı ve nesne deposu entegrasyonu bunu değiştirmelidir. Yedekleme gerekir. Süreç bir yazma sırasında çökerse, başka yazıcı olmadığını doğruladıktan sonra eski write.lock kaldırılmalıdır.

## Doğrulama

node --test src/components/kids/experience/content.test.mjs
npx tsc --noEmit
npx eslint src/components/kids/experience src/components/kids/KidsHomeScreen.tsx src/components/kids/ParentDashboardView.tsx src/lib/kids src/app/api/kids/admin src/app/api/kids/assets src/app/api/kids/content src/app/api/kids/play src/app/api/kids/proposals src/app/api/kids/contests

Yedi otomatik test: 400 benzersiz ve geçerli içerik/tüm varlık dosyaları; 100 oyunun sözdizimi, ağ yalıtımı ve Türkçe görünür etiketleri; 100 güvenli SVG ve 40 takip şablonu; hikâye sayfaları ve lisans künyeleri; yayınlama inceleme şartı; ebeveyn onayı ve etkinlik yaşları; boyama sınırları/ayrı bölgeler/silgi.

Çalışan localhost ortamında verify-live.mjs yönetici girişi, özel taslaklar, yayınlama/arşivleme, özel görsel erişimi, sahte kimlik başlıklarının reddi, hesap zorunluluğu, CSRF ve zararlı SVG reddini dener. Kendi geçici kaydını ve dosyasını temizler; önceki yerel veri dosyasını geri yükler. Yönetici aynı anda kayıt düzenlerken çalıştırılmamalıdır.

Tarayıcıda 100 oyunun açılışı tarandı; başlangıç düğmesi olanlarda düğmeye basıldı. Bowling ve havai fişek kaynaklarındaki iki başlangıç hatası giderilip tekrar denendi. Bu, 100 oyunun her turunun sonuna kadar oynandığı anlamına gelmez. 390×844 görünümde hikâye sayfaları, eğitim kartları, boş tuval fırçası, harf şablonu, boyama/geri alma/yineleme ve PNG indirme denendi. validation/boyama-denemesi.png gerçek tuvalden indirilen örnektir.

Gerçek Android/iOS paket testi, bütün oyunların uzun süreli oynanışı ve çocuk gelişimi uzmanının editoryal değerlendirmesi henüz yapılmadı. İçerik inceleme notları klinik onay veya hatasızlık garantisi değildir. Kapsam dışı prebuild işleri başka modülleri değiştirebildiğinden genel üretim build komutu bu çalışma sırasında çalıştırılmadı.

## İçerikleri yeniden üretme

Çalışan paket public/kids ve dört nihai katalog JSON dosyasındadır; uygulama kaynak klonlarına veya çeviri servisine ihtiyaç duymaz. build-education.mjs özgün etkinlikleri tekrar üretir. Kaynakları yeniden içe almak için source-versions.json içindeki sürümleri .tmp-kids-games, .tmp-kids-story-source, .tmp-kids-stories, .tmp-kids-images ve .tmp-kids-drawings konumlarına alın; Noto için 2D/svg, imagebank için story-selection.json içindeki medium/<id> klasörleri gerekir. curate-games.mjs, import-content.mjs --games, import-content.mjs --stories, build-original-stories.mjs ve build-drawings.mjs araçları kullanılır. Çeviri önbellekleri korunmuştur; eksik metin olduğunda importer dış çeviri servisine başvurabildiğinden kaynak/çeviri değişiklikleri ayrıca incelenmelidir. Yeni içerikler için tercih edilen yol yönetici panelindeki manuel inceleme akışıdır.
