# Hacking Gravity Defied Web

Ways to unlock tracks and bikes, edit best times, move a save between browsers and mod the game. Everything is single player and lives in your own browser, so nothing here affects anyone else.

- [How unlocking works](#how-unlocking-works)
- [The built-in cheat name](#the-built-in-cheat-name)
- [Save editing](#save-editing)
- [Best times](#best-times)
- [Backup, restore and wipe](#backup-restore-and-wipe)
- [Modding the source](#modding-the-source)

## How unlocking works

The game calls the three difficulties *levels* (Easy, Medium, Pro), the ten circuits in each one *tracks* and the four bikes *leagues* (100cc, 175cc, 220cc, 325cc).

| To unlock | Do this |
|---|---|
| Next track of a level | Finish the previous one |
| Pro level | Finish the last Easy track (Savvy). Easy and Medium are open from the start |
| 175cc | Finish the last Easy track (Savvy) |
| 220cc | Finish the last Medium track (Trenches) |
| 325cc | Finish the last Pro track (Trial again) |

Only the last track of a level unlocks a league, and the bike you ride it with does not matter. So the shortest honest route to Pro skips Medium entirely, but 220cc still needs all ten Medium tracks.

## The built-in cheat name

A player name of **RKE** unlocks every level, every track and all four leagues. It comes from the original game.

1. Finish any track with a time that enters the top three, so the finish screen offers `Name - AAA`.
2. Select it, then use Up and Down to change a letter and Enter to move to the next one. Enter on the third letter confirms.
3. Select `Ok`, then reload the page. The name is only checked when the game starts. On a build without the save fix (progress stored only on `Next`), select `Next` on that finish screen before reloading.

The game then saves the unlocked state, so everything stays open even if you later change the name back.

Without playing, the same name can be written with the [console helper](#console-helper):

```js
GD.patch({ 16: 82, 17: 75, 18: 69 }) // "RKE"
GD.save()
```

## Save editing

### Where the save lives

Everything is in `localStorage`, under keys that start with `gravity_defied_record_store:`. Each value is a JSON array holding one array of bytes.

| Key suffix | Content |
|---|---|
| `GWTRStates` | Options, unlocked levels, tracks and leagues, current selection, player name (19 bytes) |
| `<level><track>`, e.g. `19` | Best times of one track: level 1 (Medium), track 9 (96 bytes) |

Open the browser console on the game page (F12) to work with them.

### Console helper

The running game keeps its own copy of the state and writes it back when the page closes, so a value edited by hand in the storage panel is overwritten on reload. Paste this helper once per page load: it queues your edits and writes them after the game's own save.

```js
window.GD = {
  prefix: 'gravity_defied_record_store:',
  pending: {},
  read(name) {
    const key = this.prefix + name
    return JSON.parse(this.pending[key] ?? localStorage.getItem(key) ?? '[]')[0] ?? []
  },
  write(name, bytes) {
    this.pending[this.prefix + name] = JSON.stringify([bytes])
  },
  state() {
    const bytes = this.read('GWTRStates')
    return bytes.length === 19 ? bytes : [0, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, -127, 0, -127, 65, 65, 65]
  },
  patch(changes) {
    const bytes = this.state()
    for (const [index, value] of Object.entries(changes)) bytes[index] = value
    this.write('GWTRStates', bytes)
  },
  record(level, track, league, place, time, name) {
    const stored = this.read(`${level}${track}`)
    const bytes = stored.length === 96 ? stored : Array(96).fill(0)
    const slot = league * 3 + place
    for (let i = 0; i < 5; ++i) {
      bytes[slot * 5 + i] = time % 256
      time = Math.floor(time / 256)
    }
    for (let i = 0; i < 3; ++i) bytes[60 + slot * 3 + i] = name.charCodeAt(i)
    this.write(`${level}${track}`, bytes)
  },
  save() {
    addEventListener('pagehide', () => {
      for (const [key, value] of Object.entries(this.pending)) localStorage.setItem(key, value)
    })
    location.reload()
  },
}
```

Nothing is written until `GD.save()`, which also reloads the page.

### State layout

`GD.state()` returns the 19 bytes of `GWTRStates`. All indexes count from 0.

| Byte | Meaning | Values |
|---|---|---|
| 0 | Perspective | 0 on, 1 off |
| 1 | Shadows | 0 on, 1 off |
| 2 | Driver sprite | 0 on, 1 off |
| 3 | Bike sprite | 0 on, 1 off |
| 4 | Look ahead | 0 on, 1 off |
| 5 | Highest unlocked league | 0 100cc, 1 175cc, 2 220cc, 3 325cc |
| 6 | Highest unlocked level | 0 Easy, 1 Medium, 2 Pro |
| 7 | Highest unlocked Easy track | 0 to 9 |
| 8 | Highest unlocked Medium track | 0 to 9 |
| 9 | Highest unlocked Pro track | 0 to 9, or -1 while Pro is locked |
| 10 | Selected level | 0 to 2 |
| 11 | Selected track | 0 to 9 |
| 12 | Selected league | 0 to 3 |
| 13 | Unused | -127 |
| 14 | Input keyset | 0 to 2 |
| 15 | Unused | -127 |
| 16 to 18 | Player name | Three ASCII codes, 65 is `A` |

A level is playable only when byte 6 allows it *and* its track byte is 0 or more. Values above the maximum are harmless: the game itself stores 10 for a fully finished level.

### Recipes

Unlock everything:

```js
GD.patch({ 5: 3, 6: 2, 7: 9, 8: 9, 9: 9 })
GD.save()
```

Unlock all four bikes and keep the track progress:

```js
GD.patch({ 5: 3 })
GD.save()
```

Unlock every track and keep the bikes:

```js
GD.patch({ 6: 2, 7: 9, 8: 9, 9: 9 })
GD.save()
```

Open Pro up to its fifth track only:

```js
GD.patch({ 6: 2, 9: 4 })
GD.save()
```

Get back a league that was lost to the old save bug (progress finished but not stored), here 220cc after a completed Medium:

```js
GD.patch({ 5: 2, 8: 10 })
GD.save()
```

## Best times

Each track keeps three places for each of the four leagues. The 96 bytes are:

| Bytes | Content |
|---|---|
| 0 to 59 | 12 times of 5 bytes each, lowest byte first, in hundredths of a second. Slot = `league * 3 + place` |
| 60 to 95 | 12 names of 3 ASCII codes each, in the same slot order |

A time of 0 means the place is empty. Keep the places of a league filled from the first one and sorted from fastest to slowest, because the game assumes that order when it inserts a new time.

`GD.record(level, track, league, place, time, name)` writes one place; the name must be three characters. This sets the first place of Easy / Intro on 100cc to 00:05.00 by `VIN`:

```js
GD.record(0, 0, 0, 0, 500, 'VIN')
GD.save()
```

The finish screen line "N of 10 tracks in Easy completed" just counts the stored keys that start with that level's digit, so a track counts as completed as soon as its key exists.

To clear the times without touching the unlocks, use `Options > Clear highscore` in the game.

## Backup, restore and wipe

Reload the page first so the latest state is stored, then copy the whole save to the clipboard:

```js
copy(JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('gravity_defied_record_store:')))))
```

Restore it in another browser or profile, with the helper pasted:

```js
Object.assign(GD.pending, /* paste the copied JSON here */ {})
GD.save()
```

A save is tied to the site address, so a game played on one address (for example `localhost:3000`) does not show up on another one until you move it this way.

To start over, use `Options > Clear highscore > Full Reset` in the game and reload. It relocks everything and deletes the times.

## Modding the source

These need a local build (`npm install`, `npm run dev`).

### Bikes

`setMotoLeague()` in `src/GamePhysics.ts` holds one block of numbers per league. They are 16.16 fixed point, so 65536 is 1.0.

| Field | Effect |
|---|---|
| `motoParam3` | Top wheel speed |
| `motoParam4` | Maximum engine torque |
| `motoParam5` | Torque added per step while accelerating |
| `motoParam6` | Brake strength |
| `motoParam8` | Lean force |
| `motoParam9` | Lean rotation speed limit |

Copying the `case 3` block over `case 0` gives the 325cc physics under the 100cc name, with its times stored in the 100cc table. Only the look of the wheels still follows the selected league.

### Starting state

`initPart(2)` in `src/MenuManager.ts` sets what a new player starts with: `availableLeagues = 0`, `maxAvailableLevel = 1` and the unlocked tracks `0, 0, -1`. Raising them changes the default for a fresh save only; an existing save still wins.

### Game speed

`numPhysicsLoops` in `src/Micro.ts` is the number of physics steps per 30 ms tick (2 by default). Setting it to 1 runs the game at half speed. The race clock advances with the physics steps, so recorded times stay comparable.

### Custom tracks

All tracks come from `src/assets/levels.mrg`. Replacing that file replaces the tracks; the number of tracks per level is read from the file. Integers are big endian.

Header, repeated for the three levels:

| Size | Content |
|---|---|
| 4 bytes | Number of tracks in the level |
| per track: 4 bytes | Offset of the track data in the file |
| per track: up to 40 bytes | Track name, zero terminated, `_` shown as a space |

Track data, at each offset:

| Size | Content |
|---|---|
| 1 byte | Marker. If it is 50, 20 more bytes follow and are skipped |
| 4 × 4 bytes | Start X, start Y, finish X, finish Y |
| 2 bytes | Number of points |
| 2 × 4 bytes | First point, X and Y |
| per further point | One signed byte. If it is -1, an absolute X and Y follow (4 bytes each). Otherwise it is the X step from the previous point and the next signed byte is the Y step |

Saves are keyed by level and track position, not by name, so after swapping the file the old best times and unlocks apply to whatever track now sits in the same position.
