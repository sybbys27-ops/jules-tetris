# Test Plan

## Basic Tetris Mechanics
1. **Movement**: Use Left/Right arrows. Verify piece moves.
2. **Rotation**: Use Up arrow. Verify piece rotates counter-clockwise.
3. **Soft Drop**: Hold Down arrow. Verify piece drops faster.
4. **Hard Drop**: Press Space. Verify piece drops instantly and locks.
5. **Collision**: Verify pieces stop at walls, floor, and other blocks.
6. **Line Clear**: Fill a row. Verify it clears and blocks above fall.

## Conveyor Mechanics
1. **Indicator**:
   - Verify a yellow highlight moves up and down on the right side (or covering the row).
   - Verify it bounces between the bottom and the highest block.
2. **Trigger**:
   - Play until `Locked Blocks` reaches 10.
   - Verify game pauses (no input allowed).
   - Verify Conveyor Event starts.
3. **Animation**:
   - Verify the blocks in the *highlighted row* move to the right.
   - Verify they wrap around the screen.
   - Verify animation lasts 5 seconds.
4. **Physics**:
   - After animation ends, verify blocks in that row fall down if there is empty space below.
   - Verify other rows do NOT fall.
5. **Post-Event**:
   - Verify game resumes (new piece spawns).
   - Verify line clearing happens if the event caused a full line.

## Edge Cases
1. **Empty Board**: Indicator should stay at bottom.
2. **Top Out**: Game Over screen should appear.
3. **Wrap Around**: Blocks moving off right edge should appear on left.
