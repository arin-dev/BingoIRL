type BingoEntry = { text: string; tick: boolean };

type BingoGridProps = {
  entries: BingoEntry[][];
  gameSize: number;
  readOnly?: boolean;
  serverEntries?: BingoEntry[][];
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
};

export default function BingoGrid({
  entries,
  gameSize,
  readOnly = false,
  serverEntries,
  onCellClick,
  disabled = false,
}: BingoGridProps) {
  return (
    <div
      className="grid border-2 border-black w-fit"
      style={{ gridTemplateColumns: `repeat(${gameSize}, 1fr)` }}
    >
      {entries.map((row, r) =>
        row.map((cell, c) => {
          const isPending =
            !readOnly && serverEntries
              ? serverEntries[r]?.[c]?.tick !== cell.tick
              : false;

          const colorClass =
            cell.tick && !isPending
              ? 'bg-green-500 text-white line-through'
              : isPending
              ? 'bg-amber-400 text-white'
              : 'bg-yellow-100 text-gray-800';

          if (readOnly) {
            return (
              <div
                key={`${r}-${c}`}
                className={`w-20 h-20 border border-black p-2 text-xs text-center flex items-center justify-center leading-tight ${colorClass}`}
              >
                {cell.text}
              </div>
            );
          }

          return (
            <button
              key={`${r}-${c}`}
              onClick={() => onCellClick?.(r, c)}
              disabled={disabled}
              className={`w-24 h-24 border border-black p-2 text-xs text-center flex items-center justify-center transition-colors leading-tight relative
                ${colorClass}
                ${!cell.tick && !isPending ? 'hover:bg-yellow-200' : ''}
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {cell.text}
              {isPending && (
                <span className="absolute top-1 right-1 text-[8px] font-bold opacity-70">●</span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
