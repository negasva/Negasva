// JSON-LD BreadcrumbList para páginas de segundo nivel (server component).
export default function BreadcrumbSchema({ name, path }: { name: string; path: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://negasva.shop' },
      { '@type': 'ListItem', position: 2, name, item: `https://negasva.shop${path}` },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
