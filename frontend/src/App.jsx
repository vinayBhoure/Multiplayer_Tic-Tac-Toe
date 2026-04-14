import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';

import { useGameStore } from './gameStore';
import { nakamaClient } from './nakamaClient';
import LoginBox from './components/LoginBox';
import Matchmaking from './components/Matchmaking';
import GameBoard from './components/GameBoard';
import ResultModal from './components/ResultModal';

function App() {
  const appState = useGameStore((state) => state.appState);
  const processMatchData = useGameStore((state) => state.processMatchData);

  React.useEffect(() => {
    // Pipe all global match data straight into the store's authoritative parser
    nakamaClient.onMatchData = (matchData) => {
      try {
        const payloadStr = new TextDecoder().decode(matchData.data);
        const payload = JSON.parse(payloadStr);

        processMatchData(payload);
      } catch (err) {

      }
    };
  }, [processMatchData]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      <ToastContainer />
      
      <AnimatePresence mode="wait">
        {appState === 'LOGIN' && <LoginBox key="login" />}
        {appState === 'MATCHMAKING' && <Matchmaking key="matchmaking" />}
        {(appState === 'PLAYING' || appState === 'GAME_OVER') && (
          <React.Fragment key="game">
            <GameBoard />
            {appState === 'GAME_OVER' && <ResultModal />}
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
