import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { setPlayer1Pokemon, setPlayer2Pokemon, setAllPokemon, setLoading, setError } from '../store/pokemonSlice';
import { startBattle } from '../store/battleSlice';
import PokemonSelector from '../components/PokemonSelector';
import StatControls from '../components/StatControls';
import MovesSelector from '../components/MovesSelector';
import { fetchAllPokemon } from '../api/pokeApi';

// Memoized component versions
const MemoizedStatControls = React.memo(StatControls);
const MemoizedMovesSelector = React.memo(MovesSelector);

const SetupPage = () => {
  console.log('SetupPage render');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoadingState] = useState(true);
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const fileInputRef = useRef(null);
  
  const { player1Pokemon, player2Pokemon } = useSelector(state => state.pokemon);
  
  // For debugging
  useEffect(() => {
    console.log('SetupPage mounted');
    
    return () => {
      console.log('SetupPage unmounted');
    };
  }, []);
  
  // Track Pokemon changes
  useEffect(() => {
    console.log("Pokemon 1 changed:", player1Pokemon?.name);
  }, [player1Pokemon]);
  
  useEffect(() => {
    console.log("Pokemon 2 changed:", player2Pokemon?.name);
  }, [player2Pokemon]);

  useEffect(() => {
    const loadPokemon = async () => {
      console.log('Starting Pokemon list load');
      try {
        setIsLoadingState(true);
        setLoadError(null);
        dispatch(setLoading(true));
        
        const pokemonList = await fetchAllPokemon();
        console.log(`Received Pokemon list: ${pokemonList.length} items.`);
        
        if (!pokemonList || pokemonList.length === 0) {
          throw new Error('Failed to load Pokemon list');
        }
        
        dispatch(setAllPokemon(pokemonList));
        console.log('Pokemon list successfully saved to store');
      } catch (err) {
        console.error('Error loading Pokemon:', err);
        dispatch(setError('Error loading Pokemon data'));
        setLoadError('Failed to load Pokemon data. Please try refreshing the page.');
      } finally {
        setIsLoadingState(false);
        dispatch(setLoading(false));
      }
    };

    loadPokemon();
  }, [dispatch]);

  // Wrap handlers in useCallback
  const handleSetPlayer1Pokemon = useCallback((pokemon) => {
    console.log('(Callback) Setting Pokemon for Player 1:', pokemon?.name);
    try {
      if (!pokemon || !pokemon.id) {
        console.error('(Callback) Attempt to set invalid Pokemon for Player 1');
        setLoadError('Invalid Pokemon data for Player 1.');
        return;
      }
      setPlayer1Ready(false);
      // Additional checks can be kept or removed if PokemonSelector is trusted
      dispatch(setPlayer1Pokemon(pokemon));
      setLoadError(null);
      console.log('(Callback) Pokemon for Player 1 set successfully:', pokemon.name);
    } catch (err) {
      console.error('(Callback) Error setting Pokemon for Player 1:', err);
      setLoadError(`Error setting Pokemon for Player 1: ${err.message}`);
    }
  }, [dispatch]); // Dependency only on dispatch
  
  const handleSetPlayer2Pokemon = useCallback((pokemon) => {
    console.log('(Callback) Setting Pokemon for Player 2:', pokemon?.name);
    try {
      if (!pokemon || !pokemon.id) {
        console.error('(Callback) Attempt to set invalid Pokemon for Player 2');
        setLoadError('Invalid Pokemon data for Player 2.');
        return;
      }
      setPlayer2Ready(false);
      dispatch(setPlayer2Pokemon(pokemon));
      setLoadError(null); 
      console.log('(Callback) Pokemon for Player 2 set successfully:', pokemon.name);
    } catch (err) {
      console.error('(Callback) Error setting Pokemon for Player 2:', err);
      setLoadError(`Error setting Pokemon for Player 2: ${err.message}`);
    }
  }, [dispatch]); // Dependency only on dispatch

  const handleStartBattle = () => {
    console.log('Starting battle!');
    try {
      // Check for data before starting the battle
      if (!player1Pokemon || !player2Pokemon) {
        console.error('Cannot start battle: Pokemon not selected');
        setLoadError('Select Pokemon for both players before starting the battle');
        return;
      }
      
      // Check for moves
      if (!player1Pokemon.moves || player1Pokemon.moves.length === 0) {
        console.error('Player 1 Pokemon has no moves');
        setLoadError('Player 1 Pokemon has no moves. Choose another Pokemon');
        return;
      }
      
      if (!player2Pokemon.moves || player2Pokemon.moves.length === 0) {
        console.error('Player 2 Pokemon has no moves');
        setLoadError('Player 2 Pokemon has no moves. Choose another Pokemon');
        return;
      }
      
      dispatch(startBattle());
      console.log('Navigating to battle page');
      navigate('/battle');
    } catch (err) {
      console.error('Error starting battle:', err);
      setLoadError(`Error starting battle: ${err.message}`);
    }
  };

  // --- Load Replay Logic ---
  const handleLoadReplayClick = () => {
    fileInputRef.current.click(); // Trigger file input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const replayData = JSON.parse(e.target.result);
        
        // Basic validation
        if (!replayData.player1Pokemon || !replayData.player2Pokemon || !replayData.battleLog) {
          throw new Error('Invalid replay file format. Missing required data.');
        }
        
        // Further validation (optional but recommended)
        if (!Array.isArray(replayData.battleLog)) {
           throw new Error('Invalid replay file format. battleLog must be an array.');
        }
        
        // TODO: Add more detailed validation for pokemon and log structure if needed

        console.log('Replay data loaded successfully:', replayData);
        navigate('/replay', { state: replayData }); // Navigate with data

      } catch (error) {
        console.error('Error loading or parsing replay file:', error);
        setLoadError(`Failed to load replay: ${error.message}`); 
      } finally {
         // Reset file input value to allow loading the same file again
         if (fileInputRef.current) {
            fileInputRef.current.value = null;
         }
      }
    };
    reader.onerror = (e) => {
        console.error('Error reading file:', e);
        setLoadError('Error reading the replay file.');
    };
    reader.readAsText(file);
  };
  // --- End Load Replay Logic ---

  const bothPlayersReady = player1Ready && player2Ready;

  if (isLoading) {
    return <LoadingContainer>Loading Pokemon data...</LoadingContainer>;
  }
  
  if (loadError) {
    return <ErrorContainer>
      <ErrorMessage>{loadError}</ErrorMessage>
      <RetryButton onClick={() => window.location.reload()}>
        Refresh Page
      </RetryButton>
    </ErrorContainer>;
  }

  return (
    <SetupContainer>
      <h1>Pokemon Setup</h1>
      
      <PlayersContainer>
        <PlayerColumn>
          <h2>Player 1</h2>
          <PokemonSelector 
            playerId={1}
            onPokemonSelected={handleSetPlayer1Pokemon}
          />
          <MemoizedStatControls playerId={1} pokemon={player1Pokemon} />
          <MemoizedMovesSelector playerId={1} pokemon={player1Pokemon} />
          {player1Pokemon && (
            <SetupButton
              className={player1Ready ? 'ready' : ''}
              onClick={() => {
                console.log('Player 1 ready');
                setPlayer1Ready(true);
              }}
              disabled={player1Ready}
            >
              {player1Ready ? 'Ready!' : 'Ready'}
            </SetupButton>
          )}
        </PlayerColumn>
        
        <PlayerColumn>
          <h2>Player 2</h2>
          <PokemonSelector 
            playerId={2}
            onPokemonSelected={handleSetPlayer2Pokemon}
          />
          <MemoizedStatControls playerId={2} pokemon={player2Pokemon} />
          <MemoizedMovesSelector playerId={2} pokemon={player2Pokemon} />
          {player2Pokemon && (
            <SetupButton
              className={player2Ready ? 'ready' : ''}
              onClick={() => {
                console.log('Player 2 ready');
                setPlayer2Ready(true);
              }}
              disabled={player2Ready}
            >
              {player2Ready ? 'Ready!' : 'Ready'}
            </SetupButton>
          )}
        </PlayerColumn>
      </PlayersContainer>
      
      <ActionButtonsContainer>
        <StartBattleButton
          onClick={handleStartBattle}
          disabled={!bothPlayersReady}
        >
          Start Battle!
        </StartBattleButton>
        
        <input 
          type="file" 
          accept=".json" 
          style={{ display: 'none' }} 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        
        <LoadReplayButton onClick={handleLoadReplayClick}>
          Load Replay
        </LoadReplayButton>
      </ActionButtonsContainer>
      
      {loadError && !isLoading && (
        <GlobalErrorContainer>
          <ErrorMessage>{loadError}</ErrorMessage>
        </GlobalErrorContainer>
      )}
    </SetupContainer>
  );
};

const SetupContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PlayersContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlayerColumn = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const SetupButton = styled.button`
  padding: 10px 20px;
  background-color: #4a69bd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.65 : 1};
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.15s ease;
  width: 100%;
  margin-top: 20px;

  &:hover:not([disabled]) {
    background-color: #5d79cc;
  }

  &:active:not([disabled]) {
    background-color: #3b5bb5;
  }
  
  &.ready {
    background-color: #2ebf4f;
    cursor: default;
  }
  
  &.ready:hover {
     background-color: #2ebf4f;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px; 
  margin-top: 20px;
`;

const LoadReplayButton = styled(SetupButton)`
  margin-top: 0;
  width: auto;
  background-color: #6c757d;

  &:hover:not([disabled]) {
    background-color: #5a6268;
  }
  
  &:active:not([disabled]) {
    background-color: #545b62;
  }
`;

const GlobalErrorContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #ffebee;
  border: 1px solid #d32f2f;
  border-radius: 4px;
  text-align: center;
`;

const StartBattleButton = styled(SetupButton)`
  margin-top: 0;
  width: auto;
  background-color: #e64a4a;

  &:hover:not([disabled]) {
    background-color: #ec5e5e;
  }
  
  &:active:not([disabled]) {
    background-color: #dd3a3a;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 18px;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: #0b7dda;
  }
`;

export default SetupPage; 