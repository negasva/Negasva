import { redirect } from 'next/navigation';

// El seguimiento se centralizó en /seguimiento. /track queda como redirección
// permanente para no romper enlaces antiguos (preserva ?ref=).
export default function TrackPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams?.ref;
  redirect(ref ? `/seguimiento?ref=${encodeURIComponent(ref)}` : '/seguimiento');
}
