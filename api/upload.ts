import { put } from '@vercel/blob';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).send('Method not allowed');
    }

    const filename = request.query.filename || 'uploaded-file';

    try {
        // Stream the request body directly to Vercel Blob
        const blob = await put(filename, request, {
            access: 'public',
            addRandomSuffix: true,
        });

        return response.status(200).json({ url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return response.status(500).json({ error: 'Upload failed' });
    }
}
