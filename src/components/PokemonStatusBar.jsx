import { useState, useEffect } from 'react';
import styled from 'styled-components';

const PokemonStatusBar = ({ pokemon, playerId }) => {
  const [hpPercentage, setHpPercentage] = useState(100);
  const [hpColor, setHpColor] = useState('#78C850');
  
  useEffect(() => {
    if (pokemon) {
      // Calculate max HP based on base stats, IV, EV, and level
      const maxHp = calculateHp(pokemon.stats.hp, pokemon.level, pokemon.iv.hp, pokemon.ev.hp);
      
      // Calculate current HP percentage
      const percentage = Math.max(0, Math.min(100, (pokemon.currentHp / maxHp) * 100));
      setHpPercentage(percentage);
      
      // Determine HP bar color
      if (percentage > 50) {
        setHpColor('#78C850'); // Green
      } else if (percentage > 20) {
        setHpColor('#F8D030'); // Yellow
      } else {
        setHpColor('#F08030'); // Red
      }
    }
  }, [pokemon]);

  // Функция для расчета HP
  const calculateHp = (baseHp, level, iv, ev) => {
    return Math.floor(((2 * baseHp + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  };

  if (!pokemon) {
    return <div>No Pokemon data</div>;
  }

  return (
    <StatusBarContainer player={playerId}>
      <PokemonInfo>
        <PokemonName>{pokemon.name}</PokemonName>
        <PokemonLevel>Lvl {pokemon.level}</PokemonLevel>
      </PokemonInfo>
      
      <HpBarContainer>
        <HpBar width={hpPercentage} color={hpColor} />
      </HpBarContainer>
      
      <HpText>
        HP: {pokemon.currentHp}/{calculateHp(pokemon.stats.hp, pokemon.level, pokemon.iv.hp, pokemon.ev.hp)}
      </HpText>
      
      <PokemonImage
        src={playerId === 1 
          ? pokemon.sprites?.back_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemon.id}.png`
          : pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
        }
        alt={pokemon.name}
      />
      
      {pokemon.status && (
        <StatusIndicator status={pokemon.status}>
          {pokemon.status}
        </StatusIndicator>
      )}
    </StatusBarContainer>
  );
};

const StatusBarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 250px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  ${props => props.player === 2 ? 'margin-left: auto;' : ''}
`;

const PokemonInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PokemonName = styled.span`
  font-weight: bold;
  font-size: 18px;
  text-transform: capitalize;
`;

const PokemonLevel = styled.span`
  font-size: 14px;
  color: #666;
`;

const HpBarContainer = styled.div`
  height: 10px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 5px;
`;

const HpBar = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  border-radius: 2px;
`;

const HpText = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
`;

const PokemonImage = styled.img`
  width: 60px;
  height: 60px;
  position: absolute;
  bottom: 10px;
  right: 15px;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  left: 15px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  
  ${props => {
    switch (props.status) {
      case 'burn':
        return 'background-color: #F08030; color: white;';
      case 'poison':
        return 'background-color: #A040A0; color: white;';
      case 'paralysis':
        return 'background-color: #F8D030; color: #333;';
      case 'freeze':
        return 'background-color: #98D8D8; color: #333;';
      case 'sleep':
        return 'background-color: #705898; color: white;';
      default:
        return 'background-color: #78C850; color: white;';
    }
  }}
`;

export default PokemonStatusBar; 