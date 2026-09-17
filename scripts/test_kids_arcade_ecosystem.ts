import { DEFAULT_HOMESCREEN_MODULES, DEFAULT_DOCK_MODULES, getModuleById } from '../src/modules/registry';
import { MINI_GAMES_CATALOG } from '../src/components/arcade/MiniGamesCatalog';
import { KIDS_GAMES_LIST } from '../src/components/kids/KidsMiniGamesView';
import { useKidsStore } from '../src/stores/useKidsStore';
import { useArcadeStore } from '../src/stores/useArcadeStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runTests() {
  console.log('==============================================');
  console.log('🔍 RUNNING KIDS & ARCADE ECOSYSTEM AUDIT TESTS');
  console.log('==============================================\n');

  // TEST 1: Homescreen & Dock Cleanliness
  console.log('--- Test Group 1: Homescreen Icons & Removed Apps ---');
  const removedApps = ['cloud', 'camera', 'explore', 'documents', 'media', 'emergency'];
  for (const app of removedApps) {
    assert(
      !DEFAULT_HOMESCREEN_MODULES.includes(app),
      `Homescreen does NOT contain removed app: ${app}`
    );
    assert(
      !DEFAULT_DOCK_MODULES.includes(app),
      `Dock does NOT contain removed app: ${app}`
    );
  }

  assert(
    DEFAULT_HOMESCREEN_MODULES.includes('kids'),
    'DEFAULT_HOMESCREEN_MODULES contains "kids"'
  );
  assert(
    DEFAULT_HOMESCREEN_MODULES.includes('arcade'),
    'DEFAULT_HOMESCREEN_MODULES contains "arcade"'
  );
  assert(
    DEFAULT_HOMESCREEN_MODULES.includes('smart-home'),
    'DEFAULT_HOMESCREEN_MODULES retains "smart-home"'
  );

  // TEST 2: Arcade Adult Games Catalog
  console.log('\n--- Test Group 2: Arcade Adult Games Catalog ---');
  const arcadeGameIds = MINI_GAMES_CATALOG.map((g) => g.id);
  console.log('Arcade Games List:', arcadeGameIds);

  const requiredAdultGames = [
    'tavla',
    'satranc',
    'okey_101',
    'poker',
    'batak',
    'pisti',
    'solitaire',
    'sudoku_master',
    'game_2048',
    'kelime_bulmaca',
  ];

  for (const gId of requiredAdultGames) {
    assert(
      arcadeGameIds.includes(gId as any),
      `Arcade includes adult/general game: ${gId}`
    );
  }

  // Ensure no kids games in Arcade
  const kidsOnlyGameIds = ['bilmece', 'cocuk_sudoku', 'sayi_sekilleri', 'tangram', 'shape_counting', 'simon_diyor'];
  for (const kId of kidsOnlyGameIds) {
    assert(
      !arcadeGameIds.includes(kId as any),
      `Arcade does NOT contain children mini game: ${kId}`
    );
  }

  // TEST 3: Arcade Quests, Achievements, and Leaderboard
  console.log('\n--- Test Group 3: Arcade Quests & Leaderboard ---');
  const arcadeStore = useArcadeStore.getState();
  assert(
    arcadeStore.dailyQuests.length > 0,
    `Arcade retains Daily Quests (${arcadeStore.dailyQuests.length} quests active)`
  );
  assert(
    arcadeStore.achievements.length > 0,
    `Arcade retains Achievements (${arcadeStore.achievements.length} achievements active)`
  );

  // TEST 4: Kids Hub & 30 Games
  console.log('\n--- Test Group 4: Dedicated Kids Hub ---');
  assert(
    KIDS_GAMES_LIST.length >= 25,
    `Kids mini games view contains all ${KIDS_GAMES_LIST.length} children games`
  );

  const kidsStore = useKidsStore.getState();
  assert(
    kidsStore.isKidsModeActive === true,
    'Kids mode is active by default'
  );
  assert(
    kidsStore.parentPin === '2026',
    'Default Parent PIN is "2026"'
  );

  // TEST 5: Parent PIN Verification & Security Lockout
  console.log('\n--- Test Group 5: Parental PIN & Security ---');
  const wrongPinRes = kidsStore.verifyPin('0000');
  assert(
    !wrongPinRes.success && wrongPinRes.error !== undefined,
    'Incorrect PIN correctly rejected with error message'
  );

  const correctPinRes = kidsStore.verifyPin('2026');
  assert(
    correctPinRes.success,
    'Correct PIN "2026" unlocks parent mode'
  );
  assert(
    useKidsStore.getState().isParentUnlocked === true,
    'Parent dashboard unlocked status set to true'
  );

  // TEST 6: Kids Mode Exclusions
  console.log('\n--- Test Group 6: Kids Mode Safety Exclusions ---');
  assert(
    (kidsStore as any).dailyQuests === undefined,
    'Kids store strictly has NO daily quests'
  );
  assert(
    (kidsStore as any).leaderboard === undefined,
    'Kids store strictly has NO competitive leaderboard'
  );

  console.log('\n==============================================');
  console.log('🎉 ALL KIDS & ARCADE ECOSYSTEM TESTS PASSED SUCCESSFULLY!');
  console.log('==============================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
