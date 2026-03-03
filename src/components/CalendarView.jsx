import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'

export const CalendarView = ({ tasks, onOpenNewTask, onEditTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date())

    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }

    const getDaysArray = useMemo(() => {
        const days = []
        // Empty cells for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null)
        }
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(currentYear, currentMonth, i))
        }
        return days
    }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth])

    // Normalize task dates to match calendar days without timezones breaking the match
    const getTasksForDay = (day) => {
        if (!day) return []
        return tasks.filter(task => {
            if (!task.due_date) return false
            const dueDate = new Date(task.due_date)
            return dueDate.getFullYear() === day.getFullYear() &&
                dueDate.getMonth() === day.getMonth() &&
                dueDate.getDate() === day.getDate()
        })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const handleDayClick = (day) => {
        if (!day) return
        // Format to YYYY-MM-DD for the input[type="date"]
        const tzoffset = day.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(day - tzoffset)).toISOString().split('T')[0];
        onOpenNewTask({ due_date: localISOTime })
    }

    return (
        <div className="bg-[var(--color-forge-800)] border border-[var(--color-forge-700)] rounded-2xl shadow-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-forge-900 rounded-xl text-forge-accent shrink-0">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">Timeline</h2>
                        <p className="text-xs text-gray-400 font-medium">Task Deadlines</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-forge-700)] rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-lg font-bold min-w-[140px] text-center">
                        {monthNames[currentMonth]} {currentYear}
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-forge-700)] rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {getDaysArray.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="min-h-[100px] bg-[var(--color-forge-900)]/30 rounded-lg"></div>
                    }

                    const isToday = day.getTime() === today.getTime()
                    const dayTasks = getTasksForDay(day)

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[120px] p-2 rounded-lg border flex flex-col group transition-colors ${isToday ? 'bg-[var(--color-forge-accent)]/10 border-[var(--color-forge-accent)]/50' : 'bg-[var(--color-forge-900)] border-[var(--color-forge-700)] hover:border-gray-500'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--color-forge-accent)] text-white' : 'text-gray-400'}`}>
                                    {day.getDate()}
                                </span>
                                <button
                                    onClick={() => handleDayClick(day)}
                                    className="p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-forge-800 transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-grow">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onEditTask(task)}
                                        className={`text-[10px] font-bold truncate px-1.5 py-1 rounded cursor-pointer hover:scale-[1.02] transition-transform ${task.status === 'done' ? 'bg-green-500/20 text-green-300 line-through' : 'bg-[var(--color-forge-800)] border border-forge-700 text-gray-300'}`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
