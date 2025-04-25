import { configureStore } from '@reduxjs/toolkit';
import battleReducer from './battleSlice';
import pokemonReducer from './pokemonSlice';

export const store = configureStore({
  reducer: {
    battle: battleReducer,
    pokemon: pokemonReducer,
  },
}); 