/**
 * Test Suite for LifeOS Smart Home Real Devices Architecture
 * Verifies:
 * 1. Initial Empty State: Zero pre-seeded devices, rooms, scenes, or energy mocks.
 * 2. Failed Pairing: Invalid Matter QR or unreachable HA URL fails and adds 0 devices.
 * 3. Matter Commissioning: Real Matter device addition with capabilities.
 * 4. Home Assistant Selective Import: Only user-checked devices are imported.
 * 5. Capability Strictness: Controls match exact capabilities (no fake power meters).
 * 6. RBAC & PIN Verification for High Security (Lock / Alarms).
 * 7. User Custom Room Creation & Assignment.
 * 8. Device Removal with Audit Trail Preservation.
 */

import { SmartHomeEngine } from '../src/lib/smarthome/SmartHomeEngine';
import {
  DisabledSmartHomeProvider,
  MatterProvider,
  HomeAssistantProvider,
} from '../src/lib/smarthome/SmartHomeProvider';

async function runTests() {
  console.log('🚀 Starting LifeOS Smart Home Real Devices Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. FRESH ACCOUNT: Initial Empty State
  console.log('--- Test Group 1: Fresh Account & Zero Mock Devices ---');
  SmartHomeEngine.resetState();
  const initialHome = SmartHomeEngine.getHome();
  const initialDevices = SmartHomeEngine.getDevices('home_owner');
  const initialRooms = SmartHomeEngine.getRooms();
  const initialOverview = SmartHomeEngine.getQuickOverview();

  assert(initialDevices.length === 0, 'Initial device list is strictly EMPTY (0 devices)', `count: ${initialDevices.length}`);
  assert(initialRooms.length === 0, 'Initial room list is strictly EMPTY (0 rooms)', `count: ${initialRooms.length}`);
  assert(initialOverview.totalDevices === 0, 'Overview reports totalDevices: 0');
  assert(!initialHome.isBridgeConnected, 'Home bridge status is FALSE (not connected)');

  // 2. FAILED CONNECTION: Adding zero devices on error
  console.log('\n--- Test Group 2: Failed Connection Handlers ---');
  const badMatterRes = await SmartHomeEngine.commissionMatterDevice({
    setupCode: 'INVALID-CODE-XYZ',
    customName: 'Hatalı Cihaz',
  });
  assert(!badMatterRes.success, 'Invalid Matter code fails commissioning');
  assert(SmartHomeEngine.getDevices().length === 0, 'Zero devices added on failed Matter pairing');

  const badHaRes = await SmartHomeEngine.testAndFetchHomeAssistantEntities({
    url: 'http://invalid-non-existent-ha.local:8123',
    token: 'bad_token',
  });
  assert(!badHaRes.success, 'Unreachable Home Assistant fails cleanly');
  assert(badHaRes.candidates.length === 0, 'Zero candidates returned on unreachable HA');

  // 3. MATTER DEVICE COMMISSIONING
  console.log('\n--- Test Group 3: Real Matter Device Commissioning ---');
  const validMatterRes = await SmartHomeEngine.commissionMatterDevice({
    setupCode: 'MT:Y35J04VJ00MAS000000',
    customName: 'Salon Akıllı Lambader',
    roomName: 'Salon',
    userId: 'user_01',
    userName: 'Furkan Turhan',
  });
  assert(validMatterRes.success, 'Valid Matter device successfully commissioned');
  assert(validMatterRes.device?.source === 'matter', 'Device source verified as "matter"');
  assert(validMatterRes.device?.capabilities.canDim === true, 'Matter light reports canDim capability');

  const currentDevices = SmartHomeEngine.getDevices('home_owner');
  assert(currentDevices.length === 1, `Device count updated to 1 (${currentDevices[0].name})`);
  assert(SmartHomeEngine.getRooms().length === 1, 'Room "Salon" dynamically created from user assignment');

  // 4. HOME ASSISTANT SELECTIVE IMPORT
  console.log('\n--- Test Group 4: Home Assistant Selective Import ---');
  // Simulated HA candidate entities
  const simulatedCandidates = [
    {
      providerDeviceId: 'light.mutfak_tavan',
      source: 'home_assistant' as const,
      vendorName: 'Home Assistant',
      name: 'Mutfak Tavan Işığı',
      category: 'light' as const,
      state: 'off' as const,
      capabilities: { canDim: false },
      attributes: { brightness: undefined },
      isOnline: true,
    },
    {
      providerDeviceId: 'switch.kahve_makinesi',
      source: 'home_assistant' as const,
      vendorName: 'Home Assistant',
      name: 'Kahve Makinesi Prizi',
      category: 'switch' as const,
      state: 'off' as const,
      capabilities: { hasPowerMeasurement: false, hasEnergyMonitoring: false },
      attributes: {},
      isOnline: true,
    },
    {
      providerDeviceId: 'lock.celik_kapi',
      source: 'home_assistant' as const,
      vendorName: 'Home Assistant',
      name: 'Ana Giriş Kapı Kilidi',
      category: 'lock' as const,
      state: 'locked' as const,
      capabilities: { isLock: true, isCriticalSecurity: true },
      attributes: { isCriticalSecurity: true, batteryLevel: 94 },
      isOnline: true,
    },
  ];

  // User selects ONLY 2 out of 3 devices (excludes light.mutfak_tavan)
  const importRes = await SmartHomeEngine.importSelectedHomeAssistantDevices({
    url: 'http://homeassistant.local:8123',
    token: 'valid_token_123',
    selectedEntities: [
      {
        candidate: simulatedCandidates[1], // switch.kahve_makinesi
        customName: 'Mutfak Kahve Prizi',
        roomName: 'Mutfak',
      },
      {
        candidate: simulatedCandidates[2], // lock.celik_kapi
        customName: 'Çelik Kapı Kilidi',
        roomName: 'Giriş',
      },
    ],
    userId: 'user_01',
    userName: 'Furkan Turhan',
  });

  assert(importRes.success, 'Selected Home Assistant devices imported successfully');
  assert(importRes.addedCount === 2, 'Exactly 2 selected devices imported');

  const afterHaDevices = SmartHomeEngine.getDevices('home_owner');
  assert(afterHaDevices.length === 3, `Total devices in LifeOS is now 3 (1 Matter + 2 HA)`);
  assert(
    !afterHaDevices.some((d) => d.providerDeviceId === 'light.mutfak_tavan'),
    'Unselected device (light.mutfak_tavan) is STRICTLY NOT imported'
  );

  // 5. CAPABILITY STRICTNESS
  console.log('\n--- Test Group 5: Capability Strictness ---');
  const plugDevice = afterHaDevices.find((d) => d.providerDeviceId === 'switch.kahve_makinesi');
  assert(plugDevice !== undefined, 'Found imported plug device');
  assert(
    plugDevice?.capabilities.hasPowerMeasurement === false,
    'Simple switch correctly reports hasPowerMeasurement: false (no fake watts)'
  );

  // 6. RBAC & HIGH SECURITY PIN
  console.log('\n--- Test Group 6: RBAC & High Security PIN ---');
  const lockDevice = afterHaDevices.find((d) => d.category === 'lock');
  assert(lockDevice !== undefined, 'Found security lock device');

  if (lockDevice) {
    // Child access test
    const childDevices = SmartHomeEngine.getDevices('child');
    assert(!childDevices.some((d) => d.id === lockDevice.id), 'Child role cannot see or access security lock');

    // Owner invalid PIN
    const badPinRes = await SmartHomeEngine.sendDeviceCommand({
      deviceId: lockDevice.id,
      command: 'unlock',
      userId: 'user_01',
      userName: 'Furkan Turhan',
      userRole: 'home_owner',
      securityPin: '9999',
    });
    assert(!badPinRes.success, 'Invalid PIN rejected on lock');

    // Owner valid PIN
    await new Promise((r) => setTimeout(r, 400));
    const goodPinRes = await SmartHomeEngine.sendDeviceCommand({
      deviceId: lockDevice.id,
      command: 'unlock',
      userId: 'user_01',
      userName: 'Furkan Turhan',
      userRole: 'home_owner',
      securityPin: '1234',
    });
    assert(goodPinRes.success, 'Owner with correct PIN unlocks door');
    assert(goodPinRes.device?.state === 'unlocked', 'Door lock state updated to UNLOCKED');
  }

  // 7. USER-CREATED ROOMS
  console.log('\n--- Test Group 7: Manual Room Creation ---');
  const newRoom = SmartHomeEngine.createRoom('Çalışma Odası', '💼');
  assert(newRoom.name === 'Çalışma Odası', 'User manually created room "Çalışma Odası"');
  assert(SmartHomeEngine.getRooms().some((r) => r.name === 'Çalışma Odası'), 'Room exists in room list');

  // 8. DEVICE REMOVAL
  console.log('\n--- Test Group 8: Device Removal & Audit Trail ---');
  if (plugDevice) {
    const removeOk = SmartHomeEngine.removeDevice(plugDevice.id, 'user_01');
    assert(removeOk, 'Device removed successfully');
    assert(
      !SmartHomeEngine.getDevices().some((d) => d.id === plugDevice.id),
      'Removed device no longer in active device list'
    );
    assert(SmartHomeEngine.getDevices().length === 2, 'Device count decremented to 2');

    const auditLogs = SmartHomeEngine.getAuditLogs();
    assert(
      auditLogs.some((l) => l.action.includes('Cihaz Kaldırıldı')),
      'Audit trail recorded device removal event'
    );
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
