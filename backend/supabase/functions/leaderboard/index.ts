// Supabase Edge Function - leaderboard.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Cache structure and constants
type CacheEntry = {
  data: any;
  timestamp: number;
};

const cachedPages = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || PAGE_SIZE.toString());

    if (page < 1 || limit < 1 || limit > 100) {
      return new Response(JSON.stringify({
        error: 'Invalid parameters',
        message: 'Page must be >= 1 and limit must be between 1 and 100'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const now = Date.now();
    const cacheKey = `${page}-${limit}`;

    // Check cache
    if (cachedPages.has(cacheKey)) {
      const cached = cachedPages.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_DURATION) {
        return new Response(JSON.stringify({ ...cached.data, cached: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        cachedPages.delete(cacheKey);
      }
    }

    // Load env variables - FIXED
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase env variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pagination
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('users')
      .select('id, username, points, rank', { count: 'exact' })
      .order('points', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    const totalPages = Math.ceil((count ?? 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const responseData = {
      leaderboard: data,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: count,
        usersPerPage: limit,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null
      },
      timestamp: now,
      cached: false
    };

    // Store in cache
    cachedPages.set(cacheKey, { data: responseData, timestamp: now });

    // Limit memory usage
    if (cachedPages.size > 10) {
      const oldestKey = cachedPages.keys().next().value;
      cachedPages.delete(oldestKey);
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err: any) {
    console.error('Leaderboard error:', err.message);
    return new Response(JSON.stringify({
      error: 'Failed to fetch leaderboard',
      message: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

