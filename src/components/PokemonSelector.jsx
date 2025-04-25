import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { css } from 'styled-components';
import { setPlayer1Pokemon, setPlayer2Pokemon } from '../store/pokemonSlice';

const PokemonSelector = ({ playerId, onPokemonSelected }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false); // Flag to track selection process

  // Protection against context loss errors during mount/unmount
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const { allPokemon, isLoading } = useSelector((state) => state.pokemon);

  // For tracking changes in the selected pokemon
  useEffect(() => {
    if (selectedPokemon) {
      console.log(`Pokemon selected for player ${playerId}:`, selectedPokemon.name);
    }
  }, [selectedPokemon, playerId]);

  // Filter pokemon when search or type changes
  useEffect(() => {
    if (!allPokemon || allPokemon.length === 0) return;

    try {
      let filtered = [...allPokemon];
      
      // Filter by name
      if (searchTerm) {
        filtered = filtered.filter(pokemon => 
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filter by type
      if (typeFilter) {
        filtered = filtered.filter(pokemon => 
          pokemon.types && pokemon.types.some(type => type.toLowerCase() === typeFilter.toLowerCase())
        );
      }
      
      setFilteredPokemon(filtered);
      setError(null);
    } catch (err) {
      console.error('Error filtering pokemon:', err);
      setError('Error filtering pokemon');
    }
  }, [allPokemon, searchTerm, typeFilter]);

  const handlePokemonSelect = useCallback(async (pokemon) => {
    if (!pokemon || !pokemon.id) {
      console.error('Invalid pokemon selected:', pokemon);
      return;
    }
    
    try {
      setIsSelecting(true); // Set flag indicating selection process is ongoing
      console.log(`Starting pokemon selection (playerId: ${playerId}):`, pokemon?.name);
      
      if (!pokemon) {
        console.error('Empty pokemon selected!');
        setError('Error selecting pokemon: data missing');
        setIsSelecting(false);
        return;
      }
      
      if (!pokemon.stats) {
        console.error('Pokemon is missing stats:', pokemon);
        setError('Error selecting pokemon: missing stats');
        setIsSelecting(false);
        return;
      }

      // Check required fields
      if (!pokemon.types || !Array.isArray(pokemon.types)) {
        console.error('Pokemon is missing types or they are in the wrong format:', pokemon.types);
        pokemon.types = ['normal']; // Set default type
      }

      // Create base moves if they don't exist
      console.log('Moves before processing:', pokemon.moves);
      const defaultMoves = [];
      
      if (!pokemon.moves || !Array.isArray(pokemon.moves) || pokemon.moves.length === 0) {
        console.warn('Pokemon has no moves, creating defaults');
        // Create default move "Tackle"
        defaultMoves.push({
          name: 'Tackle',
          power: 40,
          accuracy: 100,
          type: pokemon.types[0] || 'normal',
          pp: 35,
          category: 'Physical',
          priority: 0
        });
      } else {
        // Take up to 4 moves from the existing ones
        const movesToUse = Math.min(4, pokemon.moves.length);
        console.log(`Taking ${movesToUse} moves from ${pokemon.moves.length} available`);
        
        for (let i = 0; i < movesToUse; i++) {
          const moveName = typeof pokemon.moves[i] === 'string' 
            ? pokemon.moves[i] 
            : (pokemon.moves[i]?.name || 'Unknown Move');
            
          defaultMoves.push({
            name: moveName,
            power: 50,
            accuracy: 100,
            type: pokemon.types[0] || 'normal',
            pp: 10,
            category: 'Physical',
            priority: 0
          });
        }
      }
      
      console.log('Created default moves:', defaultMoves);

      // Check stats
      if (!pokemon.stats.hp && pokemon.stats.hp !== 0) pokemon.stats.hp = 50;
      if (!pokemon.stats.attack && pokemon.stats.attack !== 0) pokemon.stats.attack = 50;
      if (!pokemon.stats.defense && pokemon.stats.defense !== 0) pokemon.stats.defense = 50;
      if (!pokemon.stats['special-attack'] && pokemon.stats['special-attack'] !== 0) pokemon.stats['special-attack'] = 50;
      if (!pokemon.stats['special-defense'] && pokemon.stats['special-defense'] !== 0) pokemon.stats['special-defense'] = 50;
      if (!pokemon.stats.speed && pokemon.stats.speed !== 0) pokemon.stats.speed = 50;

      // Create pokemon instance with default settings
      const pokemonInstance = {
        ...pokemon,
        level: 50, // Default level
        currentHp: calculateHp(pokemon.stats.hp, 50), // Current HP based on base stats and level
        iv: {
          hp: 31,
          attack: 31,
          defense: 31,
          'special-attack': 31,
          'special-defense': 31,
          speed: 31
        },
        ev: {
          hp: 0,
          attack: 0,
          defense: 0,
          'special-attack': 0,
          'special-defense': 0,
          speed: 0
        },
        nature: 'Serious', // Default neutral nature
        ability: pokemon.abilities?.[0] || '',
        item: '',
        moves: defaultMoves
      };
      
      console.log('Created pokemon instance:', pokemonInstance.name);
      
      // First, set the pokemon in the local state
      setSelectedPokemon(pokemonInstance);
      setError(null);
      
      // Then, call the callback which will update the Redux state
      if (onPokemonSelected && typeof onPokemonSelected === 'function') {
        console.log(`Calling onPokemonSelected for player ${playerId}`);
        onPokemonSelected(pokemonInstance);
        console.log('onPokemonSelected called successfully');
      } else {
        console.error('onPokemonSelected is missing or not a function', onPokemonSelected);
      }
      
      // Clear loading flag after successful selection
      setIsSelecting(false);
    } catch (err) {
      console.error('Error selecting pokemon:', err);
      console.error('Error stack:', err.stack);
      setError(`Error selecting pokemon: ${err.message}`);
      setIsSelecting(false);
    }
  }, [onPokemonSelected, playerId]);

  // Function to calculate HP based on base stats and level
  const calculateHp = (baseHp, level) => {
    try {
      if (!baseHp || typeof baseHp !== 'number') {
        console.warn(`Invalid baseHp value: ${baseHp}, using default value 100`);
        return 100; // Default value if baseHp is invalid
      }
      return Math.floor(((2 * baseHp + 31 + Math.floor(0 / 4)) * level) / 100) + level + 10;
    } catch (err) {
      console.error('Error calculating HP:', err);
      return 100; // Safe default value
    }
  };

  // Display loading indicator if pokemon is being selected
  if (isSelecting) {
    return <LoadingState>Loading Pokemon data...</LoadingState>;
  }

  if (isLoading) {
    return <LoadingState>Loading Pokemon...</LoadingState>;
  }

  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }

  if (!allPokemon || allPokemon.length === 0) {
    return <EmptyState>No available Pokemon</EmptyState>;
  }

  return (
    <SelectorContainer>
      <SearchContainer>
        <Input
          type="text"
          placeholder="Search Pokemon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <TypeFilter>
          <label>Type: </label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="normal">Normal</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="electric">Electric</option>
            <option value="grass">Grass</option>
            <option value="ice">Ice</option>
            <option value="fighting">Fighting</option>
            <option value="poison">Poison</option>
            <option value="ground">Ground</option>
            <option value="flying">Flying</option>
            <option value="psychic">Psychic</option>
            <option value="bug">Bug</option>
            <option value="rock">Rock</option>
            <option value="ghost">Ghost</option>
            <option value="dragon">Dragon</option>
            <option value="dark">Dark</option>
            <option value="steel">Steel</option>
            <option value="fairy">Fairy</option>
          </select>
        </TypeFilter>
      </SearchContainer>
      
      {selectedPokemon ? (
        <SelectedPokemonCard>
          <PokemonImage 
            src={selectedPokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`} 
            alt={selectedPokemon.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
            }}
          />
          <div>
            <PokemonName>{selectedPokemon.name}</PokemonName>
            <TypeBadges>
              {selectedPokemon.types && selectedPokemon.types.map((type, index) => (
                <TypeBadge key={index} type={type}>
                  {type}
                </TypeBadge>
              ))}
            </TypeBadges>
            <BaseStats>
              <StatItem>HP: {selectedPokemon.stats.hp}</StatItem>
              <StatItem>Attack: {selectedPokemon.stats.attack}</StatItem>
              <StatItem>Defense: {selectedPokemon.stats.defense}</StatItem>
              <StatItem>Sp. Attack: {selectedPokemon.stats['special-attack']}</StatItem>
              <StatItem>Sp. Defense: {selectedPokemon.stats['special-defense']}</StatItem>
              <StatItem>Speed: {selectedPokemon.stats.speed}</StatItem>
            </BaseStats>
          </div>
          <ChangeButton onClick={() => {
            console.log(`Canceling Pokemon selection ${selectedPokemon.name} for player ${playerId}`);
            setSelectedPokemon(null);
          }}>
            Change
          </ChangeButton>
        </SelectedPokemonCard>
      ) : (
        <PokemonList>
          {filteredPokemon && filteredPokemon.slice(0, 10).map(pokemon => (
            <PokemonCard 
              key={pokemon.id} 
              onClick={() => handlePokemonSelect(pokemon)}
            >
              <PokemonImage 
                src={pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} 
                alt={pokemon.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
                }}
              />
              <PokemonName>{pokemon.name}</PokemonName>
              <TypeBadges>
                {pokemon.types && pokemon.types.map((type, index) => (
                  <TypeBadge key={index} type={type}>
                    {type}
                  </TypeBadge>
                ))}
              </TypeBadges>
            </PokemonCard>
          ))}
          {(!filteredPokemon || filteredPokemon.length === 0) && (
            <NoResults>Pokemon not found</NoResults>
          )}
        </PokemonList>
      )}
    </SelectorContainer>
  );
};

const SelectorContainer = styled.div`
  background-color: #ffffff;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const flatInputStyle = css`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  background-color: white;
  font-size: 16px;
  color: #212529;
  transition: border-color 0.15s ease-in-out;

  &:focus {
    border-color: #80bdff;
    outline: 0;
  }
`;

const Input = styled.input`
  ${flatInputStyle}
  flex-grow: 1;
`;

const TypeFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  select {
    ${flatInputStyle}
    cursor: pointer;
  }
`;

const PokemonList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
`;

const PokemonCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.isSelected ? '#e2e6ea' : '#f8f9fa'};
  cursor: pointer;
  transition: background-color 0.15s ease;
  border: 1px solid ${props => props.isSelected ? '#adb5bd' : 'transparent'};

  &:hover {
    background-color: #e9ecef;
  }
`;

const SelectedPokemonCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
  }
`;

const PokemonImage = styled.img`
  width: 70px;
  height: 70px;
  object-fit: contain;
  margin-bottom: 5px;
`;

const PokemonName = styled.span`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  text-transform: capitalize;
`;

const TypeBadges = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
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
  
  return typeColors[type.toLowerCase()] || '#999999';
};

const TypeBadge = styled.span`
  padding: 3px 8px;
  background-color: ${props => getTypeColor(props.type)};
  color: white;
  border-radius: 4px;
  font-size: 12px;
  text-transform: capitalize;
`;

const BaseStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  margin-top: 10px;
`;

const StatItem = styled.div`
  font-size: 14px;
`;

const ChangeButton = styled.button`
  padding: 8px 15px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #5a6268;
  }

  &:active {
    background-color: #545b62;
  }
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: #666;
`;

const LoadingState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  color: #666;
`;

const ErrorState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #ffebee;
  border-radius: 8px;
  color: #d32f2f;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #666;
`;

export default PokemonSelector; 