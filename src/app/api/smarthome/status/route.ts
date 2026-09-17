import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';
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
  const supportedVendors = SmartHomeEngine.getSupportedVendors();

  return NextResponse.json({
    success: true,
    home,
    overview,
    devices,
    rooms,
    scenes,
    automations,
    auditLogs,
    supportedVendors,
  });
}
