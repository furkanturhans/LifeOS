# Nodes

## Kullanıcı deneyimi

Beş ikonlu alt menü: Akış, Nodes Reel, + paylaşım, Nodes içi arama, Profil. Nodes içinde LifeOS alt menüsü ve masaüstü kenar çubuğu gizlenir. Üstte eve dönüş, Nodes logosu ve bildirimler bulunur. Hikâye şeridindeki + ile hikâye paylaşılır; hikâyeler 24 saat görünür ve normal akıştan ayrıdır. Arama metin ve kullanıcı adına göre çalışır. Bildirimler kendi paylaşımlarına gelen beğeni ve yorumları gösterir; beğeniler mevcut şemada zaman damgası taşımadığından gönderi tarihine göre sıralanır. Kronolojik ve sayfalı akış; metin veya tek fotoğraf/video paylaşımı; beğeni; son 50 yorumun gösterimi; yorum ekleme; kendi paylaşımını akıştan kaldırma. Medya oynatımı görünürlükten çıkınca durur. Kısa videolar sessiz başlar; azaltılmış hareket tercihi otomatik oynatmayı kapatır.

Profil adı doğrudan LifeOS `User.lifeosId` alanından okunur; ayrı kopyası tutulmaz. Kullanıcı profilinden değiştirildiğinde sonraki okumada eski paylaşımlar da yeni adı gösterir. `ExploreProfile` hesapla bire-çok ilişkilidir, ancak API yalnızca `(userId, slot=0)` upsert eder. İstemciden owner/slot kabul edilmez. İkinci profil arayüzü yoktur.

## Kurulum

1. Çalışan PostgreSQL için `DATABASE_URL`, gerçek Supabase projesi için `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` ayarlanmalı. Gizli değerleri sohbete veya Git'e koymayın.
2. Mevcut `users` tabloları olan veritabanında `prisma/explore.sql` incelenerek uygulanmalı. Bu SQL sadece yeni dört tabloyu ekler; boş veritabanı başlangıç şeması değildir. Depoda önceki migration geçmişi bulunmadığından otomatik reset/push yapılmadı.
3. Supabase SQL editöründe `prisma/explore-storage.sql` uygulanmalı. Kova özel kalır; doğrulanmış kullanıcılar okuyabilir, kendi klasörlerine yükleyip silebilir. SQL politikaları bir kez kurulmalıdır.
4. `npx prisma generate`, ardından uygulama yeniden başlatılır. Supabase ile gerçek giriş ve mevcut LifeOS kullanıcı kaydı gerekir. İstemcide oluşturulan geliştirme oturum çerezi Nodes’ta kabul edilmez.

## Sınırlar

- Gönderi başına tek medya; 50 MB. JPG/PNG/WebP ve MP4/WebM dosya imzaları kontrol edilir. Bu kontrol tam codec çözümleme veya zararlı içerik taraması değildir.
- Kısa video sekmesi video paylaşımlarını ayrı sunar; sunucuda süre/kadraj dönüştürme henüz yoktur.
- Akış sayfa başına 20 kayıt; yorumlar son 50 kayıt. Takip, özel hesap, algoritmik öneri ve çoklu fotoğraf henüz yoktur.
- Yükleme, mevcut sunucu üzerinden geçer. Sunucu/reverse proxy gövde sınırının uygun ayarlanması gerekir. Büyük ölçek için doğrudan imzalı yükleme, iş kuyruğu ve transcode gerekir.
- Kaldırma `deletedAt` ile yumuşak silmedir; medya fiziksel olarak hemen silinmez. Önceden verilmiş imzalı URL en fazla bir saat geçerlidir.
- Hız sınırlaması temel gönderi/yorum sayımıdır; dağıtık trafik için atomik limit deposu eklenmelidir.
- Gerçek kullanıcı verisi veya test medyası dışarı gönderilmedi. Bağlantı kurulmadığından canlı paylaşım testi yapılmadı.

## Doğrulama

`npm run test:explore`, `npm run test:i18n`, `npx tsc --noEmit`, `npx prisma validate`, `npm run build`.

API testleri dosya türü/boyutu, doğrulanmış hesap kimliği, yabancı origin engeli ve tek profil slotunu kapsar. Gerçek veritabanı eşzamanlılık/yükleme testinin yerini tutmaz.

Hikâyeler mevcut ExplorePost.kind alanındaki story türünü kullanır; yeni tablo gerektirmez. Süresi dolan kayıt ve dosyalar fiziksel olarak silinmez; görünürlük sorguyla sınırlanır. Hikâyeler ilk 20 kayıtla sınırlıdır.
