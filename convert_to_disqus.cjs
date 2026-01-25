const fs = require('fs');
const xml2js = require('xml2js');

// Mapping of WP ID -> New Slug
const ID_MAPPING = {
    '258': 'tique-herisson',
    '263': 'bebe-herisson-presentation-et-comment-sen-occuper',
    '162': 'que-mange-un-herisson',
    '413': 'que-mange-un-herisson', // Seems duplicate topic?
    '239': 'soccuper-dun-herisson-sauvage', // Best guess based on content (care, ticks)
    '222': 'sauver-les-herissons', // General rescue/garden context
    '232': 'predateurs-herisson',
    '404': 'bebe-herisson-presentation-et-comment-sen-occuper', // "recueillir jeune femelle"
    '323': 'index', // General congrats? or specific article?
    '162': 'que-mange-un-herisson'
};

const POST_TITLES = {
    'tique-herisson': 'Les tiques sur les hérissons',
    'bebe-herisson-presentation-et-comment-sen-occuper': 'Bébé hérisson : Naissance, alimentation, soin que faire ?',
    'que-mange-un-herisson': 'Que mange un hérisson ?',
    'soccuper-dun-herisson-sauvage': "S'occuper d'un hérisson sauvage",
    'sauver-les-herissons': 'Sauver les hérissons',
    'predateurs-herisson': 'Les prédateurs du hérisson',
    'index': 'Accueil'
};

const inputFile = 'wp_comments.xml';
const outputFile = 'disqus_import.xml';

fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) throw err;

    xml2js.parseString(data, (err, result) => {
        if (err) throw err;

        const pma = result['pma_xml_export'];
        const db = pma['database'][0];
        const comments = db['table'];

        const threads = {};
        const posts = [];

        comments.forEach(c => {
            const getCol = (name) => {
                const col = c.column.find(x => x.$.name === name);
                return col ? col._ : '';
            };

            const wpId = getCol('comment_post_ID');
            const slug = ID_MAPPING[wpId];

            if (!slug) {
                console.warn(`Skipping Post ID ${wpId} - No mapping found`);
                return;
            }

            // Create thread if not exists
            if (!threads[slug]) {
                threads[slug] = {
                    id: slug,
                    forum: 'sovkipik',
                    title: POST_TITLES[slug] || slug,
                    link: `https://sovkipik.netlify.app/blog/${slug}`
                };
            }

            // Create post
            const commentId = getCol('comment_ID');
            const parentId = getCol('comment_parent');

            posts.push({
                id: commentId,
                message: getCol('comment_content'),
                createdAt: new Date(getCol('comment_date_gmt') + 'Z').toISOString(),
                authorEmail: getCol('comment_author_email'),
                authorName: getCol('comment_author'),
                authorUrl: getCol('comment_author_url'),
                ip: getCol('comment_author_IP'),
                isApproved: getCol('comment_approved') === '1',
                parent: parentId !== '0' ? parentId : null,
                threadId: slug
            });
        });

        // Builder
        const builder = new xml2js.Builder({
            rootName: 'disqus',
            headless: false,
            renderOpts: { 'pretty': true, 'indent': '  ', 'newline': '\n' }
        });

        const xmlObj = {
            $: {
                'xmlns': 'http://disqus.com',
                'xmlns:dsq': 'http://disqus.com/disqus-internals',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                'xsi:schemaLocation': 'http://disqus.com/disqus-internals http://disqus.com/api/schemas/1.0/disqus-internals.xsd'
            },
            thread: Object.values(threads).map(t => ({
                id: t.id,
                forum: t.forum,
                category: { $: { 'dsq:id': '0' } },
                link: t.link,
                title: t.title,
                message: '',
                createdAt: '2023-01-01T00:00:00Z',
                author: { name: 'Sovkipik', isAnonymous: false }
            })),
            post: posts.map(p => {
                const post = {
                    id: p.id,
                    message: p.message,
                    createdAt: p.createdAt,
                    author: {
                        email: p.authorEmail,
                        name: p.authorName,
                        isAnonymous: false,
                        url: p.authorUrl
                    },
                    ipAddress: p.ip,
                    isDeleted: false,
                    isSpam: false,
                    thread: { $: { 'dsq:id': p.threadId } }
                };
                if (p.parent) post.parent = { $: { 'dsq:id': p.parent } };
                return post;
            })
        };

        const xml = builder.buildObject(xmlObj);
        fs.writeFile(outputFile, xml, (err) => {
            if (err) throw err;
            console.log(`Generated ${outputFile} with ${posts.length} comments`);
        });
    });
});
