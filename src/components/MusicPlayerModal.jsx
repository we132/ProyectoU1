import { useState, useRef } from 'react';
import { X, Play, Pause, Headphones, Music2, Upload, Loader2, Music, Trash2 } from 'lucide-react';
import { useGlobalAudio } from '../context/AudioContext';
import { useMusic } from '../hooks/useMusic';

export const MusicPlayerModal = ({ isOpen, onClose }) => {
    const {
        stations, activeStation, musicEnabled, playError,
        toggleMusic, changeStation, forcePlay, setMusicEnabled
    } = useGlobalAudio();

    const { tracks, uploadTrack, deleteTrack, loading: musicLoading } = useMusic();
    const [isUploadingTrack, setIsUploadingTrack] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="relative z-10 w-full max-w-md bg-[var(--color-forge-800)]/90 backdrop-blur-xl border border-[var(--color-forge-700)] rounded-3xl p-8 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-forge-900 rounded-2xl text-forge-accent shrink-0">
                        <Headphones size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">Audio Engine</h2>
                        <p className="text-xs text-gray-400 font-medium">Global Background Soundtrack</p>
                    </div>
                </div>

                {/* Main Playback Control */}
                <div className="flex flex-col items-center gap-6 mb-8 py-6 bg-forge-900/50 rounded-2xl border border-forge-700/50">
                    <button
                        onClick={toggleMusic}
                        className={`p-6 rounded-full border transition-all hover:scale-105 ${musicEnabled ? 'bg-forge-xp text-forge-900 border-forge-xp shadow-neon-xp' : 'bg-forge-900 text-gray-400 border-forge-700 hover:text-white hover:border-white'}`}
                        title="Toggle Global Audio"
                    >
                        {musicEnabled ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Music2 size={16} className={musicEnabled ? 'text-forge-xp animate-pulse' : ''} />
                        {musicEnabled ? "PLAYING: " + activeStation.name : "RADIO OFF"}
                    </p>

                    {playError && (
                        <div className="mt-2 bg-forge-danger/20 border border-forge-danger text-forge-danger px-4 py-2 rounded-xl text-center flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-xs font-bold">Browser blocked audio.</span>
                            <button
                                onClick={forcePlay}
                                className="bg-forge-danger text-white px-4 py-1 flex items-center gap-2 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                            >
                                <Play size={12} fill="currentColor" /> Force Play
                            </button>
                        </div>
                    )}
                </div>

                {/* Station Selection */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tuning</h3>
                    <div className={`flex flex-wrap gap-2 transition-opacity ${musicEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        {stations.map(station => (
                            <button
                                key={station.id}
                                onClick={() => changeStation(station)}
                                className={`px-4 py-2 rounded-full border border-forge-700 text-xs font-bold transition-all flex-grow text-center ${activeStation.id === station.id ? 'bg-[var(--color-forge-accent)] text-white shadow-neon border-[var(--color-forge-accent)]' : 'bg-forge-900 text-gray-400 hover:text-white hover:bg-forge-800'}`}
                            >
                                {station.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Tracks Manager */}
                <div className="bg-forge-900 border border-forge-700 rounded-2xl p-4 flex flex-col flex-grow max-h-64">
                    <div className="flex items-center justify-between mb-3 border-b border-forge-700 pb-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                            <Music size={16} className="text-forge-accent" />
                            My Playlist ({tracks.length})
                        </div>
                        <label className={`cursor-pointer text-forge-accent hover:text-white text-xs font-bold flex items-center gap-1 transition-colors ${isUploadingTrack ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploadingTrack ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {isUploadingTrack ? 'Uploading...' : 'Upload MP3'}
                            <input
                                type="file"
                                accept=".mp3,audio/mp3,audio/mpeg,audio/wav,audio/x-m4a"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setIsUploadingTrack(true);
                                        await uploadTrack(file);
                                        setIsUploadingTrack(false);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </label>
                    </div>

                    <div className="space-y-1 overflow-y-auto custom-scrollbar flex-grow pr-2">
                        {musicLoading && tracks.length === 0 ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-forge-accent" /></div>
                        ) : tracks.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-6 leading-relaxed">Your cloud playlist is empty.<br />Upload MP3s to listen to them globally.</p>
                        ) : (
                            tracks.map(track => (
                                <div key={track.id} className="flex items-center justify-between hover:bg-forge-800 p-2 rounded-lg group transition-colors">
                                    <span className="text-xs font-medium truncate text-gray-300 pr-4">{track.title}</span>
                                    <button
                                        onClick={() => deleteTrack(track.id, track.file_url)}
                                        className="text-gray-600 hover:text-red-400 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                        title="Delete Track"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
