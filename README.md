# Jumping Game

Open the link in the browser : https://calentin.github.io/jumping-game/. The existing controls are Space and Up Arrow.

## Scope

The HTML adds a best-score row inside the existing score display. All original
JavaScript and CSS are preserved; obstacle, collision, and scoring additions are
appended after the original code.
The teammates' jump function, keyboard handler, character, clouds, horizon,
layout, and original styles have not been rewritten.
The additions reuse the teammates' `dino` and `container` variables directly instead
of selecting the same elements again. The original `jump()` function and keyboard
handler continue to provide character movement.

## Game behavior

- Create one cactus immediately, then another obstacle every 2.2 seconds with `setInterval`.
- Add one point every second while the game is running. Passing an obstacle does not award extra points. The score timer stops on collision and resets on restart.
- Save the best score in `localStorage` under `jumpingGame.bestScore` and show it below the current score. A new record is saved as it increases, so reloading or restarting keeps it. Records belong to the current browser profile and site; people sharing that profile share a record. No player accounts are required. If storage is blocked, the game continues and displays the current session's best.
- Start obstacles at 480 pixels per second and multiply the current speed by 1.07 every 10 seconds: 513.6 at 10 seconds, 549.552 at 20 seconds, and so on, without the previous 800-pixel-per-second cap. Existing and new obstacles use the current speed. Movement uses animation frame timestamps. Delayed frames are capped at 50 milliseconds to prevent large position jumps.
- Unlock small cacti at score 10, paired cacti at 20, and animated flying dinosaurs at 30. The next spawn introduces the new type. Before the final unlock, available types rotate in order. After the flying dinosaur is introduced, every spawn uses `Math.random()` to choose among all four sprites with equal probability. Consecutive repeats are allowed; unlock scores and spawning intervals stay fixed. All sprites come from the existing `images/spritesheet.png`.
- Detect collisions with smaller boxes inside the visible sprite shapes, including the dino's current jump position and running frame. Empty corners do not count. A small inset forgives edge grazes; bird wing tips are also forgiving. Contact between solid body parts and cactus trunks or branches still ends the game.
- Remove obstacles after they leave the screen.
- On collision, stop obstacle spawning, movement, and scoring; reveal the existing game-over message and label the existing score as the final score.
- Block new jump input after game over without editing the teammate's keyboard handler.
- Connect the existing Restart button to reload the page for a clean new round.

The original scenery animations and held-key behavior during play are retained.
The additions do not manage or replace the teammates' animation timers.

## Manual checks

1. While playing, verify the score increases by one every second, including before the first cactus reaches the character.
2. Jump over a cactus: passing it should not give a bonus point.
3. Reach scores 10, 20, and 30: speed increases and the next spawn introduces the small cactus, paired cacti, and flying dinosaur respectively. After the flying dinosaur appears, subsequent sprites arrive in random order.
4. Collide: game over appears with the seconds survived. Obstacles, bird animation, and score remain fixed, and no new obstacles appear.
5. Restart several times: each round begins at score zero, the starting speed, and the original cactus type only. The best score remains visible after restarting or reloading, and a lower score must not replace the saved record.
6. Pass near a cactus without visible contact: overlapping empty sprite corners should not cause game over. Running directly into its trunk or branches should.
