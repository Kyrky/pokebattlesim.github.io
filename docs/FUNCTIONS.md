# Pokemon Battle Simulator Functions Documentation

## BattlePage.jsx

### handleNextTurn()
Handles the next turn in the battle. Selects a random available move for the current player's Pokemon, calculates damage, updates Pokemon stats, and adds the event to the battle log.

### toggleAutoMode()
Toggles the automatic battle mode on/off.

### handleRestart()
Resets the battle state and navigates back to the setup page.

### handleReplay()
Navigates to the replay page with the current battle data.

## MovesSelector.jsx

### handleMoveSelect(move)
Handles the selection/deselection of a move. Ensures no more than 4 moves are selected and updates the selected moves state.

### loadMoves()
Loads available moves for the selected Pokemon from the API. Sets default moves if the Pokemon has no moves.

## StatControls.jsx

### calculateHp(baseHp, level, iv, ev)
Calculates the HP stat for a Pokemon based on its base HP, level, IV, and EV values.

### handleEvChange(stat, value)
Handles changes to a Pokemon's EV (Effort Value) for a specific stat. Ensures the total EV doesn't exceed 510 and individual stat EVs don't exceed 252.

### handleIvChange(stat, value)
Handles changes to a Pokemon's IV (Individual Value) for a specific stat. Ensures IVs stay within the valid range (0-31).

### updatePokemonStatsInRedux()
Updates the Pokemon's stats in the Redux store with current values for level, nature, ability, item, and HP.

## SetupPage.jsx

### handleSetPlayer1Pokemon(pokemon)
Sets the Pokemon for Player 1 and updates the Redux store.

### handleSetPlayer2Pokemon(pokemon)
Sets the Pokemon for Player 2 and updates the Redux store.

### handleStartBattle()
Validates both players' Pokemon and moves before starting the battle. Navigates to the battle page if validation passes.

### handleLoadReplayClick()
Triggers the file input for loading a replay file.

### handleFileChange(event)
Handles the loading and parsing of a replay file. Validates the file format and navigates to the replay page if successful.

## ReplayPage.jsx

### calculateReplayPokemonsState(initialPokemon1, initialPokemon2, battleLog, turnIndex)
Calculates the state of both Pokemon at a specific turn in the replay by replaying the battle log up to that point.

### handlePlayPause()
Toggles the automatic playback of the replay.

### handlePrevTurn()
Moves to the previous turn in the replay.

### handleNextTurn()
Moves to the next turn in the replay.

### handleSliderChange(e)
Updates the current turn based on the slider position.

### handleExport()
Exports the current replay data as a JSON file.

### handleBack()
Navigates back to the setup page.

## Utility Functions

### getTypeColor(type)
Returns the color code for a Pokemon type.

### getStatLabel(stat)
Translates stat names to their display labels.

## Redux Actions

### Pokemon Actions
- setPlayer1Pokemon(pokemon)
- setPlayer2Pokemon(pokemon)
- setAllPokemon(pokemonList)
- setLoading(isLoading)
- setError(error)
- updatePlayer1PokemonStats(stats)
- updatePlayer2PokemonStats(stats)

### Battle Actions
- nextTurn()
- addBattleEvent(event)
- setAutoMode(isAuto)
- finishBattle()
- resetBattle()
- startBattle() 