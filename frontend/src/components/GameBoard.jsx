import React from 'react';

const GameBoard = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <div className="flex justify-between w-64 mb-4">
                <span className="font-bold text-primary-400">Player 1 (X)</span>
                <span className="text-slate-400">vs</span>
                <span className="font-bold text-accent-500">Player 2 (O)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-slate-800 p-2 rounded-lg shadow-xl">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-3xl font-bold cursor-pointer transition-colors">
                    </div>
                ))}
            </div>
            <p className="mt-6 text-xl">Current Turn: <span className="text-primary-400">X</span></p>
        </div>
    );
};

export default GameBoard;
