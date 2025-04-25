import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components';
import { updatePlayer1PokemonStats, updatePlayer2PokemonStats } from '../store/pokemonSlice';
import { fetchPokemonMoves } from '../api/pokeApi';
import React from 'react';

// Flat style for Input (copied from other components)
const flatInputStyle = css`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da; 
  background-color: white;
  font-size: 16px;
  transition: border-color 0.15s ease-in-out;
  /* box-shadow: none; */

  &:focus {
    border-color: #80bdff;
    outline: 0;
    /* box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); Remove focus shadow */
  }
`;

const MovesSelector = ({ playerId, pokemon }) => {
  // --- LOGGING --- Added
  console.log(`%cMovesSelector (${playerId}) RENDERED. Pokemon prop:`, 'color: purple; font-weight: bold;', pokemon ? { ...pokemon } : null);
  // -----------------

  const dispatch = useDispatch();
  
  // Protection against context loss errors during mount/unmount
  const isMounted = React.useRef(true);
  const pokemonRef = React.useRef(pokemon);
  
  // Update the pokemon reference when it changes
  React.useEffect(() => {
    pokemonRef.current = pokemon;
  }, [pokemon]);
  
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const [availableMoves, setAvailableMoves] = useState([]);
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // For debugging
  useEffect(() => {
    console.log(`MovesSelector mounted for player ${playerId}`);
    console.log('Initial pokemon data:', pokemon?.name || 'no pokemon');

    return () => {
      console.log(`MovesSelector unmounted for player ${playerId}`);
    };
  }, [playerId]);

  // For tracking changes in pokemon
  useEffect(() => {
    console.log(`Pokemon changed for player ${playerId}:`, pokemon?.name || 'no pokemon');
  }, [pokemon, playerId]);

  // Load pokemon moves
  useEffect(() => {
    // --- LOGGING --- Added
    console.log(`%cMovesSelector (${playerId}) LOAD MOVES EFFECT. Pokemon ID: ${pokemon?.id}`, 'color: orange;');
    // -----------------
    
    const loadMoves = async () => {
      if (!pokemon) {
        console.log(`No pokemon for player ${playerId}, skipping moves load`);
        return;
      }
      
      console.log(`Loading moves for pokemon ${playerId}:`, pokemon.id);
      
      if (!pokemon.id) {
        console.error('Pokemon has no ID, cannot load moves');
        
        // Add a basic move even if there's no ID
        const defaultMoves = [{
          name: 'Tackle',
          power: 40,
          accuracy: 100,
          type: pokemon.types?.[0] || 'normal',
          pp: 35,
          category: 'Physical',
          priority: 0
        }];
        
        console.log('Setting basic move due to missing ID');
        setAvailableMoves(defaultMoves);
        setSelectedMoves(defaultMoves);
        setError(null);
        
        // Update pokemon moves in the store
        try {
          const updateAction = playerId === 1
            ? updatePlayer1PokemonStats({ moves: defaultMoves })
            : updatePlayer2PokemonStats({ moves: defaultMoves });
            
          dispatch(updateAction);
        } catch (err) {
          console.error('Error setting basic move:', err);
        }
        return;
      }
      
      // If the pokemon already has moves, use them
      if (pokemon.moves && Array.isArray(pokemon.moves) && pokemon.moves.length > 0) {
        console.log(`Pokemon ${pokemon.name} already has ${pokemon.moves.length} moves, using them`);
        
        // Use existing moves, but also set them as available
        if (isMounted.current) {
          setSelectedMoves(pokemon.moves);
          setAvailableMoves(pokemon.moves); // Set existing moves as available as well
          setIsLoading(false);
          setError(null);
        }
        
        // Request additional moves to display in available, but don't block the UI
        setTimeout(async () => {
          try {
            console.log(`Requesting additional moves for ${pokemon.name}`);
            const moves = await fetchPokemonMoves(pokemon.id);
            
            if (isMounted.current && moves?.length > 0) {
              // Merge existing moves with those obtained from the API and remove duplicates
              const uniqueMoves = [...pokemon.moves];
              
              moves.forEach(move => {
                if (!uniqueMoves.some(m => m.name === move.name)) {
                  uniqueMoves.push(move);
                }
              });
              
              setAvailableMoves(uniqueMoves);
            }
          } catch (err) {
            console.error('Error loading additional moves:', err);
          }
        }, 100);
        
        return;
      }
      
      // If there are no moves, load them
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Starting move load for pokemon ${pokemon.id}`);
        
        // Use a local basic move to avoid blocking the UI
        const basicMove = {
          name: 'Tackle',
          power: 40,
          accuracy: 100,
          type: pokemon.types?.[0] || 'normal',
          pp: 35,
          category: 'Physical',
          priority: 0
        };
        
        // Set the basic move immediately so the user can proceed without delay
        if (isMounted.current) {
          const initialMoves = [basicMove];
          setSelectedMoves(initialMoves);
          setAvailableMoves(initialMoves);
          
          try {
            const updateAction = playerId === 1
              ? updatePlayer1PokemonStats({ moves: initialMoves })
              : updatePlayer2PokemonStats({ moves: initialMoves });
            
            dispatch(updateAction);
          } catch (updateErr) {
            console.error('Error setting initial moves:', updateErr);
          }
        }
        
        // Now try to get moves from the API
        const moves = await fetchPokemonMoves(pokemon.id);
        
        // Check if the component is still mounted
        if (!isMounted.current) {
          console.log('Component unmounted, cancelling state update');
          return;
        }
        
        if (!moves || !Array.isArray(moves) || moves.length === 0) {
          console.log('Received empty move list, using only basic move');
          setIsLoading(false);
          return; // Already set the basic move above
        }
        
        console.log(`Received moves for pokemon ${pokemon.id}:`, moves.length);
        
        // Select the first 4 moves by default, or fewer if less are available
        const defaultMoves = moves.slice(0, Math.min(4, moves.length)).map(move => ({
          name: move.name || 'Unknown Move',
          power: move.power || 0,
          accuracy: move.accuracy || 100,
          type: move.type || 'normal',
          pp: move.pp || 10,
          category: move.category || 'Physical',
          priority: move.priority || 0
        }));
        
        console.log('Created default moves:', defaultMoves);
        
        if (isMounted.current) {
          setAvailableMoves(moves);
          setSelectedMoves(defaultMoves);
          
          // Update the pokemon with initial moves, but handle in a separate try-catch
          try {
            const updateAction = playerId === 1
              ? updatePlayer1PokemonStats({ moves: defaultMoves })
              : updatePlayer2PokemonStats({ moves: defaultMoves });
            
            console.log('Updating pokemon moves in store');
            dispatch(updateAction);
          } catch (err) {
            console.error('Error updating moves in store:', err);
          }
        }
      } catch (error) {
        console.error('Error loading moves:', error);
        
        if (isMounted.current) {
          setError(`Error loading moves: ${error.message}`);
          
          // Already set the basic move above, no need to set it again
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadMoves();
  }, [pokemon?.id, dispatch, playerId]);

  // Update moves in redux when selected moves change
  useEffect(() => {
    if (selectedMoves.length > 0) {
      try {
        console.log(`Updating pokemon moves in store for player ${playerId}:`, selectedMoves.length);
        const updateAction = playerId === 1
          ? updatePlayer1PokemonStats({ moves: selectedMoves })
          : updatePlayer2PokemonStats({ moves: selectedMoves });
        
        dispatch(updateAction);
      } catch (error) {
        console.error('Error updating moves:', error);
        setError(`Error updating moves: ${error.message}`);
      }
    }
  }, [selectedMoves, dispatch, playerId]);

  // Move selection handler with additional protection
  const handleMoveSelect = useCallback((move) => {
    try {
      if (!move) return;
      
      // Check that no more than 4 moves are selected
      if (selectedMoves.length >= 4 && !selectedMoves.some(m => m.name === move.name)) {
        return;
      }

      // If the move is already selected, remove it
      if (selectedMoves.some(m => m.name === move.name)) {
        setSelectedMoves(prev => prev.filter(m => m.name !== move.name));
      } else {
        // Add the new move
        setSelectedMoves(prev => [
          ...prev, 
          {
            name: move.name || 'Unknown Move',
            power: move.power || 0,
            accuracy: move.accuracy || 100,
            type: move.type || 'normal',
            pp: move.pp || 10,
            category: move.category || 'Physical',
            priority: move.priority || 0
          }
        ]);
      }
    } catch (error) {
      console.error('Error selecting move:', error);
      setError(`Error selecting move: ${error.message}`);
    }
  }, [selectedMoves]);

  // Filter moves by search with error handling
  const filteredMoves = useMemo(() => {
    try {
      return (availableMoves || []).filter(move => 
        move && move.name && move.name.toLowerCase().includes((searchTerm || '').toLowerCase())
      );
    } catch (err) {
      console.error('Error filtering moves:', err);
      return [];
    }
  }, [availableMoves, searchTerm]);

  if (!pokemon) {
    return <EmptyState>Select a Pokemon</EmptyState>;
  }

  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }

  if (isLoading) {
    return <LoadingState>Loading moves...</LoadingState>;
  }

  return (
    <MovesContainer>
      <MovesHeader>Select Moves (max 4)</MovesHeader>
      
      <SearchInput 
        type="text" 
        placeholder="Search move..."
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      
      <SelectedMovesContainer>
        <h4>Selected Moves:</h4>
        {!selectedMoves || selectedMoves.length === 0 ? (
          <EmptyMessage>No moves selected</EmptyMessage>
        ) : (
          <MovesList>
            {selectedMoves.map((move, index) => (
              <MoveCard 
                key={index} 
                onClick={() => handleMoveSelect(move)}
                isSelected={true}
                type={move.type}
              >
                <MoveHeader>
                  <MoveName>{move.name}</MoveName>
                  <MoveType type={move.type}>{move.type}</MoveType>
                </MoveHeader>
                <MoveStats>
                  <MoveStat>Power: {move.power || 'N/A'}</MoveStat>
                  <MoveStat>Accuracy: {move.accuracy}%</MoveStat>
                  <MoveStat>PP: {move.pp}</MoveStat>
                  <MoveStat>Priority: {move.priority}</MoveStat>
                </MoveStats>
              </MoveCard>
            ))}
          </MovesList>
        )}
      </SelectedMovesContainer>
      
      <AvailableMovesContainer>
        <h4>Available Moves:</h4>
        <MovesList>
          {filteredMoves.length > 0 ? filteredMoves.map((move, index) => (
            <MoveCard 
              key={index} 
              onClick={() => handleMoveSelect(move)}
              isSelected={selectedMoves.some(m => m.name === move.name)}
              type={move.type}
            >
              <MoveHeader>
                <MoveName>{move.name}</MoveName>
                <MoveType type={move.type}>{move.type}</MoveType>
              </MoveHeader>
              <MoveStats>
                <MoveStat>Сила: {move.power || 'N/A'}</MoveStat>
                <MoveStat>Точность: {move.accuracy}%</MoveStat>
                <MoveStat>PP: {move.pp}</MoveStat>
                <MoveStat>Приоритет: {move.priority}</MoveStat>
              </MoveStats>
            </MoveCard>
          )) : (
            <EmptyMessage>Ходы не найдены</EmptyMessage>
          )}
        </MovesList>
      </AvailableMovesContainer>
    </MovesContainer>
  );
};

const MovesContainer = styled.div`
  background-color: #ffffff; 
  border-radius: 6px; 
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Усиливаем тень */
`;

const MovesHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
`;

const SearchInput = styled.input`
  ${flatInputStyle} // Применяем плоский стиль
  width: 100%;
  margin-bottom: 15px;
  /* Убираем лишнее */
`;

const SelectedMovesContainer = styled.div`
  margin-bottom: 20px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #444;
  }
`;

const AvailableMovesContainer = styled.div`
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #444;
  }
`;

const MovesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
  background-color: #e9ecef; /* Фон для списка */
  border-radius: 4px;
`;

const getTypeColor = (type) => {
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  
  return typeColors[type?.toLowerCase()] || '#999999';
};

const MoveCard = styled.div`
  padding: 10px;
  /* Более плоское выделение выбранного хода */
  background-color: ${props => props.isSelected ? '#dee2e6' : 'white'}; 
  border-radius: 4px; /* Меньше скругление */
  border: 1px solid ${props => props.isSelected ? '#adb5bd' : '#dee2e6'}; /* Граница для всех, цвет зависит от выбора */
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  /* Убираем hover эффекты с тенью/трансформацией */
  
  &:hover {
    background-color: ${props => props.isSelected ? '#ced4da' : '#f8f9fa'}; /* Меняем фон при наведении */
    border-color: #adb5bd; /* Показываем границу при наведении */
    /* transform: translateY(-2px); */
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  }
`;

const MoveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MoveName = styled.span`
  font-weight: bold;
  text-transform: capitalize;
`;

const MoveType = styled.span`
  padding: 2px 6px;
  background-color: ${props => getTypeColor(props.type)};
  color: white;
  border-radius: 4px;
  font-size: 12px;
  text-transform: capitalize;
`;

const MoveStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  font-size: 13px;
`;

const MoveStat = styled.div`
  color: #555;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #666;
`;

const LoadingState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  color: #666;
`;

const EmptyMessage = styled.div`
  grid-column: 1 / -1;
  padding: 15px;
  text-align: center;
  color: #666;
`;

const ErrorState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #ffebee;
  border-radius: 8px;
  color: #d32f2f;
  margin-bottom: 20px;
`;

export default MovesSelector;