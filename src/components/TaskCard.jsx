import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreVertical, Trash2, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

// Map difficulties to colors for visual flair (Streaming Style)
const diffColors = {
    easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-forge-danger bg-forge-danger/10 border-forge-danger/20'
}

export const TaskCard = ({ task, onDelete }) => {
    const { t } = useLanguage()

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
            className={`relative group bg-forge-800 border border-forge-700 rounded-xl overflow-hidden mb-4 flex flex-col cursor-grab transition-all hover:bg-forge-700/50 ${isDragging ? 'ring-2 ring-forge-accent shadow-2xl scale-105' : 'shadow-sm'
                }`}
        >
            {/* Thumbnail Area (Like a YouTube Video thumbnail) */}
            <div className="w-full h-32 bg-forge-900 relative overflow-hidden flex items-center justify-center border-b border-forge-700 group-hover:opacity-90 transition-opacity">
                {task.image_url ? (
                    <img
                        src={task.image_url}
                        alt={task.title}
                        className="w-full h-full object-cover"
                        draggable="false"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-600 gap-2">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-widest font-bold">THE FORGE</span>
                    </div>
                )}

                {/* Difficulty Badge floating on thumbnail */}
                <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${diffColors[task.difficulty] || diffColors.medium}`}>
                    {t(task.difficulty)}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-gray-100 leading-snug line-clamp-2">
                        {task.title}
                    </h4>
                    <div className="text-gray-500 group-hover:text-white transition-colors shrink-0 pt-1">
                        <MoreVertical size={16} />
                    </div>
                </div>

                {task.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-forge-700">
                    <span className="text-xs font-bold text-forge-xp">
                        +{task.xp_reward} XP
                    </span>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onDelete(task.id)}
                        className="text-gray-500 hover:text-forge-danger transition-colors p-1.5 rounded-full hover:bg-forge-900 opacity-0 group-hover:opacity-100"
                        title="Delete Task"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
