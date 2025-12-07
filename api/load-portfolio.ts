import { list } from '@vercel/blob';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // 1. Find the blob file
        const { blobs } = await list({ prefix: 'data/portfolio-data.json', limit: 1 });

        // Check if we have a match
        // Filters for exact match just in case
        const blob = blobs.find(b => b.pathname === 'data/portfolio-data.json');

        if (blob) {
            // 2. Fetch the content from the Blob URL
            const response = await fetch(blob.url);
            const data = await response.json();

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0' // Ensure fresh data
                },
            });
        } else {
            // No data saved yet
            return new Response(JSON.stringify([]), {
                status: 200, // Return empty array validly? Or 404?
                // Let's return null so frontend can fallback to static default
            }); // Actually better: return null or empty array.
            // If I return 404, frontend might error. 
            // Let's return empty array if not found, OR simpler:
            // The frontend logic expects an array. If not found in blob, user starts fresh or uses static.
            // I will return 404 so frontend knows to use static fallback.
            return new Response('Not found', { status: 404 });
        }
    } catch (error) {
        console.error('Load Portfolio Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
