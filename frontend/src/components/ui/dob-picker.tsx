import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DOBPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  error?: boolean;
}

export function DOBPicker({ value, onChange, disabled = false, error = false }: DOBPickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [month, setMonth] = useState(value ? value.getMonth() : new Date().getMonth());
  const [year, setYear] = useState(value ? value.getFullYear() : new Date().getFullYear());

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    onChange(date);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value) || year;
    if (newYear >= 1900 && newYear <= new Date().getFullYear()) {
      setYear(newYear);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(e.target.value));
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days = Array.from({ length: firstDay }, (_, i) => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const age = value ? calculateAge(value) : null;
  const displayText = value ? value.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Select date';

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 rounded-md border bg-white text-left text-sm flex items-center justify-between transition-colors',
          error ? 'border-destructive focus:ring-destructive' : 'border-input hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          error ? 'focus:ring-destructive' : 'focus:ring-primary'
        )}
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className={value ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            {displayText}
          </span>
        </span>
        {age !== null && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {age} yrs
          </span>
        )}
      </button>

      {showCalendar && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-input rounded-lg shadow-lg p-4 z-50 w-80">
          {/* Header with Month/Year Selection */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <select
                value={month}
                onChange={handleMonthChange}
                className="flex-1 px-2 py-1.5 border border-input rounded text-sm font-medium bg-white hover:bg-accent cursor-pointer"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={handleYearChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-24 px-2 py-1.5 border border-input rounded text-sm font-medium bg-white"
              />
            </div>

            {/* Quick Year Navigation */}
            <div className="flex items-center justify-between gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground text-center flex-1">
                {monthNames[month]} {year}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Days */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground h-6">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day, idx) => {
                const isSelected = value && day && value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
                const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();
                const isDisabled = day ? new Date(year, month, day) > new Date() : false;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => day && !isDisabled && handleDateClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      'h-8 text-sm rounded transition-colors flex items-center justify-center',
                      day === null && 'invisible',
                      isSelected && 'bg-primary text-primary-foreground font-bold',
                      isToday && !isSelected && 'border-2 border-primary font-semibold',
                      !isSelected && !isToday && day && 'hover:bg-accent text-foreground',
                      isDisabled && 'text-muted-foreground opacity-50 cursor-not-allowed'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          {value && (
            <div className="mt-4 pt-3 border-t border-input text-center">
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-semibold text-foreground">{value.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
              <p className="text-xs text-primary mt-1">Age: <span className="font-bold">{calculateAge(value)} years</span></p>
            </div>
          )}

          {/* Quick Select Age Options */}
          <div className="mt-4 pt-3 border-t border-input space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Quick select:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[18, 22, 25, 30].map(ageVal => {
                const birthDate = new Date();
                birthDate.setFullYear(birthDate.getFullYear() - ageVal);
                return (
                  <Button
                    key={ageVal}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onChange(birthDate);
                      setMonth(birthDate.getMonth());
                      setYear(birthDate.getFullYear());
                      setShowCalendar(false);
                    }}
                    className="text-xs"
                  >
                    Age {ageVal}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCalendar(false)}
            className="w-full mt-3"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
