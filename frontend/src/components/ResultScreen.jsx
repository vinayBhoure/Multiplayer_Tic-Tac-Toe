import React from 'react';

const ResultScreen = ({ winner }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <h2 className="text-5xl font-bold mb-4 text-primary-400">
                {winner ? `Winner: ${winner}` : "It's a Draw!"}
            </h2>
            <button className="mt-8 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95">
                Play Again
            </button>
        </div>
    );
};

export default ResultScreen;
