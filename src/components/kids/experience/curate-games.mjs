import fs from 'node:fs';
const rows=`bowling|Bowling|Topu kaydırarak lobutları devirmeyi dene.
mini-golf|Mini Golf|Topun yönünü seçip golf deliğine ulaştır.
penalty-kick|Penaltı|Zamanında dokunarak kaleye top gönder.
ring-toss|Halka Atma|Halkaları hedeflere doğru at.
ball-throw|Top Atma|Topu kaydırarak hedefe ulaştır.
jump-rope-rhythm|İp Atlama|Ritmi izleyip zamanında zıpla.
bicycle-balance|Bisiklet Dengesi|Sağa sola yön vererek bisikleti dengede tut.
stone-balance-walk|Denge Yolu|Taşların üstündeki karaktere yol göster.
kite-fly|Uçurtma Uçuşu|Rüzgârda uçurtmanı yönlendir.
paper-airplane-fly|Kâğıt Uçak|Kâğıt uçağını fırlatıp uçuşunu izle.
paper-boat-sail|Kâğıt Tekne|Tekneni suyun üstünde yönlendir.
train-track|Tren Rayları|Ray parçalarını birleştirip trene yol aç.
balance-tower|Denge Kulesi|Parçaları dengeli biçimde üst üste koy.
tower-rings|Halka Kulesi|Halkaları yerleştirerek kule oluştur.
tangram-puzzle|Tangram|Parçaları birleştirerek bir şekil tamamla.
jigsaw-mini|Resimli Yapboz|Resim parçalarını uygun yerlere yerleştir.
slide-puzzle|Kaydırmalı Yapboz|Parçaları kaydırarak resmi tamamla.
rabbit-maze|Tavşan Labirenti|Tavşana labirentte yol göster.
marble-roll|Bilye Yolu|Bilyeyi yönlendirerek hedefe ulaştır.
domino-chain|Domino Zinciri|Domino parçalarını dizip hareketlerini izle.
shadow-match|Gölge Eşleştirme|Nesneleri gölgeleriyle eşleştir.
spot-difference|Farkları Bul|İki resimdeki farklı ayrıntıları keşfet.
hidden-object-hunt|Gizli Nesneler|Resmin içindeki nesneleri bul.
sock-match|Çorap Eşleri|Birbirine benzeyen çorapları eşleştir.
fruit-pair|Meyve Eşleri|Aynı meyveleri bir araya getir.
memory-match|Hafıza Kartları|Kartları açıp aynı resimleri bul.
memory-sequence|Işık Sırası|Parlayan düğmeleri aynı sırayla takip et.
fruit-match|Meyve Dizisi|Meyveleri eşleştirerek oyun alanını düzenle.
face-match|Yüz Eşleri|Benzer yüzleri eşleştir.
star-connect|Yıldız Birleştirme|Yıldızlara dokunarak çizgiler oluştur.
constellation-draw|Yıldız Desenleri|Yıldızları birleştirip gökyüzü desenleri çiz.
shadow-puppet|Gölge Kuklası|Kuklanı hareket ettirip gölgesini izle.
paper-fold-lab|Kâğıt Katlama|Kâğıdı adım adım katlayıp şekil oluştur.
castle-builder|Kale Yapımı|Parçalardan kendi kaleni kur.
build-snowman|Kardan Adam|Kardan adamın parçalarını ve aksesuarlarını seç.
cake-decor|Pasta Süsleme|Oyun pastanı renkli süslerle tasarla.
pizza-maker|Pizza Yapımı|Oyun pizzası için malzemeler seç.
ice-cream-scoop|Dondurma Kulesi|Dondurma toplarını üst üste yerleştir.
cotton-candy|Pamuk Şeker|Oyun şekerini çevirerek şekillendir.
juice-pour-party|Meyve Suyu|Bardağı uygun yere kadar doldur.
pretend-play|Hayal Oyunu|Oyuncaklarla küçük bir sahne kur.
pet-feed|Hayvan Dostları|Oyun hayvanlarına uygun yiyecekler ver.
dog-walk|Köpek Gezisi|Köpek dostunla oyun yolunda ilerle.
teddy-dress|Ayıcığı Giydir|Ayıcığın için giysi ve aksesuar seç.
dinosaur-tap|Dinozor Dokunuşu|Dinozorları dokunarak keşfet.
hatch-egg|Yumurtadan Çıkış|Dokunarak yumurtanın içindeki dostu ortaya çıkar.
caterpillar-feed|Tırtılın Yaprakları|Tırtıla yapraklar seçip büyümesini izle.
vegetable-garden|Sebze Bahçesi|Oyun bahçende sebzeler yetiştir.
watering-plant|Bitki Sulama|Bitkileri oyun içinde sulayıp gelişmelerini izle.
mushroom-pick|Mantar Sepeti|Oyun mantarlarını sepette topla.
carrot-pull|Havuç Toplama|Bahçedeki oyun havuçlarını topla.
butterfly-garden|Kelebek Bahçesi|Bahçedeki kelebekleri takip et.
bee-pollen|Arının Çiçekleri|Arıya çiçekler arasında yol göster.
honey-drip|Bal Damlaları|Bal damlalarını oyun kabına topla.
acorn-squirrel|Sincabın Palamutları|Sincabın palamutları toplamasına yardım et.
frog-jump|Kurbağa Zıplaması|Kurbağayı uygun yerlere zıplat.
dolphin-jump|Yunus Sıçrayışı|Yunusun hareketlerini zamanında dokunarak yönlendir.
penguin-slide|Penguen Kayması|Pengueni kaydırarak oyun yolunda ilerlet.
snail-race|Salyangoz Yolu|Salyangozu dokunarak ilerlet.
cloud-jump|Bulutlara Zıpla|Karakteri bulutlar arasında yönlendir.
bounce-ball|Zıplayan Top|Topun zıplamasına yön ver.
balloon-pop|Balon Patlatma|Renkli oyun balonlarına dokun.
bubble-wrap|Baloncuklu Kâğıt|Baloncuklara dokunarak serbestçe oyna.
soap-bubble-catch|Sabun Köpükleri|Uçuşan köpükleri dokunarak yakala.
firefly-catch|Ateşböceği Işıkları|Parlayan ateşböceklerine dokun.
clover-find|Yonca Bahçesi|Yoncaların arasındaki farklı şekli bul.
dandelion|Karahindiba|Dokunarak uçuşan tohumları izle.
magic-wand|Sihirli Değnek|Dokunarak ışıklı oyun desenleri oluştur.
lantern-float|Işıklı Fenerler|Hayalî fenerlerin hareketlerine yön ver.
fireworks-tap|Gökyüzü Işıkları|Dokunarak renkli gökyüzü desenleri oluştur.
color-piano|Renkli Piyano|Renkli tuşlarla serbest melodiler çal.
percussion-band|Ritim Grubu|Çalgıların seslerini sırayla keşfet.
drum-beat|Davul Ritmi|Davulu serbestçe çal veya verilen ritmi takip et.
beat-animals|Ritimli Hayvanlar|Parlayan hayvanlara ritme göre dokun.
rhythm-touch-beat|Ritim Halkası|Halka hedefle örtüşünce dokun.
piano-tiles|Piyano Oyunu|Piyano tuşlarıyla serbestçe çal veya bir şarkıyı takip et.
top-spin-duel|Topaç Yarışı|Dokunarak topacını güçlendirip dönmesini izle.
ddakji-flip|Kâğıt Çevirme|Aşağı kaydırarak oyun kâğıdını çevir.
jegi-kick|Tüylü Top|Karakteri topun altına getirip zamanında vur.
gonggi-nori|Beştaş|Yerdeki taşları topla, sonra düşen oyun taşını yakala.
sabangchigi-hop|Seksek|Hedef kareyi atlayarak sırayla ilerle.
magnet-fish|Mıknatıslı Balık|Mıknatısı kaydırarak balıkları topla, taşları atla.
fish-catch|Balık Yakala|Ağı yönlendirerek oyun balıklarını yakala.
ice-fishing|Buzda Balık|Balık oltaya yaklaşınca dokun.
squid-catch|Kalamar Yakala|Ağı yukarı aşağı taşıyarak kalamarları yakala.
pearl-diver|İnci Dalgıcı|İncileri topla ve yüzeye dönerek havayı yenile.
treasure-dive|Deniz Hazinesi|Hazine ve hava kabarcıklarını dokunarak topla.
ocean-cleanup|Deniz Temizliği|Denizaltıyla çöpleri topla, balıkları atla.
recycle-rescue|Geri Dönüşüm|Nesneleri uygun oyun kutusuna sürükle.
space-garbage-collector|Uzay Temizliği|Uzay çöplerini topla, meteorları atla.
laundry-sort|Çamaşır Sepetleri|Kıyafetleri renklerine göre oyun sepetlerine ayır.
fridge-sort|Buzdolabı Oyunu|Yiyecek resimlerini uygun saklama bölümlerine taşı.
sandwich-order|Sandviç Siparişi|Malzemelere doğru sırayla dokunarak sandviç hazırla.
burger-stack|Hamburger Kulesi|Zamanında dokunarak malzemeleri üst üste koy.
sushi-conveyor|Suşi Siparişi|Banttan geçen doğru siparişe dokun.
robot-pet-grooming|Robot Köpeğin Banyosu|Robot köpeği köpükle temizle, durula ve süsle.
panda-bamboo-wind-chime|Pandanın Bambu Çanları|Çanlara ve çiy damlalarına dokunarak melodiler çal.
sea-turtle-coral-reef-swim|Kaplumbağanın Mercan Yolculuğu|Kaplumbağayı yönlendirerek incileri ve yıldızları topla.
otter-stream-pebble-skip|Su Samurunun Taş Oyunu|Suya değen taşın halkasına dokunarak sekmeleri sürdür.
train-ticket-stamp|Tren Bileti Damgalama|Yıldız ortaya gelince basılı tutup bırakarak bileti damgala.`;
const editorial=Object.fromEntries(rows.split('\n').map(row=>{const [id,title,description]=row.split('|');return [id,{title,description}];}));if(Object.keys(editorial).length!==100)throw Error('Expected 100 editorial entries');
fs.writeFileSync('src/components/kids/experience/catalog/games-editorial.json',JSON.stringify(editorial,null,2)+'\n');
const p='src/components/kids/experience/catalog/public-source-translations.json';const cache=JSON.parse(fs.readFileSync(p,'utf8'));for(const key of Object.keys(cache))cache[key]=cache[key].replace(/meydan okumak!|Meydan okumak!|Meydan okumaya başlayın!/g,'Oyna').replace(/Uçurtma Sineği/g,'Uçurtma Uçuşu').replace(/Kağıt Uçak Sineği/g,'Kâğıt Uçak').replace(/Mermer/g,'Bilye');fs.writeFileSync(p,JSON.stringify(cache,null,2)+'\n');
