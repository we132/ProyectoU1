import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreVertical, Trash2 } from 'lucide-react'

// Map difficulties to colors for visual flair
const diffColors = {
    easy: 'text-green-400 border-green-400/30 bg-green-400/5',
    medium: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
    hard: 'text-forge-danger border-forge-danger/30 bg-forge-danger/5'
}

export const TaskCard = ({ task, onDelete }) => {
    // Setup dnd-kit hooks for the draggable behavior
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
        opacity: isDragging ? 0.8 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group bg-forge-900/90 border border-forge-800 p-4 rounded mb-3 flex flex-col gap-3 cursor-grab hover:border-forge-accent/50 transition-colors shadow-sm ${isDragging ? 'shadow-neon ring-1 ring-forge-accent' : ''
                }`}
        >
            <div className="flex justify-between items-start">
                <p className="text-sm font-sans text-gray-200 leading-snug pr-6 break-words">
                    {task.title}
                </p>

                {/* Drag Handle Icon */}
                <div className="text-gray-600 group-hover:text-forge-accent transition-colors">
                    <MoreVertical size={16} />
                </div>
            </div>

            <div className="flex justify-between items-end mt-1">
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${diffColors[task.difficulty] || diffColors.medium}`}>
                    {task.difficulty}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-forge-xp drop-shadow-neon-xp font-bold">
                        +{task.xp_reward} XP
                    </span>

                    <button
                        onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking delete
                        onClick={() => onDelete(task.id)}
                        className="text-gray-600 hover:text-forge-danger transition-colors bg-forge-800 p-1 rounded opacity-0 group-hover:opacity-100"
                        title="Delete Objective"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
