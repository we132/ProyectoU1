import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMusic } from '../hooks/useMusic';
import { useAuth } from './AuthContext';

const AudioContext = createContext(null);

export const DEFAULT_STATIONS = [
    { id: 'lofi', name: 'Lo-Fi Chill', streamUrls: ['https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'] },
    {
        id: 'top', name: 'Twenty One Pilots (Mix)', streamUrls: [
            '/audio/top1.mp3', '/audio/top2.mp3', '/audio/top3.mp3', '/audio/top4.mp3', '/audio/top5.mp3',
            '/audio/top6.mp3', '/audio/top7.mp3', '/audio/top8.mp3', '/audio/top9.mp3', '/audio/top10.mp3',
            '/audio/top11.mp3', '/audio/top12.mp3', '/audio/top13.mp3', '/audio/top14.mp3'
        ]
    }
];

export const AudioProvider = ({ children }) => {
    const { session } = useAuth();
    const { tracks } = useMusic();

    // We dynamically build the stations list based on if the user has custom tracks
    const [stations, setStations] = useState(DEFAULT_STATIONS);
    const [activeStation, setActiveStation] = useState(DEFAULT_STATIONS[0]);
    const [trackIndex, setTrackIndex] = useState(0);
    const [musicEnabled, setMusicEnabled] = useState(false);
    const [playError, setPlayError] = useState(false);

    const audioRef = useRef(null);

    // Update stations if custom tracks change
    useEffect(() => {
        if (tracks && tracks.length > 0) {
            const customStation = {
                id: 'custom',
                name: 'My Playlist',
                streamUrls: tracks.map(t => t.streamUrl),
            };
            setStations([...DEFAULT_STATIONS, customStation]);

            // If active station is custom, update its streamUrls in case they added/deleted songs
            if (activeStation.id === 'custom') {
                setActiveStation(customStation);
                if (trackIndex >= tracks.length) {
                    setTrackIndex(0);
                }
            }
        } else {
            setStations(DEFAULT_STATIONS);
            if (activeStation.id === 'custom') {
                setActiveStation(DEFAULT_STATIONS[0]);
            }
        }
    }, [tracks]);

    // Safety fallback: if streamUrls is empty or invalid, fallback to empty string
    const currentStreamUrl = activeStation?.streamUrls?.[trackIndex] || '';

    // Handle Playback Logic & URL Changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3;

            // If music is NOT enabled, simply pause
            if (!musicEnabled) {
                audioRef.current.pause();
                return;
            }

            // Always force a load when the URL changes or music is toggled ON to ensure the buffer resets
            audioRef.current.load();

            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setPlayError(false);
                }).catch(e => {
                    console.error("Audio Global block:", e);
                    setPlayError(true);
                });
            }
        }
    }, [musicEnabled, currentStreamUrl]);

    const handleTrackEnd = () => {
        if (activeStation.streamUrls.length > 1) {
            setTrackIndex((prevIndex) => (prevIndex + 1) % activeStation.streamUrls.length);
        }
    };

    const forcePlay = () => {
        if (audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setPlayError(false)).catch(e => setPlayError(true));
            }
        }
    };

    const toggleMusic = () => {
        setMusicEnabled(!musicEnabled);
    };

    const changeStation = (station) => {
        setActiveStation(station);
        setTrackIndex(0);
        if (!musicEnabled) {
            setMusicEnabled(true);
        }
    };

    // If user logs out, stop music
    useEffect(() => {
        if (!session) {
            setMusicEnabled(false);
        }
    }, [session]);

    return (
        <AudioContext.Provider value={{
            stations,
            activeStation,
            trackIndex,
            musicEnabled,
            playError,
            toggleMusic,
            changeStation,
            forcePlay,
            setMusicEnabled
        }}>
            {/* The global hidden audio element */}
            <audio
                ref={audioRef}
                src={currentStreamUrl}
                preload="auto"
                onEnded={handleTrackEnd}
                loop={activeStation?.streamUrls?.length === 1}
            />
            {children}
        </AudioContext.Provider>
    );
};

export const useGlobalAudio = () => {
    return useContext(AudioContext);
};
