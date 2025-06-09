// Supabase Edge Function - leaderboard.ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Cache constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20;

// Type for stored data
type CacheEntry = {
  data: any;
  timestamp: number;
};

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
    const limit = parseInt(
      url.searchParams.get('limit') || PAGE_SIZE.toString()
    );

    if (page < 1 || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          error: 'Invalid parameters',
          message: 'Page must be >= 1 and limit must be between 1 and 100',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const now = Date.now();
    const cacheKey = `leaderboard:${page}-${limit}`;

    // Open KV store
    const kv = await Deno.openKv();

    // Check cache in KV
    const cacheResult = await kv.get<CacheEntry>([cacheKey]);

    // If we have a valid cache entry, return it
    if (
      cacheResult.value &&
      now - cacheResult.value.timestamp < CACHE_DURATION
    ) {
      return new Response(
        JSON.stringify({ ...cacheResult.value.data, cached: true }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'max-age=300', // Allow browser caching for 5 minutes
          },
        }
      );
    }

    // Load env variables
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
        previousPage: hasPreviousPage ? page - 1 : null,
      },
      timestamp: now,
      cached: false,
    };

    // Store in KV with automatic expiration
    // This is cleaner than manual deletion as KV handles expiration for us
    await kv.set(
      [cacheKey],
      { data: responseData, timestamp: now },
      {
        expireIn: CACHE_DURATION,
      }
    );

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=300', // Allow browser caching
      },
    });
  } catch (err: any) {
    console.error('Leaderboard error:', err.message);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch leaderboard',
        message: err.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
