'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import Logo from '@/components/Logo';

const STEPS = ['Estilo', 'Cuerpo', 'Fondo', 'Detalles', 'Fotos'];

const STYLES = [
  { id: 'rick-morty', name: 'Rick & Morty' },
  { id: 'gravity-falls', name: 'Gravity Falls' },
  { id: 'simpsons', name: 'Simpsons' },
  { id: 'fairly-odd', name: 'Los Padrinos Mágicos' },
  { id: 'negasva', name: 'Estilo NEGASVA' },
];

const BODY_TYPES = [
  { id: 'torso_only', name: 'Solo Torso', desc: 'Busto hasta la cintura', price: 15, original: 20 },
  { id: 'full_body', name: 'Cuerpo Completo', desc: 'Personaje de cuerpo entero', price: 25, original: null },
];

const BACKGROUNDS_BY_STYLE: Record<string, { id: string; name: string }[]> = {
  'rick-morty': [
    { id: 'rm-1', name: 'Garaje de Rick' },
    { id: 'rm-2', name: 'Árboles Mega' },
    { id: 'rm-3', name: 'Portal Dimensional' },
    { id: 'rm-4', name: 'La Ciudadela' },
    { id: 'rm-5', name: 'Sala de Estar' },
    { id: 'rm-6', name: 'Planeta Purga' },
    { id: 'rm-7', name: 'Anatomía Park' },
    { id: 'rm-8', name: 'Gazorpazorp' },
    { id: 'rm-9', name: 'Boda Espacial' },
    { id: 'rm-10', name: 'Show Me What You Got' },
    { id: 'none', name: 'Sin fondo' },
  ],
  'gravity-falls': [
    { id: 'gf-1', name: 'Cabaña Misterio' },
    { id: 'gf-2', name: 'Ático Dipper/Mabel' },
    { id: 'gf-3', name: 'Bosque Profundo' },
    { id: 'gf-4', name: 'Laboratorio Secreto' },
    { id: 'gf-5', name: 'Lago del Monstruo' },
    { id: 'gf-6', name: 'Centro del Pueblo' },
    { id: 'gf-7', name: 'Tienda Dusk 2 Dawn' },
    { id: 'gf-8', name: 'Raroarmagedón' },
    { id: 'gf-9', name: 'Cueva de Cristales' },
    { id: 'gf-10', name: 'Restaurante Linda' },
    { id: 'none', name: 'Sin fondo' },
  ],
  'simpsons': [
    { id: 'sp-1', name: 'Sofá Clásico' },
    { id: 'sp-2', name: 'Casa Simpsons' },
    { id: 'sp-3', name: 'Taberna de Moe' },
    { id: 'sp-4', name: 'Escuela Primaria' },
    { id: 'sp-5', name: 'Kwik-E-Mart' },
    { id: 'sp-6', name: 'Planta Nuclear' },
    { id: 'sp-7', name: 'Plaza Estatua' },
    { id: 'sp-8', name: 'Tienda de Cómics' },
    { id: 'sp-9', name: 'El Acantilado' },
    { id: 'sp-10', name: 'Cielo Intro' },
    { id: 'none', name: 'Sin fondo' },
  ],
  'fairly-odd': [
    { id: 'fo-1', name: 'Cuarto de Timmy' },
    { id: 'fo-2', name: 'Mundo Mágico' },
    { id: 'fo-3', name: 'Escuela Dimmsdale' },
    { id: 'fo-4', name: 'Parque Central' },
    { id: 'fo-5', name: 'Castillo Pecera' },
    { id: 'fo-6', name: 'Tribunal Mágico' },
    { id: 'fo-7', name: 'Castillo de Vicky' },
    { id: 'fo-8', name: 'Pista de Carreras' },
    { id: 'fo-9', name: 'Mansión Trixie' },
    { id: 'fo-10', name: 'Dimmadome' },
    { id: 'none', name: 'Sin fondo' },
  ],
  'negasva': [
    { id: 'none', name: 'Sin fondo' },
  ],
  'custom': [
    { id: 'none', name: 'Sin fondo' },
  ],
};

const ROLES = ['Yo', 'Pareja', 'Hijo/a', 'Padre/Madre', 'Amigo/a', 'Mascota', 'Otro'];

const getBodyImage = (style: string, bodyType: string) => {
  return '';
};

export default function StudioPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({
    style: '',
    bodyType: '',
    background: '',
    people: [{ name: '', role: 'Yo' }],
    specialRequests: '',
    photos: [] as File[],
  });

  const canAdvance = () => {
    if (step === 1) return !!selected.style;
    if (step === 2) return !!selected.bodyType && selected.people.every(p => p.name.trim().length >= 2);
    if (step === 3) return !!selected.background;
    if (step === 4) return true;
    if (step === 5) return selected.photos.length >= selected.people.length;
    return true;
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else router.push('/checkout');
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const totalPrice = () => {
    const perPerson = selected.bodyType === 'full_body' ? 25 : 15;
    const bgCost = selected.background && selected.background !== 'none' ? 15 : 0;
    return selected.people.length * perPerson + bgCost;
  };

  const addPerson = () => {
    if (selected.people.length < 4) {
      setSelected({ ...selected, people: [...selected.people, { name: '', role: 'Amigo/a' }] });
    }
  };

  const removePerson = (i: number) => {
    setSelected({ ...selected, people: selected.people.filter((_, idx) => idx !== i) });
  };

  const updatePerson = (i: number, field: string, value: string) => {
    const people = [...selected.people];
    people[i] = { ...people[i], [field]: value };
    setSelected({ ...selected, people });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelected({ ...selected, photos: files });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-primary-lighter sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Logo href="/" size="md" />
          {selected.bodyType && (
            <span className="text-sm font-bold text-white bg-primary px-4 py-2 rounded-full">
              Total: ${totalPrice()}
            </span>
          )}
        </div>
      </nav>

      {/* Progress */}
      <div className="bg-white border-b-2 border-primary-lighter">
        <div className="mx-auto max-w-5xl px-4 py-6 flex justify-center">
          <div className="flex items-center gap-4">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => i + 1 <= step && setStep(i + 1)}
                  disabled={i + 1 > step}
                  className="flex flex-col items-center focus:outline-none disabled:cursor-not-allowed group"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    i + 1 < step ? 'bg-primary text-white group-hover:bg-primary-dark cursor-pointer' :
                    i + 1 === step ? 'bg-primary text-white ring-4 ring-primary-lighter' :
                    'bg-primary-lighter text-secondary'
                  }`}>
                    {i + 1 < step ? '•' : i + 1}
                  </div>
                  <span className={`mt-2 text-xs hidden sm:block font-bold ${i + 1 === step ? 'text-primary' : 'text-secondary-lighter'}`}>
                    {label}
                  </span>
                </button>
                {i < 4 && (
                  <div className={`w-12 h-1 mx-2 ${i + 1 < step ? 'bg-primary' : 'bg-primary-lighter'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-12">

        {/* PASO 1: Estilo */}
        {step === 1 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">Elige tu Estilo</h1>
              <p className="text-lg text-secondary-lighter">En qué universo de caricatura quieres verte</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected({ ...selected, style: s.id, background: '' })}
                  className={`rounded-2xl border-2 p-8 text-center transition-all focus:outline-none ${
                    selected.style === s.id
                      ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-lg'
                      : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
                  }`}
                >
                  {selected.style === s.id && (
                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">•</span>
                  )}
                  <p className="font-bold text-secondary">{s.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Cuerpo + Personas */}
        {step === 2 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">Tipo de Cuerpo</h1>
              <p className="text-lg text-secondary-lighter">Cómo quieres que aparezca tu personaje</p>
            </div>

            {/* Body Type selector */}
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              {BODY_TYPES.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setSelected({ ...selected, bodyType: b.id })}
                  className={`rounded-2xl border-2 p-10 text-center transition-all focus:outline-none relative overflow-visible ${
                    selected.bodyType === b.id
                      ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-xl'
                      : 'border-primary-lighter bg-white hover:border-primary hover:shadow-lg'
                  } ${idx === 0 ? 'animate-pulse-scale' : ''}`}
                >
                  {b.original && (
                    <div className="inline-flex items-center gap-1.5 bg-secondary text-white px-3 py-1.5 rounded-full text-xs font-black mb-3 shadow">
                      Antes <span className="line-through text-gray-400">${b.original}</span> ahora <span className="text-primary-lighter font-black">${b.price}</span>
                    </div>
                  )}
                  {selected.bodyType === b.id && (
                    <span className="block text-primary font-bold text-xs mb-2">SELECCIONADO</span>
                  )}
                  <p className="font-black text-2xl text-secondary mb-3 tracking-tighter">{b.name}</p>
                  <p className="text-secondary-lighter mb-6">{b.desc}</p>
                  <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-4 font-black text-3xl">
                    ${b.price}/persona
                  </div>
                </button>
              ))}
            </div>

            {/* Personas section */}
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-black text-2xl text-secondary tracking-tighter">Cantidad de Personas/Mascotas</h2>
                  <p className="text-secondary-lighter text-sm mt-1">Añade hasta 4 personas al retrato</p>
                </div>
                {/* Contador rápido */}
                <div className="flex items-center gap-3 bg-primary-lighter rounded-2xl px-4 py-2">
                  <button
                    onClick={() => selected.people.length > 1 && removePerson(selected.people.length - 1)}
                    disabled={selected.people.length <= 1}
                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black text-xl text-secondary w-6 text-center">{selected.people.length}</span>
                  <button
                    onClick={addPerson}
                    disabled={selected.people.length >= 4}
                    className="w-8 h-8 rounded-full bg-primary text-white shadow flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 disabled:bg-primary-lighter disabled:text-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selected.people.map((person, i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-primary-lighter p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-black flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-2">Nombre</label>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePerson(i, 'name', e.target.value)}
                          placeholder="Ej: María"
                          className="w-full rounded-lg border-2 border-primary-lighter px-4 py-2.5 text-sm text-secondary focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-2">Relación</label>
                        <select
                          value={person.role}
                          onChange={(e) => updatePerson(i, 'role', e.target.value)}
                          className="w-full rounded-lg border-2 border-primary-lighter px-4 py-2.5 text-sm text-secondary focus:border-primary focus:outline-none"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    {i > 0 && (
                      <button
                        onClick={() => removePerson(i)}
                        className="text-secondary-lighter hover:text-primary transition-colors flex-shrink-0 font-bold text-xl"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Precio dinámico */}
              {selected.bodyType && (
                <div className="mt-6 bg-primary-lighter rounded-2xl p-5 border-2 border-primary">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">
                      {selected.people.length} persona{selected.people.length > 1 ? 's' : ''} x ${selected.bodyType === 'full_body' ? 25 : 15}
                    </span>
                    <span className="font-black text-xl text-primary">${selected.people.length * (selected.bodyType === 'full_body' ? 25 : 15)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 3: Fondo */}
        {step === 3 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">Elige el Fondo</h1>
              <p className="text-lg text-secondary-lighter">Selecciona el escenario para tu retrato</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(BACKGROUNDS_BY_STYLE[selected.style] ?? []).map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelected({ ...selected, background: bg.id })}
                  className={`rounded-2xl border-2 p-5 text-center transition-all focus:outline-none ${
                    selected.background === bg.id
                      ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-lg'
                      : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
                  }`}
                >
                  {selected.background === bg.id && (
                    <span className="block text-primary text-xs font-bold mb-1">•</span>
                  )}
                  <p className="text-sm font-bold text-secondary">{bg.name}</p>
                  {bg.id !== 'none' && <p className="text-xs text-primary mt-1 font-bold">+$15</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4: Detalles */}
        {step === 4 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">Detalles Finales</h1>
              <p className="text-lg text-secondary-lighter">Agrega notas especiales para tu retrato</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <label className="block font-bold text-secondary mb-3">
                Notas especiales <span className="font-normal text-secondary-lighter">(opcional)</span>
              </label>
              <textarea
                value={selected.specialRequests}
                onChange={(e) => setSelected({ ...selected, specialRequests: e.target.value })}
                placeholder="Ej: Quiero que lleve sombrero, cambiar color de cabello a rubio, incluir mascota, accesorios especiales..."
                rows={6}
                maxLength={500}
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none resize-none"
              />
              <p className="text-right text-xs text-secondary-lighter mt-2">{selected.specialRequests.length}/500</p>
            </div>
          </div>
        )}

        {/* PASO 5: Fotos */}
        {step === 5 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">Sube tus Fotos</h1>
              <p className="text-lg text-secondary-lighter">Necesitamos fotos claras de cada persona para crear el retrato</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl border-2 border-dashed border-primary-lighter bg-white p-12 text-center hover:border-primary hover:bg-primary-lighter transition-all cursor-pointer">
                <p className="font-bold text-secondary mb-2">Arrastra tus fotos aquí</p>
                <p className="text-secondary-lighter mb-6">o haz clic para seleccionar</p>
                <label className="inline-block cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                  Seleccionar fotos
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {selected.photos.length > 0 && (
                  <div className="mt-6 text-sm text-primary font-bold">
                    {selected.photos.length} foto{selected.photos.length > 1 ? 's' : ''} seleccionada{selected.photos.length > 1 ? 's' : ''}
                  </div>
                )}
                <p className="mt-6 text-xs text-secondary-lighter">
                  JPG, PNG o WEBP · Máx 5MB por foto · {selected.people.length} foto{selected.people.length > 1 ? 's' : ''} requerida{selected.people.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Resumen del pedido */}
              <div className="mt-8 rounded-2xl bg-primary-lighter border-2 border-primary p-8">
                <p className="font-black text-secondary mb-5 text-lg tracking-tighter">Resumen de tu pedido</p>
                <div className="space-y-3 text-secondary">
                  <div className="flex justify-between">
                    <span className="text-secondary-lighter">Estilo:</span>
                    <span className="font-bold">{STYLES.find(s => s.id === selected.style)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-lighter">Tipo:</span>
                    <span className="font-bold">{selected.bodyType === 'full_body' ? 'Cuerpo completo' : 'Solo torso'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-lighter">Personas:</span>
                    <span className="font-bold">{selected.people.map(p => p.name).join(', ')}</span>
                  </div>
                  {selected.background && selected.background !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-secondary-lighter">Fondo:</span>
                      <span className="font-bold">{(BACKGROUNDS_BY_STYLE[selected.style] ?? []).find(bg => bg.id === selected.background)?.name} (+$15)</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-primary pt-4 mt-4 font-black text-xl">
                    <span>Total:</span>
                    <span className="text-primary">${totalPrice()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between items-center mt-14">
          <button
            onClick={prevStep}
            className="text-secondary-lighter hover:text-primary text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary-lighter transition-colors"
          >
            {step === 1 ? <Link href="/">Volver al inicio</Link> : 'Anterior'}
          </button>
          <button
            onClick={nextStep}
            disabled={!canAdvance()}
            className={`rounded-lg px-10 py-3 font-bold text-white transition-all ${
              canAdvance()
                ? 'bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl'
                : 'bg-secondary-lighter text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 5 ? 'Ir al pago' : 'Siguiente'}
          </button>
        </div>

        <p className="text-center text-xs text-secondary-lighter mt-8">
          Pago seguro con Stripe · Tu información está protegida
        </p>
      </main>
    </div>
  );
}
