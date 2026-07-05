import SeoLanding, { landingMetadata } from '@/components/SeoLanding';
import { getLandingByPath } from '@/lib/content/landings';

const content = getLandingByPath('/custom-pet-portrait')!;
export const metadata = landingMetadata(content);
export default function Page() {
  return <SeoLanding content={content} />;
}
