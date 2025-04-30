import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ArenaView from '../components/ArenaView';
import BattleLog from '../components/BattleLog';
import PokemonStatusBar from '../components/PokemonStatusBar';

const BattleLayout = styled.div`
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const LogPanel = styled.aside`
  width: 300px;
  flex-shrink: 0;
  max-height: 80vh;
  overflow-y: auto;
  background-color: #ffffff;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

const MainBattleArea = styled.div`
  flex-grow: 1;
  max-width: 1000px;
`;

const StatusBarsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ReplayControls = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const TurnInfo = styled.div`
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const ReplayButton = styled.button`
  padding: 10px 20px;
  background-color: #4a5cd6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.65 : 1};
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.15s ease;

  &:hover:not([disabled]) {
    background-color: #5e6cdb;
  }

  &:active:not([disabled]) {
    background-color: #3e4eaf;
  }
`;

const SliderContainer = styled.div`
  padding: 0 10px;
`;

const ReplaySlider = styled.input`
  width: 100%;
  cursor: pointer;
`;

const ExtraButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
`;

// Function to calculate the state of Pokemon at a specific turn in the replay
const calculateReplayPokemonsState = (initialPokemon1, initialPokemon2, battleLog, turnIndex) => {
  // Deep copy to avoid mutating the original objects from Redux
  let currentPokemon1 = JSON.parse(JSON.stringify(initialPokemon1));
  let currentPokemon2 = JSON.parse(JSON.stringify(initialPokemon2));

  // Set initial HP (in case it's missing in initialPokemon)
  if (!currentPokemon1.maxHp) currentPokemon1.maxHp = currentPokemon1.currentHp || 100;
  if (!currentPokemon2.maxHp) currentPokemon2.maxHp = currentPokemon2.currentHp || 100;
  currentPokemon1.currentHp = currentPokemon1.maxHp;
  currentPokemon2.currentHp = currentPokemon2.maxHp;

  // Replay the log up to the current turn
  for (let i = 0; i <= turnIndex; i++) {
    const event = battleLog[i];
    if (!event) continue;

    // Update HP based on log data (preferably using HpAfter)
    if (event.defenderHpAfter !== undefined) {
      if (event.actor === 1) { // Player 1 attacked, update Player 2 HP
        currentPokemon2.currentHp = event.defenderHpAfter;
      } else { // Player 2 attacked, update Player 1 HP
        currentPokemon1.currentHp = event.defenderHpAfter;
      }
    } else if (event.damage !== undefined && event.actor !== undefined) {
        // Fallback: subtract damage (less accurate)
        if (event.actor === 1) {
            currentPokemon2.currentHp = Math.max(0, (currentPokemon2.currentHp || currentPokemon2.maxHp) - event.damage);
        } else {
            currentPokemon1.currentHp = Math.max(0, (currentPokemon1.currentHp || currentPokemon1.maxHp) - event.damage);
        }
    }
  }

  return { pokemon1: currentPokemon1, pokemon2: currentPokemon2 };
};

const ReplayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data directly from location state passed during navigation
  const replayData = location.state;
  const initialPlayer1Pokemon = replayData?.player1Pokemon;
  const initialPlayer2Pokemon = replayData?.player2Pokemon;
  const battleLog = replayData?.battleLog;

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInterval, setPlaybackInterval] = useState(null);
  const [error, setError] = useState(null); // Add error state

  // Check if we have valid data from state, otherwise redirect
  useEffect(() => {
    if (!initialPlayer1Pokemon || !initialPlayer2Pokemon || !battleLog || !Array.isArray(battleLog) || battleLog.length === 0) {
      console.error('Invalid or missing replay data in location state. Redirecting...');
      // Optionally set an error message before redirecting
      // setError('Failed to load replay data. Returning to setup.'); 
      // Use a timeout to allow user to see message (optional)
      // setTimeout(() => navigate('/'), 2000);
      navigate('/'); 
    }
  }, [initialPlayer1Pokemon, initialPlayer2Pokemon, battleLog, navigate]);
  
  // Manage automatic playback
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTurnIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= battleLog.length) {
            setIsPlaying(false);
            return prev;
          }
          return nextIndex;
        });
      }, 1500);
      
      setPlaybackInterval(interval);
      
      return () => clearInterval(interval);
    } else if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
  }, [isPlaying, battleLog]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevTurn = () => {
    if (currentTurnIndex > 0) {
      setCurrentTurnIndex(currentTurnIndex - 1);
    }
  };

  const handleNextTurn = () => {
    if (currentTurnIndex < battleLog.length - 1) {
      setCurrentTurnIndex(currentTurnIndex + 1);
    }
  };

  const handleSliderChange = (e) => {
    setCurrentTurnIndex(Number(e.target.value));
  };

  const handleExport = () => {
    // Use the initial data loaded from the state for export
    if (!initialPlayer1Pokemon || !initialPlayer2Pokemon || !battleLog) {
      console.error("Cannot export replay: Data is missing.");
      return;
    }
    const replayDataToExport = {
      player1Pokemon: initialPlayer1Pokemon,
      player2Pokemon: initialPlayer2Pokemon,
      battleLog
    };
    
    const jsonString = JSON.stringify(replayDataToExport, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    // Suggest a filename based on Pokemon names
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `replay-${initialPlayer1Pokemon.name}-vs-${initialPlayer2Pokemon.name}-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Display loading or error state if data is not ready yet or invalid
  if (!battleLog || battleLog.length === 0 || !initialPlayer1Pokemon || !initialPlayer2Pokemon) {
     // This check might be redundant due to the useEffect redirect, but good as a safeguard
    return <LoadingContainer>{error || 'Loading replay...'}</LoadingContainer>; 
  }

  // Get the current event to display
  // Ensure currentTurnIndex is valid before accessing battleLog
  const safeTurnIndex = Math.max(0, Math.min(currentTurnIndex, battleLog.length - 1));
  const currentEvent = battleLog[safeTurnIndex] || {}; // Provide default empty object
  const isPlayer1Turn = currentEvent?.actor === 1;

  // Calculate the current state of the Pokemon for the replay
  // Pass the validated initial Pokemon data
  const { pokemon1: pokemon1ForDisplay, pokemon2: pokemon2ForDisplay } = 
    calculateReplayPokemonsState(initialPlayer1Pokemon, initialPlayer2Pokemon, battleLog, safeTurnIndex);

  return (
    <BattleLayout>
      <LogPanel>
        <h2>Replay Log</h2>
        {/* Pass only the relevant portion of the log */}
        <BattleLog battleLog={battleLog.slice(0, safeTurnIndex + 1)} /> 
      </LogPanel>
      
      <MainBattleArea>
        <h1>Replay View</h1>
        
        {/* Add status bars */}
        <StatusBarsContainer>
          {/* Ensure pokemon data is valid before passing */}
          {pokemon1ForDisplay && <PokemonStatusBar pokemon={pokemon1ForDisplay} playerId={1} />} 
          {pokemon2ForDisplay && <PokemonStatusBar pokemon={pokemon2ForDisplay} playerId={2} />} 
        </StatusBarsContainer>
      
        <ArenaView 
          player1Pokemon={pokemon1ForDisplay} 
          player2Pokemon={pokemon2ForDisplay}
          battleEvent={currentEvent}
          isPlayer1Turn={isPlayer1Turn}
          isReplay={true}
        />
      
        <ReplayControls>
          <TurnInfo>
            {/* Ensure battleLog has length before accessing */}
            Turn {safeTurnIndex + 1} of {battleLog.length} 
          </TurnInfo>
          
          <ControlButtons>
            <ReplayButton onClick={handlePrevTurn} disabled={safeTurnIndex === 0}>
              ⏮ Prev
            </ReplayButton>
            
            <ReplayButton onClick={handlePlayPause}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </ReplayButton>
            
            <ReplayButton onClick={handleNextTurn} disabled={safeTurnIndex === battleLog.length - 1}>
              Next ⏭
            </ReplayButton>
          </ControlButtons>
          
          <SliderContainer>
            <ReplaySlider 
              type="range" 
              min="0" 
              max={battleLog.length - 1} 
              value={safeTurnIndex} // Use safe index
              onChange={handleSliderChange}
            />
          </SliderContainer>
        </ReplayControls>
      
        <ExtraButtons>
          <ReplayButton onClick={handleExport}>
            Export Replay
          </ReplayButton>
          
          <ReplayButton onClick={handleBack}>
            Back to Menu
          </ReplayButton>
        </ExtraButtons>
      </MainBattleArea>
    </BattleLayout>
  );
};

const ReplayContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

export default ReplayPage;