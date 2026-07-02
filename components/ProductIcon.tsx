import {
  Coffee,
  Shirt,
  Frame,
  Smartphone,
  Package,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

const PRODUCT_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  mug: Coffee,
  tshirt: Shirt,
  hoodie: Shirt,
  canvas: Frame,
  poster: Frame,
  phonecase: Smartphone,
};

export default function ProductIcon({
  productKey,
  className,
}: {
  productKey: string;
  className?: string;
}) {
  const Icon = PRODUCT_ICONS[productKey] ?? Package;
  return <Icon className={className} aria-hidden="true" />;
}
