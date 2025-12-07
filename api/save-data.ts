import { put } from '@vercel/blob';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const data = await req.json();
        const jsonString = JSON.stringify(data);

        const blob = await put('data/project-data.json', jsonString, {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json',
        });

        return new Response(JSON.stringify({ success: true, url: blob.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Save Data Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
