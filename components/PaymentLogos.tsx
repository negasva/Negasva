type PaymentLogoName =
  | 'Visa'
  | 'Mastercard'
  | 'Amex'
  | 'PayPal'
  | 'Shop Pay'
  | 'Google Pay'
  | 'Mercado Pago'
  | 'PSE';

function MastercardMark() {
  return (
    <span className="relative inline-flex h-3.5 w-5 items-center">
      <span className="absolute left-0 h-3.5 w-3.5 rounded-full bg-[#eb001b]" />
      <span className="absolute right-0 h-3.5 w-3.5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
    </span>
  );
}

function GoogleMark() {
  return (
    <span className="font-black">
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#db4437]">o</span>
      <span className="text-[#f4b400]">o</span>
      <span className="text-[#4285f4]">g</span>
      <span className="text-[#0f9d58]">l</span>
      <span className="text-[#db4437]">e</span>
    </span>
  );
}

export function PaymentLogo({ name }: { name: PaymentLogoName | string }) {
  if (name === 'Mastercard') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <MastercardMark />
        <span className="text-[#231f20]">Mastercard</span>
      </span>
    );
  }
  if (name === 'Google Pay') {
    return (
      <span className="inline-flex items-center gap-1">
        <GoogleMark />
        <span className="text-[#3c4043]">Pay</span>
      </span>
    );
  }
  if (name === 'Visa') return <span className="text-[#1434cb]">VISA</span>;
  if (name === 'Amex') return <span className="rounded-sm bg-[#2e77bb] px-1 py-0.5 text-white">AMEX</span>;
  if (name === 'PayPal') return <span className="text-[#003087]"><span className="text-[#009cde]">Pay</span>Pal</span>;
  if (name === 'Shop Pay') return <span className="text-[#5a31f4]">Shop Pay</span>;
  if (name === 'Mercado Pago') return <span className="text-[#00a8e0]">Mercado Pago</span>;
  if (name === 'PSE') return <span className="text-[#f58220]">PSE</span>;
  return <span>{name}</span>;
}

export function PaymentLogoStrip({ methods }: { methods: Array<PaymentLogoName | string> }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {methods.map((method) => (
        <span
          key={method}
          className="inline-flex min-h-6 items-center rounded-md border border-primary-lighter bg-white px-2.5 py-1 text-[10px] font-black leading-none shadow-sm"
        >
          <PaymentLogo name={method} />
        </span>
      ))}
    </div>
  );
}
