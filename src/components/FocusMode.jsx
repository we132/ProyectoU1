import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Brain } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

export const FocusMode = ({ isOpen, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Defaulting to 25 minutes. If user changes logic, this handles it dynamically based on initial full time.
    const FOCUS_MINUTES = 25;
    const { logSession } = useAnalytics();

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            clearInterval(interval);
            setIsActive(false);

            // Log exactly FOCUS_MINUTES (default 25) when timer naturally reaches 0
            logSession(FOCUS_MINUTES);

            // Play a ding sound for feedback
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.connect(audioCtx.destination);
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
                // Ignore audio errors
            }
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

            {/* Main Focus UI */}
            <div className="relative z-10 w-full max-w-lg bg-[var(--color-forge-800)]/80 backdrop-blur-xl border border-[var(--color-forge-accent)]/50 rounded-3xl p-10 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                <button
                    onClick={() => {
                        if (isActive) {
                            const confirmExit = window.confirm("Are you sure you want to exit? Your focus session is active and will be reset.");
                            if (!confirmExit) return;
                        }
                        setIsActive(false);
                        onClose();
                    }}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>

                <div className="text-[var(--color-forge-accent)] mb-4 animate-pulse">
                    <Brain size={48} />
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
                </div>
            </div>
        </div>
    );
};
