import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  player1Pokemon: null,
  player2Pokemon: null,
  allPokemon: [],
  isLoading: false,
  error: null,
};

export const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    setAllPokemon: (state, action) => {
      state.allPokemon = action.payload;
    },
    setPlayer1Pokemon: (state, action) => {
      try {
        console.log('Устанавливаем покемона для Игрока 1:', action.payload?.name);
        if (!action.payload) {
          console.error('Попытка установить пустого покемона для Игрока 1');
          return;
        }
        
        state.player1Pokemon = action.payload;
      } catch (err) {
        console.error('Ошибка при установке покемона для Игрока 1:', err);
      }
    },
    setPlayer2Pokemon: (state, action) => {
      try {
        console.log('Устанавливаем покемона для Игрока 2:', action.payload?.name);
        if (!action.payload) {
          console.error('Попытка установить пустого покемона для Игрока 2');
          return;
        }
        
        state.player2Pokemon = action.payload;
      } catch (err) {
        console.error('Ошибка при установке покемона для Игрока 2:', err);
      }
    },
    updatePlayer1PokemonStats: (state, action) => {
      try {
        const { payload } = action;
        if (!state.player1Pokemon) {
          console.error('Попытка обновить статистики: покемон игрока 1 не найден');
          return;
        }
        
        console.log('Обновление статистик покемона Игрока 1:', payload);
        
        // Создаем копию покемона и обновляем только указанные поля
        const updatedPokemon = { ...state.player1Pokemon };
        
        if (payload.level !== undefined) updatedPokemon.level = payload.level;
        if (payload.nature !== undefined) updatedPokemon.nature = payload.nature;
        if (payload.ability !== undefined) updatedPokemon.ability = payload.ability;
        if (payload.item !== undefined) updatedPokemon.item = payload.item;
        if (payload.currentHp !== undefined) updatedPokemon.currentHp = payload.currentHp;
        
        // Обновляем IV и EV, сохраняя существующие значения
        if (payload.iv) {
          updatedPokemon.iv = { ...updatedPokemon.iv, ...payload.iv };
        }
        
        if (payload.ev) {
          updatedPokemon.ev = { ...updatedPokemon.ev, ...payload.ev };
        }
        
        // Обновляем ходы, если они переданы
        if (payload.moves) {
          updatedPokemon.moves = [...payload.moves];
        }
        
        // Обновляем состояние
        state.player1Pokemon = updatedPokemon;
      } catch (err) {
        console.error('Ошибка при обновлении статистик покемона Игрока 1:', err);
      }
    },
    updatePlayer2PokemonStats: (state, action) => {
      try {
        const { payload } = action;
        if (!state.player2Pokemon) {
          console.error('Попытка обновить статистики: покемон игрока 2 не найден');
          return;
        }
        
        console.log('Обновление статистик покемона Игрока 2:', payload);
        
        // Создаем копию покемона и обновляем только указанные поля
        const updatedPokemon = { ...state.player2Pokemon };
        
        if (payload.level !== undefined) updatedPokemon.level = payload.level;
        if (payload.nature !== undefined) updatedPokemon.nature = payload.nature;
        if (payload.ability !== undefined) updatedPokemon.ability = payload.ability;
        if (payload.item !== undefined) updatedPokemon.item = payload.item;
        if (payload.currentHp !== undefined) updatedPokemon.currentHp = payload.currentHp;
        
        // Обновляем IV и EV, сохраняя существующие значения
        if (payload.iv) {
          updatedPokemon.iv = { ...updatedPokemon.iv, ...payload.iv };
        }
        
        if (payload.ev) {
          updatedPokemon.ev = { ...updatedPokemon.ev, ...payload.ev };
        }
        
        // Обновляем ходы, если они переданы
        if (payload.moves) {
          updatedPokemon.moves = [...payload.moves];
        }
        
        // Обновляем состояние
        state.player2Pokemon = updatedPokemon;
      } catch (err) {
        console.error('Ошибка при обновлении статистик покемона Игрока 2:', err);
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAllPokemon,
  setPlayer1Pokemon,
  setPlayer2Pokemon,
  updatePlayer1PokemonStats,
  updatePlayer2PokemonStats,
  setLoading,
  setError,
} = pokemonSlice.actions;

export default pokemonSlice.reducer; 