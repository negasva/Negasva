'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Ajusta automáticamente el tamaño del texto para que quepa SIEMPRE dentro de
 * su contenedor (útil en botones con precios/etiquetas de longitud variable
 * según moneda o idioma). Si el texto desborda, encoge la tipografía hasta que
 * toque el borde; nunca sobresale por los lados. Es responsive: reacciona a los
 * cambios de ancho vía ResizeObserver.
 *
 * Uso: <button><FitText>{texto}</FitText></button>
 */
export default function FitText({
  children,
  className,
  min = 0.55,
}: {
  children: React.ReactNode;
  className?: string;
  /** Escala mínima (fracción del tamaño base) antes de dejar de encoger. */
  min?: number;
}) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);

  const fit = useCallback(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const avail = o.clientWidth;
    if (avail === 0) return;
    // Ancho natural = ancho medido dividido por la escala actual (deshace el
    // escalado ya aplicado para no realimentar el cálculo).
    const natural = i.scrollWidth / scaleRef.current;
    if (natural === 0) return;
    const next = natural > avail ? Math.max(min, avail / natural) : 1;
    if (Math.abs(next - scaleRef.current) > 0.005) {
      scaleRef.current = next;
      setScale(next);
    }
  }, [min]);

  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (outer.current) ro.observe(outer.current);
    return () => ro.disconnect();
  }, [fit, children]);

  return (
    <span ref={outer} className={`block w-full overflow-hidden text-center ${className ?? ''}`}>
      <span
        ref={inner}
        className="inline-block whitespace-nowrap align-middle"
        style={{ fontSize: `${scale}em`, transition: 'font-size 80ms linear' }}
      >
        {children}
      </span>
    </span>
  );
}
