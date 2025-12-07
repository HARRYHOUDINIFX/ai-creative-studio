import { put, list, del } from '@vercel/blob';

export const config = {
    runtime: 'edge', // or 'nodejs'
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const data = await req.json();
        const jsonString = JSON.stringify(data);

        // 1. Upload new file (overwrite is effectively creating new one)
        const blob = await put('data/portfolio-data.json', jsonString, {
            access: 'public',
            addRandomSuffix: false, // Try to keep clean name if possible, but Vercel might version it
            contentType: 'application/json',
        });

        // 2. Cleanup old versions? 
        // Vercel Blob doesn't inherently version in a way that clutters unless named differently. 
        // If we use same path 'data/portfolio-data.json' with addRandomSuffix: false, it might overwrite?
        // Actually Vercel Blob docs say "addRandomSuffix: true" is default.
        // If we set false, it overwrites! perfect.

        return new Response(JSON.stringify({ success: true, url: blob.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Save Portfolio Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
