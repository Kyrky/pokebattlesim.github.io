import { useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

const ArenaView = ({ player1Pokemon, player2Pokemon, battleEvent, isPlayer1Turn, isReplay = false }) => {
  const arenaRef = useRef(null);

  // Effect for scrolling to new events - Commented out
  /*
  useEffect(() => {
    if (battleEvent && arenaRef.current) {
      arenaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [battleEvent]);
  */

  if (!player1Pokemon || !player2Pokemon) {
    return <ArenaContainer>Loading arena...</ArenaContainer>;
  }

  // Determine if the last move was critical or effective
  const isCrit = battleEvent?.isCrit;
  const isHighlyEffective = battleEvent?.effectiveness > 1;
  const isNotEffective = battleEvent?.effectiveness < 1;
  
  // Determine which pokemon is currently attacking
  const attackingPokemon = isPlayer1Turn ? player1Pokemon : player2Pokemon;
  const defendingPokemon = isPlayer1Turn ? player2Pokemon : player1Pokemon;

  return (
    <ArenaContainer ref={arenaRef}>
      <BattleGround>
        <Pokemon1Container
          animate={
            isPlayer1Turn && battleEvent
              ? { x: [0, 30, 0], transition: { duration: 0.5 } }
              : {}
          }
        >
          <PokemonImage
            src={player1Pokemon.sprites?.back_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${player1Pokemon.id}.png`}
            alt={player1Pokemon.name}
            defending={!isPlayer1Turn && battleEvent}
            damaged={!isPlayer1Turn && battleEvent?.damage > 0}
          />
          <PokemonName player={1}>{player1Pokemon.name}</PokemonName>
        </Pokemon1Container>
        
        <Pokemon2Container
          animate={
            !isPlayer1Turn && battleEvent
              ? { x: [0, -30, 0], transition: { duration: 0.5 } }
              : {}
          }
        >
          <PokemonImage
            src={player2Pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${player2Pokemon.id}.png`}
            alt={player2Pokemon.name}
            defending={isPlayer1Turn && battleEvent}
            damaged={isPlayer1Turn && battleEvent?.damage > 0}
          />
          <PokemonName player={2}>{player2Pokemon.name}</PokemonName>
        </Pokemon2Container>
        
        {battleEvent && (
          <EffectOverlay>
            {isCrit && <EffectText>Critical Hit!</EffectText>}
            {isHighlyEffective && <EffectText $effectiveness="high">It's super effective!</EffectText>}
            {isNotEffective && <EffectText $effectiveness="low">It's not very effective...</EffectText>}
            
            {battleEvent.move && (
              <MoveText>
                {(battleEvent.actor === 1 ? player1Pokemon.name : player2Pokemon.name)} uses {battleEvent.move}!
              </MoveText>
            )}
            
            {battleEvent.damage > 0 && (
              <DamageText>-{battleEvent.damage} HP</DamageText>
            )}
          </EffectOverlay>
        )}
      </BattleGround>
    </ArenaContainer>
  );
};

const ArenaContainer = styled.div`
  width: 100%;
  height: 400px;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const BattleGround = styled.div`
  width: 100%;
  height: 100%;
  /* Old background:
  background-image: url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png');
  background-size: 100px;
  background-color: #a8d5ba; 
  */
  
  /* New background - REPLACE URL! */
  background-image: url('REPLACE_THIS_WITH_YOUR_BACKGROUND_URL.jpg');
  background-size: cover; /* Stretch background to fill the area */
  background-position: center; /* Center background */
  background-repeat: no-repeat; /* Do not repeat background */
  background-color: #7da7ca; /* Background color in case the image doesn't load */

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  position: relative;
`;

const Pokemon1Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 80px;
  left: 100px;
`;

const Pokemon2Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 80px;
  right: 100px;
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const flash = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
`;

const PokemonImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
  z-index: 1;
  
  ${props => props.defending && props.damaged && css`
    animation: ${shake} 0.5s ease-in-out, ${flash} 0.5s ease-in-out;
  `}
`;

const PokemonName = styled.div`
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px 10px;
  border-radius: 15px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  text-transform: capitalize;
  
  ${props => props.player === 1 ? `
    color: #3f51b5;
  ` : `
    color: #f44336;
  `}
`;

const EffectOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const EffectText = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: ${props => {
    if (props.$effectiveness === 'high') return '#78C850';
    if (props.$effectiveness === 'low') return '#F08030';
    return 'white';
  }};
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  animation: ${css`${fadeIn}`} 0.3s ease-out, ${css`${fadeOut}`} 0.3s ease-in 1.5s forwards;
`;

const MoveText = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 15px;
  animation: ${css`${fadeIn}`} 0.3s ease-out, ${css`${fadeOut}`} 0.3s ease-in 2s forwards;
`;

const bounce = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0); }
`;

const DamageText = styled.div`
  color: #F44336;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 2px 2px 0 #000;
  animation: ${css`${bounce}`} 0.6s ease-out, ${css`${fadeOut}`} 0.3s ease-in 1s forwards;
`;

export default ArenaView; 