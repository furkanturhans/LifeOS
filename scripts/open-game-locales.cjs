// Offline reviewed labels. No user data or source code is sent to translation services.
const fs=require('node:fs');
const locales=['en','de','fr','es','it','pt','ru','ar','zh','ja','ko','nl','pl','sv','az','hi','id','uk','el'];
const file='src/lib/i18n/overrides.json';
const overrides=JSON.parse(fs.readFileSync(file,'utf8'));
const catalog={...require('../src/lib/i18n/catalog.json'),...overrides};
const rows={
 'Yılan':'Snake|Schlange|Serpent|Serpiente|Serpente|Cobra|Змейка|الثعبان|贪吃蛇|スネーク|스네이크|Slang|Wąż|Ormen|İlan|साँप|Ular|Змійка|Φιδάκι',
 'Tuğla Kırma':'Brick Breaker|Ziegelbrecher|Casse-briques|Rompebloques|Rompi mattoni|Quebra-blocos|Разбей кирпичи|تكسير الطوب|打砖块|ブロック崩し|벽돌 깨기|Blokkenbreker|Rozbijanie cegieł|Tegelknäckaren|Kərpic qırma|ईंट तोड़ो|Pemecah Bata|Розбий цеглу|Σπάσε τα τούβλα',
 'Sonsuz Koşu':'Endless Runner|Endloslauf|Course infinie|Carrera infinita|Corsa infinita|Corrida infinita|Бесконечный бег|الجري اللانهائي|无尽跑酷|エンドレスラン|무한 달리기|Eindeloze renner|Niekończący się bieg|Oändligt lopp|Sonsuz qaçış|अंतहीन दौड़|Lari Tanpa Akhir|Нескінченний біг|Ατελείωτο τρέξιμο',
 'Uçan Denizanası':'Flying Jellyfish|Fliegende Qualle|Méduse volante|Medusa voladora|Medusa volante|Água-viva voadora|Летающая медуза|قنديل البحر الطائر|飞行水母|空飛ぶクラゲ|날아다니는 해파리|Vliegende kwal|Latająca meduza|Flygande manet|Uçan meduza|उड़ती जेलिफ़िश|Ubur-ubur Terbang|Летюча медуза|Ιπτάμενη μέδουσα',
 'Masa Tenisi':'Table Tennis|Tischtennis|Tennis de table|Tenis de mesa|Tennis da tavolo|Tênis de mesa|Настольный теннис|تنس الطاولة|乒乓球|卓球|탁구|Tafeltennis|Tenis stołowy|Bordtennis|Stolüstü tennis|टेबल टेनिस|Tenis Meja|Настільний теніс|Επιτραπέζια αντισφαίριση',
 'Uzay Savunması':'Space Defense|Weltraumverteidigung|Défense spatiale|Defensa espacial|Difesa spaziale|Defesa espacial|Космическая оборона|الدفاع الفضائي|太空防御|宇宙防衛|우주 방어|Ruimteverdediging|Obrona kosmiczna|Rymdförsvar|Kosmik müdafiə|अंतरिक्ष रक्षा|Pertahanan Antariksa|Космічна оборона|Διαστημική άμυνα',
 'Mücevher Eşleştirme':'Gem Match|Edelsteine kombinieren|Match de gemmes|Combina gemas|Abbina gemme|Combine joias|Собери самоцветы|مطابقة الجواهر|宝石消除|宝石マッチ|보석 맞추기|Edelstenen combineren|Dopasuj klejnoty|Matcha juveler|Daş uyğunlaşdırma|रत्न मिलान|Cocokkan Permata|Збери самоцвіти|Ταίριασμα πετραδιών',
 'Mayın Tarlası':'Minesweeper|Minesweeper|Démineur|Buscaminas|Campo minato|Campo minado|Сапёр|كاسحة الألغام|扫雷|マインスイーパー|지뢰 찾기|Mijnenveger|Saper|Minröjare|Mina sahəsi|माइनस्वीपर|Penyapu Ranjau|Сапер|Ναρκαλιευτής',
 'Kaydırmalı Bulmaca':'Sliding Puzzle|Schiebepuzzle|Puzzle coulissant|Puzzle deslizante|Puzzle scorrevole|Quebra-cabeça deslizante|Пятнашки|لغز الانزلاق|滑块拼图|スライドパズル|슬라이딩 퍼즐|Schuifpuzzel|Przesuwana układanka|Skjutpussel|Sürüşdürmə tapmacası|स्लाइडिंग पहेली|Puzzle Geser|Рухома головоломка|Συρόμενο παζλ',
 'Kutu İtme':'Box Pusher|Kisten schieben|Pousse-caisses|Empuja cajas|Spingi le casse|Empurre caixas|Толкай ящики|دفع الصناديق|推箱子|倉庫番|상자 밀기|Kisten duwen|Pchanie skrzyń|Skjut lådor|Qutu itələmə|बक्से धकेलो|Dorong Kotak|Штовхай ящики|Σπρώξε τα κιβώτια',
 'Işıkları Söndür':'Lights Out|Lichter aus|Éteins les lumières|Apaga las luces|Spegni le luci|Apague as luzes|Погаси свет|أطفئ الأنوار|熄灯|ライトアウト|불 끄기|Lichten uit|Zgaś światła|Släck ljusen|İşıqları söndür|बत्तियाँ बुझाओ|Matikan Lampu|Погаси світло|Σβήσε τα φώτα',
 'Renk Sıralama':'Color Sort|Farben sortieren|Tri des couleurs|Ordena colores|Ordina colori|Ordene cores|Сортировка цветов|ترتيب الألوان|颜色排序|色分け|색상 정렬|Kleuren sorteren|Sortowanie kolorów|Sortera färger|Rəng sıralama|रंग क्रमबद्ध करो|Urutkan Warna|Сортування кольорів|Ταξινόμηση χρωμάτων',
 'Hanoi Kuleleri':'Towers of Hanoi|Türme von Hanoi|Tours de Hanoï|Torres de Hanói|Torri di Hanoi|Torres de Hanói|Ханойские башни|أبراج هانوي|汉诺塔|ハノイの塔|하노이의 탑|Torens van Hanoi|Wieże Hanoi|Tornen i Hanoi|Hanoy qüllələri|हनोई की मीनारें|Menara Hanoi|Ханойські вежі|Πύργοι του Ανόι',
 'Dörtlü Bağlantı':'Four in a Row|Vier gewinnt|Puissance quatre|Cuatro en línea|Quattro in fila|Quatro em linha|Четыре в ряд|أربعة على التوالي|四子连线|四目並べ|4목 게임|Vier op een rij|Cztery w rzędzie|Fyra i rad|Dördünü birləşdir|चार एक पंक्ति में|Empat Berderet|Чотири в ряд|Τέσσερα στη σειρά',
 'Kule Savunması':'Tower Defense|Turmverteidigung|Défense de tours|Defensa de torres|Difesa della torre|Defesa de torres|Защита башен|الدفاع بالأبراج|塔防|タワーディフェンス|타워 디펜스|Torenverdediging|Obrona wież|Tornförsvar|Qüllə müdafiəsi|टावर रक्षा|Pertahanan Menara|Захист веж|Άμυνα πύργων',
 'Basket Atışı':'Basketball Shoot|Basketballwurf|Tir au panier|Tiro a canasta|Tiro a canestro|Arremesso de basquete|Бросок в корзину|رمي كرة السلة|篮球投篮|バスケットシュート|농구 슛|Basketbalworp|Rzut do kosza|Basketkast|Basket atışı|बास्केटबॉल शॉट|Lempar Basket|Кидок у кошик|Βολές μπάσκετ',
 'Okçuluk':'Archery|Bogenschießen|Tir à l’arc|Tiro con arco|Tiro con l’arco|Tiro com arco|Стрельба из лука|الرماية بالقوس|射箭|アーチェリー|양궁|Boogschieten|Łucznictwo|Bågskytte|Oxçuluq|तीरंदाज़ी|Panahan|Стрільба з лука|Τοξοβολία',
 'Ücretsiz':'Free|Kostenlos|Gratuit|Gratis|Gratis|Grátis|Бесплатно|مجاني|免费|無料|무료|Gratis|Bezpłatnie|Gratis|Pulsuz|मुफ़्त|Gratis|Безкоштовно|Δωρεάν',
 'Bulmaca':'Puzzle|Rätsel|Puzzle|Puzle|Rompicapo|Quebra-cabeça|Головоломки|ألغاز|益智|パズル|퍼즐|Puzzel|Łamigłówki|Pussel|Tapmaca|पहेली|Puzzle|Головоломки|Παζλ',
 'Refleks':'Reflex|Reaktion|Réflexes|Reflejos|Riflessi|Reflexos|Реакция|ردود الفعل|反应|反射神経|반응|Reactie|Refleks|Reflexer|Refleks|प्रतिक्रिया|Refleks|Реакція|Αντανακλαστικά',
 'Strateji':'Strategy|Strategie|Stratégie|Estrategia|Strategia|Estratégia|Стратегия|استراتيجية|策略|戦略|전략|Strategie|Strategia|Strategi|Strategiya|रणनीति|Strategi|Стратегія|Στρατηγική',
 'Spor':'Sports|Sport|Sport|Deportes|Sport|Esportes|Спорт|رياضة|体育|スポーツ|스포츠|Sport|Sport|Sport|İdman|खेल|Olahraga|Спорт|Αθλητικά',
 'Favoriler':'Favorites|Favoriten|Favoris|Favoritos|Preferiti|Favoritos|Избранное|المفضلة|收藏|お気に入り|즐겨찾기|Favorieten|Ulubione|Favoriter|Sevimlilər|पसंदीदा|Favorit|Обране|Αγαπημένα',
 'Son Oynananlar':'Recently played|Zuletzt gespielt|Joués récemment|Jugados recientemente|Giocati di recente|Jogados recentemente|Недавно играли|لُعبت مؤخرًا|最近玩过|最近プレイ|최근 플레이|Onlangs gespeeld|Ostatnio grane|Nyligen spelade|Son oynananlar|हाल में खेले|Terakhir Dimainkan|Нещодавно грали|Πρόσφατα παιχνίδια',
 'Dokunmatik kontroller':'Touch controls|Touch-Steuerung|Commandes tactiles|Controles táctiles|Comandi touch|Controles de toque|Сенсорное управление|التحكم باللمس|触控操作|タッチ操作|터치 조작|Aanraakbediening|Sterowanie dotykowe|Pekkontroller|Toxunma idarəetməsi|टच नियंत्रण|Kontrol Sentuh|Сенсорне керування|Χειρισμός αφής',
 'Oyun yüklenemedi.':'Game could not load.|Spiel konnte nicht geladen werden.|Impossible de charger le jeu.|No se pudo cargar el juego.|Impossibile caricare il gioco.|Não foi possível carregar o jogo.|Не удалось загрузить игру.|تعذر تحميل اللعبة.|游戏加载失败。|ゲームを読み込めませんでした。|게임을 불러오지 못했습니다.|Spel kon niet laden.|Nie udało się wczytać gry.|Spelet kunde inte laddas.|Oyun yüklənmədi.|गेम लोड नहीं हुआ।|Game tidak dapat dimuat.|Не вдалося завантажити гру.|Αδυναμία φόρτωσης παιχνιδιού.',
 'Duraklatıldı':'Paused|Pausiert|En pause|En pausa|In pausa|Pausado|Пауза|متوقف مؤقتًا|已暂停|一時停止中|일시 정지|Gepauzeerd|Wstrzymano|Pausat|Dayandırıldı|रुका हुआ|Dijeda|Пауза|Σε παύση',
 'Favorilerden Kaldır':'Remove from favorites|Aus Favoriten entfernen|Retirer des favoris|Quitar de favoritos|Rimuovi dai preferiti|Remover dos favoritos|Убрать из избранного|إزالة من المفضلة|取消收藏|お気に入りから削除|즐겨찾기 해제|Uit favorieten verwijderen|Usuń z ulubionych|Ta bort från favoriter|Sevimlilərdən sil|पसंदीदा से हटाएँ|Hapus dari Favorit|Вилучити з обраного|Αφαίρεση από αγαπημένα',
 'Favorilere Ekle':'Add to favorites|Zu Favoriten hinzufügen|Ajouter aux favoris|Añadir a favoritos|Aggiungi ai preferiti|Adicionar aos favoritos|Добавить в избранное|إضافة إلى المفضلة|添加收藏|お気に入りに追加|즐겨찾기 추가|Aan favorieten toevoegen|Dodaj do ulubionych|Lägg till i favoriter|Sevimlilərə əlavə et|पसंदीदा में जोड़ें|Tambahkan ke Favorit|Додати до обраного|Προσθήκη στα αγαπημένα',
 'Kazandın!':'You won!|Gewonnen!|Vous avez gagné !|¡Ganaste!|Hai vinto!|Você ganhou!|Вы выиграли!|لقد فزت!|你赢了！|勝ちました！|승리!|Gewonnen!|Wygrana!|Du vann!|Qazandın!|आप जीत गए!|Kamu Menang!|Ви виграли!|Κέρδισες!',
 'Harika!':'Great!|Super!|Bravo !|¡Genial!|Ottimo!|Ótimo!|Отлично!|رائع!|太棒了！|すばらしい！|훌륭해요!|Geweldig!|Świetnie!|Toppen!|Əla!|बहुत बढ़िया!|Hebat!|Чудово!|Υπέροχα!',
 'Atla':'Skip|Überspringen|Passer|Omitir|Salta|Pular|Пропустить|تخطي|跳过|スキップ|건너뛰기|Overslaan|Pomiń|Hoppa över|Keç|छोड़ें|Lewati|Пропустити|Παράλειψη',
 'Sonraki':'Next|Weiter|Suivant|Siguiente|Avanti|Próximo|Далее|التالي|下一步|次へ|다음|Volgende|Dalej|Nästa|Növbəti|अगला|Berikutnya|Далі|Επόμενο',
 'Nasıl Oynanır?':'How to play?|Spielanleitung|Comment jouer ?|¿Cómo jugar?|Come si gioca?|Como jogar?|Как играть?|كيف تلعب؟|怎么玩？|遊び方|게임 방법|Hoe speel je?|Jak grać?|Hur spelar man?|Necə oynanılır?|कैसे खेलें?|Cara Bermain|Як грати?|Πώς παίζεται;',
 'Berabere':'Draw|Unentschieden|Égalité|Empate|Pareggio|Empate|Ничья|تعادل|平局|引き分け|무승부|Gelijkspel|Remis|Oavgjort|Heç-heçə|बराबरी|Seri|Нічия|Ισοπαλία',
};
for(const [source,row] of Object.entries(rows)){
 const values=row.split('|');if(values.length!==locales.length)throw Error(source);
 overrides[source]={tr:source,...Object.fromEntries(locales.map((locale,i)=>[locale,values[i]]))};
}
for(const [source,target] of Object.entries({'Hamle:':'Hamle','En iyi:':'En İyi','Easy':'Kolay','Normal':'Orta','Hard':'Zor'})){
 if(!catalog[target])throw Error(target);
 overrides[source]={tr:source,...catalog[target]};
 if(['Easy','Normal','Hard'].includes(source))overrides[source].tr=target;
 if(source.endsWith(':'))for(const locale of locales)overrides[source][locale]=(overrides[source][locale]||target)+':';
}
overrides['Sonraki (']={...overrides.Sonraki};for(const locale of ['tr',...locales])overrides['Sonraki ('][locale]+=' (';
for(const source of ['2048','Reversi'])overrides[source]=Object.fromEntries(['tr',...locales].map(locale=>[locale,source]));
fs.writeFileSync(file,JSON.stringify(overrides,null,2)+'\n','utf8');
console.log('Open game labels ready in 20 locales.');
