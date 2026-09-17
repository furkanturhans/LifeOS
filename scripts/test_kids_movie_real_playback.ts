import { KIDS_MOVIES_CATALOG } from '../src/components/kids/KidsMovieView';
import { useKidsStore } from '../src/stores/useKidsStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runMovieTests() {
  console.log('====================================================');
  console.log('🎬 RUNNING KIDS MOVIE REAL VIDEO PLAYBACK AUDIT');
  console.log('====================================================\n');

  // TEST 1: Verified First Real Video Content (Big Buck Bunny)
  console.log('--- Test Group 1: Big Buck Bunny Video Metadata ---');
  const bbb = KIDS_MOVIES_CATALOG.find((m) => m.id === 'big_buck_bunny');
  assert(bbb !== undefined, 'Big Buck Bunny exists in KIDS_MOVIES_CATALOG');

  if (bbb) {
    assert(bbb.title === 'Big Buck Bunny', 'Title is "Big Buck Bunny"');
    assert(bbb.category === 'Animasyon', 'Category is "Animasyon"');
    assert(bbb.creator === 'Blender Foundation', 'Creator is "Blender Foundation"');
    assert(
      bbb.license === 'Creative Commons Attribution 3.0',
      'License is "Creative Commons Attribution 3.0"'
    );
    assert(bbb.sourceUrl === 'https://peach.blender.org/', 'Source URL is "https://peach.blender.org/"');
    assert(
      bbb.videoUrl ===
        'https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4',
      'Video stream URL is official Blender Foundation MP4 URL'
    );
    assert(
      bbb.attributionText.includes('Blender Foundation') && bbb.attributionText.includes('CC BY 3.0'),
      'Attribution text contains creator and license info'
    );
    assert(bbb.isPublished === true, 'Video is published');
  }

  // TEST 2: Only Verified Content in Catalog
  console.log('\n--- Test Group 2: Content Safety Exclusions ---');
  assert(
    KIDS_MOVIES_CATALOG.length === 1,
    `Only 1 verified open-source video is in the catalog (Found: ${KIDS_MOVIES_CATALOG.length})`
  );

  // TEST 3: Watch Progress & Resume Point Persistence
  console.log('\n--- Test Group 3: Watch Progress Tracking ---');
  const kidsStore = useKidsStore.getState();

  kidsStore.saveWatchProgress('big_buck_bunny', 145, 600, false);

  const savedProg = useKidsStore.getState().getWatchProgress('big_buck_bunny');
  assert(savedProg !== undefined, 'Watch progress was recorded in store');
  assert(savedProg?.currentTime === 145, 'Recorded current time is 145s (02:25)');
  assert(savedProg?.duration === 600, 'Recorded duration is 600s');
  assert(savedProg?.completed === false, 'Completed flag is false');

  // Mark completed
  kidsStore.saveWatchProgress('big_buck_bunny', 600, 600, true);
  const completedProg = useKidsStore.getState().getWatchProgress('big_buck_bunny');
  assert(completedProg?.completed === true, 'Completed flag is true when video ends');

  console.log('\n====================================================');
  console.log('🎉 ALL KIDS MOVIE AUDIT TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runMovieTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
