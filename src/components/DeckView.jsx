import { useState, useEffect } from 'react';
import { useFlashcards } from '../hooks/useFlashcards';
import { ChevronLeft, Plus, X, Trash2, Maximize2, RotateCw } from 'lucide-react';

export const DeckView = ({ deck, onBack }) => {
    const { cards, loadingCards, fetchCards, createCard, deleteCard } = useFlashcards();
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');

    const [studyIndex, setStudyIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (deck?.id) {
            fetchCards(deck.id);
        }
    }, [deck, fetchCards]);

    const handleCreateCard = async (e) => {
        e.preventDefault();
        if (newFront.trim() && newBack.trim()) {
            await createCard(deck.id, newFront, newBack);
            setNewFront('');
            setNewBack('');
            setIsCreatingCard(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setStudyIndex(prev => Math.min(prev + 1, cards.length - 1));
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setStudyIndex(prev => Math.max(prev - 1, 0));
        }, 150);
    };

    const handleDeleteCard = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this flashcard?')) {
            await deleteCard(id);
            // Re-adjust index if we delete the last card we were viewing
            if (studyIndex >= cards.length - 1) {
                setStudyIndex(Math.max(0, cards.length - 2));
            }
        }
    };

    if (loadingCards) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-forge-700 border-t-[var(--color-forge-accent)] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative animate-in zoom-in-95 duration-300">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-forge-800 text-gray-400 hover:text-white rounded-xl border border-forge-700 hover:border-white transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{deck.title}</h1>
                        <p className="text-gray-400 text-sm">
                            {cards.length} {cards.length === 1 ? 'Card' : 'Cards'} Available
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsCreatingCard(true)}
                    className="flex items-center gap-2 bg-forge-900 border border-[var(--color-forge-accent)] text-white px-4 py-2 rounded-full font-bold hover:bg-[var(--color-forge-accent)] transition-colors shadow-neon"
                >
                    <Plus size={16} />
                    <span>Add Card</span>
                </button>
            </div>

            {/* Create Card Form */}
            {isCreatingCard && (
                <form
                    onSubmit={handleCreateCard}
                    className="bg-forge-900 border border-[var(--color-forge-accent)]/50 rounded-2xl p-6 mb-8 animate-in mt-[-10px] fade-in grid grid-cols-1 sm:grid-cols-2 gap-4 relative"
                >
                    <button
                        type="button"
                        onClick={() => setIsCreatingCard(false)}
                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[var(--color-forge-accent)] uppercase">Front (Term)</label>
                        <textarea
                            required
                            autoFocus
                            value={newFront}
                            onChange={e => setNewFront(e.target.value)}
                            placeholder="e.g. Mitochondria"
                            className="bg-forge-800 border border-forge-700 rounded-xl p-3 text-white text-lg min-h-[100px] outline-none focus:border-[var(--color-forge-accent)]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[var(--color-forge-accent)] uppercase">Back (Definition)</label>
                        <textarea
                            required
                            value={newBack}
                            onChange={e => setNewBack(e.target.value)}
                            placeholder="e.g. The powerhouse of the cell."
                            className="bg-forge-800 border border-forge-700 rounded-xl p-3 text-white text-lg min-h-[100px] outline-none focus:border-[var(--color-forge-accent)]"
                        />
                    </div>

                    <div className="sm:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={!newFront.trim() || !newBack.trim()}
                            className="bg-[var(--color-forge-accent)] text-[var(--color-forge-900)] px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:scale-105 transition-transform shadow-neon"
                        >
                            Save Card
                        </button>
                    </div>
                </form>
            )}

            {/* Main Study Arena */}
            <div className="flex-grow flex flex-col items-center justify-center relative min-h-[400px]">
                {cards.length === 0 ? (
                    <div className="text-center p-10 border-2 border-dashed border-forge-700 rounded-3xl w-full max-w-lg">
                        <Maximize2 size={48} className="mx-auto text-forge-800 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Deck is Empty</h3>
                        <p className="text-gray-400">Add some cards above to begin your study session.</p>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl flex flex-col items-center">
                        {/* The CSS 3D Flipping Card */}
                        <div
                            className="relative w-full aspect-[3/2] perspective-1000 mb-8 cursor-pointer group"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div
                                className={`w-full h-full transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
                            >
                                {/* Front Face */}
                                <div className="absolute inset-0 backface-hidden bg-forge-800 border-2 border-[var(--color-forge-accent)]/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-forge-900 to-forge-800">
                                    <div className="absolute top-4 left-6 text-sm font-bold text-[var(--color-forge-accent)] tracking-widest opacity-80">FRONT</div>
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight break-words max-w-full">
                                        {cards[studyIndex].front_content}
                                    </h2>
                                    <div className="absolute bottom-6 flex items-center gap-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RotateCw size={16} className="animate-pulse" /> Click to flip
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteCard(e, cards[studyIndex].id)}
                                        className="absolute top-4 right-4 p-2 text-forge-700 hover:text-forge-danger hover:bg-forge-danger/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {/* Back Face */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border-2 border-white rounded-3xl flex flex-col items-center p-8 overflow-y-auto custom-scrollbar text-center justify-center">
                                    <div className="absolute top-4 left-6 text-sm font-bold text-gray-400 tracking-widest">BACK (ANSWER)</div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-forge-900)] leading-relaxed mt-4 break-words w-full">
                                        {cards[studyIndex].back_content}
                                    </h2>
                                    <button
                                        onClick={(e) => handleDeleteCard(e, cards[studyIndex].id)}
                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-6 bg-forge-900 border border-forge-700 rounded-full p-2 px-6 shadow-neon">
                            <button
                                onClick={(e) => { e.stopPropagation(); prevCard(); }}
                                disabled={studyIndex === 0}
                                className="p-2 text-white hover:bg-forge-800 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <span className="font-bold text-sm tracking-widest text-[var(--color-forge-accent)]">
                                {studyIndex + 1} / {cards.length}
                            </span>

                            <button
                                onClick={(e) => { e.stopPropagation(); nextCard(); }}
                                disabled={studyIndex === cards.length - 1}
                                className="p-2 text-white hover:bg-forge-800 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft size={24} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
