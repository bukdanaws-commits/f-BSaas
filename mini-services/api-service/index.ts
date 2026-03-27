// Eventify Backend API - Bun/Node.js (Equivalent to Golang Fiber)
// This replicates the Golang backend functionality

import { serve } from "bun";

// =====================================
// CONFIGURATION
// =====================================
const CONFIG = {
  PORT: 8080,
  SUPABASE_URL: 'https://ibrdwbsfwrrxeqglpppk.supabase.co',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicmR3YnNmd3JyeGVxZ2xwcHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ3MjE1MCwiZXhwIjoyMDg5MDQ4MTUwfQ.kMW86SgNJ4TaJ2yqw-7DaizYlWbi3oezkCrm7ZAkwlk',
  JWT_SECRET: 'eventify-super-secret-jwt-key-2024',
  GOOGLE_CLIENT_ID: '870697180975-atbk3jiiq05c56uc0qt1c5itdqevkoar.apps.googleusercontent.com',
  FRONTEND_URL: 'http://localhost:3000'
};

console.log('🚀 Eventify API (Golang Backend Equivalent)');
console.log(`📡 Port: ${CONFIG.PORT}`);
console.log(`🔗 Supabase: ${CONFIG.SUPABASE_URL}`);

// =====================================
// SUPABASE HELPERS
// =====================================
async function querySupabase(table: string, options: any = {}) {
  const { select = '*', filter, order, limit } = options;
  let url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  if (filter) url += `&${filter}`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  
  const res = await fetch(url, {
    headers: {
      'apikey': CONFIG.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${CONFIG.SUPABASE_SERVICE_KEY}`
    }
  });
  return res.json();
}

async function insertSupabase(table: string, data: any) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': CONFIG.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${CONFIG.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateSupabase(table: string, id: string, data: any) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': CONFIG.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${CONFIG.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// =====================================
// JWT HELPERS (Simple base64 for demo)
// =====================================
function encodeToken(payload: any): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decodeToken(token: string): any {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
}

// =====================================
// CORS HEADERS
// =====================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// =====================================
// ROUTER
// =====================================
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ==================== HEALTH ====================
    if (path === '/health') {
      return Response.json({
        status: 'ok',
        message: 'Eventify API is running (Golang Backend Equivalent)',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }, { headers: corsHeaders });
    }

    // ==================== PRICING PACKAGES (Public) ====================
    if (path === '/api/pricing/packages' && method === 'GET') {
      const packages = await querySupabase('pricing_packages', {
        filter: 'is_active=eq.true',
        order: 'sort_order.asc'
      });
      return Response.json({ success: true, data: packages }, { headers: corsHeaders });
    }

    // ==================== GOOGLE OAUTH URL ====================
    if (path === '/api/auth/google' && method === 'GET') {
      const redirectUri = `${CONFIG.FRONTEND_URL}/auth/callback`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CONFIG.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
      return Response.json({ success: true, auth_url: authUrl }, { headers: corsHeaders });
    }

    // ==================== GOOGLE LOGIN ====================
    if (path === '/api/auth/google/login' && method === 'POST') {
      const body = await req.json();
      const { access_token } = body;

      if (!access_token) {
        return Response.json({ success: false, error: 'No access token' }, { status: 400, headers: corsHeaders });
      }

      // Verify with Google
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      if (!googleRes.ok) {
        return Response.json({ success: false, error: 'Invalid Google token' }, { status: 401, headers: corsHeaders });
      }

      const googleUser = await googleRes.json();

      // Check/create user
      let users = await querySupabase('users', { filter: `email=eq.${googleUser.email}` });
      let user = users?.[0];

      if (!user) {
        const created = await insertSupabase('users', {
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          google_id: googleUser.sub,
          is_super_admin: false
        });
        user = created?.[0];
      }

      // Get tenant
      let tenant = null;
      let role = null;
      if (user) {
        const memberships = await querySupabase('memberships', { filter: `user_id=eq.${user.id}` });
        if (memberships?.length > 0) {
          role = memberships[0].role;
          const tenants = await querySupabase('tenants', { filter: `id=eq.${memberships[0].tenant_id}` });
          tenant = tenants?.[0];
        }
      }

      // Generate token
      const token = encodeToken({
        user_id: user?.id,
        email: user?.email,
        name: user?.name,
        tenant_id: tenant?.id,
        role,
        is_super_admin: user?.is_super_admin,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000
      });

      return Response.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user?.id, email: user?.email, name: user?.name },
        tenant,
        role
      }, { headers: corsHeaders });
    }

    // ==================== AUTH MIDDLEWARE ====================
    const authHeader = req.headers.get('Authorization');
    let currentUser = null;

    if (authHeader?.startsWith('Bearer ')) {
      currentUser = decodeToken(authHeader.substring(7));
    }

    // ==================== GET CURRENT USER ====================
    if (path === '/api/auth/me' && method === 'GET') {
      if (!currentUser) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      return Response.json({ success: true, user: currentUser }, { headers: corsHeaders });
    }

    // ==================== EVENTS ====================
    if (path === '/api/events' && method === 'GET') {
      if (!currentUser) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      if (!currentUser.tenant_id) {
        return Response.json({ success: true, data: [], message: 'No tenant' }, { headers: corsHeaders });
      }
      const events = await querySupabase('events', { filter: `tenant_id=eq.${currentUser.tenant_id}` });
      return Response.json({ success: true, data: events }, { headers: corsHeaders });
    }

    if (path === '/api/events' && method === 'POST') {
      if (!currentUser?.tenant_id) {
        return Response.json({ success: false, error: 'No tenant' }, { status: 400, headers: corsHeaders });
      }
      const body = await req.json();
      const event = await insertSupabase('events', {
        tenant_id: currentUser.tenant_id,
        name: body.name,
        status: 'draft'
      });
      return Response.json({ success: true, data: event?.[0] }, { headers: corsHeaders });
    }

    // ==================== EVENT STATS ====================
    if (path.match(/^\/api\/events\/[^/]+\/stats$/) && method === 'GET') {
      const eventId = path.split('/')[3];
      const participants = await querySupabase('participants', {
        filter: `event_id=eq.${eventId}`,
        select: 'id,is_checked_in,food_claims,drink_claims'
      });
      
      return Response.json({
        success: true,
        data: {
          total_participants: participants.length,
          checked_in: participants.filter((p: any) => p.is_checked_in).length,
          total_food_claims: participants.reduce((sum: number, p: any) => sum + (p.food_claims || 0), 0),
          total_drink_claims: participants.reduce((sum: number, p: any) => sum + (p.drink_claims || 0), 0)
        }
      }, { headers: corsHeaders });
    }

    // ==================== PARTICIPANTS ====================
    if (path.match(/^\/api\/events\/[^/]+\/participants$/) && method === 'GET') {
      const eventId = path.split('/')[3];
      const participants = await querySupabase('participants', {
        filter: `event_id=eq.${eventId}`,
        order: 'created_at.desc'
      });
      return Response.json({ success: true, data: participants, total: participants.length }, { headers: corsHeaders });
    }

    if (path.match(/^\/api\/participants\/qr\//) && method === 'GET') {
      const qrCode = path.split('/').pop();
      const participants = await querySupabase('participants', { filter: `qr_code=eq.${qrCode}` });
      
      if (!participants?.length) {
        return Response.json({ success: false, error: 'Participant not found' }, { status: 404, headers: corsHeaders });
      }
      return Response.json({ success: true, data: participants[0] }, { headers: corsHeaders });
    }

    // ==================== CHECK-IN ====================
    if (path === '/api/checkin' && method === 'POST') {
      if (!currentUser) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const body = await req.json();
      const { qr_code, event_id, desk_number = 1 } = body;

      const participants = await querySupabase('participants', {
        filter: `qr_code=eq.${qr_code}&event_id=eq.${event_id}`
      });
      const participant = participants?.[0];

      if (!participant) {
        return Response.json({ success: false, error: 'Participant not found' }, { status: 404, headers: corsHeaders });
      }

      if (participant.is_checked_in) {
        return Response.json({ success: false, error: 'Already checked in', participant }, { status: 400, headers: corsHeaders });
      }

      await updateSupabase('participants', participant.id, {
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
        checkin_count: 1
      });

      await insertSupabase('checkins', {
        event_id,
        participant_id: participant.id,
        operator_id: currentUser.user_id,
        desk_number
      });

      await insertSupabase('display_queue', {
        event_id,
        participant_id: participant.id,
        name: participant.name,
        is_displayed: false
      });

      return Response.json({
        success: true,
        message: 'Check-in successful',
        participant: { ...participant, is_checked_in: true }
      }, { headers: corsHeaders });
    }

    // ==================== CLAIMS ====================
    if (path === '/api/claims' && method === 'POST') {
      if (!currentUser) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const body = await req.json();
      const { qr_code, event_id, claim_type } = body;

      const participants = await querySupabase('participants', {
        filter: `qr_code=eq.${qr_code}&event_id=eq.${event_id}`
      });
      const participant = participants?.[0];

      if (!participant) {
        return Response.json({ success: false, error: 'Participant not found' }, { status: 404, headers: corsHeaders });
      }

      if (!participant.is_checked_in) {
        return Response.json({ success: false, error: 'Not checked in' }, { status: 400, headers: corsHeaders });
      }

      const isFood = claim_type === 'food';
      const current = isFood ? participant.food_claims : participant.drink_claims;
      const max = isFood ? participant.max_food_claims : participant.max_drink_claims;

      if (current >= max) {
        return Response.json({ success: false, error: `Max ${claim_type} claims` }, { status: 400, headers: corsHeaders });
      }

      const update = isFood ? { food_claims: current + 1 } : { drink_claims: current + 1 };
      await updateSupabase('participants', participant.id, update);

      await insertSupabase('claims', { event_id, participant_id: participant.id });

      return Response.json({ success: true, message: `${claim_type} claimed`, participant: { ...participant, ...update } }, { headers: corsHeaders });
    }

    // ==================== WALLET ====================
    if (path === '/api/credits/wallet' && method === 'GET') {
      if (!currentUser) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      if (!currentUser.tenant_id) {
        return Response.json({ success: false, error: 'No tenant' }, { status: 400, headers: corsHeaders });
      }

      let wallets = await querySupabase('credit_wallets', { filter: `tenant_id=eq.${currentUser.tenant_id}` });
      
      if (!wallets?.length) {
        wallets = await insertSupabase('credit_wallets', { tenant_id: currentUser.tenant_id, balance: 0 });
      }

      return Response.json({ success: true, data: wallets?.[0] }, { headers: corsHeaders });
    }

    // ==================== ADMIN CREDIT SETTINGS ====================
    if (path === '/api/admin/credit-settings' && method === 'GET') {
      const settings = await querySupabase('credit_settings');
      return Response.json({ success: true, data: settings?.[0] }, { headers: corsHeaders });
    }

    // ==================== MENU ====================
    if (path.match(/^\/api\/events\/[^/]+\/menu$/) && method === 'GET') {
      const eventId = path.split('/')[3];
      const items = await querySupabase('menu_items', { filter: `event_id=eq.${eventId}&is_active=eq.true` });
      return Response.json({ success: true, data: items }, { headers: corsHeaders });
    }

    // ==================== 404 ====================
    return Response.json({ success: false, error: 'Not found' }, { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500, headers: corsHeaders });
  }
}

// =====================================
// START SERVER
// =====================================
serve({
  port: CONFIG.PORT,
  fetch: handleRequest
});

console.log(`✅ API running at http://localhost:${CONFIG.PORT}`);
