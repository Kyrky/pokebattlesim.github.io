import { calculateDamage, determineFirstAttacker } from './battleCalculator';

// Класс для управления боем
export class BattleManager {
  constructor(player1Pokemon, player2Pokemon) {
    this.player1Pokemon = { ...player1Pokemon };
    this.player2Pokemon = { ...player2Pokemon };
    this.currentTurn = 0;
    this.battleLog = [];
    this.isFinished = false;
    this.winner = null;
  }

  // Инициализация боя
  initialize() {
    // Установка начального HP
    this.player1Pokemon.currentHp = this.calculateMaxHp(this.player1Pokemon);
    this.player2Pokemon.currentHp = this.calculateMaxHp(this.player2Pokemon);
    this.currentTurn = 0;
    this.battleLog = [];
    this.isFinished = false;
    this.winner = null;
  }

  // Расчет максимального здоровья
  calculateMaxHp(pokemon) {
    return Math.floor(((2 * pokemon.stats.hp + pokemon.iv.hp + Math.floor(pokemon.ev.hp / 4)) * pokemon.level) / 100) + pokemon.level + 10;
  }

  // Выполнение хода
  executeMove(playerIndex, moveIndex) {
    if (this.isFinished) {
      return { success: false, message: 'Бой уже завершен' };
    }

    const attackingPokemon = playerIndex === 1 ? this.player1Pokemon : this.player2Pokemon;
    const defendingPokemon = playerIndex === 1 ? this.player2Pokemon : this.player1Pokemon;

    // Проверяем, что у покемона есть выбранный ход
    if (!attackingPokemon.moves || attackingPokemon.moves.length <= moveIndex) {
      return { success: false, message: 'Неверный ход' };
    }

    const selectedMove = attackingPokemon.moves[moveIndex];

    // Проверяем, что у хода остались PP
    if (selectedMove.pp <= 0) {
      return { success: false, message: 'У хода не осталось PP' };
    }

    // Уменьшаем PP хода
    selectedMove.pp -= 1;

    // Расчет урона
    const { damage, isCrit, effectiveness } = calculateDamage(attackingPokemon, defendingPokemon, selectedMove);

    // Применяем урон
    defendingPokemon.currentHp = Math.max(0, defendingPokemon.currentHp - damage);

    // Создаем запись в логе
    const battleEvent = {
      turn: this.currentTurn,
      actor: playerIndex,
      move: selectedMove.name,
      damage,
      isCrit,
      effectiveness,
      statusChanges: [],
    };

    // Добавляем событие в лог
    this.battleLog.push(battleEvent);

    // Проверяем, закончился ли бой
    if (defendingPokemon.currentHp <= 0) {
      this.isFinished = true;
      this.winner = playerIndex;
    }

    // Увеличиваем счетчик ходов
    this.currentTurn += 1;

    return { 
      success: true, 
      battleEvent, 
      isFinished: this.isFinished, 
      winner: this.winner 
    };
  }

  // Автоматический выбор хода
  autoSelectMove(playerIndex) {
    const pokemon = playerIndex === 1 ? this.player1Pokemon : this.player2Pokemon;
    
    // Фильтруем ходы, у которых остались PP
    const availableMoves = pokemon.moves.filter(move => move.pp > 0);
    
    if (availableMoves.length === 0) {
      return -1; // Нет доступных ходов
    }
    
    // Выбираем случайный ход
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const selectedMove = availableMoves[randomIndex];
    
    // Находим индекс хода в исходном массиве
    return pokemon.moves.findIndex(move => move.name === selectedMove.name);
  }

  // Симуляция одного полного раунда с автоматическим выбором ходов
  simulateRound() {
    // Выбираем случайные ходы для обоих игроков
    const player1MoveIndex = this.autoSelectMove(1);
    const player2MoveIndex = this.autoSelectMove(2);
    
    // Проверяем, что у обоих игроков есть доступные ходы
    if (player1MoveIndex === -1 || player2MoveIndex === -1) {
      this.isFinished = true;
      this.winner = player1MoveIndex === -1 ? 2 : 1;
      return {
        isFinished: true,
        winner: this.winner,
        message: `У игрока ${player1MoveIndex === -1 ? 1 : 2} закончились ходы`,
        events: []
      };
    }
    
    // Определяем очередность ходов
    const player1Move = this.player1Pokemon.moves[player1MoveIndex];
    const player2Move = this.player2Pokemon.moves[player2MoveIndex];
    
    const firstAttacker = determineFirstAttacker(
      this.player1Pokemon,
      this.player2Pokemon,
      player1Move,
      player2Move
    );
    
    // Выполняем ходы в правильном порядке
    const events = [];
    
    // Первый ход
    const firstResult = this.executeMove(firstAttacker, firstAttacker === 1 ? player1MoveIndex : player2MoveIndex);
    events.push(firstResult);
    
    // Если бой не закончился, выполняем второй ход
    if (!this.isFinished) {
      const secondResult = this.executeMove(firstAttacker === 1 ? 2 : 1, firstAttacker === 1 ? player2MoveIndex : player1MoveIndex);
      events.push(secondResult);
    }
    
    return {
      isFinished: this.isFinished,
      winner: this.winner,
      events
    };
  }

  // Получение текущего состояния боя
  getState() {
    return {
      player1Pokemon: this.player1Pokemon,
      player2Pokemon: this.player2Pokemon,
      currentTurn: this.currentTurn,
      battleLog: this.battleLog,
      isFinished: this.isFinished,
      winner: this.winner
    };
  }
}

export default BattleManager; 