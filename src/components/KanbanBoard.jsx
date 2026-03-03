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
import { CheckCircle2, Clock, ListTodo, Loader2, Plus, X, Layout, Calendar as CalendarIcon } from 'lucide-react'

import { useTasks } from '../hooks/useTasks'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useProfile } from '../hooks/useProfile'
import { useLanguage } from '../context/LanguageContext'
import { TaskModal } from './TaskModal'
import { TaskCard } from './TaskCard'
import { LootboxModal } from './LootboxModal'
import { CalendarView } from './CalendarView'

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
const Column = ({ id, title, tasks, icon: Icon, onDeleteTask, onEditTask }) => {
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
                        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
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

    // Workspace State
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(null)
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
    const [newWorkspaceName, setNewWorkspaceName] = useState('')
    const [viewMode, setViewMode] = useState('board') // 'board' | 'calendar'

    const { workspaces, createWorkspace, deleteWorkspace } = useWorkspaces()
    const { tasks, loading, addTask, editTask, updateTaskStatus, deleteTask } = useTasks(activeWorkspaceId)

    const { addXP, updateAvatar } = useProfile()

    const [activeTask, setActiveTask] = useState(null)
    const [localTasks, setLocalTasks] = useState(tasks)

    // Lootbox States
    const [showLootbox, setShowLootbox] = useState(false)
    const [achievedLevel, setAchievedLevel] = useState(1)

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState(null)

    const handleCreateWorkspace = async (e) => {
        if (e.key === 'Enter') {
            await createWorkspace(newWorkspaceName)
            setNewWorkspaceName('')
            setIsCreatingWorkspace(false)
        }
    }

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
                const result = await addXP(reward)
                playSuccessSound() // Ding!

                // Trigger Lootbox Drop
                if (result && result.levelledUp) {
                    setAchievedLevel(result.newLevel)
                    setShowLootbox(true)
                }
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
        <div className="flex flex-col h-full max-w-7xl mx-auto w-full relative animate-in fade-in duration-500">

            {/* WORKSPACE SELECTOR TOP BAR */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setActiveWorkspaceId(null)}
                    className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeWorkspaceId === null ? 'bg-[var(--color-forge-accent)] text-white shadow-neon' : 'bg-[var(--color-forge-800)] text-gray-400 hover:text-white border border-[var(--color-forge-700)]'}`}
                >
                    General
                </button>

                {workspaces.map(w => (
                    <div
                        key={w.id}
                        onClick={() => setActiveWorkspaceId(w.id)}
                        className={`group px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-3 cursor-pointer ${activeWorkspaceId === w.id ? 'bg-[var(--color-forge-accent)] text-white shadow-neon' : 'bg-[var(--color-forge-800)] text-gray-400 hover:text-white border border-[var(--color-forge-700)]'}`}
                    >
                        <span>{w.name}</span>
                        <button
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full ${activeWorkspaceId === w.id ? 'hover:bg-white/20' : 'hover:bg-red-400/20 hover:text-red-400'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteWorkspace(w.id);
                                if (activeWorkspaceId === w.id) setActiveWorkspaceId(null);
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {isCreatingWorkspace ? (
                    <div className="flex items-center gap-2 bg-[var(--color-forge-800)] border border-[var(--color-forge-accent)] rounded-full px-3 py-1.5 animate-in fade-in slide-in-from-left-2">
                        <input
                            autoFocus
                            type="text"
                            value={newWorkspaceName}
                            onChange={e => setNewWorkspaceName(e.target.value)}
                            onKeyDown={handleCreateWorkspace}
                            className="bg-transparent outline-none text-white w-24 text-sm font-bold placeholder-gray-500"
                            placeholder="Name..."
                        />
                        <button onClick={() => setIsCreatingWorkspace(false)} className="text-gray-400 hover:text-[var(--color-forge-danger)]"><X size={16} /></button>
                    </div>
                ) : (
                    <button onClick={() => setIsCreatingWorkspace(true)} className="p-2 border border-dashed border-gray-600 text-gray-400 hover:border-white hover:text-white rounded-full transition-colors flex items-center justify-center flex-shrink-0" title="New Workspace">
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {/* VIEW MODE TOGGLE & ADD TASK */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex bg-[var(--color-forge-900)] p-1 rounded-xl border border-[var(--color-forge-700)] shadow-inner">
                    <button
                        onClick={() => setViewMode('board')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${viewMode === 'board' ? 'bg-[var(--color-forge-800)] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Layout size={16} /> Board
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${viewMode === 'calendar' ? 'bg-[var(--color-forge-accent)] text-white shadow-[0_0_15px_rgba(255,83,73,0.3)] border border-transparent' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CalendarIcon size={16} /> Calendar
                    </button>
                </div>

                <button
                    onClick={() => {
                        setEditingTask(null)
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 bg-[var(--color-text-main)] text-[var(--color-forge-900)] px-4 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-md"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline-block">{t('createTask')}</span>
                </button>
            </div>

            {/* 1. Rich Task Creation Modal Launcher */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingTask(null)
                }}
                /* We remove onOpenNew from here since we lifted the Add Task button out! */
                initialData={editingTask}
                onSaveTask={editingTask ? editTask : addTask}
            />

            {/* 2. Main View Area */}
            <div className="flex-grow min-h-0">
                {viewMode === 'board' ? (
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
                                    onEditTask={(task) => {
                                        setEditingTask(task)
                                        setIsModalOpen(true)
                                    }}
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeTask ? (
                                <div className="opacity-95 transform rotate-3 scale-105">
                                    <TaskCard task={activeTask} onDelete={() => { }} onEdit={() => { }} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <CalendarView
                        tasks={localTasks}
                        onOpenNewTask={(initialData) => {
                            setEditingTask(initialData)
                            setIsModalOpen(true)
                        }}
                        onEditTask={(task) => {
                            setEditingTask(task)
                            setIsModalOpen(true)
                        }}
                    />
                )}
            </div>

            <LootboxModal
                isOpen={showLootbox}
                newLevel={achievedLevel}
                onClose={() => setShowLootbox(false)}
                onEquip={async (url) => {
                    await updateAvatar(url)
                    setShowLootbox(false)
                }}
            />
        </div >
    )
}
