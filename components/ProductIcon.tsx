import {
  Coffee,
  Shirt,
  Sofa,
  Frame,
  ShoppingBag,
  Smartphone,
  Package,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

// Icono (línea) que representa cada producto físico (POD). Sustituye a los
// emojis: la marca nunca usa emojis en la interfaz.
const PRODUCT_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  mug: Coffee,
  tshirt: Shirt,
  pillow: Sofa,
  canvas: Frame,
  tote: ShoppingBag,
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
