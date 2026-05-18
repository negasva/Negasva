'use client';

import Link from 'next/link';

const STYLES = [
  {
    id: 'rick-morty',
    name: 'Rick & Morty',
    emoji: '🛸',
    desc: 'Estilo de ciencia ficción y aventuras interdimensionales. Personajes con proporciones exageradas, ojos grandes y colores vibrantes.',
    features: ['Personajes caricaturizados con proporciones únicas', 'Colores saturados y fondos de ciencia ficción', 'Expresiones exageradas y cómicas'],
    bgCount: { id: 'rick-morty' },
  },
  {
    id: 'gravity-falls',
    name: 'Gravity Falls',
    emoji: '🌲',
    desc: 'Estilo misterioso con toques sobrenaturales. Colores cálidos y atmosféricos con detalles únicos en personajes y entornos.',
    features: ['Diseño con toques de misterio y aventura', 'Paleta de colores cálidos y otoñales', 'Fondos de bosque, misterio y magia'],
    bgCount: { id: 'gravity-falls' },
  },
  {
    id: 'simpsons',
    name: 'The Simpsons',
    emoji: '🍩',
    desc: 'El estilo más icónico de la animación. Personajes amarillos con 4 dedos, ojos redondos y expresiones características.',
    features: ['Piel amarilla característica de Springfield', 'Ojos redondos y proporciones clásicas', 'Fondos del pueblo de Springfield'],
    bgCount: { id: 'simpsons' },
  },
  {
    id: 'fairly-odd',
    name: 'Padrinos Mágicos',
    emoji: '⭐',
    desc: 'Estilo mágico y colorido con personajes de formas redondeadas. Perfecto para retratos llenos de fantasía y color.',
    features: ['Formas redondeadas y colores brillantes', 'Estética mágica y fantasiosa', 'Fondos de Dimmsdale y mundo de las hadas'],
    bgCount: { id: 'fairly-odd' },
  },
  {
    id: 'negasva',
    name: 'Estilo NEGASVA',
    emoji: '🎨',
    desc: 'El estilo propio y exclusivo de NEGASVA. Una mezcla única de influencias que crea retratos personalizados inconfundibles.',
    features: ['Estilo propio y exclusivo', 'Personalización máxima', 'Toque artístico único'],
    bgCount: { id: 'negasva' },
  },
];

export default function EstilosAdminPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-black text-secondary mb-1">Estilos de dibujo</h1>
        <p className="text-sm text-secondary-lighter">Visión general de los estilos disponibles. Gestiona los fondos de cada estilo desde la sección de Fondos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {STYLES.map((style) => (
          <div key={style.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-light to-primary p-6 text-center">
              <div className="text-5xl mb-3">{style.emoji}</div>
              <h2 className="font-black text-white text-lg">{style.name}</h2>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1 gap-4">
              <p className="text-sm text-secondary-lighter leading-relaxed">{style.desc}</p>

              <div>
                <p className="text-xs font-bold text-secondary-lighter uppercase tracking-wide mb-2">Características</p>
                <ul className="space-y-1.5">
                  {style.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-secondary-lighter">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50 flex gap-2">
                <Link
                  href={`/admin/backgrounds?style=${style.id}`}
                  className="flex-1 text-center text-xs font-bold bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg transition-colors"
                >
                  🖼 Gestionar fondos
                </Link>
                <Link
                  href={`/estilos`}
                  target="_blank"
                  className="text-xs font-bold border border-gray-100 hover:border-primary-lighter text-secondary-lighter hover:text-secondary px-3 py-2 rounded-lg transition-colors"
                >
                  👁 Ver en web
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="mt-6 bg-primary-lighter rounded-xl p-4 border border-primary/20">
        <p className="text-sm text-secondary font-bold mb-1">💡 Cómo funciona</p>
        <p className="text-xs text-secondary-lighter leading-relaxed">
          Los estilos de dibujo están disponibles para los clientes en el studio. Cada estilo tiene sus propios fondos que puedes activar o desactivar.
          Para añadir o eliminar fondos de un estilo, ve a <strong>Fondos</strong> y selecciona el estilo correspondiente.
        </p>
      </div>
    </div>
  );
}
