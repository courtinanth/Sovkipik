import type { APIRoute } from 'astro';

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
const CUSDIS_HOST = 'https://cusdis.com';

export const GET: APIRoute = async ({ request, url }) => {
    // Use Astro's `url` object provided in the context, which retains query params
    const pageId = url.searchParams.get('pageId');

    console.log(`[Proxy] Context URL href: ${url.href}`);
    console.log(`[Proxy] Extracted pageId: ${pageId}`);

    if (!pageId) {
        return new Response(JSON.stringify({ error: 'Missing pageId', debugUrl: url.href }), { status: 400 });
    }

    try {
        const fetchUrl = `${CUSDIS_HOST}/api/open/comments?appId=${APP_ID}&pageId=${pageId}&limit=100`;

        const res = await fetch(fetchUrl);
        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('[Proxy] Error fetching comments:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const payload = { ...body, appId: APP_ID };

        const res = await fetch(`${CUSDIS_HOST}/api/open/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Proxy] Error posting comment:', error);
        return new Response(JSON.stringify({ error: 'Failed to post comment' }), { status: 500 });
    }
};
