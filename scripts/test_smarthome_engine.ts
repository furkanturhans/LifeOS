/**
 * Comprehensive Automated Verification Suite for LifeOS Smart Home & Energy Ecosystem
 * Tests:
 * 1. Disabled Provider & Zero Fake State
 * 2. SmartHomeEngine Initialization & Test Device Seeding (including Solar, Heat Pump, Appliances)
 * 3. Solar & Inverter System Control (Production kW, Battery Storage %, Surplus Action Policies)
 * 4. Heat Pump System Control (Heating/Cooling/Hot Water, Water Flow/Return Temp, COP Efficiency, Silent/Boost/SolarSync)
 * 5. Camera System Control (Multi-channel feeds, Privacy Shutter, Night Vision, Child Restrictions)
 * 6. Household Appliances Control (Washing Machine, Dishwasher, Robot Vacuum, Solar Auto-Start Schedule)
 * 7. Real-Time kW Power Flow & Energy Efficiency Analytics (Live kW Load, Self-Consumption %, Daily Cost/Savings)
 * 8. Local WiFi Network Discovery Radar (Home Assistant, Inverter, Heat Pump, Matter, ONVIF Camera scan)
 * 9. RBAC & High-Security PIN Verification
 * 10. Critical Safety Alarms & Immutable Audit Logging
 */

import { SmartHomeEngine } from '../src/lib/smarthome/SmartHomeEngine';
import {
  DisabledSmartHomeProvider,
  HomeAssistantProvider,
} from '../src/lib/smarthome/SmartHomeProvider';

async function runTests() {
  console.log('🚀 Starting LifeOS Smart Home & Energy Verification Suite...\n');

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

  // TEST 1: Unconnected State (Disabled Provider)
  console.log('--- Test Group 1: Unconnected Provider & Zero Fake State ---');
  const disabledProvider = new DisabledSmartHomeProvider();
  const testConn = await disabledProvider.testConnection();
  assert(!testConn.success, 'Disabled provider testConnection() returns success: false');
  assert(testConn.message !== undefined && (testConn.message.includes('yapılandırılmamış') || testConn.message.includes('bağlı değil')), 'Disabled provider provides clear Turkish guidance');

  const emptyEntitiesRes = await disabledProvider.fetchEntities();
  assert(emptyEntitiesRes.devices.length === 0, 'Unconnected provider returns ZERO mock devices (no fake data)', `devices: ${emptyEntitiesRes.devices.length}`);

  // TEST 2: Initial Engine State & Seeding Test Devices
  console.log('\n--- Test Group 2: SmartHomeEngine Initialization & Sync ---');
  const initialHome = SmartHomeEngine.getHome();
  assert(initialHome.name === 'Evim', 'Initializes with default home (Evim)');
  
  const initialRooms = SmartHomeEngine.getRooms();
  assert(initialRooms.length >= 7, `Contains default rooms including Çatı & Enerji Odası (Total: ${initialRooms.length})`);

  SmartHomeEngine.seedTestDevices();
  const devices = SmartHomeEngine.getDevices('home_owner');
  assert(devices.length >= 9, `SmartHomeEngine contains mapped device entities (${devices.length} devices)`);

  // TEST 3: Solar & Inverter System
  console.log('\n--- Test Group 3: Solar & Inverter System ---');
  const solar = SmartHomeEngine.getSolarSystem();
  assert(solar.solarProductionKW > 0, `Solar production live: ${solar.solarProductionKW} kW`);
  assert(solar.batteryLevelPercent > 50, `Battery level verified: %${solar.batteryLevelPercent}`);
  assert(solar.inverterEfficiency >= 95, `Inverter efficiency verified: %${solar.inverterEfficiency}`);

  const updateSolarRes = SmartHomeEngine.controlSolarInverter({
    surplusAction: 'heat_pump_hotwater',
    userId: 'user_owner_01',
    userName: 'Furkan Turhan',
  });
  assert(updateSolarRes.success, 'Solar surplus policy changed to "heat_pump_hotwater" successfully');
  assert(SmartHomeEngine.getSolarSystem().solarSurplusAutoAction === 'heat_pump_hotwater', 'Surplus policy verified in state');

  // TEST 4: Heat Pump System
  console.log('\n--- Test Group 4: Heat Pump System & COP Diagnostics ---');
  const heatPump = SmartHomeEngine.getHeatPumpSystem();
  assert(heatPump.copEfficiency >= 4.0, `Heat pump COP efficiency verified: ${heatPump.copEfficiency} COP`);
  assert(heatPump.waterFlowTempC > heatPump.waterReturnTempC, `Hydraulic loop delta verified (Flow: ${heatPump.waterFlowTempC}°C > Return: ${heatPump.waterReturnTempC}°C)`);

  const updateHpRes = SmartHomeEngine.controlHeatPump({
    mode: 'heating',
    targetTempC: 23.0,
    hotWaterTankTargetTempC: 58.0,
    silentMode: true,
    solarSyncEnabled: true,
    userId: 'user_owner_01',
    userName: 'Furkan Turhan',
  });
  assert(updateHpRes.success, 'Heat pump parameters updated (Target: 23°C, Tank: 58°C, Silent: ON, SolarSync: ON)');
  const updatedHp = SmartHomeEngine.getHeatPumpSystem();
  assert(updatedHp.targetTempC === 23.0 && updatedHp.silentMode === true, 'Heat pump state updated accurately in memory');

  // TEST 5: Camera Surveillance & Privacy Shutter
  console.log('\n--- Test Group 5: Security Cameras & Privacy Control ---');
  const cameras = SmartHomeEngine.getCameras('home_owner');
  assert(cameras.length >= 3, `Surveillance cameras active: ${cameras.length} channels`);

  const salonCam = cameras.find(c => c.id === 'cam-salon');
  assert(salonCam !== undefined, 'Found Salon Internal Camera');

  if (salonCam) {
    const privacyRes = SmartHomeEngine.controlCamera({
      cameraId: salonCam.id,
      privacyMode: true,
      userId: 'user_owner_01',
      userName: 'Furkan Turhan',
      userRole: 'home_owner',
    });
    assert(privacyRes.success, 'Privacy shutter enabled on internal camera');
    assert(SmartHomeEngine.getCameras('home_owner').find(c => c.id === salonCam.id)?.privacyMode === true, 'Privacy shutter state verified as TRUE');

    // Child role restriction test
    const childCameras = SmartHomeEngine.getCameras('child');
    assert(childCameras.length === 0, 'Child role is DENIED access to camera video feeds');
  }

  // TEST 6: Smart Household Appliances & Solar Eco Sync
  console.log('\n--- Test Group 6: Household Appliances & Solar Eco Start ---');
  const appliances = SmartHomeEngine.getAppliances();
  assert(appliances.length >= 4, `Smart appliances mapped: ${appliances.length} appliances`);

  const washingMachine = appliances.find(a => a.type === 'washing_machine');
  assert(washingMachine !== undefined, 'Found Smart Washing Machine');

  if (washingMachine) {
    const toggleSyncRes = SmartHomeEngine.controlAppliance({
      applianceId: washingMachine.id,
      command: 'toggle_solar_sync',
      userId: 'user_owner_01',
      userName: 'Furkan Turhan',
    });
    assert(toggleSyncRes.success, 'Toggled Solar Eco Start synchronization on washing machine');
  }

  // TEST 7: Real-Time kW Power Flow & Energy Efficiency
  console.log('\n--- Test Group 7: Real-Time kW Power Flow & Efficiency ---');
  const flow = SmartHomeEngine.getEnergyFlow();
  assert(flow.currentTotalPowerKW > 0, `Total live home power verified: ${flow.currentTotalPowerKW} kW`);
  assert(flow.efficiencyScore >= 90, `Energy efficiency score verified: ${flow.efficiencyScore}/100`);
  assert(flow.topConsumers.length >= 3, `Top consumer devices analyzed: ${flow.topConsumers.length} devices`);
  assert(flow.smartSavingsTips.length >= 2, `AI savings tips generated: ${flow.smartSavingsTips.length} tips`);

  // TEST 8: Local WiFi Network Discovery Radar
  console.log('\n--- Test Group 8: Local WiFi Network Discovery Radar ---');
  const wifiScan = await SmartHomeEngine.scanLocalWifiDevices();
  assert(wifiScan.success, 'Local WiFi network scan completed');
  assert(wifiScan.foundDevices.length >= 4, `Discovered smart nodes: ${wifiScan.foundDevices.length} nodes (HA, Inverter, Heat Pump, Matter, ONVIF)`);
  assert(wifiScan.foundDevices.some(d => d.type === 'solar_inverter'), 'Discovered Fronius Solar Inverter on LAN');
  assert(wifiScan.foundDevices.some(d => d.type === 'heat_pump'), 'Discovered Daikin Heat Pump controller on LAN');

  // TEST 9: Role-Based Access Control & High-Security PIN
  console.log('\n--- Test Group 9: RBAC & High-Security PIN Verification ---');
  const frontDoorLock = devices.find(d => d.id === 'lock.ana_kapi');
  assert(frontDoorLock !== undefined, 'Found Main Door Lock entity');

  if (frontDoorLock) {
    // Child trying to unlock
    const childLockRes = await SmartHomeEngine.sendDeviceCommand({
      deviceId: frontDoorLock.id,
      command: 'unlock',
      userId: 'user_child_01',
      userName: 'Ahmet (Çocuk)',
      userRole: 'child',
    });
    assert(!childLockRes.success, 'Child role is DENIED access to lock/unlock door');

    // Owner with invalid PIN
    await new Promise(r => setTimeout(r, 400));
    const badPinRes = await SmartHomeEngine.sendDeviceCommand({
      deviceId: frontDoorLock.id,
      command: 'unlock',
      userId: 'user_owner_01',
      userName: 'Furkan Turhan',
      userRole: 'home_owner',
      securityPin: '0000',
    });
    assert(!badPinRes.success, 'Owner with INVALID PIN is rejected');

    // Owner with correct PIN
    await new Promise(r => setTimeout(r, 400));
    const goodPinRes = await SmartHomeEngine.sendDeviceCommand({
      deviceId: frontDoorLock.id,
      command: 'unlock',
      userId: 'user_owner_01',
      userName: 'Furkan Turhan',
      userRole: 'home_owner',
      securityPin: '1234',
    });
    assert(goodPinRes.success, 'Owner with CORRECT PIN (1234) unlocks front door successfully');
  }

  // TEST 10: Safety Alarms & Audit Logging
  console.log('\n--- Test Group 10: Safety Alarms & Immutable Audit Logging ---');
  const waterLeakSensor = devices.find(d => d.id === 'binary_sensor.banyo_su_kacagi');
  if (waterLeakSensor) {
    const alarmRes = SmartHomeEngine.triggerSafetyAlarm({
      deviceId: waterLeakSensor.id,
      alarmType: 'water_leak',
    });
    assert(alarmRes.success, 'Safety alarm triggered successfully');
  }

  const logs = SmartHomeEngine.getAuditLogs();
  assert(logs.length >= 6, `Audit logs recorded accurately (Total events: ${logs.length})`);
  assert(logs.some(l => l.action.includes('İnverter') || l.action.includes('Solar')), 'Audit trail records solar management action');
  assert(logs.some(l => l.action.includes('Isı Pompası')), 'Audit trail records heat pump adjustment action');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
