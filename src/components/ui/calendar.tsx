import * as React from 'react';
import { format, parse, isValid } from 'date-fns';

interface CalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect }) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = parse(event.target.value, 'yyyy-MM-dd', new Date());
    if (isValid(date)) {
      onSelect(date);
    }
  };

  return (
    <div>
      <div className="calendar-header">
        <h2>カレンダー</h2>
      </div>
      <input
        type="date"
        value={selected ? format(selected, 'yyyy-MM-dd') : ''}
        onChange={handleDateChange}
        className="border rounded p-2 w-full text-center bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
};
