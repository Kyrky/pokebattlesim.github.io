# PokeBattleSim - Pokemon Battle Simulator

An interactive Pokemon battle simulator built with React and Redux.

## Features

- Pokemon selection from PokeAPI database
- Configuration of level, IV/EV, abilities, items, and moves
- Pokemon stat calculation considering all parameters
- Turn-based battle simulation with visualization
- Damage calculation using the official formula
- Detailed battle log with move descriptions
- Save and load battle replays

## Technologies

- React 19
- Redux Toolkit
- React Router
- Framer Motion for animations
- Styled Components
- Axios for API requests
- PokeAPI as data source

## Getting Started

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pokebattlesim.git
   cd pokebattlesim
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run in development mode
   ```
   npm run dev
   ```

## Production Build

```
npm run build
```

## Implementation Details

- Comprehensive damage calculation considering types, STAB, critical hits, and random modifier
- Initiative calculation based on speed and move priority
- Status effect support (burn, paralysis, poison, etc.)
- IV and EV value configuration for fine-tuning Pokemon
- Consideration of items and abilities effects on stats
- Attack effectiveness visualization
- Automatic battle mode

## License

MIT
