import type { APIRoute } from 'astro';
import { getDevices } from '../lib/devices';

export const GET: APIRoute = async () => {
  const devices = await getDevices();
  return new Response(JSON.stringify(devices), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  });
};
