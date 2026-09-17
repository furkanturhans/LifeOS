import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';
import { getSmartHomeProvider } from '@/lib/smarthome/SmartHomeProvider';
import type { SmartHomeRole } from '@/types/smarthome';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') as SmartHomeRole) || 'home_owner';

  const home = SmartHomeEngine.getHome();
  const devices = SmartHomeEngine.getDevices(role);
  const rooms = SmartHomeEngine.getRooms();
  const overview = SmartHomeEngine.getQuickOverview();
  const scenes = SmartHomeEngine.getScenes();
  const automations = SmartHomeEngine.getAutomations();
  const auditLogs = SmartHomeEngine.getAuditLogs();
  const solar = SmartHomeEngine.getSolarSystem();
  const heatPump = SmartHomeEngine.getHeatPumpSystem();
  const cameras = SmartHomeEngine.getCameras(role);
  const appliances = SmartHomeEngine.getAppliances();
  const energyFlow = SmartHomeEngine.getEnergyFlow();

  const provider = getSmartHomeProvider();
  const energy = await provider.getEnergyData();

  return NextResponse.json({
    success: true,
    home,
    overview,
    devices,
    rooms,
    scenes,
    automations,
    auditLogs,
    energy,
    solar,
    heatPump,
    cameras,
    appliances,
    energyFlow,
  });
}
