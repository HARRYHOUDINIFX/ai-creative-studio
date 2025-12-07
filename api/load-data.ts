
try {
    const { blobs } = await list({ prefix: 'data/project-data.json', limit: 1 });
    const blob = blobs.find(b => b.pathname === 'data/project-data.json');

    if (blob) {
        const response = await fetch(blob.url);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } else {
        return new Response('Not found', { status: 404 });
    }
} catch (error) {
    console.error('Load Data Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
}
}
