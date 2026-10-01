import { GameCanvas } from './GameCanvas.ts'
import { GamePhysics } from './GamePhysics.ts'
import { LevelLoader } from './LevelLoader.ts'
import { MenuManager } from './MenuManager.ts'
import { Micro } from './Micro.ts'
import { TouchControls } from './TouchControls.ts'
import LEVELS_MRG_URL from './assets/levels.mrg?url'

type AppState = {
  loadedSpriteFlags: number
  lastOuterStepMs: number
  outerAccumulatorMs: number
  lastMenuStepMs: number
  isGoalLoopActive: boolean
  goalLoopEndMs: number
  lastGoalLoopStepMs: number
  forcedRestartMs: number
  wasInGameMenu: boolean
}

export async function startGravityDefiedApp(root: HTMLDivElement): Promise<void> {
  root.className = 'app-root'

  const canvasElement = document.createElement('canvas')
  canvasElement.className = 'game-canvas'
  root.replaceChildren(canvasElement)

  const micro = new Micro()
  Micro.isGameVisible = true
  const levelLoader = await LevelLoader.create(LEVELS_MRG_URL)
  const gamePhysics = new GamePhysics(levelLoader)
  const gameCanvas = await GameCanvas.create(canvasElement, micro)
  const menuManager = new MenuManager(micro)
  micro.levelLoader = levelLoader
  micro.gamePhysics = gamePhysics
  micro.gameCanvas = gameCanvas
  micro.menuManager = menuManager
  gameCanvas.init(gamePhysics)
  for (let i = 1; i <= 7; ++i) {
    menuManager.initPart(i)
  }
  gameCanvas.setMenuManager(menuManager)
  const state: AppState = {
    loadedSpriteFlags: await gameCanvas.loadSprites(menuManager.getLoadedSpriteFlags()),
    lastOuterStepMs: performance.now(),
    outerAccumulatorMs: 0,
    lastMenuStepMs: performance.now(),
    isGoalLoopActive: false,
    goalLoopEndMs: 0,
    lastGoalLoopStepMs: 0,
    forcedRestartMs: 0,
    wasInGameMenu: false,
  }
  gamePhysics.applyLoadedSpriteFlags(state.loadedSpriteFlags)
  menuManager.applyLoadedSpriteFlags(state.loadedSpriteFlags)
  gamePhysics.setMode(1)

  const touchControls = new TouchControls(root, {
    keyPressed: (keyCode) => {
      gameCanvas.keyPressed(keyCode)
      render()
    },
    keyReleased: (keyCode) => gameCanvas.keyReleased(keyCode),
    back: () => {
      handleBack()
      render()
    },
  })

  function resize(): void {
    const rect = root.getBoundingClientRect()
    let width = Math.floor(rect.width)
    let height = Math.floor(rect.height)

    if (width <= 0 || height <= 0) {
      width = window.innerWidth
      height = window.innerHeight
    }

    if (window.visualViewport !== null) {
      width = Math.max(width, Math.floor(window.visualViewport.width))
      height = Math.max(height, Math.floor(window.visualViewport.height))
    }

    gameCanvas.resize(width, height, menuManager.getZoom())
    gamePhysics.setMinimalScreenWH(Math.min(gameCanvas.getWidth(), gameCanvas.getHeight()))
  }

  function render(): void {
    gameCanvas.paint(gameCanvas.getGraphics())
    touchControls.update(Micro.isInGameMenu, isBackAvailable())
  }

  function isBackAvailable(): boolean {
    if (Micro.isInGameMenu) {
      const menu = menuManager.getCurrentMenu()
      return menu !== null && menu.getParentMenu() !== null
    }

    return gameCanvas.hasMenuButton()
  }

  function handleBack(): boolean {
    if (Micro.isInGameMenu) {
      gameCanvas.handleBackAction()
      return true
    }

    if (gameCanvas.hasMenuButton()) {
      gameCanvas.openPauseMenu()
      return true
    }

    return false
  }

  gameCanvas.setRepaintHandler(render)

  function restart(var1: boolean): void {
    gamePhysics.resetSmth(true)
    micro.timeMs = 0
    micro.gameTimeMs = 0
    micro.crashRestartDeadlineMs = 0
    micro.isTimerRunning = false
    state.goalLoopEndMs = 0
    state.isGoalLoopActive = false
    state.lastGoalLoopStepMs = 0
    state.forcedRestartMs = 0
    if (var1) {
      gameCanvas.scheduleGameTimerTask(levelLoader.getName(menuManager.getCurrentLevel(), menuManager.getCurrentTrack()), 3000)
    }
    gameCanvas.resetInputState()
  }

  function openFinishedMenu(): void {
    menuManager.setFinishTime(micro.gameTimeMs / 10)
    menuManager.showMenuScreen(2)
  }

  function startGoalLoop(nowMs: number): void {
    state.goalLoopEndMs = nowMs + 1000
    state.isGoalLoopActive = true
    state.lastGoalLoopStepMs = nowMs
    gameCanvas.scheduleGameTimerTask(gamePhysics.isTrackFinished ? 'Finished' : 'Wheelie!', 1000)
  }

  function updateSpriteMode(): void {
    const nextSpriteFlags = menuManager.getLoadedSpriteFlags()
    if (gamePhysics.getLoadedSpriteFlags() !== nextSpriteFlags) {
      void gameCanvas.loadSprites(nextSpriteFlags).then((var5) => {
        gamePhysics.applyLoadedSpriteFlags(var5)
        menuManager.applyLoadedSpriteFlags(var5)
        state.loadedSpriteFlags = var5
      })
    }
  }

  function outerStep(nowMs: number): void {
    updateSpriteMode()

    if (state.forcedRestartMs !== 0) {
      if (nowMs >= state.forcedRestartMs) {
        restart(true)
      }
      return
    }

    for (let i = micro.numPhysicsLoops; i > 0; --i) {
      if (micro.isTimerRunning) {
        micro.gameTimeMs += 20
      }

      if (micro.timeMs === 0) {
        micro.timeMs = Date.now()
      }

      const var5 = gamePhysics.updatePhysics()
      if (var5 === 3 && micro.crashRestartDeadlineMs === 0) {
        micro.crashRestartDeadlineMs = Date.now() + 3000
        gameCanvas.scheduleGameTimerTask('Crashed', 3000)
        gameCanvas.repaint()
        gameCanvas.serviceRepaints()
      }

      if (micro.crashRestartDeadlineMs !== 0 && micro.crashRestartDeadlineMs < Date.now()) {
        restart(true)
        return
      }

      if (var5 === 5) {
        gameCanvas.scheduleGameTimerTask('Crashed', 3000)
        gameCanvas.repaint()
        gameCanvas.serviceRepaints()
        let waitMs = 1000
        if (micro.crashRestartDeadlineMs > 0) {
          waitMs = Math.min(micro.crashRestartDeadlineMs - Date.now(), 1000)
        }
        if (waitMs < 0) {
          waitMs = 0
        }
        state.forcedRestartMs = nowMs + waitMs
        return
      }

      if (var5 === 4) {
        micro.timeMs = 0
        micro.gameTimeMs = 0
      } else if (var5 === 1 || var5 === 2) {
        if (var5 === 2) {
          micro.gameTimeMs -= 10
        }

        startGoalLoop(nowMs)
        micro.isTimerRunning = true
        return
      }

      micro.isTimerRunning = var5 !== 4
    }

    gamePhysics.syncRenderStateFromSimulation()
  }

  function goalLoopStep(nowMs: number): void {
    if (!state.isGoalLoopActive) {
      return
    }

    if (nowMs >= state.goalLoopEndMs) {
      state.isGoalLoopActive = false
      openFinishedMenu()
      return
    }

    while (nowMs - state.lastGoalLoopStepMs >= 30) {
      for (let i = micro.numPhysicsLoops; i > 0; --i) {
        if (gamePhysics.updatePhysics() === 5) {
          state.isGoalLoopActive = false
          state.goalLoopEndMs = nowMs
          openFinishedMenu()
          return
        }
      }

      gamePhysics.syncRenderStateFromSimulation()
      state.lastGoalLoopStepMs += 30
    }
  }

  function menuStep(nowMs: number): void {
    if (!Micro.isInGameMenu) {
      return
    }

    while (nowMs - state.lastMenuStepMs >= 50) {
      if (gamePhysics.isGenerateInputAI) {
        const var9 = gamePhysics.updatePhysics()
        if (var9 !== 0 && var9 !== 4) {
          gamePhysics.resetSmth(true)
        }

        gamePhysics.syncRenderStateFromSimulation()
      }

      state.lastMenuStepMs += 50
      if (!gamePhysics.isGenerateInputAI) {
        break
      }
    }
  }

  resize()
  gameCanvas.requestRepaint(0)
  restart(false)
  menuManager.showMenuScreen(0)

  function loop(now: number): void {
    if (menuManager.getZoom() !== gameCanvas.getZoom()) {
      resize()
    }

    if (Micro.isInGameMenu && !state.wasInGameMenu) {
      state.lastMenuStepMs = now
    }

    if (Micro.isInGameMenu && !state.wasInGameMenu && menuManager.isOpeningPauseMenu) {
      menuManager.showMenuScreen(1)
    }

    if (Micro.isInGameMenu) {
      menuStep(now)
      render()
      state.wasInGameMenu = true
      requestAnimationFrame(loop)
      return
    }

    if (state.wasInGameMenu) {
      state.lastOuterStepMs = now
      state.outerAccumulatorMs = 0
    }

    state.wasInGameMenu = false
    if (menuManager.consumeRestartRequested()) {
      restart(true)
    }

    if (state.isGoalLoopActive) {
      goalLoopStep(now)
      render()
      requestAnimationFrame(loop)
      return
    }

    state.outerAccumulatorMs += now - state.lastOuterStepMs
    state.lastOuterStepMs = now

    while (state.outerAccumulatorMs >= 30) {
      outerStep(now)
      state.outerAccumulatorMs -= 30
      if (Micro.isInGameMenu || state.isGoalLoopActive) {
        break
      }
    }

    if (menuManager.consumeRestartRequested()) {
      restart(true)
    }

    render()
    requestAnimationFrame(loop)
  }

  const handleResize = (): void => {
    resize()
    render()
  }

  const resizeObserver = new ResizeObserver(() => {
    handleResize()
  })
  resizeObserver.observe(root)

  window.addEventListener('resize', handleResize)
  window.visualViewport?.addEventListener('resize', handleResize)

  window.addEventListener('keydown', (event) => {
    let handled = false
    const keyCode = browserKeyCodeToGameKeyCode(event.code)

    if (event.code === 'Escape') {
      handled = handleBack()
    }

    if (keyCode !== null) {
      gameCanvas.keyPressed(keyCode)
      handled = true
    }

    if (handled) {
      event.preventDefault()
      render()
    }
  })

  window.addEventListener('keyup', (event) => {
    const keyCode = browserKeyCodeToGameKeyCode(event.code)
    if (keyCode !== null) {
      gameCanvas.keyReleased(keyCode)
      event.preventDefault()
    }
  })

  window.addEventListener('pagehide', () => {
    menuManager.persistState()
  })

  requestAnimationFrame(loop)
}

function browserKeyCodeToGameKeyCode(code: string): number | null {
  switch (code) {
    case 'ArrowUp':
      return 1
    case 'ArrowLeft':
      return 2
    case 'ArrowRight':
      return 5
    case 'ArrowDown':
      return 6
    case 'Space':
    case 'Enter':
    case 'NumpadEnter':
      return 8
    case 'Digit0':
      return 48
    case 'Digit1':
      return 49
    case 'Digit2':
      return 50
    case 'Digit3':
      return 51
    case 'Digit4':
      return 52
    case 'Digit5':
      return 53
    case 'Digit6':
      return 54
    case 'Digit7':
      return 55
    case 'Digit8':
      return 56
    case 'Digit9':
      return 57
    default:
      return null
  }
}
