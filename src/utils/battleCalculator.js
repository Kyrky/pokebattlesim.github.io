// Constants for the type effectiveness table
const TYPE_EFFECTIVENESS = {
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5
  },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2
  },
  fairy: {
    fighting: 2,
    poison: 0.5,
    bug: 2,
    dragon: 2,
    dark: 2,
    steel: 0.5
  }
};

// Calculate damage based on the Pokemon formula
export const calculateDamage = (attacker, defender, move) => {
  // Check base data
  if (!attacker || !defender || !move) {
    console.error('Missing attacker, defender, or move in calculateDamage');
    return { damage: 0, isCrit: false, effectiveness: 1 };
  }
  
  // If the move has no power, return 0 damage
  if (!move.power) {
    return { damage: 0, isCrit: false, effectiveness: 1 };
  }
  
  // Ensure required objects exist
  if (!attacker.stats || !defender.stats) {
    console.error('Missing stats in attacker or defender');
    return { damage: 1, isCrit: false, effectiveness: 1 };
  }
  
  if (!attacker.iv) attacker.iv = { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 };
  if (!attacker.ev) attacker.ev = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
  if (!defender.iv) defender.iv = { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 };
  if (!defender.ev) defender.ev = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
  
  // Ensure level exists
  const attackerLevel = attacker.level || 50;
  const defenderLevel = defender.level || 50;
  
  // Ensure types exist
  const attackerTypes = Array.isArray(attacker.types) ? attacker.types : ['normal'];
  const defenderTypes = Array.isArray(defender.types) ? defender.types : ['normal'];
  
  // Determine if the move is physical or special
  const isPhysical = move.category === 'Physical';
  
  // Get the attacker's attack and the defender's defense
  const attackStat = isPhysical ? 'attack' : 'special-attack';
  const defenseStat = isPhysical ? 'defense' : 'special-defense';
  
  const attackValue = calculateStat(attacker.stats[attackStat], attackerLevel, attacker.iv[attackStat], attacker.ev[attackStat], attacker.nature, attackStat);
  const defenseValue = calculateStat(defender.stats[defenseStat], defenderLevel, defender.iv[defenseStat], defender.ev[defenseStat], defender.nature, defenseStat);
  
  // Calculate critical hit (6.25% chance)
  const isCrit = Math.random() < 0.0625;
  const critModifier = isCrit ? 1.5 : 1;
  
  // Calculate STAB (Same Type Attack Bonus)
  const stab = attackerTypes.includes(move.type) ? 1.5 : 1;
  
  // Calculate type effectiveness
  let effectiveness = 1;
  
  defenderTypes.forEach(defenderType => {
    const moveTypeEffectiveness = TYPE_EFFECTIVENESS[move.type] || {};
    effectiveness *= moveTypeEffectiveness[defenderType] || 1;
  });
  
  // Random multiplier (0.85-1.0)
  const randomFactor = 0.85 + (Math.random() * 0.15);
  
  // Calculate base damage
  let damage = Math.floor(
    (((2 * attackerLevel / 5 + 2) * move.power * attackValue / defenseValue) / 50 + 2) * 
    stab * effectiveness * critModifier * randomFactor
  );
  
  // Check items and abilities
  if (attacker.item === 'choice-band' && isPhysical) {
    damage = Math.floor(damage * 1.5);
  } else if (attacker.item === 'choice-specs' && !isPhysical) {
    damage = Math.floor(damage * 1.5);
  } else if (attacker.item === 'life-orb') {
    damage = Math.floor(damage * 1.3);
  }
  
  // Ensure damage is at least 1
  damage = Math.max(1, Math.floor(damage));
  
  console.log(`Damage calculation: ${attacker.name} -> ${defender.name}, Move: ${move.name}, Damage: ${damage}`);
  
  return { damage, isCrit, effectiveness };
};

// Calculate stat considering level, IV, EV, and nature
const calculateStat = (baseStat, level, iv, ev, nature, statName) => {
  if (!baseStat) return 5; // Default value if base stat is missing
  
  // Ensure IV and EV have values
  const ivValue = iv !== undefined ? iv : (statName === 'hp' ? 31 : 31);
  const evValue = ev !== undefined ? ev : 0;
  
  // Calculate nature modifier
  let natureModifier = 1;
  
  // Map of natures to their effects
  const natureEffects = {
    Adamant: { increase: 'attack', decrease: 'special-attack' },
    Brave: { increase: 'attack', decrease: 'speed' },
    Bold: { increase: 'defense', decrease: 'attack' },
    Relaxed: { increase: 'defense', decrease: 'speed' },
    Modest: { increase: 'special-attack', decrease: 'attack' },
    Quiet: { increase: 'special-attack', decrease: 'speed' },
    Calm: { increase: 'special-defense', decrease: 'attack' },
    Sassy: { increase: 'special-defense', decrease: 'speed' },
    Timid: { increase: 'speed', decrease: 'attack' },
    Hasty: { increase: 'speed', decrease: 'defense' }
  };
  
  // Apply nature modifier
  if (nature in natureEffects) {
    if (statName === natureEffects[nature].increase) {
      natureModifier = 1.1;
    } else if (statName === natureEffects[nature].decrease) {
      natureModifier = 0.9;
    }
  }
  
  // A separate formula is used for HP
  if (statName === 'hp') {
    return Math.floor(((2 * baseStat + ivValue + Math.floor(evValue / 4)) * level) / 100) + level + 10;
  }
  
  // For other stats
  return Math.floor((Math.floor(((2 * baseStat + ivValue + Math.floor(evValue / 4)) * level) / 100) + 5) * natureModifier);
};

// Calculate speed considering items and status
export const calculateSpeed = (pokemon1, pokemon2) => {
  if (!pokemon1 || !pokemon2) return 1; // Default first player goes first
  
  // Ensure IV and EV objects exist
  if (!pokemon1.iv) pokemon1.iv = { speed: 31 };
  if (!pokemon1.ev) pokemon1.ev = { speed: 0 };
  if (!pokemon2.iv) pokemon2.iv = { speed: 31 };
  if (!pokemon2.ev) pokemon2.ev = { speed: 0 };
  
  // Ensure stats object exists
  if (!pokemon1.stats) pokemon1.stats = { speed: 50 };
  if (!pokemon2.stats) pokemon2.stats = { speed: 50 };
  
  // Ensure level exists
  const level1 = pokemon1.level || 50;
  const level2 = pokemon2.level || 50;
  
  let speed1 = calculateStat(pokemon1.stats.speed, level1, pokemon1.iv.speed, pokemon1.ev.speed, pokemon1.nature, 'speed');
  let speed2 = calculateStat(pokemon2.stats.speed, level2, pokemon2.iv.speed, pokemon2.ev.speed, pokemon2.nature, 'speed');
  
  // Consider paralysis status (reduces speed by 50%)
  const paralysisModifier1 = pokemon1.status === 'paralysis' ? 0.5 : 1;
  const paralysisModifier2 = pokemon2.status === 'paralysis' ? 0.5 : 1;
  
  // Consider items
  if (pokemon1.item === 'choice-scarf') speed1 = Math.floor(speed1 * 1.5);
  if (pokemon2.item === 'choice-scarf') speed2 = Math.floor(speed2 * 1.5);
  
  const finalSpeed1 = speed1 * paralysisModifier1;
  const finalSpeed2 = speed2 * paralysisModifier2;
  
  // If speeds are equal, choose randomly
  if (finalSpeed1 === finalSpeed2) {
    return Math.random() < 0.5 ? 1 : 2;
  }
  
  // Return 1 if first pokemon is faster, otherwise 2
  return finalSpeed1 > finalSpeed2 ? 1 : 2;
};

// Determine the first attacker based on speed and move priority
export const determineFirstAttacker = (pokemon1, pokemon2, move1, move2) => {
  if (!pokemon1 || !pokemon2) return 1;
  if (!move1 || !move2) return 1;
  
  // Ensure move priority exists
  const priority1 = move1.priority || 0;
  const priority2 = move2.priority || 0;
  
  // First, check move priority
  if (priority1 !== priority2) {
    return priority1 > priority2 ? 1 : 2;
  }
  
  // If priorities are equal, check speed
  return calculateSpeed(pokemon1, pokemon2);
}; 