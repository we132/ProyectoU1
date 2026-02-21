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
import { DatabaseZap, FileText, Loader2, PlayCircle } from 'lucide-react'

import { useTasks } from '../hooks/useTasks'
import { useProfile } from '../hooks/useProfile'
import { TaskTerminal } from './TaskTerminal'
import { TaskCard } from './TaskCard'

// Column Component
const Column = ({ id, title, tasks, icon: Icon, onDeleteTask }) => {
    const { setNodeRef } = useSortable({ id })

    return (
        <div className="flex flex-col bg-forge-800/40 border border-forge-800 rounded-lg p-4 h-full min-h-[500px]">
            <div className="flex items-center gap-2 mb-4 border-b border-forge-800 pb-3">
                <Icon size={18} className="text-forge-accent opacity-80" />
                <h3 className="font-mono font-bold tracking-widest text-sm text-gray-300 uppercase">
                    {title} <span className="text-gray-600 ml-1">[{tasks.length}]</span>
                </h3>
            </div>

            <div ref={setNodeRef} className="flex-grow flex flex-col gap-2 relative">
                <SortableContext items={tasks.map(t => t.id)} strategy={rectSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-xs border border-dashed border-forge-800 rounded">
                        NO OBJECTIVES
                    </div>
                )}
            </div>
        </div>
    )
}

export const KanbanBoard = () => {
    const { tasks, loading, addTask, updateTaskStatus, deleteTask } = useTasks()
    const { addXP } = useProfile()

    // Local state for optimistic UI updates during drag
    const [activeTask, setActiveTask] = useState(null)
    const [localTasks, setLocalTasks] = useState(tasks)

    // Sync local tasks when DB tasks change (except during drag)
    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const columns = [
        { id: 'todo', title: 'BACKLOG', icon: FileText },
        { id: 'in_progress', title: 'IN PROGRESS', icon: PlayCircle },
        { id: 'done', title: 'TERMINATED', icon: DatabaseZap }
    ]

    // Filter tasks per column
    const tasksByCol = useMemo(() => {
        return columns.reduce((acc, col) => {
            acc[col.id] = localTasks.filter(t => t.status === col.id)
            return acc
        }, {})
    }, [localTasks])

    // DND Handlers
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
        const targetStatus = over.id // This handles dropping on the column container

        // If dropped on another task, get that task's status
        const overTask = localTasks.find(t => t.id === over.id)
        const finalTargetStatus = overTask ? overTask.status : (columns.find(c => c.id === targetStatus) ? targetStatus : null)

        // Find original task
        const originalTask = localTasks.find(t => t.id === taskId)

        if (finalTargetStatus && originalTask.status !== finalTargetStatus) {
            // Optimistic update
            setLocalTasks(prev =>
                prev.map(t => t.id === taskId ? { ...t, status: finalTargetStatus } : t)
            )

            // Actual DB Sync
            await updateTaskStatus(taskId, finalTargetStatus)

            // XP Rewards logic strictly ON COMPLETION (moved to 'done')
            if (finalTargetStatus === 'done' && originalTask.status !== 'done') {
                const reward = originalTask.xp_reward || 10
                await addXP(reward)
            }
        }

        setActiveTask(null)
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-forge-accent font-mono animate-pulse gap-3">
                <Loader2 className="animate-spin w-8 h-8" />
                <span>QUERYING_DATABASE...</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto w-full">
            {/* 1. Terminal Input Area */}
            <TaskTerminal onAddTask={addTask} />

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
                            <div className="opacity-90 transform rotate-2">
                                <TaskCard task={activeTask} onDelete={() => { }} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
}
