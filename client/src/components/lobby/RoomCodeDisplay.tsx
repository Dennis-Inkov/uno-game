import { useState } from 'react';

interface Props {
  code: string;
}

export default function RoomCodeDisplay({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-white/60 text-sm">Код комнаты</div>
      <div className="flex items-center gap-3">
        <span className="font-mono font-black text-4xl text-white tracking-widest">{code}</span>
        <button
          onClick={copy}
          className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded-lg transition-all"
        >
          {copied ? '✓ Скопировано' : 'Копировать'}
        </button>
      </div>
      <div className="text-white/40 text-xs">Поделитесь кодом с друзьями</div>
    </div>
  );
}
