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
import { CheckCircle2, Clock, ListTodo, Loader2, Plus, X, Layout, Calendar as CalendarIcon, Users, Key, Briefcase } from 'lucide-react'

import { useTasks } from '../hooks/useTasks'
import { useWorkspaceContext } from '../context/WorkspaceContext'
import { useProfile } from '../hooks/useProfile'
import { useLanguage } from '../context/LanguageContext'
import { TaskModal } from './TaskModal'
import { TaskCard } from './TaskCard'
import { LootboxModal } from './LootboxModal'
import { CalendarView } from './CalendarView'
import { PetPlaypen } from './PetPlaypen'

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
    const { workspaces, createWorkspace, deleteWorkspace, joinWorkspace, activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext()
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
    const [wsActionType, setWsActionType] = useState('personal') // 'personal' | 'group' | 'join'
    const [workspaceInput, setWorkspaceInput] = useState('')
    const [viewMode, setViewMode] = useState('board') // 'board' | 'calendar'

    const { tasks, loading, addTask, editTask, updateTaskStatus, deleteTask } = useTasks(activeWorkspaceId)

    const { addXP, addCoins } = useProfile()

    const [activeTask, setActiveTask] = useState(null)
    const [localTasks, setLocalTasks] = useState(tasks)

    // Lootbox States
    const [showLootbox, setShowLootbox] = useState(false)
    const [achievedLevel, setAchievedLevel] = useState(1)

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState(null)

    const handleWorkspaceSubmit = async (e) => {
        e.preventDefault()
        if (!workspaceInput.trim()) return

        if (wsActionType === 'join') {
            await joinWorkspace(workspaceInput)
        } else {
            await createWorkspace(workspaceInput, wsActionType)
        }

        setWorkspaceInput('')
        setShowWorkspaceModal(false)
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

            // XP, Coins & Sound Logic
            if (finalTargetStatus === 'done' && originalTask.status !== 'done') {
                const reward = originalTask.xp_reward || 10

                // Coin Economy Matrix
                let coinReward = 10;
                if (originalTask.difficulty === 'medium') coinReward = 25;
                if (originalTask.difficulty === 'hard') coinReward = 50;

                const result = await addXP(reward)
                await addCoins(coinReward)
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
                        {w.type === 'group' && w.invite_code && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(w.invite_code);
                                    alert(`Invide Code Copied: ${w.invite_code}`);
                                }}
                                className={`text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md border transition-colors ${activeWorkspaceId === w.id ? 'bg-white/20 border-white/30 text-white hover:bg-white/30' : 'bg-forge-[950] border-forge-700 text-gray-400 hover:text-white hover:border-forge-600'}`}
                                title="Click to copy invite code"
                            >
                                {w.invite_code}
                            </span>
                        )}
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

                <button onClick={() => setShowWorkspaceModal(true)} className="p-2 border border-dashed border-gray-600 text-gray-400 hover:border-white hover:text-white rounded-full transition-colors flex items-center justify-center flex-shrink-0" title="Manage Workspaces">
                    <Plus size={18} />
                </button>
            </div>

            {/* PET PLAYPEN */}
            <PetPlaypen />

            {/* VIEW MODE TOGGLE & ADD TASK */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex bg-[var(--color-forge-900)] p-1 rounded-xl border border-[var(--color-forge-700)] shadow-inner">
                    <button
                        onClick={() => setViewMode('board')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${viewMode === 'board' ? 'bg-[var(--color-forge-800)] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Layout size={16} /> {t('board')}
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${viewMode === 'calendar' ? 'bg-[var(--color-forge-accent)] text-white shadow-[0_0_15px_rgba(255,83,73,0.3)] border border-transparent' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CalendarIcon size={16} /> {t('calendar')}
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

            {/* Workspace Modal */}
            {showWorkspaceModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--color-forge-800)] border border-[var(--color-forge-700)] w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setShowWorkspaceModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-4 text-white">Workspaces</h3>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <button onClick={() => { setWsActionType('personal'); setWorkspaceInput(''); }} className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${wsActionType === 'personal' ? 'bg-forge-accent/10 border-forge-accent text-forge-accent' : 'bg-forge-900 border-forge-700 text-gray-400 hover:border-gray-500'}`}>
                                <Briefcase size={18} />
                                <span className="text-[10px] font-bold uppercase truncate">Personal</span>
                            </button>
                            <button onClick={() => { setWsActionType('group'); setWorkspaceInput(''); }} className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${wsActionType === 'group' ? 'bg-forge-accent/10 border-forge-accent text-forge-accent' : 'bg-forge-900 border-forge-700 text-gray-400 hover:border-gray-500'}`}>
                                <Users size={18} />
                                <span className="text-[10px] font-bold uppercase truncate">Group</span>
                            </button>
                            <button onClick={() => { setWsActionType('join'); setWorkspaceInput(''); }} className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${wsActionType === 'join' ? 'bg-forge-accent/10 border-forge-accent text-forge-accent' : 'bg-forge-900 border-forge-700 text-gray-400 hover:border-gray-500'}`}>
                                <Key size={18} />
                                <span className="text-[10px] font-bold uppercase truncate">Join</span>
                            </button>
                        </div>

                        <form onSubmit={handleWorkspaceSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                    {wsActionType === 'join' ? 'Invite Code' : 'Workspace Name'}
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={workspaceInput}
                                    onChange={e => setWorkspaceInput(e.target.value)}
                                    placeholder={wsActionType === 'join' ? "e.g. A1B2C3" : "e.g. University"}
                                    className="w-full bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-forge-accent)] transition-colors"
                                />
                            </div>
                            <button type="submit" className="w-full bg-[var(--color-forge-accent)] text-white hover:bg-[var(--color-forge-accent-hover)] font-bold py-3 rounded-lg transition-colors">
                                {wsActionType === 'join' ? 'Join Team' : 'Create Workspace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                        onDeleteTask={deleteTask}
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
