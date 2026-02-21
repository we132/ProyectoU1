import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Headphones } from 'lucide-react';

export const FocusMode = ({ isOpen, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes mostly
    const [isActive, setIsActive] = useState(false);
    const [musicEnabled, setMusicEnabled] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            // Optional: Play a different chime here
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[var(--color-forge-900)] z-[60] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">

            {/* Background Ambience (Lo-Fi Girl Stream) */}
            {musicEnabled && (
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen overflow-hidden flex items-center justify-center">
                    {/* Lofi Girl YouTube Radio - Autoplays */}
                    <iframe
                        width="150%"
                        height="150%"
                        src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&controls=0&showinfo=0&mute=0&loop=1"
                        title="Lofi Radio"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="min-w-full min-h-full"
                    ></iframe>
                </div>
            )}

            {/* Main Focus UI */}
            <div className="relative z-10 w-full max-w-lg bg-[var(--color-forge-800)]/80 backdrop-blur-xl border border-[var(--color-forge-accent)]/50 rounded-3xl p-10 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                <button
                    onClick={() => {
                        setIsActive(false);
                        setMusicEnabled(false);
                        onClose();
                    }}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>

                <div className="text-[var(--color-forge-accent)] mb-4 animate-pulse">
                    <Headphones size={48} />
                </div>

                <h2 className="text-2xl font-bold tracking-widest text-[#dfdfdf] uppercase mb-8">Deep Focus</h2>

                {/* Giant Timer */}
                <div className="text-8xl sm:text-9xl font-mono font-bold text-white mb-10 tracking-tighter drop-shadow-[0_0_20px_var(--color-forge-accent)] relative">
                    {formatTime(timeLeft)}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mb-8">
                    <button
                        onClick={resetTimer}
                        className="p-4 rounded-full bg-forge-900 text-gray-400 hover:text-white border border-forge-700 transition-all hover:scale-105"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className="p-6 rounded-full bg-[var(--color-forge-accent)] text-white shadow-[0_0_20px_var(--color-forge-accent)] hover:scale-105 transition-all transform"
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <button
                        onClick={() => setMusicEnabled(!musicEnabled)}
                        className={`p-4 rounded-full border transition-all hover:scale-105 ${musicEnabled ? 'bg-forge-xp text-forge-900 border-forge-xp shadow-neon-xp' : 'bg-forge-900 text-gray-400 border-forge-700 hover:text-white'}`}
                        title="Toggle Lo-Fi Music"
                    >
                        <Headphones size={24} />
                    </button>
                </div>

                <p className="text-sm text-gray-400 text-center uppercase tracking-widest">
                    {musicEnabled ? "Lo-Fi STREAM ENABLED" : "SILENT MODE"}
                </p>
            </div>
        </div>
    );
};
