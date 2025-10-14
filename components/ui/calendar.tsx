"use client"

import * as React from "react"

type CalendarProps = {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
}

export default function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState<Date>(() => {
    return selected ? new Date(selected) : startOfDay(new Date())
  })

  React.useEffect(() => {
    if (selected) {
      setViewDate(startOfDay(selected))
    }
  }, [selected])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const days = getMonthGrid(year, month)

  function selectDay(day: Date) {
    onSelect?.(day)
  }

  function prevMonth() {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() - 1)
    setViewDate(d)
  }

  function nextMonth() {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() + 1)
    setViewDate(d)
  }

  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(viewDate)
  const weekdayLabels = getWeekdayLabels()

  return (
    <div className={["w-[280px]", className].filter(Boolean).join(" ")}> 
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prevMonth} className="px-2 py-1 text-sm rounded hover:bg-gray-100">
          ‹
        </button>
        <div className="text-sm font-medium">{monthLabel}</div>
        <button type="button" onClick={nextMonth} className="px-2 py-1 text-sm rounded hover:bg-gray-100">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {weekdayLabels.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => {
          const isCurrentMonth = d.getMonth() === month
          const isSelected = selected && isSameDay(d, selected)
          return (
            <button
              type="button"
              key={idx}
              onClick={() => selectDay(d)}
              className={[
                "h-8 w-8 rounded text-sm flex items-center justify-center",
                isSelected ? "bg-black text-white" : isCurrentMonth ? "text-foreground hover:bg-gray-100" : "text-gray-300",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b?: Date | null): boolean {
  if (!b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getWeekdayLabels(): string[] {
  const base = new Date(2020, 5, 7) // Sunday
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short" })
  return Array.from({ length: 7 }).map((_, i) => fmt.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)))
}

function getMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay() // 0-6 Sun-Sat
  const days: Date[] = []

  // start from previous month's last days to fill grid
  const startDate = new Date(year, month, 1 - startWeekday)
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    days.push(startOfDay(d))
  }
  return days
} 