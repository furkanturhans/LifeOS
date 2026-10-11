import type { LocalePreference } from '@/types/user';

/**
 * LifeOS sistemindeki tüm sayfa, modül ve bileşen metinlerinin 20 dildeki karşılıkları.
 */
export const PHRASE_BOOK: Record<string, Partial<Record<LocalePreference, string>>> = {
  // --- Genel & Navigasyon ---
  'Ana Ekran': {
    en: 'Home', de: 'Startseite', fr: 'Accueil', es: 'Inicio', it: 'Home',
    pt: 'Início', ru: 'Главная', ar: 'الرئيسية', zh: '主页', ja: 'ホーム',
    ko: '홈', nl: 'Home', pl: 'Pulpit', sv: 'Hem', az: 'Əsas Ekran',
    hi: 'होम', id: 'Beranda', uk: 'Головна', el: 'Αρχική'
  },
  'Kütüphane': {
    en: 'Library', de: 'Bibliothek', fr: 'Bibliothèque', es: 'Biblioteca', it: 'Libreria',
    pt: 'Biblioteca', ru: 'Библиотека', ar: 'المكتبة', zh: '模块库', ja: 'ライブラリ',
    ko: '라이브러리', nl: 'Bibliotheek', pl: 'Biblioteka', sv: 'Bibliotek', az: 'Kitabxana',
    hi: 'लाइब्रेरी', id: 'Pustaka', uk: 'Бібліотека', el: 'Βιβλιοθήκη'
  },
  'Modül Kitaplığı': {
    en: 'Module Library', de: 'Modul-Bibliothek', fr: 'Bibliothèque de modules', es: 'Biblioteca de módulos', it: 'Libreria moduli',
    pt: 'Biblioteca de módulos', ru: 'Библиотека модулей', ar: 'مكتبة الوحدات', zh: '模块中心', ja: 'モジュールライブラリ',
    ko: '모듈 라이브러리', nl: 'Modulebibliotheek', pl: 'Biblioteka modułów', sv: 'Modulbibliotek', az: 'Modul Kitabxanası',
    hi: 'मॉड्यूल लाइब्रेरी', id: 'Pustaka Modul', uk: 'Бібліотека модулів', el: 'Βιβλιοθήκη στοιχείων'
  },
  'Ara': {
    en: 'Search', de: 'Suchen', fr: 'Rechercher', es: 'Buscar', it: 'Cerca',
    pt: 'Pesquisar', ru: 'Поиск', ar: 'بحث', zh: '搜索', ja: '検索',
    ko: '검색', nl: 'Zoeken', pl: 'Szukaj', sv: 'Sök', az: 'Axtar',
    hi: 'खोजें', id: 'Cari', uk: 'Пошук', el: 'Αναζήτηση'
  },
  'Arama': {
    en: 'Search', de: 'Suche', fr: 'Recherche', es: 'Búsqueda', it: 'Ricerca',
    pt: 'Pesquisa', ru: 'Поиск', ar: 'البحث', zh: '搜索', ja: '検索',
    ko: '검색', nl: 'Zoeken', pl: 'Szukanie', sv: 'Sökning', az: 'Axtarış',
    hi: 'खोज', id: 'Pencarian', uk: 'Пошук', el: 'Αναζήτηση'
  },
  'Profil': {
    en: 'Profile', de: 'Profil', fr: 'Profil', es: 'Perfil', it: 'Profilo',
    pt: 'Perfil', ru: 'Профиль', ar: 'الملف الشخصي', zh: '个人资料', ja: 'プロフィール',
    ko: '프로필', nl: 'Profiel', pl: 'Profil', sv: 'Profil', az: 'Profil',
    hi: 'प्रोफ़ाइल', id: 'Profil', uk: 'Профіль', el: 'Προφίλ'
  },
  'Ayarlar': {
    en: 'Settings', de: 'Einstellungen', fr: 'Paramètres', es: 'Ajustes', it: 'Impostazioni',
    pt: 'Configurações', ru: 'Настройки', ar: 'الإعدادات', zh: '设置', ja: '設定',
    ko: '설정', nl: 'Instellingen', pl: 'Ustawienia', sv: 'Inställningar', az: 'Tənzimləmələr',
    hi: 'सेटिंग्स', id: 'Pengaturan', uk: 'Налаштування', el: 'Ρυθμίσεις'
  },
  'Bildirimler': {
    en: 'Notifications', de: 'Mitteilungen', fr: 'Notifications', es: 'Notificaciones', it: 'Notifiche',
    pt: 'Notificações', ru: 'Уведомления', ar: 'الإشعارات', zh: '通知', ja: '通知',
    ko: '알림', nl: 'Meldingen', pl: 'Powiadomienia', sv: 'Aviseringar', az: 'Bildirişlər',
    hi: 'सूचनाएं', id: 'Notifikasi', uk: 'Сповіщення', el: 'Ειδοποιήσεις'
  },
  'Bildirim Merkezi': {
    en: 'Notification Center', de: 'Mitteilungszentrale', fr: 'Centre de notifications', es: 'Centro de notificaciones', it: 'Centro notifiche',
    pt: 'Central de notificações', ru: 'Центр уведомлений', ar: 'مركز الإشعارات', zh: '通知中心', ja: '通知センター',
    ko: '알림 센터', nl: 'Meldingencentrum', pl: 'Centrum powiadomień', sv: 'Aviseringscenter', az: 'Bildiriş Mərkəzi',
    hi: 'सूचना केंद्र', id: 'Pusat Notifikasi', uk: 'Центр сповіщень', el: 'Κέντρο ειδοποιήσεων'
  },
  'Çıkış Yap': {
    en: 'Log Out', de: 'Abmelden', fr: 'Déconnexion', es: 'Cerrar sesión', it: 'Disconnetti',
    pt: 'Sair', ru: 'Выйти', ar: 'تسجيل الخروج', zh: '退出登录', ja: 'ログアウト',
    ko: '로그아웃', nl: 'Uitloggen', pl: 'Wyloguj', sv: 'Logga ut', az: 'Çıxış',
    hi: 'लॉग आउट', id: 'Keluar', uk: 'Вийти', el: 'Αποσύνδεση'
  },
  'Giriş Yap': {
    en: 'Sign In', de: 'Anmelden', fr: 'Connexion', es: 'Iniciar sesión', it: 'Accedi',
    pt: 'Entrar', ru: 'Войти', ar: 'تسجيل الدخول', zh: '登录', ja: 'ログイン',
    ko: '로그인', nl: 'Inloggen', pl: 'Zaloguj się', sv: 'Logga in', az: 'Daxil ol',
    hi: 'साइन इन', id: 'Masuk', uk: 'Увійти', el: 'Σύνδεση'
  },
  'Kayıt Ol': {
    en: 'Sign Up', de: 'Registrieren', fr: "S'inscrire", es: 'Registrarse', it: 'Registrati',
    pt: 'Cadastrar', ru: 'Регистрация', ar: 'إنشاء حساب', zh: '注册', ja: '登録',
    ko: '회원가입', nl: 'Registreren', pl: 'Zarejestruj się', sv: 'Registrera', az: 'Qeydiyyat',
    hi: 'साइन अप', id: 'Daftar', uk: 'Реєстрація', el: 'Εγγραφή'
  },
  'Geri': {
    en: 'Back', de: 'Zurück', fr: 'Retour', es: 'Atrás', it: 'Indietro',
    pt: 'Voltar', ru: 'Назад', ar: 'رجوع', zh: '返回', ja: '戻る',
    ko: '뒤로', nl: 'Terug', pl: 'Wstecz', sv: 'Tillbaka', az: 'Geri',
    hi: 'वापस', id: 'Kembali', uk: 'Назад', el: 'Πίσω'
  },
  'Kaydet': {
    en: 'Save', de: 'Speichern', fr: 'Enregistrer', es: 'Guardar', it: 'Salva',
    pt: 'Salvar', ru: 'Сохранить', ar: 'حفظ', zh: '保存', ja: '保存',
    ko: '저장', nl: 'Opslaan', pl: 'Zapisz', sv: 'Spara', az: 'Yadda saxla',
    hi: 'सहेजें', id: 'Simpan', uk: 'Зберегти', el: 'Αποθήκευση'
  },
  'İptal': {
    en: 'Cancel', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar', it: 'Annulla',
    pt: 'Cancelar', ru: 'Отмена', ar: 'إلغاء', zh: '取消', ja: 'キャンセル',
    ko: '취소', nl: 'Annuleren', pl: 'Anuluj', sv: 'Avbryt', az: 'İmtina',
    hi: 'रद्द करें', id: 'Batal', uk: 'Скасувати', el: 'Ακύρωση'
  },
  'Bitti': {
    en: 'Done', de: 'Fertig', fr: 'Terminé', es: 'Listo', it: 'Fatto',
    pt: 'Concluído', ru: 'Готово', ar: 'تم', zh: '完成', ja: '完了',
    ko: '완료', nl: 'Klaar', pl: 'Gotowe', sv: 'Klar', az: 'Hazırdır',
    hi: 'पूर्ण', id: 'Selesai', uk: 'Готово', el: 'Τέλος'
  },
  'Düzenle': {
    en: 'Edit', de: 'Bearbeiten', fr: 'Modifier', es: 'Editar', it: 'Modifica',
    pt: 'Editar', ru: 'Изменить', ar: 'تعديل', zh: '编辑', ja: '編集',
    ko: '수정', nl: 'Bewerken', pl: 'Edytuj', sv: 'Redigera', az: 'Düzəliş et',
    hi: 'संपादित करें', id: 'Edit', uk: 'Редагувати', el: 'Επεξεργασία'
  },
  'Sil': {
    en: 'Delete', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar', it: 'Elimina',
    pt: 'Excluir', ru: 'Удалить', ar: 'حذف', zh: '删除', ja: '削除',
    ko: '삭제', nl: 'Verwijderen', pl: 'Usuń', sv: 'Radera', az: 'Sil',
    hi: 'हटाएं', id: 'Hapus', uk: 'Видалити', el: 'Διαγραφή'
  },
  'Kapat': {
    en: 'Close', de: 'Schließen', fr: 'Fermer', es: 'Cerrar', it: 'Chiudi',
    pt: 'Fechar', ru: 'Закрыть', ar: 'إغلاق', zh: '关闭', ja: '閉じる',
    ko: '닫기', nl: 'Sluiten', pl: 'Zamknij', sv: 'Stäng', az: 'Bağla',
    hi: 'बंद करें', id: 'Tutup', uk: 'Закрити', el: 'Κλείσιμο'
  },
  'Tümü': {
    en: 'All', de: 'Alle', fr: 'Tous', es: 'Todos', it: 'Tutti',
    pt: 'Todos', ru: 'Все', ar: 'الكل', zh: '全部', ja: 'すべて',
    ko: '전체', nl: 'Alles', pl: 'Wszystkie', sv: 'Alla', az: 'Hamısı',
    hi: 'सभी', id: 'Semua', uk: 'Всі', el: 'Όλα'
  },
  'Tüm Modüller': {
    en: 'All Modules', de: 'Alle Module', fr: 'Tous les modules', es: 'Todos los módulos', it: 'Tutti i moduli',
    pt: 'Todos os módulos', ru: 'Все модули', ar: 'جميع الوحدات', zh: '全部模块', ja: 'すべてのモジュール',
    ko: '모든 모듈', nl: 'Alle modules', pl: 'Wszystkie moduły', sv: 'Alla moduler', az: 'Bütün Modullar',
    hi: 'सभी मॉड्यूल', id: 'Semua Modul', uk: 'Усі модулі', el: 'Όλα τα στοιχεία'
  },
  'Aktif': {
    en: 'Active', de: 'Aktiv', fr: 'Actif', es: 'Activo', it: 'Attivo',
    pt: 'Ativo', ru: 'Активно', ar: 'نشط', zh: '进行中', ja: '有効',
    ko: '활성', nl: 'Actief', pl: 'Aktywny', sv: 'Aktiv', az: 'Aktiv',
    hi: 'सक्रिय', id: 'Aktif', uk: 'Активно', el: 'Ενεργό'
  },
  'Yakında': {
    en: 'Soon', de: 'Bald', fr: 'Bientôt', es: 'Pronto', it: 'Presto',
    pt: 'Em breve', ru: 'Скоро', ar: 'قريباً', zh: '即将推出', ja: '近日公開',
    ko: '출시 예정', nl: 'Binnenkort', pl: 'Wkrótce', sv: 'Snart', az: 'Tezliklə',
    hi: 'जल्द ही', id: 'Segera', uk: 'Скоро', el: 'Σύντομα'
  },
  'Eklendi': {
    en: 'Added', de: 'Hinzugefügt', fr: 'Ajouté', es: 'Añadido', it: 'Aggiunto',
    pt: 'Adicionado', ru: 'Добавлено', ar: 'تمت الإضافة', zh: '已添加', ja: '追加済み',
    ko: '추가됨', nl: 'Toegevoegd', pl: 'Dodano', sv: 'Tillagd', az: 'Əlavə edildi',
    hi: 'जोड़ा गया', id: 'Ditambahkan', uk: 'Додано', el: 'Προστέθηκε'
  },
  'Ana Ekranda': {
    en: 'On Home Screen', de: 'Auf der Startseite', fr: "Sur l'accueil", es: 'En Inicio', it: 'In Home',
    pt: 'No Início', ru: 'На главном экране', ar: 'في الرئيسية', zh: '已在主页', ja: 'ホーム配置中',
    ko: '홈에 있음', nl: 'Op Home', pl: 'Na pulpicie', sv: 'På Hem', az: 'Əsas Ekranda',
    hi: 'होम पर', id: 'Di Beranda', uk: 'На головній', el: 'Στην Αρχική'
  },
  'Ana Ekrana Ekle': {
    en: 'Add to Home', de: 'Zur Startseite', fr: "Ajouter à l'accueil", es: 'Añadir a Inicio', it: 'Aggiungi a Home',
    pt: 'Adicionar ao Início', ru: 'Добавить на главный', ar: 'إضافة إلى الرئيسية', zh: '添加至主页', ja: 'ホームに追加',
    ko: '홈에 추가', nl: 'Toevoegen aan Home', pl: 'Dodaj do pulpitu', sv: 'Lägg till på Hem', az: 'Əsas Ekrana Əlavə Et',
    hi: 'होम में जोड़ें', id: 'Tambah ke Beranda', uk: 'Додати на головну', el: 'Προσθήκη στην Αρχική'
  },
  'Ana Ekrandan Kaldır': {
    en: 'Remove from Home', de: 'Von Startseite entfernen', fr: "Retirer de l'accueil", es: 'Quitar de Inicio', it: 'Rimuovi da Home',
    pt: 'Remover do Início', ru: 'Удалить с главного', ar: 'إزالة من الرئيسية', zh: '从主页移除', ja: 'ホームから削除',
    ko: '홈에서 제거', nl: 'Verwijderen van Home', pl: 'Usuń z pulpitu', sv: 'Ta bort från Hem', az: 'Əsas Ekrandan Sil',
    hi: 'होम से हटाएं', id: 'Hapus dari Beranda', uk: 'Видалити з головної', el: 'Αφαίρεση από την Αρχική'
  },

  // --- Hizmetler Modülü (Services) ---
  'Hizmetler': {
    en: 'Services', de: 'Dienste', fr: 'Services', es: 'Servicios', it: 'Servizi',
    pt: 'Serviços', ru: 'Услуги', ar: 'الخدمات', zh: '生活服务', ja: 'サービス',
    ko: '서비스', nl: 'Diensten', pl: 'Usługi', sv: 'Tjänster', az: 'Xidmətlər',
    hi: 'सेवाएं', id: 'Layanan', uk: 'Послуги', el: 'Υπηρεσίες'
  },
  'Taksi': {
    en: 'Taxi', de: 'Taxi', fr: 'Taxi', es: 'Taxi', it: 'Taxi',
    pt: 'Táxi', ru: 'Такси', ar: 'تاكسي', zh: '出行出租', ja: 'タクシー',
    ko: '택시', nl: 'Taxi', pl: 'Taxi', sv: 'Taxi', az: 'Taksi',
    hi: 'टैक्सी', id: 'Taksi', uk: 'Таксі', el: 'Ταξί'
  },
  'Şehir içi ve şehirlerarası güvenli taksi çağırma': {
    en: 'Safe local and intercity taxi booking', de: 'Sichere Taxis für Nah- und Fernfahrten',
    fr: 'Réservation de taxi urbain et interurbain', es: 'Reserva de taxi urbano e interurbano',
    it: 'Chiamata taxi sicura in città e fuori', pt: 'Chame táxis com segurança na cidade e na estrada',
    ru: 'Безопасный вызов такси по городу и межгороду', ar: 'طلب تاكسي آمن داخل المدينة وبين المدن',
    zh: '安全便捷的同城及城际叫车服务', ja: '市内および長距離の安心タクシー配車',
    ko: '안전한 시내 및 시외 택시 호출', nl: 'Veilige taxi in en buiten de stad',
    pl: 'Bezpieczne zamawianie taksówek w mieście i trasie', sv: 'Säker taxibokning i och mellan städer',
    az: 'Şəhərdaxili və şəhərlərarası etibarlı taksi sifarişi', hi: 'शहर और इंटरसिटी के लिए सुरक्षित टैक्सी',
    id: 'Pemesanan taksi aman dalam dan luar kota', uk: 'Безпечне замовлення таксі по місту та міжмісту',
    el: 'Ασφαλής κλήση ταξί στην πόλη και υπεραστικά'
  },
  'Seyahat': {
    en: 'Travel', de: 'Reisen', fr: 'Voyage', es: 'Viajes', it: 'Viaggi',
    pt: 'Viagens', ru: 'Путешествия', ar: 'السفر', zh: '商旅出行', ja: '旅行',
    ko: '여행', nl: 'Reizen', pl: 'Podróże', sv: 'Resor', az: 'Səyahət',
    hi: 'यात्रा', id: 'Perjalanan', uk: 'Подорожі', el: 'Ταξίδια'
  },
  'Otobüs seferleri, uçak, otel ve araç kiralama': {
    en: 'Bus, flights, hotels, and car rentals', de: 'Bus, Flug, Hotel und Mietwagen',
    fr: 'Bus, vols, hôtels et location de voiture', es: 'Autobús, vuelos, hoteles y alquiler de coches',
    it: 'Autobus, voli, hotel e noleggio auto', pt: 'Passagens, voos, hotéis e aluguel de carros',
    ru: 'Автобусы, авиабилеты, отели и прокат авто', ar: 'رحلات الحافلات، الطيران، الفنادق وتأجير السيارات',
    zh: '汽车票、机票、酒店预订与租车', ja: 'バス、航空券、ホテル、レンタカー予約',
    ko: '버스, 항공권, 호텔 및 렌터카 예약', nl: 'Bussen, vluchten, hotels en autoverhuur',
    pl: 'Autobusy, loty, hotele i wynajem aut', sv: 'Buss, flyg, hotell och hyrbil',
    az: 'Avtobus reysləri, təyyarə, otel və avtomobil icarəsi', hi: 'बस, उड़ानें, होटल और कार किराया',
    id: 'Bus, penerbangan, hotel dan rental mobil', uk: 'Автобуси, авіаквитки, готелі та оренда авто',
    el: 'Λεωφορεία, πτήσεις, ξενοδοχεία και ενοικίαση'
  },
  'Nakliye': {
    en: 'Moving & Logistics', de: 'Umzug & Transport', fr: 'Déménagement', es: 'Mudanzas', it: 'Traslochi',
    pt: 'Mudanças', ru: 'Грузоперевозки', ar: 'النقل والشحن', zh: '货运搬家', ja: '引越し・運送',
    ko: '이사 및 운송', nl: 'Verhuizing', pl: 'Przeprowadzki', sv: 'Flytt & Transport', az: 'Daşınma',
    hi: 'स्थानांतरण', id: 'Pindahan', uk: 'Вантажоперевезення', el: 'Μετακομίσεις'
  },
  'Evden eve taşıma ve parça eşya lojistiği': {
    en: 'Home relocation and cargo delivery', de: 'Umzüge und Stückgutlogistik',
    fr: 'Déménagement complet et transport de colis', es: 'Mudanzas completas y transporte de bultos',
    it: 'Traslochi casa e trasporto merci', pt: 'Mudanças residenciais e fretes',
    ru: 'Квартирные переезды и доставка грузов', ar: 'نقل الأثاث المنزلي وشحن الطرود',
    zh: '居民搬家与大件货物配送', ja: '引越し作業と荷物輸送サービス',
    ko: '가정 이사 및 화물 배송 서비스', nl: 'Verhuizingen en goederenlogistiek',
    pl: 'Przeprowadzki domów i logistyka ładunków', sv: 'Bohagsflytt och godstransport',
    az: 'Evdən-evə köçürülmə və yük logistikası', hi: 'घर का स्थानांतरण और पार्सल डिलीवरी',
    id: 'Pindahan rumah dan logistik kargo', uk: 'Квартирні переїзди та доставка речей',
    el: 'Μετακόμιση σπιτιού και μεταφορά δεμάτων'
  },
  'Usta': {
    en: 'Craftsman & Repair', de: 'Handwerker', fr: 'Artisans', es: 'Técnico y reformas', it: 'Artigiano',
    pt: 'Profissionais & Reparos', ru: 'Мастер на час', ar: 'الفنيون والصيانة', zh: '上门维修师傅', ja: '専門修理・工務',
    ko: '전문 수리 기사', nl: 'Vakmensen', pl: 'Fachowiec', sv: 'Hantverkare', az: 'Usta',
    hi: 'कारीगर व मरम्मत', id: 'Tukang & Perbaikan', uk: 'Майстер на всі руки', el: 'Τεχνίτης & Επισκευές'
  },
  'Elektrik, tesisat, boya ve montaj ustası': {
    en: 'Electricians, plumbing, paint, and assembly', de: 'Elektrik, Sanitär, Maler und Montage',
    fr: 'Électricité, plomberie, peinture et montage', es: 'Electricidad, fontanería, pintura y montaje',
    it: 'Elettricisti, idraulici, pittura e montaggio', pt: 'Eletricista, encanador, pintura e montagem',
    ru: 'Электрика, сантехника, малярные работы и сборка', ar: 'كهربائي، سباك، دهان وتركيب أثاث',
    zh: '电路维修、水管疏通、粉刷与家具组装', ja: '電気工事、水道修理、塗装、家具組み立て',
    ko: '전기, 배관, 페인트 및 가구 조립 기술자', nl: 'Elektra, loodgieter, schilder en montage',
    pl: 'Elektryka, hydraulika, malowanie i montaż', sv: 'El, VVS, måleri och montering',
    az: 'Elektrik, santexnika, rəngsaz və quraşdırma', hi: 'बिजली, नलसाजी, पेंट और असेंबली',
    id: 'Tukang listrik, pipa, cat dan perakitan', uk: 'Електрика, сантехніка, фарбування та збірка',
    el: 'Ηλεκτρολόγοι, υδραυλικοί, βάψιμο και τοποθέτηση'
  },

  // --- Profil & Hesap ---
  'Hesap': {
    en: 'Account', de: 'Konto', fr: 'Compte', es: 'Cuenta', it: 'Account',
    pt: 'Conta', ru: 'Аккаунт', ar: 'الحساب', zh: '账户', ja: 'アカウント',
    ko: '계정', nl: 'Account', pl: 'Konto', sv: 'Konto', az: 'Hesab',
    hi: 'खाता', id: 'Akun', uk: 'Обліковий запис', el: 'Λογαριασμός'
  },
  'Hesap Bilgileri': {
    en: 'Account Info', de: 'Kontoinformationen', fr: 'Infos du compte', es: 'Datos de la cuenta', it: 'Dati account',
    pt: 'Dados da conta', ru: 'Данные аккаунта', ar: 'معلومات الحساب', zh: '账户详情', ja: 'アカウント情報',
    ko: '계정 정보', nl: 'Accountgegevens', pl: 'Informacje o koncie', sv: 'Kontouppgifter', az: 'Hesab Məlumatları',
    hi: 'खाता विवरण', id: 'Info Akun', uk: 'Дані облікового запису', el: 'Στοιχεία λογαριασμού'
  },
  'Ad Soyad': {
    en: 'Full Name', de: 'Vollständiger Name', fr: 'Nom complet', es: 'Nombre completo', it: 'Nome e cognome',
    pt: 'Nome completo', ru: 'ФИО', ar: 'الاسم الكامل', zh: '姓名', ja: '氏名',
    ko: '성명', nl: 'Volledige naam', pl: 'Imię i nazwisko', sv: 'Fullständigt namn', az: 'Ad Soyad',
    hi: 'पूरा नाम', id: 'Nama Lengkap', uk: "Повне ім'я", el: 'Ονοματεπώνυμο'
  },
  'E-posta': {
    en: 'Email', de: 'E-Mail', fr: 'E-mail', es: 'Correo electrónico', it: 'Email',
    pt: 'E-mail', ru: 'Эл. почта', ar: 'البريد الإلكتروني', zh: '电子邮箱', ja: 'メールアドレス',
    ko: '이메일', nl: 'E-mailadres', pl: 'Adres e-mail', sv: 'E-post', az: 'E-poçt',
    hi: 'ईमेल', id: 'Email', uk: 'Електронна пошта', el: 'Email'
  },
  'Şifre': {
    en: 'Password', de: 'Passwort', fr: 'Mot de passe', es: 'Contraseña', it: 'Password',
    pt: 'Senha', ru: 'Пароль', ar: 'كلمة المرور', zh: '密码', ja: 'パスワード',
    ko: '비밀번호', nl: 'Wachtwoord', pl: 'Hasło', sv: 'Lösenord', az: 'Şifrə',
    hi: 'पासवर्ड', id: 'Kata Sandi', uk: 'Пароль', el: 'Κωδικός'
  },
  'Şifre Değiştir': {
    en: 'Change Password', de: 'Passwort ändern', fr: 'Changer le mot de passe', es: 'Cambiar contraseña', it: 'Cambia password',
    pt: 'Alterar senha', ru: 'Сменить пароль', ar: 'تغيير كلمة المرور', zh: '修改密码', ja: 'パスワード変更',
    ko: '비밀번호 변경', nl: 'Wachtwoord wijzigen', pl: 'Zmień hasło', sv: 'Byt lösenord', az: 'Şifrəni dəyiş',
    hi: 'पासवर्ड बदलें', id: 'Ubah Kata Sandi', uk: 'Змінити пароль', el: 'Αλλαγή κωδικού'
  },
  'Hesap şifreni güncelle': {
    en: 'Update your account password', de: 'Aktualisieren Sie Ihr Passwort', fr: 'Mettre à jour le mot de passe',
    es: 'Actualiza la contraseña de tu cuenta', it: 'Aggiorna la tua password', pt: 'Atualize sua senha de acesso',
    ru: 'Обновите пароль от аккаунта', ar: 'قم بتحديث كلمة مرور حسابك', zh: '更新您的账户安全密码',
    ja: 'アカウントパスワードを更新', ko: '계정 비밀번호를 업데이트하세요', nl: 'Werk uw wachtwoord bij',
    pl: 'Zaktualizuj hasło do konta', sv: 'Uppdatera ditt kontolösenord', az: 'Hesab şifrənizi yeniləyin',
    hi: 'अपना खाता पासवर्ड अपडेट करें', id: 'Perbarui kata sandi akun Anda', uk: 'Оновіть пароль облікового запису',
    el: 'Ενημερώστε τον κωδικό πρόσβασής σας'
  },
  'Cihazlar': {
    en: 'Devices', de: 'Geräte', fr: 'Appareils', es: 'Dispositivos', it: 'Dispositivi',
    pt: 'Dispositivos', ru: 'Устройства', ar: 'الأجهزة', zh: '登录设备', ja: 'デバイス',
    ko: '기기', nl: 'Apparaten', pl: 'Urządzenia', sv: 'Enheter', az: 'Cihazlar',
    hi: 'उपकरण', id: 'Perangkat', uk: 'Пристрої', el: 'Συσκευές'
  },
  'Aktif Oturumlar': {
    en: 'Active Sessions', de: 'Aktive Sitzungen', fr: 'Sessions actives', es: 'Sesiones activas', it: 'Sessioni attive',
    pt: 'Sessões ativas', ru: 'Активные сессии', ar: 'الجلسات النشطة', zh: '活动会话', ja: 'アクティブセッション',
    ko: '활성 세션', nl: 'Actieve sessies', pl: 'Aktywne sesje', sv: 'Aktiva sessioner', az: 'Aktiv Sessiyalar',
    hi: 'सक्रिय सत्र', id: 'Sesi Aktif', uk: 'Активні сесії', el: 'Ενεργές συνδέσεις'
  },
  'Görünüm': {
    en: 'Appearance', de: 'Erscheinungsbild', fr: 'Apparence', es: 'Apariencia', it: 'Aspetto',
    pt: 'Aparência', ru: 'Оформление', ar: 'المظهر', zh: '界面外观', ja: '外観',
    ko: '화면 테마', nl: 'Uiterlijk', pl: 'Wygląd', sv: 'Utseende', az: 'Görünüş',
    hi: 'दिखावट', id: 'Tampilan', uk: 'Вигляд', el: 'Εμφάνιση'
  },
  'Tema': {
    en: 'Theme', de: 'Design', fr: 'Thème', es: 'Tema', it: 'Tema',
    pt: 'Tema', ru: 'Тема', ar: 'السمة', zh: '主题风格', ja: 'テーマ',
    ko: '테마', nl: 'Thema', pl: 'Motyw', sv: 'Tema', az: 'Mövzu',
    hi: 'थीम', id: 'Tema', uk: 'Тема', el: 'Θέμα'
  },
  'Açık': {
    en: 'Light', de: 'Hell', fr: 'Clair', es: 'Claro', it: 'Chiaro',
    pt: 'Claro', ru: 'Светлая', ar: 'فاتح', zh: '浅色', ja: 'ライト',
    ko: '라이트', nl: 'Licht', pl: 'Jasny', sv: 'Ljust', az: 'Açıq',
    hi: 'लाइट', id: 'Terang', uk: 'Світла', el: 'Φωτεινό'
  },
  'Koyu': {
    en: 'Dark', de: 'Dunkel', fr: 'Sombre', es: 'Oscuro', it: 'Scuro',
    pt: 'Escuro', ru: 'Тёмная', ar: 'داكن', zh: '深色', ja: 'ダーク',
    ko: '다크', nl: 'Donker', pl: 'Ciemny', sv: 'Mörkt', az: 'Qaranlıq',
    hi: 'डार्क', id: 'Gelap', uk: 'Темна', el: 'Σκούρο'
  },
  'Sistem': {
    en: 'System', de: 'System', fr: 'Système', es: 'Sistema', it: 'Sistema',
    pt: 'Sistema', ru: 'Системная', ar: 'النظام', zh: '跟随系统', ja: 'システム',
    ko: '시스템', nl: 'Systeem', pl: 'Systemowy', sv: 'System', az: 'Sistem',
    hi: 'सिस्टम', id: 'Sistem', uk: 'Системна', el: 'Σύστημα'
  },
  'Dil': {
    en: 'Language', de: 'Sprache', fr: 'Langue', es: 'Idioma', it: 'Lingua',
    pt: 'Idioma', ru: 'Язык', ar: 'اللغة', zh: '语言', ja: '言語',
    ko: '언어', nl: 'Taal', pl: 'Język', sv: 'Språk', az: 'Dil',
    hi: 'भाषा', id: 'Bahasa', uk: 'Мова', el: 'Γλώσσα'
  },
  'Uygulama Dili': {
    en: 'App Language', de: 'App-Sprache', fr: "Langue de l'application", es: 'Idioma de la aplicación', it: "Lingua dell'app",
    pt: 'Idioma do aplicativo', ru: 'Язык приложения', ar: 'لغة التطبيق', zh: '应用程序语言', ja: 'アプリ言語',
    ko: '앱 언어', nl: 'App-taal', pl: 'Język aplikacji', sv: 'Appspråk', az: 'Tətbiq Dili',
    hi: 'ऐप भाषा', id: 'Bahasa Aplikasi', uk: 'Мова застосунку', el: 'Γλώσσα εφαρμογής'
  },
  'Güvenlik': {
    en: 'Security', de: 'Sicherheit', fr: 'Sécurité', es: 'Seguridad', it: 'Sicurezza',
    pt: 'Segurança', ru: 'Безопасность', ar: 'الأمان', zh: '账户安全', ja: 'セキュリティ',
    ko: '보안', nl: 'Beveiliging', pl: 'Bezpieczeństwo', sv: 'Säkerhet', az: 'Təhlükəsizlik',
    hi: 'सुरक्षा', id: 'Keamanan', uk: 'Безпека', el: 'Ασφάλεια'
  },
  'Gizlilik': {
    en: 'Privacy', de: 'Datenschutz', fr: 'Confidentialité', es: 'Privacidad', it: 'Privacy',
    pt: 'Privacidade', ru: 'Конфиденциальность', ar: 'الخصوصية', zh: '隐私保护', ja: 'プライバシー',
    ko: '개인정보', nl: 'Privacy', pl: 'Prywatność', sv: 'Integritet', az: 'Məxfilik',
    hi: 'गोपनीयता', id: 'Privasi', uk: 'Конфіденційність', el: 'Απόρρητο'
  },

  // --- Finans Modülü (Finance) ---
  'Finans': {
    en: 'Finance', de: 'Finanzen', fr: 'Finances', es: 'Finanzas', it: 'Finanza',
    pt: 'Finanças', ru: 'Финансы', ar: 'المالية', zh: '财务中心', ja: '財務',
    ko: '금융', nl: 'Financiën', pl: 'Finanse', sv: 'Ekonomi', az: 'Maliyyə',
    hi: 'वित्त', id: 'Keuangan', uk: 'Фінанси', el: 'Οικονομικά'
  },
  'Cüzdan': {
    en: 'Wallet', de: 'Geldbörse', fr: 'Portefeuille', es: 'Billetera', it: 'Portafoglio',
    pt: 'Carteira', ru: 'Кошелёк', ar: 'المحفظة', zh: '数字钱包', ja: 'ウォレット',
    ko: '지갑', nl: 'Portemonnee', pl: 'Portfel', sv: 'Plånbok', az: 'Pulqabı',
    hi: 'वॉलेट', id: 'Dompet', uk: 'Гаманець', el: 'Πορτοφόλι'
  },
  'Bakiye': {
    en: 'Balance', de: 'Guthaben', fr: 'Solde', es: 'Saldo', it: 'Saldo',
    pt: 'Saldo', ru: 'Баланс', ar: 'الرصيد', zh: '账户余额', ja: '残高',
    ko: '잔액', nl: 'Saldo', pl: 'Saldo', sv: 'Saldo', az: 'Balans',
    hi: 'शेष राशि', id: 'Saldo', uk: 'Баланс', el: 'Υπόλοιπο'
  },
  'Kredi': {
    en: 'Credits', de: 'Guthabenpunkte', fr: 'Crédits', es: 'Créditos', it: 'Crediti',
    pt: 'Créditos', ru: 'Кредиты', ar: 'النقاط / الرصيد', zh: '积分余额', ja: 'クレジット',
    ko: '크레딧', nl: 'Credits', pl: 'Kredyty', sv: 'Krediter', az: 'Kredit',
    hi: 'क्रेडिट', id: 'Kredit', uk: 'Кредити', el: 'Μονάδες'
  },
  'Son İşlemler': {
    en: 'Recent Transactions', de: 'Letzte Transaktionen', fr: 'Transactions récentes', es: 'Transacciones recientes', it: 'Ultime transazioni',
    pt: 'Transações recentes', ru: 'Последние операции', ar: 'أحدث المعاملات', zh: '最近明细', ja: '最近の取引',
    ko: '최근 거래 내역', nl: 'Recente transacties', pl: 'Ostatnie transakcje', sv: 'Senaste transaktioner', az: 'Son Əməliyyatlar',
    hi: 'हाल के लेन-देन', id: 'Transaksi Terkini', uk: 'Останні транзакції', el: 'Πρόσφατες συναλλαγές'
  },
  'Para Yükle': {
    en: 'Top Up', de: 'Aufladen', fr: 'Recharger', es: 'Recargar', it: 'Ricarica',
    pt: 'Recarregar', ru: 'Пополнить', ar: 'شحن الرصيد', zh: '充值', ja: 'チャージ',
    ko: '충전하기', nl: 'Opwaarderen', pl: 'Doładuj', sv: 'Ladda på', az: 'Balans artır',
    hi: 'टॉप अप करें', id: 'Isi Ulang', uk: 'Поповнити', el: 'Επαναφόρτιση'
  },

  // --- Dersler / Eğitim (Education / Courses) ---
  'Dersler': {
    en: 'Courses', de: 'Kurse', fr: 'Cours', es: 'Cursos', it: 'Corsi',
    pt: 'Cursos', ru: 'Курсы', ar: 'الدورات والدروس', zh: '在线课堂', ja: 'レッスン',
    ko: '강의', nl: 'Cursussen', pl: 'Lekcje', sv: 'Kurser', az: 'Dərslər',
    hi: 'कक्षाएं', id: 'Kursus', uk: 'Курси', el: 'Μαθήματα'
  },
  'Canlı Dersler': {
    en: 'Live Classes', de: 'Live-Klassen', fr: 'Cours en direct', es: 'Clases en directo', it: 'Classi dal vivo',
    pt: 'Aulas ao vivo', ru: 'Живые уроки', ar: 'الفصول المباشرة', zh: '直播大班课', ja: 'ライブ授業',
    ko: '실시간 강의', nl: 'Live lessen', pl: 'Zajęcia na żywo', sv: 'Direktlektioner', az: 'Canlı Dərslər',
    hi: 'लाइव कक्षाएं', id: 'Kelas Langsung', uk: 'Уроки наживо', el: 'Ζωντανά μαθήματα'
  },
  'Eğitmen Ol': {
    en: 'Become an Instructor', de: 'Dozent werden', fr: 'Devenir formateur', es: 'Hazte instructor', it: 'Diventa istruttore',
    pt: 'Torne-se instrutor', ru: 'Стать преподавателем', ar: 'كن معلماً', zh: '申请成为讲师', ja: '講師に応募',
    ko: '강사 신청', nl: 'Docent worden', pl: 'Zostań instruktorem', sv: 'Bli instruktör', az: 'Təlimçi ol',
    hi: 'प्रशिक्षक बनें', id: 'Jadi Instruktur', uk: 'Стати викладачем', el: 'Γίνετε εκπαιδευτής'
  },
  'Dersi Başlat': {
    en: 'Start Class', de: 'Unterricht starten', fr: 'Démarrer le cours', es: 'Iniciar clase', it: 'Avvia lezione',
    pt: 'Iniciar aula', ru: 'Начать урок', ar: 'بدء الحصة', zh: '开始上课', ja: '授業開始',
    ko: '수업 시작', nl: 'Les starten', pl: 'Rozpocznij lekcję', sv: 'Starta lektion', az: 'Dərsi Başlat',
    hi: 'कक्षा शुरू करें', id: 'Mulai Kelas', uk: 'Почати урок', el: 'Έναρξη μαθήματος'
  },
  'Katıl': {
    en: 'Join', de: 'Beitreten', fr: 'Rejoindre', es: 'Unirse', it: 'Partecipa',
    pt: 'Participar', ru: 'Присоединиться', ar: 'انضمام', zh: '加入', ja: '参加する',
    ko: '참여하기', nl: 'Deelnemen', pl: 'Dołącz', sv: 'Gå med', az: 'Qoşul',
    hi: 'शामिल हों', id: 'Gabung', uk: 'Приєднатися', el: 'Συμμετοχή'
  },

  // --- Sohbet & İletişim (Chat & Connect) ---
  'Sohbet': {
    en: 'Chat', de: 'Chat', fr: 'Discussion', es: 'Chat', it: 'Chat',
    pt: 'Chat', ru: 'Чат', ar: 'المحادثة', zh: '即时消息', ja: 'チャット',
    ko: '채팅', nl: 'Chat', pl: 'Czat', sv: 'Chatt', az: 'Söhbət',
    hi: 'चैट', id: 'Obrolan', uk: 'Чат', el: 'Συνομιλία'
  },
  'Mesaj gönder...': {
    en: 'Type a message...', de: 'Nachricht schreiben...', fr: 'Écrire un message...', es: 'Escribe un mensaje...', it: 'Scrivi un messaggio...',
    pt: 'Digite uma mensagem...', ru: 'Введите сообщение...', ar: 'اكتب رسالة...', zh: '发送消息...', ja: 'メッセージを入力...',
    ko: '메시지를 입력하세요...', nl: 'Typ een bericht...', pl: 'Napisz wiadomość...', sv: 'Skriv ett meddelande...', az: 'Mesaj yazın...',
    hi: 'संदेश लिखें...', id: 'Ketik pesan...', uk: 'Введіть повідомлення...', el: 'Πληκτρολογήστε μήνυμα...'
  },
  'Çevrimiçi': {
    en: 'Online', de: 'Online', fr: 'En ligne', es: 'En línea', it: 'Online',
    pt: 'Online', ru: 'В сети', ar: 'متصل الآن', zh: '在线', ja: 'オンライン',
    ko: '온라인', nl: 'Online', pl: 'Dostępny', sv: 'Uppkopplad', az: 'Onlayn',
    hi: 'ऑनलाइन', id: 'Online', uk: 'У мережі', el: 'Συνδεδεμένος'
  },

  // --- Akıllı Ev & Aile & Çocuk ---
  'Akıllı Ev': {
    en: 'Smart Home', de: 'Smart Home', fr: 'Maison connectée', es: 'Hogar inteligente', it: 'Casa smart',
    pt: 'Casa inteligente', ru: 'Умный дом', ar: 'المنزل الذكي', zh: '智能家居', ja: 'スマートホーム',
    ko: '스마트홈', nl: 'Smart Home', pl: 'Inteligentny dom', sv: 'Smart Hem', az: 'Ağıllı Ev',
    hi: 'स्मार्ट होम', id: 'Rumah Pintar', uk: 'Розумний дім', el: 'Έξυπνο Σπίτι'
  },
  'Aile Alanı': {
    en: 'Family Hub', de: 'Familienbereich', fr: 'Espace Famille', es: 'Espacio familiar', it: 'Spazio famiglia',
    pt: 'Espaço família', ru: 'Семейный круг', ar: 'ركن العائلة', zh: '家庭空间', ja: 'ファミリーハブ',
    ko: '패밀리 허브', nl: 'Familiehub', pl: 'Strefa rodziny', sv: 'Familjehubb', az: 'Ailə Guşəsi',
    hi: 'फैमिली हब', id: 'Ruang Keluarga', uk: 'Сімейне коло', el: 'Οικογενειακός Χώρος'
  },
  'Çocuk Dünyası': {
    en: 'Kids World', de: 'Kinderwelt', fr: 'Monde des enfants', es: 'Mundo infantil', it: 'Mondo bambini',
    pt: 'Mundo infantil', ru: 'Детский мир', ar: 'عالم الأطفال', zh: '儿童世界', ja: 'キッズワールド',
    ko: '키즈 월드', nl: 'Kinderwereld', pl: 'Świat Dzieci', sv: 'Barnens Värld', az: 'Uşaq Dünyası',
    hi: 'बच्चों की दुनिया', id: 'Dunia Anak', uk: 'Дитячий світ', el: 'Παιδικός Κόσμος'
  },
  'Arcade': {
    en: 'Arcade', de: 'Arcade', fr: 'Arcade', es: 'Arcade', it: 'Arcade',
    pt: 'Arcade', ru: 'Аркада', ar: 'آركيد', zh: '游艺中心', ja: 'アーケード',
    ko: '아케이드', nl: 'Arcade', pl: 'Arcade', sv: 'Arkad', az: 'Arcade',
    hi: 'आर्केड', id: 'Arcade', uk: 'Аркада', el: 'Arcade'
  },
  'Yükleniyor...': {
    en: 'Loading...', de: 'Laden...', fr: 'Chargement...', es: 'Cargando...', it: 'Caricamento...',
    pt: 'Carregando...', ru: 'Загрузка...', ar: 'جاري التحميل...', zh: '正在加载...', ja: '読み込み中...',
    ko: '로딩 중...', nl: 'Laden...', pl: 'Ładowanie...', sv: 'Laddar...', az: 'Yüklənir...',
    hi: 'लोड हो रहा है...', id: 'Memuat...', uk: 'Завантаження...', el: 'Φόρτωση...'
  },
  'Başarılı': {
    en: 'Success', de: 'Erfolgreich', fr: 'Succès', es: 'Éxito', it: 'Operazione riuscita',
    pt: 'Sucesso', ru: 'Успешно', ar: 'تم بنجاح', zh: '操作成功', ja: '成功',
    ko: '성공', nl: 'Geslaagd', pl: 'Sukces', sv: 'Lyckades', az: 'Uğurlu',
    hi: 'सफल', id: 'Berhasil', uk: 'Успішно', el: 'Επιτυχία'
  },
  'Bir hata oluştu': {
    en: 'An error occurred', de: 'Ein Fehler ist aufgetreten', fr: 'Une erreur est survenue', es: 'Ocurrió un error', it: 'Si è verificato un errore',
    pt: 'Ocorreu um erro', ru: 'Произошла ошибка', ar: 'حدث خطأ ما', zh: '出现错误', ja: 'エラーが発生しました',
    ko: '오류가 발생했습니다', nl: 'Er is een fout opgetreten', pl: 'Wystąpił błąd', sv: 'Ett fel uppstod', az: 'Xəta baş verdi',
    hi: 'एक त्रुटि हुई', id: 'Terjadi kesalahan', uk: 'Сталася помилка', el: 'Παρουσιάστηκε σφάλμα'
  },
};

/**
 * Verilen metin için seçili dildeki karşılığı arar.
 * Tam eşleşme veya alt metin eşlemesi yapar.
 */
export function translateText(text: string, locale: LocalePreference): string {
  if (!text || locale === 'tr') return text;

  const trimmed = text.trim();
  if (PHRASE_BOOK[trimmed] && PHRASE_BOOK[trimmed][locale]) {
    return text.replace(trimmed, PHRASE_BOOK[trimmed][locale]!);
  }

  // Case-insensitive deneme
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [key, map] of Object.entries(PHRASE_BOOK)) {
    if (key.toLowerCase() === lowerTrimmed && map[locale]) {
      return text.replace(trimmed, map[locale]!);
    }
  }

  return text;
}
