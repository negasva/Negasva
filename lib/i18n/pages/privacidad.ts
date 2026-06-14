import type { PageDict } from '@/lib/i18n/pageContent';

export const privacidadContent = {
  es: {
    badge: 'Legal',
    title: 'Política de Privacidad',
    updated: 'Última actualización: junio 2026',
    s1_title: '1. Introducción',
    s1_body:
      'En NEGASVA respetamos tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos cuando utilizas nuestro servicio de retratos animados.',
    s2_title: '2. Información que Recopilamos',
    s2_intro: 'Recopilamos únicamente la información necesaria para crear tu retrato:',
    s2_item1: 'Nombre y correo electrónico',
    s2_item2: 'Información de pago (procesada por Stripe — nunca almacenamos datos de tarjeta)',
    s2_item3: 'Fotos de las personas a retratar',
    s2_item4: 'Preferencias de estilo, fondo e indicaciones',
    s3_title: '3. Cómo Usamos tu Información',
    s3_body:
      'Usamos tus datos exclusivamente para procesar y entregar tu pedido, enviarte actualizaciones de estado y mejorar nuestros servicios.',
    s3_strong: 'Nunca vendemos ni compartimos tu información con terceros para fines publicitarios.',
    s4_title: '4. Almacenamiento y Seguridad',
    s4_body:
      'Tus datos se almacenan en servidores seguros mediante Supabase (PostgreSQL cifrado). Las fotos se conservan solo durante el tiempo necesario para crear el retrato y son eliminadas automáticamente a los 30 días de la entrega.',
    s5_title: '5. Tus Derechos',
    s5_body:
      'Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Para ejercer estos derechos escríbenos a',
    s6_title: '6. Cambios a esta Política',
    s6_body:
      'Nos reservamos el derecho de actualizar esta política. Los cambios significativos serán notificados por correo electrónico a clientes registrados.',
    s7_title: '7. Contacto',
    s7_body: '¿Preguntas sobre privacidad? Escríbenos a',
  },
  en: {
    badge: 'Legal',
    title: 'Privacy Policy',
    updated: 'Last updated: June 2026',
    s1_title: '1. Introduction',
    s1_body:
      'At NEGASVA we respect your privacy. This policy explains what data we collect, how we use it, and what rights you have over it when you use our animated portrait service.',
    s2_title: '2. Information We Collect',
    s2_intro: 'We only collect the information needed to create your portrait:',
    s2_item1: 'Name and email address',
    s2_item2: 'Payment information (processed by Stripe — we never store card data)',
    s2_item3: 'Photos of the people to be portrayed',
    s2_item4: 'Style, background, and instruction preferences',
    s3_title: '3. How We Use Your Information',
    s3_body:
      'We use your data exclusively to process and deliver your order, send you status updates, and improve our services.',
    s3_strong: 'We never sell or share your information with third parties for advertising purposes.',
    s4_title: '4. Storage and Security',
    s4_body:
      'Your data is stored on secure servers via Supabase (encrypted PostgreSQL). Photos are kept only for as long as needed to create the portrait and are automatically deleted 30 days after delivery.',
    s5_title: '5. Your Rights',
    s5_body:
      'You have the right to access, correct, or delete your personal information at any time. To exercise these rights, write to us at',
    s6_title: '6. Changes to This Policy',
    s6_body:
      'We reserve the right to update this policy. Significant changes will be notified by email to registered customers.',
    s7_title: '7. Contact',
    s7_body: 'Questions about privacy? Write to us at',
  },
  fr: {
    badge: 'Légal',
    title: 'Politique de Confidentialité',
    updated: 'Dernière mise à jour : juin 2026',
    s1_title: '1. Introduction',
    s1_body:
      'Chez NEGASVA, nous respectons votre vie privée. Cette politique explique quelles données nous collectons, comment nous les utilisons et quels droits vous avez sur celles-ci lorsque vous utilisez notre service de portraits animés.',
    s2_title: '2. Informations que Nous Collectons',
    s2_intro: 'Nous ne collectons que les informations nécessaires à la création de votre portrait :',
    s2_item1: 'Nom et adresse e-mail',
    s2_item2: 'Informations de paiement (traitées par Stripe — nous ne stockons jamais les données de carte)',
    s2_item3: 'Photos des personnes à représenter',
    s2_item4: 'Préférences de style, d’arrière-plan et instructions',
    s3_title: '3. Comment Nous Utilisons vos Informations',
    s3_body:
      'Nous utilisons vos données exclusivement pour traiter et livrer votre commande, vous envoyer des mises à jour de statut et améliorer nos services.',
    s3_strong: 'Nous ne vendons ni ne partageons jamais vos informations avec des tiers à des fins publicitaires.',
    s4_title: '4. Stockage et Sécurité',
    s4_body:
      'Vos données sont stockées sur des serveurs sécurisés via Supabase (PostgreSQL chiffré). Les photos ne sont conservées que le temps nécessaire à la création du portrait et sont automatiquement supprimées 30 jours après la livraison.',
    s5_title: '5. Vos Droits',
    s5_body:
      'Vous avez le droit d’accéder à vos informations personnelles, de les corriger ou de les supprimer à tout moment. Pour exercer ces droits, écrivez-nous à',
    s6_title: '6. Modifications de cette Politique',
    s6_body:
      'Nous nous réservons le droit de mettre à jour cette politique. Les modifications importantes seront notifiées par e-mail aux clients enregistrés.',
    s7_title: '7. Contact',
    s7_body: 'Des questions sur la confidentialité ? Écrivez-nous à',
  },
} satisfies PageDict<Record<string, string>>;
