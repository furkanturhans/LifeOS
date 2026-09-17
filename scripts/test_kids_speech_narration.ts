import {
  normalizeTurkishForSpeech,
  splitTextIntoSentences,
  kidsSpeech,
  NO_AZURE_CONFIG_NOTICE,
  PREVIEW_SAMPLE_TEXT,
  AZURE_PRIMARY_FEMALE_VOICE,
  AZURE_FALLBACK_FEMALE_VOICE,
} from '../src/services/kidsSpeechService';
import { useKidsStore } from '../src/stores/useKidsStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runSpeechTests() {
  console.log('====================================================');
  console.log('🔊 RUNNING AZURE SPEECH TURKISH FEMALE NARRATOR TESTS');
  console.log('====================================================\n');

  // TEST 1: Turkish Text Normalization
  console.log('--- Test Group 1: Turkish Text Normalization for Kids ---');

  // Math operations
  const mathInput = '2 + 3 = 5 ve 10 - 4 = 6';
  const mathNormalized = normalizeTurkishForSpeech(mathInput);
  console.log('Math:', mathInput, '->', mathNormalized);
  assert(
    mathNormalized.includes('2 artı 3 eşittir 5'),
    'Normalizes plus and equals math expression'
  );
  assert(
    mathNormalized.includes('10 eksi 4 eşittir 6'),
    'Normalizes minus and equals math expression'
  );

  // Multiplication and division
  const multDivInput = '4 x 5 = 20 ve 8 / 2 = 4';
  const multDivNorm = normalizeTurkishForSpeech(multDivInput);
  console.log('Mult/Div:', multDivInput, '->', multDivNorm);
  assert(
    multDivNorm.includes('4 çarpı 5 eşittir 20'),
    'Normalizes multiplication'
  );
  assert(
    multDivNorm.includes('8 bölü 2 eşittir 4'),
    'Normalizes division'
  );

  // Age ranges
  const ageInput = '3-5 Yaş çocukları için uygundur.';
  const ageNormalized = normalizeTurkishForSpeech(ageInput);
  console.log('Age Range:', ageInput, '->', ageNormalized);
  assert(
    ageNormalized.includes('3 ile 5 yaş arası'),
    'Normalizes age ranges ("3-5 Yaş" -> "3 ile 5 yaş arası")'
  );

  // Time format
  const timeInput = 'Saat 12:30 olunca öğle yemeği vakti.';
  const timeNormalized = normalizeTurkishForSpeech(timeInput);
  console.log('Time:', timeInput, '->', timeNormalized);
  assert(
    timeNormalized.includes('12 30'),
    'Normalizes clock time format ("12:30" -> "12 30")'
  );

  // Ordinal numbers
  const ordinalInput = '1. ders harfler, 2. ders sayılar.';
  const ordinalNorm = normalizeTurkishForSpeech(ordinalInput);
  console.log('Ordinals:', ordinalInput, '->', ordinalNorm);
  assert(
    ordinalNorm.includes('birinci ders harfler'),
    'Normalizes "1." to "birinci"'
  );
  assert(
    ordinalNorm.includes('ikinci ders sayılar'),
    'Normalizes "2." to "ikinci"'
  );

  // Emoji cleaning
  const emojiInput = 'Bir varmış bir yokmuş... 🐰🌸🌙 Tatlı rüyalar!';
  const emojiNorm = normalizeTurkishForSpeech(emojiInput);
  console.log('Emoji Clean:', emojiInput, '->', emojiNorm);
  assert(
    !emojiNorm.includes('🐰') && !emojiNorm.includes('🌸') && !emojiNorm.includes('🌙'),
    'Emojis are stripped so TTS does not speak emoji names'
  );
  assert(
    emojiNorm.includes('Bir varmış bir yokmuş... Tatlı rüyalar!'),
    'Preserves narrative story text and ellipsis breathing pauses'
  );

  // TEST 2: Sentence Splitting (Chunking) for Long Stories
  console.log('\n--- Test Group 2: Sentence Splitting for Long Stories ---');
  const longStory =
    'Bir varmış bir yokmuş. Yemyeşil çam ağaçlarının arasında Pırpır adında bir tavşan yaşarmış! Gökyüzüne baktığında parlayan yıldızları görürmüş...';
  const sentences = splitTextIntoSentences(longStory);
  console.log('Split sentences:', sentences);
  assert(sentences.length === 3, 'Splits long story into 3 distinct sentences for clean sequential playback');
  assert(sentences[0] === 'Bir varmış bir yokmuş.', 'First sentence captured correctly');
  assert(sentences[1] === 'Yemyeşil çam ağaçlarının arasında Pırpır adında bir tavşan yaşarmış!', 'Second sentence captured correctly');

  // TEST 3: Azure Turkish Female Voice Constants
  console.log('\n--- Test Group 3: Azure Voice Selection & Fallbacks ---');
  assert(
    AZURE_PRIMARY_FEMALE_VOICE === 'tr-TR-Elif:MAI-Voice-2',
    'Primary narrator voice is "tr-TR-Elif:MAI-Voice-2"'
  );
  assert(
    AZURE_FALLBACK_FEMALE_VOICE === 'tr-TR-EmelNeural',
    'Safe female fallback voice is "tr-TR-EmelNeural"'
  );

  // TEST 4: Exact Sample Preview Text & Parent Fallback Message
  console.log('\n--- Test Group 4: Exact Strings Verification ---');
  assert(
    PREVIEW_SAMPLE_TEXT ===
      'Merhaba. Ben LifeOS Kids anlatıcısıyım. Birlikte öğrenmeye ve güzel hikâyeler keşfetmeye hazır mısın?',
    'Preview sample text matches exact required sentence'
  );

  assert(
    NO_AZURE_CONFIG_NOTICE ===
      'Sesli anlatımı etkinleştirmek için anlatıcı servisi yapılandırılmalıdır.',
    'Parent fallback notice matches exact required text'
  );

  // TEST 5: Kids Store Default Voice Settings & Custom Selection
  console.log('\n--- Test Group 5: Kids Store Settings & Persistence ---');
  const kidsStore = useKidsStore.getState();

  assert(
    kidsStore.voiceSettings.persona === 'warm_female',
    'Default narrator voice persona is "warm_female"'
  );
  assert(
    kidsStore.voiceSettings.volume === 0.9,
    'Default speech volume is 0.90'
  );
  assert(
    kidsStore.voiceSettings.isVoiceEnabled === true,
    'Sesli anlatıcı is enabled by default'
  );

  // Parent selects specific voice URI
  kidsStore.updateVoiceSettings({
    selectedVoiceURI: 'tr-TR-EmelNeural',
    volume: 0.95,
  });

  const updatedStore = useKidsStore.getState();
  assert(
    updatedStore.voiceSettings.selectedVoiceURI === 'tr-TR-EmelNeural',
    'Parent voice selection stored in store'
  );
  assert(
    updatedStore.voiceSettings.volume === 0.95,
    'Parent volume change stored in store'
  );

  console.log('\n====================================================');
  console.log('🎉 ALL AZURE SPEECH TURKISH FEMALE NARRATOR TESTS PASSED!');
  console.log('====================================================');
}

runSpeechTests().catch((err) => {
  console.error('Speech test execution failed:', err);
  process.exit(1);
});
