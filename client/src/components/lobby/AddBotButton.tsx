import socket from '../../socket';

interface Props {
  disabled: boolean;
}

export default function AddBotButton({ disabled }: Props) {
  return (
    <button
      onClick={() => socket.emit('room:add-bot')}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
        transition-all
        ${disabled
          ? 'bg-white/5 text-white/30 cursor-not-allowed'
          : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'}
      `}
    >
      <span>🤖</span>
      <span>Добавить бота</span>
    </button>
  );
}
