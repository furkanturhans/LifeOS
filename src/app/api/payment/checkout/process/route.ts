import { academySession, academyFailure, AcademyError } from '@/lib/education/academy-server';
export async function POST(request:Request){try{await academySession(request);throw new AcademyError(503,'GATEWAY_NOT_CONFIGURED');}catch(error){return academyFailure(error);}}
