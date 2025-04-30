import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components';
import { updatePlayer1PokemonStats, updatePlayer2PokemonStats } from '../store/pokemonSlice';

// Flat стиль для Input и Select (скопирован из PokemonSelector)
const flatInputStyle = css`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da; 
  background-color: white;
  font-size: 16px;
  color: #212529; /* Добавляем явный цвет текста */
  transition: border-color 0.15s ease-in-out;
  /* box-shadow: none; */

  &:focus {
    border-color: #80bdff;
    outline: 0;
    /* box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); Убираем тень фокуса */
  }
`;

const StatControls = ({ playerId, pokemon }) => {
  console.log(`StatControls (${playerId}) RENDERED. Pokemon prop:`, pokemon ? { ...pokemon } : null);
  
  const dispatch = useDispatch();
  
  const [level, setLevel] = useState(50);
  const [nature, setNature] = useState('Serious');
  const [ability, setAbility] = useState('');
  const [item, setItem] = useState('');
  const [evs, setEvs] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0
  });
  const [ivs, setIvs] = useState({
    hp: 31,
    attack: 31,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31
  });

  // Инициализация и синхронизация состояния из пропса pokemon
  useEffect(() => {
    console.log(`StatControls (${playerId}): Pokemon prop changed to`, pokemon?.name);
    if (pokemon && pokemon.stats /* && pokemon.ev && pokemon.iv */) { // Временно убираем проверку ev/iv
      console.log(`StatControls (${playerId}): Syncing state for`, pokemon.name);
      try {
        // Обновляем локальное состояние, только если значения из пропса отличаются
        const newLevel = pokemon.level || 50;
        if (newLevel !== level) {
          console.log(`StatControls (${playerId}): Updating level from prop: ${level} -> ${newLevel}`);
          setLevel(newLevel);
        }

        const newNature = pokemon.nature || 'Serious';
        if (newNature !== nature) {
          console.log(`StatControls (${playerId}): Updating nature from prop: ${nature} -> ${newNature}`);
          setNature(newNature);
        }

        const newAbility = pokemon.ability || '';
        if (newAbility !== ability) {
          console.log(`StatControls (${playerId}): Updating ability from prop: ${ability} -> ${newAbility}`);
          setAbility(newAbility);
        }

        const newItem = pokemon.item || '';
        if (newItem !== item) {
          console.log(`StatControls (${playerId}): Updating item from prop: ${item} -> ${newItem}`);
          setItem(newItem);
        }

        // TODO: Добавить глубокое сравнение для evs и ivs, если они будут использоваться
        setEvs(pokemon.ev || { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 });
        setIvs(pokemon.iv || { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 });
        
        console.log(`StatControls (${playerId}): State sync completed.`);
      } catch (error) {
        console.error(`StatControls (${playerId}): Error during state sync:`, error);
      }
    } else {
      console.warn(`StatControls (${playerId}): Pokemon prop data is incomplete or missing for sync. Resetting state.`, pokemon);
      // Сбрасываем состояние, если покемон удален или некорректен
      if (level !== 50) setLevel(50);
      if (nature !== 'Serious') setNature('Serious');
      if (ability !== '') setAbility('');
      if (item !== '') setItem('');
      // TODO: Сбрасывать evs/ivs только если они не дефолтные
      setEvs({ hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 });
      setIvs({ hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 });
    }
  }, [pokemon]); // Зависимость ТОЛЬКО от pokemon, чтобы эффект срабатывал при смене покемона, а не при локальных изменениях

  // Обновление статов в Redux
  const updatePokemonStatsInRedux = () => {
    if (!pokemon || !pokemon.stats) {
        console.warn(`StatControls (${playerId}): Cannot update Redux - pokemon or stats missing.`);
        return;
    }
    
    try {
      console.log(`StatControls (${playerId}): Preparing to update Redux for`, pokemon.name);
      const currentHp = calculateHp(pokemon.stats.hp, level, ivs.hp, evs.hp);
      
      const updates = {
        level,
        nature,
        ability,
        item,
        // Временно убираем EV/IV из обновления для теста
        // ev: evs,
        // iv: ivs,
        currentHp
      };

      console.log(`StatControls (${playerId}): Dispatching updates to Redux:`, updates);
      const action = playerId === 1 ? updatePlayer1PokemonStats(updates) : updatePlayer2PokemonStats(updates);
      dispatch(action);
      console.log(`StatControls (${playerId}): Redux update dispatched for`, pokemon.name);
    } catch (err) {
      console.error(`StatControls (${playerId}): Error dispatching update to Redux:`, err);
    }
  };

  // Единый useEffect для вызова обновления Redux с debounce при изменении ЛОКАЛЬНЫХ состояний
  useEffect(() => {
    const isInitialMountOrPokemonChange = !pokemon; 
    if (isInitialMountOrPokemonChange) {
        return;
    }

    console.log(`StatControls (${playerId}): Local state changed, scheduling Redux update.`);
    
    const debounceTimer = setTimeout(() => {
      console.log(`StatControls (${playerId}): Debounce timer expired.`);
      // !!! ВРЕМЕННО ОТКЛЮЧАЕМ ОБНОВЛЕНИЕ REDUX ДЛЯ ТЕСТА !!!
      // console.log("Calling updatePokemonStatsInRedux (DISABLED FOR TEST)");
      updatePokemonStatsInRedux();
    }, 350); 
    
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [level, nature, ability, item, evs, ivs, dispatch, playerId]); // Зависим от локальных состояний

  // Функция для расчета HP с учетом IV и EV
  const calculateHp = (baseHp, level, iv, ev) => {
    if (baseHp === undefined || baseHp === null) {
        console.error(`StatControls (${playerId}): Base HP is undefined for HP calculation.`);
        return 10; 
    }
    // Добавим проверку на NaN
    const calculatedHp = Math.floor(((2 * baseHp + (iv || 0) + Math.floor((ev || 0) / 4)) * level) / 100) + level + 10;
    return isNaN(calculatedHp) ? 10 : calculatedHp;
  };

  // Обработчик изменения EV
  const handleEvChange = (stat, value) => {
    console.log(`StatControls (${playerId}): EV changed - ${stat}: ${value}`);
    // Проверяем, что сумма EV не превышает 510
    const currentTotal = Object.values(evs).reduce((sum, val) => sum + val, 0);
    const newValue = Math.max(0, Math.min(252, Number(value) || 0)); // Валидация значения
    const newTotal = currentTotal - (evs[stat] || 0) + newValue;
    
    if (newTotal <= 510) {
      setEvs(prev => ({
        ...prev,
        [stat]: newValue
      }));
    } else {
      console.warn(`StatControls (${playerId}): EV total limit exceeded.`);
    }
  };

  // Обработчик изменения IV
  const handleIvChange = (stat, value) => {
    console.log(`StatControls (${playerId}): IV changed - ${stat}: ${value}`);
    const newValue = Math.max(0, Math.min(31, Number(value) || 0)); // Валидация значения
    setIvs(prev => ({
      ...prev,
      [stat]: newValue
    }));
  };

  if (!pokemon) {
    // Компонент теперь сам обрабатывает отсутствие покемона
    return <EmptyState>Select a Pokemon to configure</EmptyState>;
  }
  
  // Дополнительная проверка перед рендерингом
  if (!pokemon.stats || !pokemon.abilities /* || !pokemon.ev || !pokemon.iv */) { // Временно убираем проверку ev/iv
      console.error(`StatControls (${playerId}): Incomplete pokemon data for rendering.`, pokemon);
      return <ErrorState>Error: Incomplete pokemon data.</ErrorState>;
  }

  return (
    <StatsContainer>
      <StatsHeader>Parameter Settings (Simplified)</StatsHeader>
      
      <LevelContainer>
        <label>Level: {level}</label>
        <RangeSlider 
          type="range" 
          min="1" 
          max="100" 
          value={level} 
          onChange={(e) => {
            const newLevel = Number(e.target.value);
            console.log(`StatControls (${playerId}): Level changed to ${newLevel}`);
            setLevel(newLevel);
          }} 
        />
      </LevelContainer>
      
      <SelectContainer>
        <div>
          <label>Nature:</label>
          <Select value={nature} onChange={(e) => {
            const newNature = e.target.value;
            console.log(`StatControls (${playerId}): Nature changed to ${newNature}`);
            setNature(newNature);
          }}>
            {/* Nature options */}
            <option value="Adamant">Adamant (+Atk, -SpA)</option>
            <option value="Brave">Brave (+Atk, -Spe)</option>
            <option value="Bold">Bold (+Def, -Atk)</option>
            <option value="Relaxed">Relaxed (+Def, -Spe)</option>
            <option value="Modest">Modest (+SpA, -Atk)</option>
            <option value="Quiet">Quiet (+SpA, -Spe)</option>
            <option value="Calm">Calm (+SpD, -Atk)</option>
            <option value="Sassy">Sassy (+SpD, -Spe)</option>
            <option value="Timid">Timid (+Spe, -Atk)</option>
            <option value="Hasty">Hasty (+Spe, -Def)</option>
            <option value="Jolly">Jolly (+Spe, -SpA)</option> {/* Added */}
            <option value="Naive">Naive (+Spe, -SpD)</option> {/* Added */}
            <option value="Impish">Impish (+Def, -SpA)</option> {/* Added */}
            <option value="Lax">Lax (+Def, -SpD)</option> {/* Added */}
            <option value="Careful">Careful (+SpD, -SpA)</option> {/* Added */}
            <option value="Gentle">Gentle (+SpD, -Def)</option> {/* Added */}
            <option value="Serious">Serious (neutral)</option>
            <option value="Hardy">Hardy (neutral)</option> {/* Added */}
            <option value="Lonely">Lonely (+Atk, -Def)</option> {/* Added */}
            <option value="Naughty">Naughty (+Atk, -SpD)</option> {/* Added */}
            <option value="Mild">Mild (+SpA, -Def)</option> {/* Added */}
            <option value="Rash">Rash (+SpA, -SpD)</option> {/* Added */}
            <option value="Bashful">Bashful (neutral)</option> {/* Added */}
            <option value="Quirky">Quirky (neutral)</option> {/* Added */}
            <option value="Docile">Docile (neutral)</option> {/* Added */}
          </Select>
        </div>
        
        <div>
          <label>Ability:</label>
          <Select value={ability} onChange={(e) => {
            const newAbility = e.target.value;
            console.log(`StatControls (${playerId}): Ability changed to ${newAbility}`);
            setAbility(newAbility);
          }}>
            <option value="">None</option>
            {pokemon.abilities?.map((abilityName, index) => (
              <option key={index} value={abilityName}>
                {abilityName} 
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <label>Item:</label>
          <Select value={item} onChange={(e) => {
            const newItem = e.target.value;
            console.log(`StatControls (${playerId}): Item changed to ${newItem}`);
            setItem(newItem);
          }}>
            {/* Item options */}
            <option value="">None</option>
            <option value="leftovers">Leftovers</option>
            <option value="choice-band">Choice Band</option>
            <option value="choice-scarf">Choice Scarf</option> {/* Added */}
            <option value="choice-specs">Choice Specs</option> {/* Added */}
            <option value="life-orb">Life Orb</option>
            <option value="focus-sash">Focus Sash</option>
            <option value="rocky-helmet">Rocky Helmet</option>
            <option value="assault-vest">Assault Vest</option> {/* Added */}
            <option value="expert-belt">Expert Belt</option> {/* Added */}
            <option value="black-sludge">Black Sludge</option> {/* Added */}
            <option value="air-balloon">Air Balloon</option> {/* Added */}
            <option value="eviolite">Eviolite</option> {/* Added */}
          </Select>
        </div>
      </SelectContainer>
    </StatsContainer>
  );
};

// Function to translate stat names
const getStatLabel = (stat) => {
  const statLabels = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Attack',
    'special-defense': 'Sp. Defense',
    speed: 'Speed'
  };
  
  return statLabels[stat] || stat;
};

const StatsContainer = styled.div`
  background-color: #ffffff; 
  border-radius: 6px; 
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Enhance shadow */
`;

const StatsHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
`;

const LevelContainer = styled.div`
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
  }
`;

// Base Flat styles for Range Slider
const RangeSlider = styled.input`
  width: 100%;
  height: 6px; // Track height
  cursor: pointer;
  appearance: none; // Remove default appearance
  background: #dee2e6; // Track background
  outline: none;
  border-radius: 3px;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px; // Thumb size
    height: 18px;
    background: #4a5cd6; // Thumb color (like buttons)
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #4a5cd6;
    border-radius: 50%;
    cursor: pointer;
    border: none; // Remove border for Firefox
  }
`;

const SelectContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 5px;
  }
`;

const Select = styled.select`
  ${flatInputStyle} // Apply flat style
  width: 100%;
  cursor: pointer; // Add cursor
  /* Remove extra padding/border, as they are in flatInputStyle */
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 8px;
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

export default StatControls; 