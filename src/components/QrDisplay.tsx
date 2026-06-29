"use client";

import QRCode from "react-qr-code";

export function QrDisplay({ value, size = 180 }: { value: string; size?: number }) {
  return (
    <div className="mx-auto w-fit rounded-2xl bg-white p-4">
      <QRCode value={value} size={size} />
      <p className="mt-3 text-center font-mono text-xs text-abico-navy">{value}</p>
    </div>
  );
}
