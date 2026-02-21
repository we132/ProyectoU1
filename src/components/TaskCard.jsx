import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreVertical, Trash2, Edit3, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const diffColors = {
    easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-[var(--color-forge-danger)] bg-[var(--color-forge-danger)]/10 border-red-500/20'
}

export const TaskCard = ({ task, onDelete, onEdit }) => {
    const { t } = useLanguage()
    const [showMenu, setShowMenu] = useState(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { status: task.status } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.9 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group bg-[var(--color-forge-800)] border border-[var(--color-forge-700)] rounded-xl mb-4 flex flex-col cursor-grab hover:border-gray-500 transition-colors ${isDragging ? 'ring-2 ring-[var(--color-forge-accent)] shadow-2xl scale-105' : 'shadow-sm'
                }`}
        >
            {/* Thumbnail Area */}
            {task.image_url ? (
                <div className="w-full h-32 bg-black relative overflow-hidden flex items-center justify-center border-b border-[var(--color-forge-700)] rounded-t-xl">
                    <img
                        src={task.image_url}
                        alt={task.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        draggable="false"
                    />
                    <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase border backdrop-blur-md ${diffColors[task.difficulty] || diffColors.medium}`}>
                        {t(task.difficulty)}
                    </div>
                </div>
            ) : (
                <div className="w-full h-12 bg-[var(--color-forge-900)] relative flex items-center px-4 border-b border-[var(--color-forge-700)] rounded-t-xl overflow-hidden">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${diffColors[task.difficulty] || diffColors.medium}`}>
                        {t(task.difficulty)}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-2 relative">
                <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-[var(--color-text-main)] leading-snug line-clamp-2">
                        {task.title}
                    </h4>

                    {/* Menu Dropdown Trigger */}
                    <div className="relative">
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation() // Prevent dragging when clicking menu
                                setShowMenu(!showMenu)
                            }}
                            className={`p-1 rounded-full transition-colors ${showMenu ? 'bg-[var(--color-forge-700)] text-white' : 'text-gray-500 hover:text-[var(--color-text-main)] hover:bg-[var(--color-forge-700)]'}`}
                        >
                            <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Box */}
                        {showMenu && (
                            <div
                                className="absolute right-0 mt-1 w-32 bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-lg shadow-xl z-50 overflow-hidden"
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseLeave={() => setShowMenu(false)}
                            >
                                <button
                                    onClick={() => { setShowMenu(false); onEdit(task); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[var(--color-forge-800)] flex items-center gap-2 transition-colors"
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => { setShowMenu(false); onDelete(task.id); }}
                                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-forge-danger)] hover:bg-[var(--color-forge-danger)]/10 hover:text-red-400 flex items-center gap-2 transition-colors border-t border-[var(--color-forge-700)]"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {task.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mt-1">
                        {task.description}
                    </p>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--color-forge-700)]">
                    <span className="text-xs font-bold text-[var(--color-forge-xp)]">
                        +{task.xp_reward} XP
                    </span>
                </div>
            </div>
        </div>
    )
}
