# Sistem incelemesi — 10 Ekim 2026

Bu inceleme kaynak kodunu, TypeScript/ESLint denetimlerini, derlemeyi, dil testlerini ve yeni Keşfet katmanını kapsar. Gerçek cihaz, ödeme sağlayıcısı ve bütün kullanıcı senaryoları için uçtan uca doğrulama değildir.

## Öncelikli bulgular

1. **Canlı altyapı hazır değil.** Supabase değişkenleri gerçek bir projeyi göstermiyor; PostgreSQL bağlantı denemesi `ECONNREFUSED` döndürdü. Keşfet veri tabloları ve medya kovası bu çalışmada sunucuya uygulanmadı. `docs/EXPLORE.md` kurulum adımlarını içerir.
2. **Mevcut oturum altyapısı yayın öncesi düzeltilmeli.** `src/lib/utils.ts`, oturum çerezini istemciden kullanıcı kimliğiyle kuruyor. Profil ve ana ekran API'leri bazı akışlarda bu değeri doğrulanmış oturum gibi kabul ediyor. Profil GET ayrıca kimlik/e-posta sorgularını kabul ediyor. Üretimde yalnızca doğrulanmış sunucu oturumu kullanılmalı; yetkisiz profil sorguları kaldırılmalı. Yeni Keşfet API'si bu geri dönüş yolunu kullanmaz.
3. **Bazı servisler prototip.** Lifechat mesaj API'sinde modül belleğinde örnek mesajlar var. Bir sunucu yeniden başlatıldığında veya birden fazla sunucu çalıştığında kalıcılık ve tutarlılık sağlanmaz. Ödeme, yönetim ve akıllı ev adaptörleri ayrı entegrasyon testleri gerektirir; çalışan arayüz gerçek işlem garantisi değildir.
4. **Mobil dağıtım doğrulanmadı.** Capacitor `out` bekliyor; uygulama sunucu API'lerine de bağlı. Statik mobil paket ile ayrı API adresi/oturum stratejisi netleştirilmeli. Android hata ayıklaması ve mixed-content ayarları geliştirme için açık. iOS paketi/dependencysi ve gerçek cihaz testleri eksik.
5. **ESLint borcu.** İlk genel tarama 151 hata ve 668 uyarı gösterdi; bunların 2 hata ve 5 uyarısı yeni Keşfet dosyasındaydı ve giderildi. Kalanların başlıcaları gevşek `any` tipleri, React effect/purity ihlalleri, kullanılmayan importlar ve JSX metin kaçışları. Dosya silme/son düzenlemeler sayıyı değiştirebilir; `npm run lint` güncel durumun kaynağıdır. Tüm kuralları kapatarak sonuç temiz gösterilmedi.

## Bu çalışmada giderilenler

- Keşfet'in ana ekran tarafından bilerek engellenmesi kaldırıldı.
- Yan menüde Keşfet'in yanlışlıkla “Modül Kitaplığı” olarak görünmesi düzeltildi.
- Ana ekran düzenini geri yükleyen `LayoutSyncProvider` kök düzenine bağlandı; her kullanıcı nesnesi değişikliğinde yeniden yükleme yerine kullanıcı kimliği değişikliği izleniyor.
- Arama sonucu yönlendirmeleri ortak modül adreslerini kullanıyor; arama listesindeki uygulama adları açılabilir bağlantılar oldu.
- Kullanıcının ekranı büyütmesini engelleyen viewport kısıtlamaları kaldırıldı.
- Keşfet için sunucu kimliğinden türeyen profil, sabit profil yuvası, kalıcı gönderi/beğeni/yorum modeli ve boyut sınırına sahip medya kabulü eklendi.

## Temizlik ve klasör düzeni

Kaldırılan 10 eski dosya: eski Keşfet ekranı, başlığı, kilitli kartları, kilit modalı, eski Keşfet store/types dosyaları; `HomeActiveModules`, `HomePersonalBar`, `HomeServicesHero`, `HomeSystemDirectory`.

Yeni işlevler `components/explore`, `lib/explore` ve `app/api/explore` altında. Tekrarlanan uygulama adresleri `modules/routes.ts` altında toplandı. `npm run audit:source` import referansı bulunmayan adayları raporlar; framework giriş dosyalarını veya testlerden kullanılan dosyaları otomatik silmez.

Import edilmeyen kaynak dosyaları çoğunlukla tarayıcı paketine zaten girmez. Bunları silmek klasörü sadeleştirir; ölçülmemiş hızlanma iddiası değildir. `.next`, `node_modules`, Android build çıktıları ve kişisel veriler topluca silinmedi. Dil kataloğu çalışma zamanında kullanılıyor; “büyük dosya” diye kaldırılmadı.

## Sonraki önemli aşamalar

- Oturum güvenliğini bütün API'lerde tek bir sunucu doğrulama katmanına taşımak.
- PostgreSQL, Supabase Auth ve Storage kurulumu sonrası iki farklı gerçek hesapla paylaşım, isim değişimi, yorum, medya ve sahiplik testleri.
- Keşfet için şikâyet/engelleme/moderasyon, video dönüştürme ve thumbnail üretimi, yükleme ilerlemesi ve kesinti sonrası devam; üretim öncesi tamamlanmalı.
- Genel ESLint borcunu bölüm bölüm düzeltmek; özellikle oyunlarda render sırasında rastgelelik, formlarda effect döngüleri ve API doğrulama tipleri.
- Android/iOS geri hareketi, klavye, dosya seçimi, kamera izinleri ve düşük bellek testleri.
