import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const BattleLog = ({ battleLog }) => {
  const logEndRef = useRef(null);

  // Auto-scroll to new messages
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [battleLog]);

  if (!battleLog || battleLog.length === 0) {
    return (
      <LogContainer>
        <EmptyLog>Battle has not started yet</EmptyLog>
      </LogContainer>
    );
  }

  return (
    <LogContainer>
      <LogTitle>Battle Log</LogTitle>
      
      <LogEntries>
        {battleLog.map((event, index) => (
          <LogEntry key={index} actor={event.actor}>
            <TurnNumber>Turn {event.turn + 1}</TurnNumber>
            <LogText>
              {event.actor === 1 ? 'Player 1' : 'Player 2'} uses <MoveText>{event.move}</MoveText>
              {event.damage > 0 && (
                <span>
                  {' — '}<DamageText>deals {event.damage} damage</DamageText>
                  {event.isCrit && <CritText> (Crit!)</CritText>}
                </span>
              )}
              {event.effectiveness > 1 && (
                <EffectivenessText high> It's super effective!</EffectivenessText>
              )}
              {event.effectiveness < 1 && (
                <EffectivenessText> It's not very effective...</EffectivenessText>
              )}
              {event.statusChanges && event.statusChanges.length > 0 && (
                <StatusChangesText>
                  {event.statusChanges.join(', ')}
                </StatusChangesText>
              )}
            </LogText>
          </LogEntry>
        ))}
        <div ref={logEndRef} />
      </LogEntries>
    </LogContainer>
  );
};

const LogContainer = styled.div`
  width: 100%;
  /* Styles removed as they are now in LogPanel in BattlePage.jsx */
  /* background-color: #f5f5f5; */
  border-radius: 8px; // Keep rounding for entry container
  /* padding: 15px; */
  /* box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1); */
  max-height: 100%; // Occupy the full height of LogPanel
  display: flex;
  flex-direction: column;
`;

const LogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
`;

const LogEntries = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }
`;

const LogEntry = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border-left: 5px solid ${props => props.actor === 1 ? '#4a5cd6' : '#f44336'};
`;

const TurnNumber = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const LogText = styled.div`
  font-size: 16px;
  line-height: 1.4;
`;

const MoveText = styled.span`
  font-weight: bold;
  color: #333;
`;

const DamageText = styled.span`
  color: #f44336;
  font-weight: bold;
`;

const CritText = styled.span`
  color: #f44336;
  font-weight: bold;
`;

const EffectivenessText = styled.span`
  color: ${props => props.high ? '#4caf50' : '#ff9800'};
  font-style: italic;
`;

const StatusChangesText = styled.div`
  margin-top: 5px;
  color: #9c27b0;
  font-style: italic;
`;

const EmptyLog = styled.div`
  padding: 20px;
  text-align: center;
  color: #777;
  font-style: italic;
`;

export default BattleLog; 