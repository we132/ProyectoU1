import { useState, useRef } from 'react'
import { Plus, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const TaskModal = ({ onAddTask }) => {
    const { t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState('medium')
    const [imageFile, setImageFile] = useState(null)

    const fileInputRef = useRef(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        await onAddTask(title, description, difficulty, imageFile)

        // Reset form
        setTitle('')
        setDescription('')
        setDifficulty('medium')
        setImageFile(null)
        setLoading(false)
        setIsOpen(false) // Close modal
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    return (
        <div className="mb-8">
            {/* Trigger Button - Floating Action or Top Bar style */}
            <div className="flex justify-between items-center bg-forge-800 p-4 rounded-xl border border-forge-700 shadow-sm">
                <h2 className="text-xl font-bold">{t('backlog')} & {t('inProgress')}</h2>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-white text-forge-900 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline-block">{t('createTask')}</span>
                </button>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-forge-800 border border-forge-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold mb-6">{t('createTask')}</h3>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('taskTitle')} *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder={t('taskTitlePlaceholder')}
                                    className="w-full bg-forge-900 border border-forge-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('taskDesc')}</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={t('taskDescPlaceholder')}
                                    rows="3"
                                    className="w-full bg-forge-900 border border-forge-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent transition-all resize-none"
                                    disabled={loading}
                                />
                            </div>

                            {/* Split Row: Difficulty & Image */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('difficulty')}</label>
                                    <select
                                        value={difficulty}
                                        onChange={e => setDifficulty(e.target.value)}
                                        className="w-full bg-forge-900 border border-forge-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-forge-accent appearance-none cursor-pointer"
                                        disabled={loading}
                                    >
                                        <option value="easy">{t('easy')}</option>
                                        <option value="medium">{t('medium')}</option>
                                        <option value="hard">{t('hard')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('uploadImage')}</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full bg-forge-900 border border-forge-700 rounded-lg h-12 flex items-center justify-center gap-2 cursor-pointer hover:border-forge-accent transition-all text-sm ${imageFile ? 'text-forge-accent' : 'text-gray-400'}`}
                                    >
                                        {imageFile ? <ImageIcon size={18} /> : <Upload size={18} />}
                                        <span className="truncate max-w-[120px]">
                                            {imageFile ? imageFile.name : t('uploadImage')}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-forge-700">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2.5 rounded-full text-gray-300 hover:text-white hover:bg-forge-700 font-medium transition-colors"
                                    disabled={loading}
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    className="px-6 py-2.5 rounded-full bg-forge-accent text-white font-medium hover:bg-forge-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {t('save')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
