import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        excerpt: z.string(),
        date: z.date(),
        author: z.string().default('Sovkipik'),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        category: z.string().default('Général'),
        description: z.string().optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
};
