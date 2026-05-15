import { Minus, Plus } from 'lucide-react';

interface CounterRowProps {
  label: string;
  sublabel?: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

function CounterRow({ label, sublabel, value, onIncrement, onDecrement, min = 0, max = 16 }: CounterRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

interface GuestCounterProps {
  adults: number;
  children: number;
  infants: number;
  onAdultsChange: (n: number) => void;
  onChildrenChange: (n: number) => void;
  onInfantsChange: (n: number) => void;
}

export function GuestCounter({
  adults,
  children,
  infants,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
}: GuestCounterProps) {
  return (
    <div className="divide-y divide-gray-100">
      <CounterRow
        label="Adults"
        sublabel="Ages 13 or above"
        value={adults}
        min={1}
        onIncrement={() => onAdultsChange(adults + 1)}
        onDecrement={() => onAdultsChange(adults - 1)}
      />
      <CounterRow
        label="Children"
        sublabel="Ages 2–12"
        value={children}
        onIncrement={() => onChildrenChange(children + 1)}
        onDecrement={() => onChildrenChange(children - 1)}
      />
      <CounterRow
        label="Infants"
        sublabel="Under 2"
        value={infants}
        max={5}
        onIncrement={() => onInfantsChange(infants + 1)}
        onDecrement={() => onInfantsChange(infants - 1)}
      />
    </div>
  );
}
