import { useMemo, useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2, Clock, ListTodo, Loader2 } from 'lucide-react'

import { useTasks } from '../hooks/useTasks'
import { useProfile } from '../hooks/useProfile'
import { useLanguage } from '../context/LanguageContext'
import { TaskModal } from './TaskModal'
import { TaskCard } from './TaskCard'

// Simple helper to play a satisfying sound
const playSuccessSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Nice double chime
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio not supported or blocked");
    }
}

// Column Component
const Column = ({ id, title, tasks, icon: Icon, onDeleteTask }) => {
    const { t } = useLanguage()
    const { setNodeRef } = useSortable({ id })

    return (
        <div className="flex flex-col bg-forge-900 border border-forge-700/50 rounded-2xl p-4 h-full min-h-[500px] shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-3">
                <div className="p-2 bg-forge-800 rounded-lg text-white">
                    <Icon size={18} />
                </div>
                <h3 className="font-bold text-base tracking-wide text-gray-100 flex-grow">
                    {title}
                </h3>
                <span className="bg-forge-800 text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    {tasks.length}
                </span>
            </div>

            <div ref={setNodeRef} className="flex-grow flex flex-col gap-0 relative">
                <SortableContext items={tasks.map(t => t.id)} strategy={rectSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 bg-forge-800/20 rounded-xl border border-dashed border-forge-700/50">
                        <Icon size={32} className="opacity-20" />
                        <span className="font-medium text-sm">{t('noObjectives')}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export const KanbanBoard = () => {
    const { t } = useLanguage()
    const { tasks, loading, addTask, updateTaskStatus, deleteTask } = useTasks()
    const { addXP } = useProfile()

    const [activeTask, setActiveTask] = useState(null)
    const [localTasks, setLocalTasks] = useState(tasks)

    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const columns = [
        { id: 'todo', title: t('backlog'), icon: ListTodo },
        { id: 'in_progress', title: t('inProgress'), icon: Clock },
        { id: 'done', title: t('done'), icon: CheckCircle2 }
    ]

    const tasksByCol = useMemo(() => {
        return columns.reduce((acc, col) => {
            acc[col.id] = localTasks.filter(t => t.status === col.id)
            return acc
        }, {})
    }, [localTasks, columns])

    const handleDragStart = (event) => {
        const { active } = event
        const task = localTasks.find(t => t.id === active.id)
        setActiveTask(task)
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event
        if (!over) {
            setActiveTask(null)
            return
        }

        const taskId = active.id
        const targetStatus = over.id

        const overTask = localTasks.find(t => t.id === over.id)
        const finalTargetStatus = overTask ? overTask.status : (columns.find(c => c.id === targetStatus) ? targetStatus : null)

        const originalTask = localTasks.find(t => t.id === taskId)

        if (finalTargetStatus && originalTask.status !== finalTargetStatus) {
            // Optimistic update
            setLocalTasks(prev =>
                prev.map(t => t.id === taskId ? { ...t, status: finalTargetStatus } : t)
            )

            // DB Sync
            await updateTaskStatus(taskId, finalTargetStatus)

            // XP & Sound Logic
            if (finalTargetStatus === 'done' && originalTask.status !== 'done') {
                const reward = originalTask.xp_reward || 10
                await addXP(reward)
                playSuccessSound() // Ding!
            }
        }

        setActiveTask(null)
    }

    if (loading && tasks.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-forge-accent gap-4">
                <Loader2 className="animate-spin w-10 h-10" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
            {/* 1. Rich Task Creation Modal Launcher */}
            <TaskModal onAddTask={addTask} />

            {/* 2. Drag and Drop Layout */}
            <div className="flex-grow min-h-0">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-8">
                        {columns.map(col => (
                            <Column
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                tasks={tasksByCol[col.id]}
                                icon={col.icon}
                                onDeleteTask={deleteTask}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <div className="opacity-95 transform rotate-3 scale-105">
                                <TaskCard task={activeTask} onDelete={() => { }} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
}
