# 🌌 LifeOS — Phase 1: Core & Phone Experience

LifeOS, klasik bir mobil/web uygulaması gibi değil, **kişisel dijital yaşam alanı ve telefon benzeri sanal ana ekran** olarak tasarlanmış modern bir işletim sistemi deneyimidir.

---

## 🚀 Hızlı Başlangıç

### 1. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

---

## 🛠️ Mimari ve Özellikler

### 1. LifeOS Core
- **Telefon benzeri Ana Ekran**: Minimal, modern, cam (glassmorphism) efektli ve dokunmatik odaklı.
- **Canlı Durum Çubuğu (Status Bar)**: Canlı saat, tarih ve günün saatine göre akıllı selamlama (*"İyi Akşamlar"*).
- **Entegre Arama Çubuğu**: Modülleri anlık arama ve hızlı erişim.
- **Floating Dock**: Ekranın altında 5 modüle kadar sabitlenebilen yüzer dock.

### 2. Modül Sistemi & Kişiselleştirme
- **22 Sistem Modülü**: AI, Chat, MedAI, Finans, Aile, Enerji, Akıllı Ev, Dosyalar, vb.
- **Sürükle-Bırak Sıralama**: `@dnd-kit` ile akıcı grid düzeni.
- **Düzenleme Modu**: Modüle basılı tutulduğunda (long-press) iOS benzeri titreme (shake) animasyonu ve kaldırma butonu.
- **Modül Kitaplığı**: Tüm kategorilerdeki modülleri keşfetme ve ana ekrana ekleme (`/library`).
- **Faz 1 Modül Durumu**: İlk aşama modüller *COMING_SOON* durumundadır ve tıklandığında bilgilendirici modal açılır.

### 3. Kullanıcı ve Kimlik
- **LifeOS ID**: `@furkan` formatında benzersiz sistem kimliği.
- **Profil Yönetimi**: Kişiselleştirilmiş profil, LifeOS ID ve avatar (`/profile`).

### 4. Ayarlar & Tema
- **Tema Yönetimi**: Koyu Mod (varsayılan), Açık Mod ve Sistem Teması (`/settings/appearance`).
- **Dil Seçeneği**: Türkçe (varsayılan) ve İngilizce (`/settings/language`).
- **Güvenlik & Gizlilik**: 2FA/Passkey altyapısı, aktif cihazlar ve oturum yönetimi (`/settings/security`, `/settings/devices`, `/settings/privacy`).

---

## 📦 Veritabanı ve Supabase Yapılandırması

Supabase ve PostgreSQL bağlantılarınızı `.env.local` dosyasına ekleyebilirsiniz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

Prisma şemasını güncellemek ve generate etmek için:
```bash
npx prisma generate
```
