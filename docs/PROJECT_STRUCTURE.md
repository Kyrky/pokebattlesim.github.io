# Pokemon Battle Simulator Project Structure

## Project Overview
A React-based Pokemon battle simulator that allows users to select Pokemon, configure their stats and moves, and simulate battles with the option to save and replay battles.

## Directory Structure

```
pokebattlesim/
├── src/
│   ├── api/              # API integration
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── store/           # Redux store
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── public/              # Public assets
└── dist/               # Build output
```

## Core Components

### Pages
- **SetupPage.jsx**: Initial setup page for selecting Pokemon and configuring their stats
- **BattlePage.jsx**: Main battle simulation page
- **ReplayPage.jsx**: Battle replay viewer

### Components
- **PokemonSelector**: Pokemon selection component
- **StatControls**: Pokemon stats configuration
- **MovesSelector**: Pokemon moves selection
- **ArenaView**: Battle arena visualization
- **BattleLog**: Battle event log display
- **PokemonStatusBar**: Pokemon status display

## State Management

### Redux Store Structure
```
store/
├── pokemonSlice.js     # Pokemon state management
└── battleSlice.js      # Battle state management
```

### Pokemon State
- Player 1 Pokemon data
- Player 2 Pokemon data
- All available Pokemon list
- Loading states
- Error states

### Battle State
- Current turn
- Battle log
- Auto mode status
- Battle status (started/finished)

## API Integration

### PokeAPI Integration
- Pokemon data fetching
- Move data fetching
- Type information
- Base stats

## Features

### Pokemon Setup
- Pokemon selection
- Stat configuration (Level, Nature, Ability, Item)
- Move selection (up to 4 moves)
- EV/IV configuration

### Battle System
- Turn-based battle simulation
- Damage calculation
- Status effects
- Move PP management
- Auto battle mode

### Replay System
- Battle recording
- Replay playback
- Export/Import functionality
- Turn-by-turn navigation

## Styling

### Styled Components
- Consistent theme across components
- Responsive design
- Type-based color coding
- Interactive elements styling

## Utility Functions

### Battle Calculations
- Damage calculation
- Stat calculation
- Type effectiveness
- Critical hit determination

### Data Management
- Pokemon data validation
- Move data validation
- Replay data handling

## Development Tools

### Build Tools
- Vite for development and building
- ESLint for code quality
- Styled-components for styling

### Dependencies
- React
- Redux Toolkit
- React Router
- Styled Components
- Axios (for API calls)

## File Structure Details

### src/api/
- **pokeApi.js**: Pokemon API integration
- **endpoints.js**: API endpoint definitions

### src/components/
- **PokemonSelector/**: Pokemon selection interface
- **StatControls/**: Stats configuration interface
- **MovesSelector/**: Moves selection interface
- **ArenaView/**: Battle visualization
- **BattleLog/**: Battle event display
- **PokemonStatusBar/**: Status display

### src/pages/
- **SetupPage/**: Initial setup
- **BattlePage/**: Battle simulation
- **ReplayPage/**: Replay viewer

### src/store/
- **pokemonSlice.js**: Pokemon state management
- **battleSlice.js**: Battle state management

### src/utils/
- **battleCalculator.js**: Battle calculations
- **typeUtils.js**: Type-related utilities
- **validationUtils.js**: Data validation

## Data Flow

1. **Setup Phase**
   - Pokemon selection
   - Stat configuration
   - Move selection
   - Battle initialization

2. **Battle Phase**
   - Turn execution
   - Damage calculation
   - State updates
   - Event logging

3. **Replay Phase**
   - Data loading
   - State reconstruction
   - Playback control
   - Export/Import

## Error Handling

- API error handling
- Data validation
- State management errors
- User input validation

## Performance Considerations

- Memoized components
- Optimized state updates
- Efficient data structures
- Lazy loading where applicable 