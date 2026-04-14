import React from 'react';

const LoginScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <h1 className="text-4xl font-bold mb-8">Tic-Tac-Toe Multiplayer</h1>
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                <input 
                    type="text" 
                    placeholder="Enter your username"
                    className="bg-slate-700 border border-slate-600 rounded p-2 mb-4 w-64 block focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-4 rounded w-full transition-all">
                    Join Game
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
