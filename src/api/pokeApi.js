import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Format Pokemon data
const formatPokemonData = (pokemon) => {
  try {
    console.log('Formatting Pokemon data:', pokemon.name);
    
    if (!pokemon || !pokemon.types || !pokemon.stats || !pokemon.abilities) {
      console.error('Invalid Pokemon data:', pokemon);
      
      // Return a structure with default values
      return {
        id: pokemon.id || 1,
        name: pokemon.name || 'unknown',
        types: pokemon.types ? pokemon.types.map(type => type.type.name) : ['normal'],
        stats: pokemon.stats ? pokemon.stats.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat;
          return acc;
        }, {}) : { hp: 50, attack: 50, defense: 50, 'special-attack': 50, 'special-defense': 50, speed: 50 },
        abilities: pokemon.abilities ? pokemon.abilities.map(ability => ability.ability.name) : [''],
        sprites: {
          front_default: pokemon.sprites?.front_default || null,
          back_default: pokemon.sprites?.back_default || null,
        },
        height: pokemon.height || 0,
        weight: pokemon.weight || 0,
        moves: pokemon.moves ? pokemon.moves.map(move => move.move.name) : ['tackle'],
      };
    }
    
    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map(type => type.type.name),
      stats: pokemon.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {}),
      abilities: pokemon.abilities.map(ability => ability.ability.name),
      sprites: {
        front_default: pokemon.sprites.front_default,
        back_default: pokemon.sprites.back_default,
      },
      height: pokemon.height,
      weight: pokemon.weight,
      moves: pokemon.moves.map(move => move.move.name),
    };
  } catch (error) {
    console.error('Error formatting Pokemon data:', error);
    
    // Return a basic object in case of error
    return {
      id: pokemon?.id || 1,
      name: pokemon?.name || 'unknown',
      types: ['normal'],
      stats: { hp: 50, attack: 50, defense: 50, 'special-attack': 50, 'special-defense': 50, speed: 50 },
      abilities: [''],
      sprites: { front_default: null, back_default: null },
      height: 0,
      weight: 0,
      moves: ['tackle'],
    };
  }
};

// Get list of all Pokemon
export const fetchAllPokemon = async (limit = 30, offset = 0) => {
  console.log(`Requesting Pokemon list: limit=${limit}, offset=${offset}`);
  
  try {
    // Get the basic list
    console.log(`Request: ${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const pokemonList = response.data.results;
    
    console.log(`Received list of ${pokemonList.length} Pokemon, loading details`);
    
    // Get detailed information for each Pokemon
    const detailedPokemonPromises = pokemonList.map(pokemon => {
      console.log(`Requesting details for ${pokemon.name}: ${pokemon.url}`);
      return axios.get(pokemon.url)
        .then(res => formatPokemonData(res.data))
        .catch(err => {
          console.error(`Error getting Pokemon data ${pokemon.name}:`, err);
          // Return a placeholder in case of error
          return {
            id: Math.floor(Math.random() * 1000),
            name: pokemon.name,
            types: ['normal'],
            stats: { hp: 50, attack: 50, defense: 50, 'special-attack': 50, 'special-defense': 50, speed: 50 },
            abilities: [''],
            sprites: { front_default: null, back_default: null },
            height: 0,
            weight: 0,
            moves: ['tackle'],
          };
        });
    });
    
    const result = await Promise.all(detailedPokemonPromises);
    console.log(`Successfully loaded detailed data for ${result.length} Pokemon`);
    return result;
  } catch (error) {
    console.error('Error getting Pokemon list:', error);
    
    // Return an empty array instead of throwing an exception
    return [];
  }
};

// Get information about a specific Pokemon by ID
export const fetchPokemonById = async (id) => {
  console.log(`Requesting Pokemon by ID: ${id}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${id}`);
    console.log(`Received data for Pokemon ${id}: ${response.data.name}`);
    return formatPokemonData(response.data);
  } catch (error) {
    console.error(`Error getting Pokemon with ID ${id}:`, error);
    
    // Return a placeholder instead of throwing an exception
    return {
      id: id,
      name: `pokemon-${id}`,
      types: ['normal'],
      stats: { hp: 50, attack: 50, defense: 50, 'special-attack': 50, 'special-defense': 50, speed: 50 },
      abilities: [''],
      sprites: { front_default: null, back_default: null },
      height: 0,
      weight: 0,
      moves: ['tackle'],
    };
  }
};

// Get information about a Pokemon move
const fetchMoveDetails = async (moveUrl) => {
  console.log(`Requesting move data: ${moveUrl}`);
  
  try {
    const response = await axios.get(moveUrl);
    const move = response.data;
    
    console.log(`Received move data: ${move.name}`);
    
    return {
      name: move.name,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      type: move.type.name,
      category: move.damage_class.name,
      priority: move.priority,
      effect: move.effect_entries.length > 0 ? move.effect_entries[0].effect : '',
    };
  } catch (error) {
    console.error(`Error getting move information:`, error);
    return {
      name: 'unknown',
      power: 0,
      accuracy: 0,
      pp: 0,
      type: 'normal',
      category: 'Physical',
      priority: 0,
      effect: '',
    };
  }
};

// Get all Pokemon moves
export const fetchPokemonMoves = async (pokemonId) => {
  console.log(`Requesting moves for Pokemon with ID: ${pokemonId}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${pokemonId}`);
    console.log(`Received basic data for Pokemon ${pokemonId}, contains ${response.data.moves.length} moves`);
    
    // If the Pokemon has no moves, return a basic move
    if (!response.data.moves || response.data.moves.length === 0) {
      console.log(`Pokemon ${pokemonId} has no moves, returning basic move`);
      return [{
        name: 'tackle',
        power: 40,
        accuracy: 100,
        pp: 35,
        type: 'normal',
        category: 'Physical',
        priority: 0,
        effect: 'Deals damage.',
      }];
    }
    
    // Limit the number of moves to load
    const movesToFetch = response.data.moves.slice(0, 10);
    console.log(`Loading ${movesToFetch.length} moves from ${response.data.moves.length} available`);
    
    // Add error handling for each move request
    const movePromises = movesToFetch.map(move => {
      try {
        return fetchMoveDetails(move.move.url)
          .catch(err => {
            console.error(`Error loading move ${move.move.name}:`, err);
            return {
              name: move.move.name || 'unknown',
              power: 0,
              accuracy: 100,
              pp: 10,
              type: 'normal',
              category: 'Physical',
              priority: 0,
              effect: '',
            };
          });
      } catch (err) {
        console.error(`Error processing move:`, err);
        return Promise.resolve({
          name: 'error-move',
          power: 0,
          accuracy: 100,
          pp: 10,
          type: 'normal',
          category: 'Physical',
          priority: 0,
          effect: '',
        });
      }
    });
    
    // If an error occurs in Promise.all, at least return the basic move
    try {
      const result = await Promise.all(movePromises);
      console.log(`Successfully loaded ${result.length} moves for Pokemon ${pokemonId}`);
      return result;
    } catch (err) {
      console.error(`Error loading moves for Pokemon ${pokemonId}:`, err);
      return [{
        name: 'tackle',
        power: 40,
        accuracy: 100,
        pp: 35,
        type: 'normal',
        category: 'Physical',
        priority: 0,
        effect: 'Deals damage.',
      }];
    }
  } catch (error) {
    console.error(`Error getting moves for Pokemon ${pokemonId}:`, error);
    // Return at least one basic move instead of throwing an exception
    return [{
      name: 'tackle',
      power: 40,
      accuracy: 100,
      pp: 35,
      type: 'normal',
      category: 'Physical',
      priority: 0,
      effect: 'Deals damage.',
    }];
  }
};

// Get information about type effectiveness
export const fetchTypeEffectiveness = async () => {
  console.log('Requesting type effectiveness data');
  
  try {
    const types = [
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic',
      'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ];
    
    console.log(`Loading data for ${types.length} types`);
    
    const typeDataPromises = types.map(type => {
      console.log(`Requesting data for type ${type}`);
      return axios.get(`${BASE_URL}/type/${type}`)
        .then(res => ({
          name: type,
          damageRelations: res.data.damage_relations
        }))
        .catch(err => {
          console.error(`Error loading data for type ${type}:`, err);
          // Return basic data in case of error
          return {
            name: type,
            damageRelations: {
              double_damage_to: [],
              half_damage_to: [],
              no_damage_to: []
            }
          };
        });
    });
    
    let typeData;
    try {
      typeData = await Promise.all(typeDataPromises);
      console.log(`Successfully loaded data for ${typeData.length} types`);
    } catch (err) {
      console.error('Error loading type data:', err);
      // Return an empty object in case of error
      return {};
    }
    
    // Transform data into a convenient format for use
    const effectivenessMap = {};
    
    typeData.forEach(typeInfo => {
      try {
        effectivenessMap[typeInfo.name] = {
          doubleDamageTo: typeInfo.damageRelations.double_damage_to.map(t => t.name),
          halfDamageTo: typeInfo.damageRelations.half_damage_to.map(t => t.name),
          noDamageTo: typeInfo.damageRelations.no_damage_to.map(t => t.name),
        };
      } catch (err) {
        console.error(`Error processing data for type ${typeInfo.name}:`, err);
        // In case of error, add empty data
        effectivenessMap[typeInfo.name] = {
          doubleDamageTo: [],
          halfDamageTo: [],
          noDamageTo: []
        };
      }
    });
    
    console.log('Type effectiveness data successfully loaded');
    return effectivenessMap;
  } catch (error) {
    console.error('Error getting type effectiveness data:', error);
    
    // Return an empty object instead of throwing an exception
    return {};
  }
};

// Get information about items
export const fetchItems = async (limit = 20, offset = 0) => {
  console.log(`Fetching item list: limit=${limit}, offset=${offset}`);
  try {
    const response = await axios.get(`${BASE_URL}/item?limit=${limit}&offset=${offset}`);
    const items = response.data.results;
    
    console.log(`Fetched ${items.length} items, loading details`);
    
    const detailedItemPromises = items.map(item => 
      axios.get(item.url).then(res => {
        const data = res.data;
        return {
          id: data.id,
          name: data.name,
          cost: data.cost,
          fling_power: data.fling_power,
          effect: data.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || 'No effect description',
          sprite: data.sprites.default
        };
      }).catch(err => {
        console.error(`Error fetching details for item ${item.name}:`, err);
        return {
          id: null,
          name: item.name,
          cost: 0,
          fling_power: null,
          effect: 'Error loading description',
          sprite: null
        };
      })
    );
    
    const result = await Promise.all(detailedItemPromises);
    console.log(`Successfully loaded details for ${result.length} items`);
    return result;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};
