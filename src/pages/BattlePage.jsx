import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { nextTurn, addBattleEvent, setAutoMode, finishBattle, resetBattle } from '../store/battleSlice';
import { updatePlayer1PokemonStats, updatePlayer2PokemonStats } from '../store/pokemonSlice';
import PokemonStatusBar from '../components/PokemonStatusBar';
import ArenaView from '../components/ArenaView';
import BattleLog from '../components/BattleLog';
import { calculateDamage } from '../utils/battleCalculator';

// --- STYLES ---
const BattleLayout = styled.div`
  display: flex;
  gap: 20px;
  max-width: 1400px; // Increased max width for the log
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const MainBattleArea = styled.div`
  flex-grow: 1; // Main area takes remaining space
  max-width: 1000px;
`;

// --- Status and Controls ---
const StatusBarsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

// New style for BattleButton
const BattleButton = styled.button`
  padding: 10px 20px;
  background-color: #4a5cd6; // Solid blue color
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.65 : 1}; // Slightly darker inactive state
  font-size: 16px;
  font-weight: 500; // Slightly bolder font
  text-align: center;
  transition: background-color 0.15s ease; // Fast transition

  // Removed shadows and gradients

  &:hover:not([disabled]) {
    background-color: #5e6cdb; // Slightly lighter on hover
  }

  &:active:not([disabled]) {
      background-color: #3e4eaf; // Slightly darker on press
  }
`;

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
`;

const BattlePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [autoPlayInterval, setAutoPlayInterval] = useState(null);
  
  const battle = useSelector((state) => state.battle);
  const { player1Pokemon, player2Pokemon } = useSelector((state) => state.pokemon);
  
  const { turnIndex, isAutoMode, battleLog, isPlayer1Turn, isBattleStarted, isBattleFinished } = battle;

  // Check if Pokemon are selected
  useEffect(() => {
    if (!player1Pokemon || !player2Pokemon) {
      navigate('/');
    }
  }, [player1Pokemon, player2Pokemon, navigate]);

  // Auto battle mode
  useEffect(() => {
    if (isAutoMode && !isBattleFinished) {
      const interval = setInterval(() => {
        handleNextTurn();
      }, 2000);
      
      setAutoPlayInterval(interval);
      
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isAutoMode, isBattleFinished]);

  // Check for battle end
  useEffect(() => {
    if (isBattleStarted && (player1Pokemon?.currentHp <= 0 || player2Pokemon?.currentHp <= 0)) {
      dispatch(finishBattle());
    }
  }, [player1Pokemon?.currentHp, player2Pokemon?.currentHp, isBattleStarted, dispatch]);

  const handleNextTurn = () => {
    console.log(`%c[Turn ${turnIndex + 1}] Starting turn... Player ${isPlayer1Turn ? 1 : 2}'s move.`, 'color: blue; font-weight: bold;');
    
    const actingPokemon = isPlayer1Turn ? player1Pokemon : player2Pokemon;
    const targetPokemon = isPlayer1Turn ? player2Pokemon : player1Pokemon;
    
    if (!actingPokemon || !targetPokemon) {
        console.error('[Turn Error] Missing acting or target pokemon.');
        return;
    }
    
    if (isBattleFinished) {
        console.warn('[Turn Info] Battle is already finished. Turn skipped.');
        return;
    }
    
    console.log(`[Turn Info] Attacker: ${actingPokemon.name} (HP: ${actingPokemon.currentHp})`);
    console.log(`[Turn Info] Defender: ${targetPokemon.name} (HP: ${targetPokemon.currentHp})`);
    
    // Select a random available move
    const availableMoves = actingPokemon.moves?.filter(move => move.pp > 0);
    
    if (!availableMoves || availableMoves.length === 0) {
      console.warn(`[Turn Warn] ${actingPokemon.name} has no available moves (no PP left).`);
      // Pokemon can't attack, skip turn? Or end battle?
      // For now, just skip the attacker's turn.
      dispatch(addBattleEvent({
          turn: turnIndex,
          actor: isPlayer1Turn ? 1 : 2,
          message: `${actingPokemon.name} can't move!`
      }));
      dispatch(nextTurn()); // Pass turn to the other player
      return;
    }
    
    const selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    console.log(`[Turn Action] ${actingPokemon.name} uses ${selectedMove.name} (PP: ${selectedMove.pp - 1})`);
    
    // Calculate damage
    console.log('[Turn Calc] Calculating damage...');
    const { damage, isCrit, effectiveness } = calculateDamage(actingPokemon, targetPokemon, selectedMove);
    console.log(`[Turn Calc] Damage calculated: ${damage}, Crit: ${isCrit}, Effectiveness: ${effectiveness}`);
    
    // Update move PP
    const updatedMoves = actingPokemon.moves.map(move => 
      move.name === selectedMove.name ? { ...move, pp: Math.max(0, move.pp - 1) } : move // Ensure PP doesn't go negative
    );
    
    // Update Pokemon stats
    const newTargetHp = Math.max(0, targetPokemon.currentHp - damage);
    console.log(`[Turn Update] Updating ${targetPokemon.name} HP from ${targetPokemon.currentHp} to ${newTargetHp}`);
    console.log(`[Turn Update] Updating ${actingPokemon.name} moves (PP change)`);
    
    try {
        if (isPlayer1Turn) {
          dispatch(updatePlayer1PokemonStats({ moves: updatedMoves }));
          dispatch(updatePlayer2PokemonStats({ currentHp: newTargetHp }));
        } else {
          dispatch(updatePlayer2PokemonStats({ moves: updatedMoves }));
          dispatch(updatePlayer1PokemonStats({ currentHp: newTargetHp }));
        }
        console.log('[Turn Update] Pokemon stats dispatched successfully.');
    } catch (error) {
        console.error('[Turn Error] Error dispatching pokemon stats update:', error);
    }
    
    // Add event to battle log
    const battleEvent = {
      turn: turnIndex,
      actor: isPlayer1Turn ? 1 : 2,
      move: selectedMove.name,
      damage,
      isCrit,
      effectiveness,
      defenderHpBefore: targetPokemon.currentHp, // Add HP before attack
      defenderHpAfter: newTargetHp, // Add HP after attack
      // statusChanges: [] // Not used yet
    };
    console.log('[Turn Log] Adding event to battle log:', battleEvent);
    dispatch(addBattleEvent(battleEvent));
    
    // Proceed to the next turn
    console.log(`[Turn ${turnIndex + 1}] Ending turn. Switching to Player ${!isPlayer1Turn ? 1 : 2}.`);
    dispatch(nextTurn());
  };

  const toggleAutoMode = () => {
    dispatch(setAutoMode(!isAutoMode));
  };

  const handleRestart = () => {
    dispatch(resetBattle());
    navigate('/');
  };

  const handleReplay = () => {
    if (!player1Pokemon || !player2Pokemon || !battleLog) {
      console.error("Cannot navigate to replay: Missing necessary data.");
      // Optionally show an error to the user
      return;
    }
    console.log("Navigating to replay with state:", { player1Pokemon, player2Pokemon, battleLog });
    // Pass the Pokemon state along with the log
    // ReplayPage expects these keys: player1Pokemon, player2Pokemon, battleLog
    navigate('/replay', { 
        state: { 
            player1Pokemon: player1Pokemon, 
            player2Pokemon: player2Pokemon, 
            battleLog: battleLog 
        } 
    });
  };

  if (!player1Pokemon || !player2Pokemon) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  return (
    <BattleLayout>
      <LogPanel>
        <h2>Battle Log</h2>
        <BattleLog battleLog={battleLog} />
      </LogPanel>
      
      <MainBattleArea>
        <StatusBarsContainer>
          <PokemonStatusBar pokemon={player1Pokemon} playerId={1} />
          <PokemonStatusBar pokemon={player2Pokemon} playerId={2} />
        </StatusBarsContainer>
        
        <ArenaView 
          player1Pokemon={player1Pokemon} 
          player2Pokemon={player2Pokemon}
          battleEvent={battleLog[battleLog.length - 1]}
          isPlayer1Turn={isPlayer1Turn}
        />
        
        <ControlsContainer>
          {!isBattleFinished ? (
            <>
              <BattleButton onClick={handleNextTurn} disabled={isAutoMode}>
                Next Turn
              </BattleButton>
              <BattleButton onClick={toggleAutoMode}>
                {isAutoMode ? 'Pause' : 'Auto Battle'}
              </BattleButton>
            </>
          ) : (
            <ResultContainer>
              <h2>
                {player1Pokemon.currentHp <= 0 
                  ? `${player2Pokemon.name} wins!` 
                  : `${player1Pokemon.name} wins!`}
              </h2>
              <BattleButton onClick={handleReplay}>
                View Replay
              </BattleButton>
            </ResultContainer>
          )}
          <BattleButton onClick={handleRestart}>
            New Battle
          </BattleButton>
        </ControlsContainer>
      </MainBattleArea>
    </BattleLayout>
  );
};

const BattleContainer = styled.div`
  // This container is no longer primary, styles can be moved or removed
  // max-width: 1000px;
  // margin: 0 auto;
  // padding: 20px;
`;

export default BattlePage;