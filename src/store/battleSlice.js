import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  turnIndex: 0,
  isAutoMode: false,
  battleLog: [],
  isPlayer1Turn: true,
  isBattleStarted: false,
  isBattleFinished: false,
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    startBattle: (state) => {
      state.isBattleStarted = true;
      state.isBattleFinished = false;
      state.turnIndex = 0;
      state.battleLog = [];
      state.isPlayer1Turn = true;
    },
    nextTurn: (state) => {
      state.turnIndex += 1;
      state.isPlayer1Turn = !state.isPlayer1Turn;
    },
    addBattleEvent: (state, action) => {
      state.battleLog.push(action.payload);
    },
    setAutoMode: (state, action) => {
      state.isAutoMode = action.payload;
    },
    finishBattle: (state) => {
      state.isBattleFinished = true;
      state.isAutoMode = false;
    },
    resetBattle: (state) => {
      return initialState;
    },
  },
});

export const {
  startBattle,
  nextTurn,
  addBattleEvent,
  setAutoMode,
  finishBattle,
  resetBattle,
} = battleSlice.actions;

export default battleSlice.reducer; 