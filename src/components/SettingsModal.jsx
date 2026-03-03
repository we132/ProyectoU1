import { useState, useRef, useEffect } from 'react';
import { Settings, X, LogOut, CheckCircle2, User, Upload, Palette, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../hooks/useProfile';
import { useAnalytics } from '../hooks/useAnalytics';

export const SettingsModal = ({ isOpen, onClose }) => {
    const { signOut, user } = useAuth();
    const { t } = useLanguage();
    const { applyTheme, currentTheme, presets } = useTheme();
    const { profile, uploadAvatar, updateAvatar } = useProfile();

    const [isUploading, setIsUploading] = useState(false);
    const [avatarPage, setAvatarPage] = useState(0);
    const AVATARS_PER_PAGE = 12;
    const TOTAL_AVATARS = 24;

    const defaultAvatars = Array.from({ length: TOTAL_AVATARS }).map((_, i) => `https://api.dicebear.com/9.x/bottts/svg?seed=ForgeHero${i}&backgroundColor=transparent`);
    const paginatedAvatars = defaultAvatars.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE);

    const fileInputRef = useRef(null);

    // Analytics Hook
    const { stats, loading: statsLoading, fetchWeeklyStats, fetchAllTimeMinutes } = useAnalytics();
    const [allTimeMins, setAllTimeMins] = useState(0);

    // Fetch analytics data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchWeeklyStats();
            fetchAllTimeMinutes().then(setAllTimeMins);
        }
    }, [isOpen, fetchWeeklyStats, fetchAllTimeMinutes]);

    if (!isOpen) return null;

    const currentLevel = profile?.level || 1;
    const currentXP = profile?.xp || 0;
    const username = user?.user_metadata?.username || user?.email;

    // Calculate relative XP for UI
    const baseXPForLevel = (currentLevel - 1) * 1000;
    const xpInCurrentLevel = currentXP - baseXPForLevel;
    const xpNeeded = 1000; // Formula for next level gap
    const progressPercent = Math.min((xpInCurrentLevel / xpNeeded) * 100, 100);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-forge-800 border border-forge-700 w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col sm:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Left Column: Avatar & Profile Info */}
                <div className="w-full sm:w-1/3 bg-forge-900/50 p-8 flex flex-col items-center border-b sm:border-b-0 sm:border-r border-forge-700">
                    <div className="relative group w-24 h-24 rounded-full bg-forge-900 border-2 border-[var(--color-forge-accent)] p-1 shadow-neon mb-4">
                        {profile?.avatar_url ? (
                            <img src={profile?.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-forge-800 flex items-center justify-center text-[var(--color-forge-accent)]">
                                <User size={40} />
                            </div>
                        )}

                        {/* Avatar Upload Overlay */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                        >
                            {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setIsUploading(true);
                                    await uploadAvatar(file);
                                    setIsUploading(false);
                                }
                            }}
                        />
                    </div>
                    <h3 className="text-xl font-bold text-center text-[var(--color-text-main)] mb-1">
                        {username}
                    </h3>
                    <span className="text-sm font-bold text-forge-xp bg-forge-800 px-3 py-1 rounded-full border border-forge-700 mb-4 shadow-neon-xp">
                        LVL {currentLevel}
                    </span>

                    {/* XP Progress Bar */}
                    <div className="w-full max-w-[200px] mb-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-1 font-bold">
                            <span>{xpInCurrentLevel} XP</span>
                            <span>{xpNeeded} XP</span>
                        </div>
                        <div className="w-full h-2 bg-forge-900 rounded-full overflow-hidden border border-forge-700">
                            <div
                                className="h-full bg-forge-xp transition-all duration-1000 shadow-neon-xp"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        className="mt-auto w-full py-2 flex items-center justify-center gap-2 text-forge-danger border border-forge-danger/30 rounded-full hover:bg-forge-danger/10 transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        {t('logout')}
                    </button>
                </div>

                {/* Right Column: Scrollable Settings */}
                <div className="w-full sm:w-2/3 p-8 overflow-y-auto max-h-[85vh]">

                    {/* Analytics Dashboard */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-[var(--color-forge-accent)]" size={24} />
                            <h2 className="text-2xl font-bold text-[var(--color-text-main)]">{t('focusAnalytics')}</h2>
                        </div>

                        <div className="bg-forge-900 border border-forge-700 rounded-2xl p-6 shadow-inner">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-bold text-gray-400">{t('past7Days')}</span>
                                <span className="text-xs font-bold text-forge-accent bg-forge-accent/10 border border-forge-accent/20 px-3 py-1.5 rounded-full shadow-neon">
                                    {allTimeMins} {t('minsTotal')}
                                </span>
                            </div>

                            {statsLoading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-forge-accent" />
                                </div>
                            ) : (
                                <div className="flex items-end justify-between h-40 gap-2 border-b border-forge-700/50 pb-2">
                                    {stats.map((stat, i) => {
                                        // Calculate max dynamically to scale the heights
                                        const maxMins = Math.max(...stats.map(s => s.minutes), 1);
                                        const heightPercent = (stat.minutes / maxMins) * 100;
                                        const isToday = i === 6; // Last item in chronological bucket is today

                                        return (
                                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                                                <div className="w-full relative flex justify-center h-full items-end group">
                                                    <div
                                                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative ${isToday ? 'bg-[var(--color-forge-accent)] shadow-neon' : 'bg-forge-800 border-x border-t border-forge-700 group-hover:bg-forge-700'}`}
                                                        style={{ height: `${Math.max(2, heightPercent)}%` }}
                                                    >
                                                        {stat.minutes > 0 && (
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] font-bold py-1 px-2 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                                {stat.minutes}m
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-forge-accent' : 'text-gray-500'}`}>
                                                    {stat.day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Theme Settings Wrapper */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="text-[var(--color-forge-accent)]" size={24} />
                            <h2 className="text-2xl font-bold text-[var(--color-text-main)]">{t('aestheticEngine')}</h2>
                        </div>

                        <p className="text-sm text-gray-400 mb-6">
                            Select a cinematic theme to override the system colors. This signature is tied to your profile across all devices.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {presets.map(theme => {
                                const isActive = currentTheme?.id === theme.id;

                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => applyTheme(theme)}
                                        className={`relative border rounded-xl overflow-hidden transition-all text-left flex flex-col ${isActive
                                            ? 'border-forge-accent ring-1 ring-forge-accent shadow-neon'
                                            : 'border-forge-700 hover:border-gray-500'
                                            }`}
                                        style={{ backgroundColor: theme.surface }}
                                    >
                                        <div className="h-4 w-full" style={{ backgroundColor: theme.accent }}></div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>
                                                {theme.name}
                                            </h4>
                                            <div className="flex gap-2">
                                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.bg }}></div>
                                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.surface }}></div>
                                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }}></div>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="absolute top-2 right-2 text-forge-900 bg-forge-accent rounded-full p-0.5">
                                                <CheckCircle2 size={14} />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}

                            {/* Custom Color Picker Hex Block */}
                            <div
                                className={`relative border rounded-xl overflow-hidden transition-all text-left flex flex-col ${currentTheme?.id === 'custom'
                                    ? 'border-[var(--color-forge-accent)] ring-1 ring-[var(--color-forge-accent)] shadow-neon'
                                    : 'border-forge-700 hover:border-gray-500'
                                    }`}
                                style={{ backgroundColor: currentTheme?.surface || '#1a1a1a' }}
                            >
                                <label className="cursor-pointer flex-grow flex flex-col h-full w-full">
                                    <div className="h-4 w-full relative" style={{ backgroundColor: currentTheme?.accent || '#ffffff' }}>
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        <h4 className="font-bold text-sm mb-2 text-white flex items-center gap-2">
                                            <Palette size={16} /> {t('customPalette')}
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={currentTheme?.accent || '#ffffff'}
                                                onChange={(e) => {
                                                    applyTheme({
                                                        ...currentTheme,
                                                        id: 'custom',
                                                        name: 'Custom',
                                                        accent: e.target.value
                                                    })
                                                }}
                                                className="w-8 h-8 rounded shrink-0 bg-transparent border-none cursor-pointer p-0"
                                            />
                                            <span className="text-xs text-gray-400 font-mono">Pick Hex</span>
                                        </div>
                                    </div>

                                    {currentTheme?.id === 'custom' && (
                                        <div className="absolute top-2 right-2 text-forge-900 bg-[var(--color-forge-accent)] rounded-full p-0.5">
                                            <CheckCircle2 size={14} />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div> {/* End Theme Wrapper */}

                    {/* Avatar Gallery */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="text-[var(--color-forge-accent)]" size={24} />
                                <h2 className="text-xl font-bold text-[var(--color-text-main)]">{t('avatarArmory')}</h2>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAvatarPage(Math.max(0, avatarPage - 1))}
                                    disabled={avatarPage === 0}
                                    className="p-1 rounded-full border border-forge-700 text-gray-400 hover:text-white hover:bg-forge-700 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-xs font-bold text-gray-500">
                                    {avatarPage + 1} / {Math.ceil(TOTAL_AVATARS / AVATARS_PER_PAGE)}
                                </span>
                                <button
                                    onClick={() => setAvatarPage(Math.min(Math.ceil(TOTAL_AVATARS / AVATARS_PER_PAGE) - 1, avatarPage + 1))}
                                    disabled={avatarPage >= Math.ceil(TOTAL_AVATARS / AVATARS_PER_PAGE) - 1}
                                    className="p-1 rounded-full border border-forge-700 text-gray-400 hover:text-white hover:bg-forge-700 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {paginatedAvatars.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => updateAvatar(url)}
                                    className={`aspect-square rounded-xl border-2 overflow-hidden transition-all bg-forge-900 ${profile?.avatar_url === url
                                        ? 'border-[var(--color-forge-accent)] shadow-neon scale-105'
                                        : 'border-transparent hover:border-forge-700 hover:scale-105'}`}
                                >
                                    <img src={url} alt="Default Avatar" className="w-full h-full object-cover p-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
