import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Headphones, Music2 } from 'lucide-react';

const STATIONS = [
    { id: 'lofi', name: 'Lo-Fi Chill', streamUrls: ['https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'] }, // Pixabay Lofi
    {
        id: 'top', name: 'Twenty One Pilots (Mix)', streamUrls: [
            '/audio/top1.mp3', '/audio/top2.mp3', '/audio/top3.mp3', '/audio/top4.mp3', '/audio/top5.mp3',
            '/audio/top6.mp3', '/audio/top7.mp3', '/audio/top8.mp3', '/audio/top9.mp3', '/audio/top10.mp3',
            '/audio/top11.mp3', '/audio/top12.mp3', '/audio/top13.mp3', '/audio/top14.mp3'
        ]
    } // 14 Local Custom Files
]

export const FocusMode = ({ isOpen, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [musicEnabled, setMusicEnabled] = useState(false);
    const [activeStation, setActiveStation] = useState(STATIONS[0]);
    const [trackIndex, setTrackIndex] = useState(0);
    const [playError, setPlayError] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            if (audioRef.current) audioRef.current.pause();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Handle Audio Playback
    useEffect(() => {
        if (musicEnabled && audioRef.current) {
            audioRef.current.volume = 0.3;
            // Play returns a promise, which we need to catch securely.
            // A slight delay ensures the new source is loaded if the trackIndex changed.
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setPlayError(false);
                }).catch(e => {
                    console.error("Audio block:", e);
                    setPlayError(true);
                });
            }
        } else if (!musicEnabled && audioRef.current) {
            audioRef.current.pause();
        }
    }, [musicEnabled, activeStation, trackIndex]);

    const handleTrackEnd = () => {
        if (activeStation.streamUrls.length > 1) {
            setTrackIndex((prevIndex) => (prevIndex + 1) % activeStation.streamUrls.length);
        }
    };

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

            {/* Hidden Native Audio Element */}
            <audio
                ref={audioRef}
                src={activeStation.streamUrls[trackIndex]}
                preload="none"
                crossOrigin="anonymous"
                onEnded={handleTrackEnd}
                loop={activeStation.streamUrls.length === 1}
            />

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
                        title="Toggle Radio"
                    >
                        <Headphones size={24} />
                    </button>
                </div>

                {/* Station Selector */}
                <div className="flex flex-col items-center gap-3">
                    {playError && (
                        <div className="mb-2 bg-forge-danger/20 border border-forge-danger text-forge-danger px-4 py-2 rounded-xl text-center flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-xs font-bold">Browser blocked audio.</span>
                            <button
                                onClick={() => {
                                    audioRef.current?.play();
                                    setPlayError(false);
                                }}
                                className="bg-forge-danger text-white px-4 py-1 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                            >
                                Force Play Audio
                            </button>
                        </div>
                    )}

                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Music2 size={16} />
                        {musicEnabled ? "RADIO STREAMING" : "RADIO OFF"}
                    </p>

                    <div className={`flex items-center bg-forge-900 border border-forge-700 p-1 rounded-full transition-opacity ${musicEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        {STATIONS.map(station => (
                            <button
                                key={station.id}
                                onClick={() => {
                                    setActiveStation(station);
                                    setTrackIndex(0);
                                }}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeStation.id === station.id ? 'bg-[var(--color-forge-accent)] text-white shadow-neon' : 'text-gray-400 hover:text-white'}`}
                            >
                                {station.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
