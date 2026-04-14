import React from 'react';

const MatchmakingScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-xl">Searching for an opponent...</p>
            <button className="mt-8 text-slate-400 hover:text-white transition-colors">
                Cancel Matchmaking
            </button>
        </div>
    );
};

export default MatchmakingScreen;
