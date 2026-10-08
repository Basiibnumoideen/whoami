import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://basi.world';
  const routes = [
    '',
    '/about',
    '/projects',
    '/skills',
    '/experience',
    '/services',
    '/blog',
    '/now',
    '/uses',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
