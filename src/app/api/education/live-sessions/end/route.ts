import { NextResponse } from 'next/server';
const retired=()=>NextResponse.json({error:'USE_ACADEMY',endpoint:'/api/academy'},{status:410});
export const GET=retired;
export const POST=retired;
export const PATCH=retired;
export const DELETE=retired;
