import { GameCanvas } from './GameCanvas.ts'
import { GameMenu } from './GameMenu.ts'
import type { IGameMenuElement } from './IGameMenuElement.ts'
import type { IMenuManager } from './IMenuManager.ts'
import { LevelLoader } from './LevelLoader.ts'
import { Micro } from './Micro.ts'
import { RecordManager } from './RecordManager.ts'
import { SettingsStringRender } from './SettingsStringRender.ts'
import { TextRender } from './TextRender.ts'
import { TimerOrMotoPartOrMenuElem } from './TimerOrMotoPartOrMenuElem.ts'
import { Font } from './lcdui/Font.ts'
import { FontStorage } from './lcdui/FontStorage.ts'
import { Graphics } from './lcdui/Graphics.ts'
import { Image } from './lcdui/Image.ts'
import { RecordStore } from './rms/RecordStore.ts'
import { Time } from './utils/Time.ts'
import RASTER_URL from './assets/raster.png?url'

export class MenuManager implements IMenuManager {
  private readonly persistedStateBuffer = new Int8Array(19)
  private readonly micro: Micro
  private recordManager: RecordManager | null = null
  private gameMenuMain: GameMenu | null = null
  private gameMenuPlay: GameMenu | null = null
  private gameMenuOptions: GameMenu | null = null
  private gameMenuAbout: GameMenu | null = null
  private gameMenuHelp: GameMenu | null = null
  private gameMenuConfirmClear: GameMenu | null = null
  private gameMenuConfirmReset: GameMenu | null = null
  private gameMenuFinished: GameMenu | null = null
  private gameMenuIngame: GameMenu | null = null
  private taskPlayMenu: TimerOrMotoPartOrMenuElem | null = null
  private taskOptions: TimerOrMotoPartOrMenuElem | null = null
  private taskHelp: TimerOrMotoPartOrMenuElem | null = null
  private settingStringLevel: SettingsStringRender | null = null
  private gameMenuStringLevel: GameMenu | null = null
  private settingsStringTrack: SettingsStringRender | null = null
  private trackSelectionMenu: GameMenu | null = null
  private settingsStringLeague: SettingsStringRender | null = null
  private gameMenuLeague: GameMenu | null = null
  private gameMenuHighscore: GameMenu | null = null
  private gameTimerTaskHighscore: TimerOrMotoPartOrMenuElem | null = null
  private taskStart: SettingsStringRender | null = null
  private perspectiveSetting: SettingsStringRender | null = null
  private shadowsSetting: SettingsStringRender | null = null
  private driverSpriteSetting: SettingsStringRender | null = null
  private bikeSpriteSetting: SettingsStringRender | null = null
  private inputSetting: SettingsStringRender | null = null
  private lookAheadSetting: SettingsStringRender | null = null
  private zoomSetting: SettingsStringRender | null = null
  private clearHighscoreSetting: TimerOrMotoPartOrMenuElem | null = null
  private fullResetItem: TimerOrMotoPartOrMenuElem | null = null
  private confirmYes: SettingsStringRender | null = null
  private confirmNo: SettingsStringRender | null = null
  private taskAbout: TimerOrMotoPartOrMenuElem | null = null
  private objectiveMenu: GameMenu | null = null
  private objectiveItem: TimerOrMotoPartOrMenuElem | null = null
  private keysMenu: GameMenu | null = null
  private keysItem: TimerOrMotoPartOrMenuElem | null = null
  private unlockingMenu: GameMenu | null = null
  private unlockingItem: TimerOrMotoPartOrMenuElem | null = null
  private gameMenuOptionsHighscoreDescription: GameMenu | null = null
  private taskHighscore: TimerOrMotoPartOrMenuElem | null = null
  private gameMenuOptions2: GameMenu | null = null
  private optionsHelpItem: TimerOrMotoPartOrMenuElem | null = null
  private gameMenuEnterName: GameMenu | null = null
  private settingStringBack: SettingsStringRender | null = null
  private settingStringPlayMenu: SettingsStringRender | null = null
  private settingStringContinue: SettingsStringRender | null = null
  private settingStringGoToMain: SettingsStringRender | null = null
  private settingStringExitGame: SettingsStringRender | null = null
  private restartTrackAction: SettingsStringRender | null = null
  private nextTrackAction: SettingsStringRender | null = null
  private finishOkAction: SettingsStringRender | null = null
  private finishNameAction: SettingsStringRender | null = null
  private lastFinishTime = -1
  private lastFinishSeconds = -1
  private lastFinishCentiseconds = -1
  private lastFinishTimeString = ''
  private playerNameBytes: Uint8Array<ArrayBufferLike> = new Uint8Array([65, 65, 65])
  private readonly unlockedTracksByLevel = new Int8Array(4)
  private readonly defaultInputString: Uint8Array<ArrayBufferLike> = new Uint8Array([65, 65, 65])
  private availableLeagues = 0
  private maxAvailableLevel = 0
  private readonly selectedTrackByLevel = [0, 0, 0]
  private levelNames: string[][] = []
  private leagueNames = new Array<string>(3)
  private leagueNamesAll4: string[] = []
  private recordStore: RecordStore | null = null
  private recordStoreRecordId = -1
  private isRecordStoreOpened = false
  private rasterImage: Image | null = null
  private textRenderCodeBrewLink: TextRender | null = null
  private resumeLevelIndex = 0
  private resumeTrackIndex = 0
  private completedLastTrack = false
  private restartRequested = false
  private readonly levelDifficultyNames = ['Easy', 'Medium', 'Pro']
  private finishMenuOpenedAt = 0
  private isDisablePerspective = 0
  private isDisabledShadows = 0
  private isDisabledDriverSprite = 0
  private isDisabledBikeSprite = 0
  private inputMode = 0
  private isDisableLookAhead = 0
  private zoomIndex = 0
  private selectedTrackIndex = 0
  private selectedLevelIndex = 0
  private selectedLeagueIndex = 0
  private uiOverlayMode = 0
  private reservedSetting15 = 0
  private toggleOptionNames: string[] = []
  private inputModeNames: string[] = []
  private readonly zoomNames = ['1x', '2x', '3x', '4x']
  private readonly spacerTextRender: TextRender

  currentGameMenu: GameMenu | null = null
  highscoreLeagueIndex = 0
  isOpeningPauseMenu = false

  constructor(var1: Micro) {
    this.micro = var1
    this.spacerTextRender = new TextRender('', var1)
  }

  initPart(var1: number): void {
    let var4 = 0
    switch (var1) {
      case 1:
        this.playerNameBytes = this.defaultInputString
        this.toggleOptionNames = ['On', 'Off']
        this.inputModeNames = ['Keyset 1', 'Keyset 2', 'Keyset 3']
        this.recordManager = new RecordManager()
        this.lastFinishTime = -1
        this.lastFinishSeconds = -1
        this.lastFinishCentiseconds = -1
        this.lastFinishTimeString = ''
        this.isRecordStoreOpened = false
        for (let var11 = 0; var11 < 19; ++var11) {
          this.persistedStateBuffer[var11] = -127
        }
        try {
          this.recordStore = RecordStore.openRecordStore('GWTRStates', true)
          this.isRecordStoreOpened = true
        } catch {
          this.isRecordStoreOpened = false
        }
        return
      case 2: {
        this.recordStoreRecordId = -1

        if (this.recordStore === null) {
          return
        }

        let records
        try {
          records = this.recordStore.enumerateRecords(null, null, false)
        } catch {
          return
        }

        if (records.numRecords() > 0) {
          try {
            const var3 = records.nextRecord()
            records.reset()
            this.recordStoreRecordId = records.nextRecordId()
            if (var3.length <= 19) {
              for (let i = 0; i < var3.length; ++i) {
                this.persistedStateBuffer[i] = var3[i]
              }
            }
          } catch {
            return
          }

          records.destroy()
        }

        const var3 = this.readStoredNameBytes(16, -1)
        if (var3.length !== 0 && var3[0] !== -1) {
          for (var4 = 0; var4 < 3; ++var4) {
            this.playerNameBytes[var4] = var3[var4]
          }
        }

        if (this.playerNameBytes[0] === 82 && this.playerNameBytes[1] === 75 && this.playerNameBytes[2] === 69) {
          this.availableLeagues = 3
          this.maxAvailableLevel = 2
          if (this.micro.levelLoader !== null) {
            this.unlockedTracksByLevel[0] = this.micro.levelLoader.levelNames[0].length - 1
            this.unlockedTracksByLevel[1] = this.micro.levelLoader.levelNames[1].length - 1
            this.unlockedTracksByLevel[2] = this.micro.levelLoader.levelNames[2].length - 1
          }
          return
        }

        this.availableLeagues = 0
        this.maxAvailableLevel = 1
        this.unlockedTracksByLevel[0] = 0
        this.unlockedTracksByLevel[1] = 0
        this.unlockedTracksByLevel[2] = -1
        return
      }
      case 3:
        this.isDisablePerspective = this.readStoredValue(0, this.isDisablePerspective)
        this.isDisabledShadows = this.readStoredValue(1, this.isDisabledShadows)
        this.isDisabledDriverSprite = this.readStoredValue(2, this.isDisabledDriverSprite)
        this.isDisabledBikeSprite = this.readStoredValue(3, this.isDisabledBikeSprite)
        this.inputMode = this.readStoredValue(14, this.inputMode)
        this.isDisableLookAhead = this.readStoredValue(4, this.isDisableLookAhead)
        this.zoomIndex = this.readStoredValue(13, this.zoomIndex)
        this.selectedTrackIndex = this.readStoredValue(11, this.selectedTrackIndex)
        this.selectedLevelIndex = this.readStoredValue(10, this.selectedLevelIndex)
        this.selectedLeagueIndex = this.readStoredValue(12, this.selectedLeagueIndex)
        this.reservedSetting15 = this.readStoredValue(15, this.reservedSetting15)
        this.resumeLevelIndex = this.selectedLevelIndex
        this.resumeTrackIndex = this.selectedTrackIndex

        if (this.playerNameBytes[0] !== 82 || this.playerNameBytes[1] !== 75 || this.playerNameBytes[2] !== 69) {
          this.availableLeagues = this.readStoredValue(5, this.availableLeagues)
          this.maxAvailableLevel = this.readStoredValue(6, this.maxAvailableLevel)
          for (var4 = 0; var4 < 3; ++var4) {
            this.unlockedTracksByLevel[var4] = this.readStoredValue(7 + var4, this.unlockedTracksByLevel[var4])
          }
        }

        try {
          this.selectedTrackByLevel[this.selectedLevelIndex] = this.selectedTrackIndex
        } catch {
          this.selectedLevelIndex = 0
          this.selectedTrackIndex = 0
          this.selectedTrackByLevel[this.selectedLevelIndex] = this.selectedTrackIndex
        }

        LevelLoader.isEnabledPerspective = this.isDisablePerspective === 0
        LevelLoader.isEnabledShadows = this.isDisabledShadows === 0
        if (this.micro.gamePhysics !== null) {
          this.micro.gamePhysics.setEnableLookAhead(this.isDisableLookAhead === 0)
        }
        if (this.micro.gameCanvas !== null) {
          this.micro.gameCanvas.setInputMode(this.inputMode)
          this.micro.gameCanvas.setUiOverlayEnabled(this.uiOverlayMode === 0)
        }
        this.leagueNamesAll4 = ['100cc', '175cc', '220cc', '325cc']
        this.levelNames = this.micro.levelLoader?.levelNames ?? []
        if (this.availableLeagues < 3) {
          this.leagueNames = ['100cc', '175cc', '220cc']
        } else {
          this.leagueNames = this.leagueNamesAll4
        }

        this.highscoreLeagueIndex = this.selectedLeagueIndex
        return
      case 4: {
        this.gameMenuMain = new GameMenu('Main', this.micro, null)
        this.gameMenuPlay = new GameMenu('Play', this.micro, this.gameMenuMain)
        this.gameMenuOptions = new GameMenu('Options', this.micro, this.gameMenuMain)
        this.gameMenuAbout = new GameMenu('About', this.micro, this.gameMenuMain)
        this.gameMenuHelp = new GameMenu('Help', this.micro, this.gameMenuMain)
        this.settingStringBack = new SettingsStringRender('Back', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.settingStringGoToMain = new SettingsStringRender('Go to Main', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.settingStringContinue = new SettingsStringRender('Continue', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.settingStringPlayMenu = new SettingsStringRender('Play Menu', 0, this, [], false, this.micro, this.gameMenuMain, true)

        const boldSmallFont = FontStorage.getFont(Font.STYLE_BOLD, Font.SIZE_SMALL)
        if ((this.gameMenuAbout?.xPos ?? 0) + boldSmallFont.stringWidth('http://www.codebrew.se/') >= this.getCanvasWidth()) {
          this.textRenderCodeBrewLink = new TextRender('www.codebrew.se', this.micro)
        } else {
          this.textRenderCodeBrewLink = new TextRender('http://www.codebrew.se/', this.micro)
        }

        this.textRenderCodeBrewLink.setFont(boldSmallFont)
        this.gameMenuHighscore = new GameMenu('Highscore', this.micro, this.gameMenuPlay)
        this.gameMenuFinished = new GameMenu('Finished!', this.micro, this.gameMenuPlay)
        return
      }
      case 5:
        this.gameMenuIngame = new GameMenu('Ingame', this.micro, this.gameMenuPlay)
        this.gameMenuEnterName = new GameMenu('Enter Name', this.micro, this.gameMenuFinished, this.playerNameBytes)
        this.gameMenuConfirmClear = new GameMenu('Confirm Clear', this.micro, this.gameMenuOptions)
        this.gameMenuConfirmReset = new GameMenu('Confirm Reset', this.micro, this.gameMenuConfirmClear)
        this.taskPlayMenu = new TimerOrMotoPartOrMenuElem('Play Menu', this.gameMenuPlay, this)
        this.taskOptions = new TimerOrMotoPartOrMenuElem('Options', this.gameMenuOptions, this)
        this.taskHelp = new TimerOrMotoPartOrMenuElem('Help', this.gameMenuHelp, this)
        this.taskAbout = new TimerOrMotoPartOrMenuElem('About', this.gameMenuAbout, this)
        this.settingStringExitGame = new SettingsStringRender('Exit Game', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.gameMenuMain?.addMenuElement(this.taskPlayMenu)
        this.gameMenuMain?.addMenuElement(this.taskOptions)
        this.gameMenuMain?.addMenuElement(this.taskHelp)
        this.gameMenuMain?.addMenuElement(this.taskAbout)
        this.gameMenuMain?.addMenuElement(this.settingStringExitGame)
        this.settingStringLevel = new SettingsStringRender('Level', this.selectedLevelIndex, this, this.levelDifficultyNames, false, this.micro, this.gameMenuPlay, false)
        this.settingsStringTrack = new SettingsStringRender('Track', this.selectedTrackByLevel[this.selectedLevelIndex], this, this.levelNames[this.selectedLevelIndex], false, this.micro, this.gameMenuPlay, false)
        this.settingsStringLeague = new SettingsStringRender('League', this.selectedLeagueIndex, this, this.leagueNames, false, this.micro, this.gameMenuPlay, false)

        try {
          this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.selectedLevelIndex])
        } catch {
          this.settingsStringTrack.setAvailableOptions(0)
        }

        this.settingStringLevel.setAvailableOptions(this.maxAvailableLevel)
        this.settingsStringLeague.setAvailableOptions(this.availableLeagues)
        this.gameTimerTaskHighscore = new TimerOrMotoPartOrMenuElem('Highscore', this.gameMenuHighscore, this)
        this.gameMenuHighscore?.addMenuElement(this.settingStringBack!)
        this.taskStart = new SettingsStringRender('Start>', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.gameMenuPlay?.addMenuElement(this.taskStart)
        this.gameMenuPlay?.addMenuElement(this.settingStringLevel)
        this.gameMenuPlay?.addMenuElement(this.settingsStringTrack)
        this.gameMenuPlay?.addMenuElement(this.settingsStringLeague)
        this.gameMenuPlay?.addMenuElement(this.gameTimerTaskHighscore)
        this.gameMenuPlay?.addMenuElement(this.settingStringGoToMain!)

        this.perspectiveSetting = new SettingsStringRender('Perspective', this.isDisablePerspective, this, this.toggleOptionNames, true, this.micro, this.gameMenuOptions, false)
        this.shadowsSetting = new SettingsStringRender('Shadows', this.isDisabledShadows, this, this.toggleOptionNames, true, this.micro, this.gameMenuOptions, false)
        this.driverSpriteSetting = new SettingsStringRender('Driver sprite', this.isDisabledDriverSprite, this, this.toggleOptionNames, true, this.micro, this.gameMenuOptions, false)
        this.bikeSpriteSetting = new SettingsStringRender('Bike sprite', this.isDisabledBikeSprite, this, this.toggleOptionNames, true, this.micro, this.gameMenuOptions, false)
        this.inputSetting = new SettingsStringRender('Input', this.inputMode, this, this.inputModeNames, false, this.micro, this.gameMenuOptions, false)
        this.lookAheadSetting = new SettingsStringRender('Look ahead', this.isDisableLookAhead, this, this.toggleOptionNames, true, this.micro, this.gameMenuOptions, false)
        this.zoomSetting = new SettingsStringRender('Zoom', this.zoomIndex, this, this.zoomNames, false, this.micro, this.gameMenuOptions, false)
        this.clearHighscoreSetting = new TimerOrMotoPartOrMenuElem('Clear highscore', this.gameMenuConfirmClear, this)
        return
      case 6:
        this.gameMenuOptions?.addMenuElement(this.perspectiveSetting!)
        this.gameMenuOptions?.addMenuElement(this.shadowsSetting!)
        this.gameMenuOptions?.addMenuElement(this.driverSpriteSetting!)
        this.gameMenuOptions?.addMenuElement(this.bikeSpriteSetting!)
        this.gameMenuOptions?.addMenuElement(this.inputSetting!)
        this.gameMenuOptions?.addMenuElement(this.lookAheadSetting!)
        this.gameMenuOptions?.addMenuElement(this.zoomSetting!)
        this.gameMenuOptions?.addMenuElement(this.clearHighscoreSetting!)
        this.gameMenuOptions?.addMenuElement(this.settingStringBack!)
        this.confirmNo = new SettingsStringRender('No', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.confirmYes = new SettingsStringRender('Yes', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.fullResetItem = new TimerOrMotoPartOrMenuElem('Full Reset', this.gameMenuConfirmReset, this)
        this.addTextRender(this.gameMenuConfirmClear!, 'Clearing the highscores can not be undone. It will remove all the registered times on all tracks.')
        this.addTextRender(this.gameMenuConfirmClear!, 'Would you like to clear the highscores?')
        this.gameMenuConfirmClear?.addMenuElement(this.confirmNo)
        this.gameMenuConfirmClear?.addMenuElement(this.confirmYes)
        this.gameMenuConfirmClear?.addMenuElement(this.fullResetItem)
        this.addTextRender(this.gameMenuConfirmReset!, 'A full reset can not be undone. It will relock all tracks and leagues and clear back all settings to default. A full reset will exit the application.')
        this.addTextRender(this.gameMenuConfirmReset!, 'Would you like to do a full reset?')
        this.gameMenuConfirmReset?.addMenuElement(this.confirmNo)
        this.gameMenuConfirmReset?.addMenuElement(this.confirmYes)
        this.objectiveMenu = new GameMenu('Objective', this.micro, this.gameMenuHelp)
        this.objectiveItem = new TimerOrMotoPartOrMenuElem('Objective', this.objectiveMenu, this)
        this.addTextRender(this.objectiveMenu, "Race to the finish line as fast as you can without crashing. By leaning forward and backward you can adjust the rotation of your bike. By landing on both wheels after jumping, your bike won't crash as easily. Beware, the levels tend to get harder and harder...")
        this.objectiveMenu.addMenuElement(this.settingStringBack!)
        this.gameMenuHelp?.addMenuElement(this.objectiveItem)
        this.keysMenu = new GameMenu('Keys', this.micro, this.gameMenuHelp)
        this.keysItem = new TimerOrMotoPartOrMenuElem('Keys', this.keysMenu, this)
        this.addTextRender(this.keysMenu, `- ${this.inputModeNames[0]} -`)
        this.addTextRender(this.keysMenu, 'UP accelerates, DOWN brakes, RIGHT leans forward and LEFT leans backward. 1 accelerates and leans backward. 3 accelerates and leans forward. 7 brakes and leans backward. 9 brakes and leans forward.')
        this.keysMenu.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.keysMenu, `- ${this.inputModeNames[1]} -`)
        this.addTextRender(this.keysMenu, '1 accelerates, 4 brakes, 6 leans forward and 5 leans backward.')
        this.keysMenu.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.keysMenu, `- ${this.inputModeNames[2]} -`)
        this.addTextRender(this.keysMenu, '3 accelerates, 6 brakes, 5 leans forward and 4 leans backward.')
        this.keysMenu.addMenuElement(this.settingStringBack!)
        this.gameMenuHelp?.addMenuElement(this.keysItem)
        this.unlockingMenu = new GameMenu('Unlocking', this.micro, this.gameMenuHelp)
        this.unlockingItem = new TimerOrMotoPartOrMenuElem('Unlocking', this.unlockingMenu, this)
        this.addTextRender(this.unlockingMenu, 'By completing the easier levels, new levels will be unlocked. You will also gain access to higher leagues where more advanced bikes with different characteristics are available.')
        this.unlockingMenu.addMenuElement(this.settingStringBack!)
        this.gameMenuHelp?.addMenuElement(this.unlockingItem)
        this.gameMenuOptionsHighscoreDescription = new GameMenu('Highscore', this.micro, this.gameMenuHelp)
        this.taskHighscore = new TimerOrMotoPartOrMenuElem('Highscore', this.gameMenuOptionsHighscoreDescription, this)
        this.addTextRender(this.gameMenuOptionsHighscoreDescription, 'The three best times on every track are saved for each league. When beating a time on a track you will be asked to enter your name. The highscores can be viewed from the Play Menu. By pressing left and right in the highscore view you can view the highscore for a specific league. The highscore can be cleared from the options menu.')
        this.gameMenuOptionsHighscoreDescription.addMenuElement(this.settingStringBack!)
        this.gameMenuHelp?.addMenuElement(this.taskHighscore)
        return
      case 7:
        this.gameMenuOptions2 = new GameMenu('Options', this.micro, this.gameMenuHelp)
        this.optionsHelpItem = new TimerOrMotoPartOrMenuElem('Options', this.gameMenuOptions2, this)
        this.addTextRender(this.gameMenuOptions2, 'Perspective: On/Off')
        this.addTextRender(this.gameMenuOptions2, 'Default: <On>. Turns on and off the perspective view of the tracks.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Shadows: On/Off')
        this.addTextRender(this.gameMenuOptions2, 'Default: <On>. Turns on and off the shadows.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Driver Sprite: On / Off')
        this.addTextRender(this.gameMenuOptions2, 'Default: <On>. <On> uses a texture for the driver. <Off> uses line graphics.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Bike Sprite: On / Off')
        this.addTextRender(this.gameMenuOptions2, 'Default: <On>. <On> uses a texture for the bike. <Off> uses line graphics.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Input: Keyset 1,2,3 ')
        this.addTextRender(this.gameMenuOptions2, 'Default: <1>. Determines which type of input should be used when playing. See "Keys" in the help menu for more info.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Look ahead: On/Off')
        this.addTextRender(this.gameMenuOptions2, 'Default: <On>. Turns on and off smart camera movement.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Zoom: 1x,2x,3x,4x')
        this.addTextRender(this.gameMenuOptions2, 'Default: <1x>. Enlarges the game graphics.')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.addTextRender(this.gameMenuOptions2, 'Clear highscore')
        this.addTextRender(this.gameMenuOptions2, 'Lets you clear the highscores. Here you can also do a "Full Reset" which will reset the game to original state (clear settings, highscores, unlocked levels and leagues).')
        this.gameMenuOptions2.addMenuElement(this.spacerTextRender)
        this.gameMenuOptions2.addMenuElement(this.settingStringBack!)
        this.gameMenuHelp?.addMenuElement(this.optionsHelpItem)
        this.gameMenuHelp?.addMenuElement(this.settingStringBack!)
        this.addTextRender(this.gameMenuAbout!, '"Gravity Defied"')
        this.addTextRender(this.gameMenuAbout!, 'brought 2 you by pascha.                For information visit:')
        if (this.textRenderCodeBrewLink !== null) {
          this.gameMenuAbout?.addMenuElement(this.textRenderCodeBrewLink)
        }
        this.gameMenuAbout?.addMenuElement(this.settingStringBack!)
        if (this.micro.levelLoader !== null) {
          this.nextTrackAction = new SettingsStringRender(`Track: ${this.micro.levelLoader.getName(0, 1)}`, 0, this, [], false, this.micro, this.gameMenuMain, true)
          this.restartTrackAction = new SettingsStringRender(`Restart: ${this.micro.levelLoader.getName(0, 0)}`, 0, this, [], false, this.micro, this.gameMenuMain, true)
        } else {
          this.nextTrackAction = new SettingsStringRender('Track', 0, this, [], false, this.micro, this.gameMenuMain, true)
          this.restartTrackAction = new SettingsStringRender('Restart', 0, this, [], false, this.micro, this.gameMenuMain, true)
        }
        this.gameMenuIngame?.addMenuElement(this.settingStringContinue!)
        this.gameMenuIngame?.addMenuElement(this.restartTrackAction)
        this.gameMenuIngame?.addMenuElement(this.taskOptions!)
        this.gameMenuIngame?.addMenuElement(this.taskHelp!)
        this.gameMenuIngame?.addMenuElement(this.settingStringPlayMenu!)
        this.finishOkAction = new SettingsStringRender('Ok', 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.finishNameAction = new SettingsStringRender(`Name - ${this.makeString(this.playerNameBytes)}`, 0, this, [], false, this.micro, this.gameMenuMain, true)
        this.openMenu(this.gameMenuMain, false)
        this.rasterImage = Image.fromSrc(RASTER_URL)
        return
      default:
        return
    }
  }

  private addTextRender(gameMenu: GameMenu, text: string): void {
    const var3 = TextRender.makeMultilineTextRenders(text, this.micro)
    for (let var4 = 0; var4 < var3.length; ++var4) {
      gameMenu.addMenuElement(var3[var4])
    }
  }

  getCurrentLevel(): number {
    return this.settingStringLevel?.getCurrentOptionPos() ?? 0
  }

  getCurrentTrack(): number {
    return this.settingsStringTrack?.getCurrentOptionPos() ?? 0
  }

  consumeRestartRequested(): boolean {
    if (this.restartRequested) {
      this.restartRequested = false
      return true
    }

    return false
  }

  private finalizeFinishedMenu(): void {
    if (this.recordManager === null || this.gameMenuFinished === null || this.settingsStringLeague === null || this.settingsStringTrack === null || this.settingStringLevel === null || this.restartTrackAction === null || this.settingStringPlayMenu === null || this.micro.levelLoader === null) {
      return
    }

    this.recordManager.addRecordIfNeeded(this.settingsStringLeague.getCurrentOptionPos(), this.playerNameBytes, this.lastFinishTime)
    this.recordManager.writeRecordInfo()
    this.completedLastTrack = false
    this.gameMenuFinished.clearVector()
    this.gameMenuFinished.addMenuElement(new TextRender(`Time: ${this.lastFinishTimeString}`, this.micro))
    const var1 = this.recordManager.getRecordDescription(this.settingsStringLeague.getCurrentOptionPos())

    for (let var2 = 0; var2 < var1.length; ++var2) {
      if (var1[var2] !== '') {
        this.gameMenuFinished.addMenuElement(new TextRender(`${var2 + 1}.${var1[var2]}`, this.micro))
      }
    }

    this.recordManager.closeRecordStore()
    let availableLeagues = -1
    if (this.settingsStringTrack.getMaxAvailableOptionPos() >= this.settingsStringTrack.getCurrentOptionPos()) {
      this.settingsStringTrack.setAvailableOptions(
        this.settingsStringTrack.getCurrentOptionPos() + 1 < this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()]
          ? this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()]
          : this.settingsStringTrack.getCurrentOptionPos() + 1,
      )
      this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()] =
        this.settingsStringTrack.getMaxAvailableOptionPos() < this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()]
          ? this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()]
          : this.settingsStringTrack.getMaxAvailableOptionPos()
    }

    if (this.settingsStringTrack.getCurrentOptionPos() === this.settingsStringTrack.getMaxOptionPos()) {
      this.completedLastTrack = true
      switch (this.settingStringLevel.getCurrentOptionPos()) {
        case 0:
          if (availableLeagues < 1) {
            availableLeagues = 1
            this.settingsStringLeague.setAvailableOptions(availableLeagues)
          }
          break
        case 1:
          if (availableLeagues < 2) {
            availableLeagues = 2
            this.settingsStringLeague.setAvailableOptions(availableLeagues)
          }
          break
        case 2:
          if (availableLeagues < 3) {
            availableLeagues = 3
            this.settingsStringLeague.setOptionsList(this.leagueNamesAll4)
            this.leagueNames = this.leagueNamesAll4
            this.settingsStringLeague.setAvailableOptions(availableLeagues)
          }
      }

      this.settingStringLevel.setAvailableOptions(this.settingStringLevel.getMaxAvailableOptionPos() + 1)
      if (this.unlockedTracksByLevel[this.settingStringLevel.getMaxAvailableOptionPos()] === -1) {
        this.unlockedTracksByLevel[this.settingStringLevel.getMaxAvailableOptionPos()] = 0
      }
    }

    const var3 = this.getCountOfRecordStoresWithPrefix(this.settingStringLevel.getCurrentOptionPos())
    this.addTextRender(
      this.gameMenuFinished,
      `${var3} of ${this.levelNames[this.settingStringLevel.getCurrentOptionPos()].length} tracks in ${this.levelDifficultyNames[this.settingStringLevel.getCurrentOptionPos()]} completed.`,
    )
    if (!this.completedLastTrack) {
      this.restartTrackAction.setText(`Restart: ${this.micro.levelLoader.getName(this.settingStringLevel.getCurrentOptionPos(), this.settingsStringTrack.getCurrentOptionPos())}`)
      this.nextTrackAction?.setText(`Next: ${this.micro.levelLoader.getName(this.resumeLevelIndex, this.resumeTrackIndex + 1)}`)
    } else {
      if (this.settingStringLevel.getCurrentOptionPos() < this.settingStringLevel.getMaxOptionPos()) {
        this.settingStringLevel.setCurrentOptionPos(this.settingStringLevel.getCurrentOptionPos() + 1)
        this.settingsStringTrack.setCurrentOptionPos(0)
        this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()])
      }

      if (availableLeagues !== -1) {
        this.addTextRender(this.gameMenuFinished, `Congratultions! You have successfully unlocked a new league: ${this.leagueNames[availableLeagues]}`)
        if (availableLeagues === 3) {
          this.gameMenuFinished.addMenuElement(new TextRender('Enjoy...', this.micro))
        }

        this.showAlert('League unlocked', `You have successfully unlocked a new league: ${this.leagueNames[availableLeagues]}`, null)
      } else {
        let var4 = true
        if (this.micro.levelLoader !== null) {
          for (let var5 = 0; var5 < 3; ++var5) {
            if (this.unlockedTracksByLevel[var5] !== this.micro.levelLoader.levelNames[var5].length - 1) {
              var4 = false
            }
          }
        }

        if (!var4) {
          this.addTextRender(this.gameMenuFinished, 'You have completed all tracks at this level.')
        }
      }
    }

    if (!this.completedLastTrack && this.nextTrackAction !== null) {
      this.gameMenuFinished.addMenuElement(this.nextTrackAction)
    }

    this.restartTrackAction.setText(`Restart: ${this.micro.levelLoader.getName(this.resumeLevelIndex, this.resumeTrackIndex)}`)
    this.gameMenuFinished.addMenuElement(this.restartTrackAction)
    this.gameMenuFinished.addMenuElement(this.settingStringPlayMenu)
    this.openMenu(this.gameMenuFinished, false)
  }

  repaint(): void {
    this.micro.gameCanvas?.repaint()
  }

  getCanvasHeight(): number {
    return this.micro.gameCanvas?.getHeight() ?? 0
  }

  getCanvasWidth(): number {
    return this.micro.gameCanvas?.getWidth() ?? 0
  }

  showMenuScreen(var1: number): void {
    void this.finishMenuOpenedAt
    this.isOpeningPauseMenu = false
    switch (var1) {
      case 0:
        this.openMenu(this.gameMenuMain, false)
        this.micro.gamePhysics?.enableGenerateInputAI()
        break
      case 1:
        if (this.settingStringLevel !== null && this.settingsStringTrack !== null && this.restartTrackAction !== null && this.micro.levelLoader !== null) {
          this.resumeLevelIndex = this.settingStringLevel.getCurrentOptionPos()
          this.resumeTrackIndex = this.settingsStringTrack.getCurrentOptionPos()
          this.restartTrackAction.setText(`Restart: ${this.micro.levelLoader.getName(this.resumeLevelIndex, this.resumeTrackIndex)}`)
        }
        this.restartRequested = false
        this.openMenu(this.gameMenuIngame, false)
        break
      case 2: {
        this.finishMenuOpenedAt = Time.currentTimeMillis()
        this.gameMenuFinished?.clearVector()
        if (this.settingStringLevel === null || this.settingsStringTrack === null || this.recordManager === null || this.settingsStringLeague === null || this.gameMenuFinished === null || this.finishOkAction === null || this.finishNameAction === null) {
          break
        }
        this.resumeLevelIndex = this.settingStringLevel.getCurrentOptionPos()
        this.resumeTrackIndex = this.settingsStringTrack.getCurrentOptionPos()
        this.recordManager.openRecordStoreForTrack(this.settingStringLevel.getCurrentOptionPos(), this.settingsStringTrack.getCurrentOptionPos())
        const var2 = this.recordManager.getPosOfNewRecord(this.settingsStringLeague.getCurrentOptionPos(), this.lastFinishTime)
        this.lastFinishTimeString = this.timeToString(this.lastFinishTime)
        if (var2 >= 0 && var2 <= 2) {
          const var3 = new TextRender('', this.micro)
          var3.setDx(GameCanvas.spriteSizeX[5] + 1)
          switch (var2) {
            case 0:
              var3.setText('First place!')
              var3.setDrawSprite(true, 5)
              break
            case 1:
              var3.setText('Second place!')
              var3.setDrawSprite(true, 6)
              break
            case 2:
              var3.setText('Third place!')
              var3.setDrawSprite(true, 7)
          }

          this.gameMenuFinished.addMenuElement(var3)
          const var4 = new TextRender(`${this.lastFinishTimeString}`, this.micro)
          var4.setDx(GameCanvas.spriteSizeX[5] + 1)
          this.gameMenuFinished.addMenuElement(var4)
          this.gameMenuFinished.addMenuElement(this.finishOkAction)
          this.gameMenuFinished.addMenuElement(this.finishNameAction)
          this.openMenu(this.gameMenuFinished, false)
          this.isOpeningPauseMenu = false
        } else {
          this.finalizeFinishedMenu()
        }
        break
      }
      default:
        this.openMenu(this.gameMenuMain, false)
    }

    this.micro.gameCanvas!.isDrawingTime = false
    this.micro.gamePhysics?.syncRenderStateFromSimulation()
    this.micro.gameToMenu()
  }

  renderCurrentMenu(var1: Graphics): void {
    if (this.currentGameMenu !== null && !this.isOpeningPauseMenu) {
      this.micro.gameCanvas?.drawGame(var1)
      this.fillCanvasWithImage(var1)
      this.currentGameMenu.render(var1)
    }
  }

  private fillCanvasWithImage(graphics: Graphics): void {
    if (this.rasterImage === null) {
      return
    }

    for (let y = 0; y < this.getCanvasHeight(); y += this.rasterImage.getHeight()) {
      for (let x = 0; x < this.getCanvasWidth(); x += this.rasterImage.getWidth()) {
        graphics.drawImage(this.rasterImage, x, y, Graphics.LEFT | Graphics.TOP)
      }
    }
  }

  processKeyCode(keyCode: number): void {
    if (this.currentGameMenu !== null && this.micro.gameCanvas !== null) {
      switch (this.micro.gameCanvas.getGameAction(keyCode)) {
        case 1:
          this.currentGameMenu.processGameActionUp()
          return
        case 2:
          this.currentGameMenu.processGameActionUpd(3)
          if (this.currentGameMenu === this.gameMenuHighscore && this.settingsStringLeague !== null) {
            --this.highscoreLeagueIndex
            if (this.highscoreLeagueIndex < 0) {
              this.highscoreLeagueIndex = 0
            }

            this.rebuildHighscoreMenu(this.highscoreLeagueIndex)
          }
          return
        case 5:
          this.currentGameMenu.processGameActionUpd(2)
          if (this.currentGameMenu === this.gameMenuHighscore && this.settingsStringLeague !== null) {
            ++this.highscoreLeagueIndex
            if (this.highscoreLeagueIndex > this.settingsStringLeague.getMaxAvailableOptionPos()) {
              this.highscoreLeagueIndex = this.settingsStringLeague.getMaxAvailableOptionPos()
            }

            this.rebuildHighscoreMenu(this.highscoreLeagueIndex)
          }
          return
        case 6:
          this.currentGameMenu.processGameActionDown()
          return
        case 8:
          this.currentGameMenu.processGameActionUpd(1)
          return
        default:
          return
      }
    }
  }

  handleBackAction(): void {
    if (this.currentGameMenu === null) {
      return
    }

    if (this.currentGameMenu === this.gameMenuIngame) {
      this.micro.menuToGame()
      return
    }

    this.openMenu(this.currentGameMenu.getParentMenu(), true)
  }

  getCurrentMenu(): GameMenu | null {
    return this.currentGameMenu
  }

  openMenu(gm: GameMenu | null, preserveSelection: boolean): void {
    this.micro.gameCanvas?.hideBackButton()
    if (gm !== this.gameMenuMain && gm !== this.gameMenuFinished && gm !== null) {
      this.micro.gameCanvas?.showBackButton()
    }

    if (gm === this.gameMenuHighscore) {
      if (this.settingsStringLeague !== null) {
        this.highscoreLeagueIndex = this.settingsStringLeague.getCurrentOptionPos()
        this.rebuildHighscoreMenu(this.highscoreLeagueIndex)
      }
    } else if (gm === this.gameMenuFinished) {
      this.playerNameBytes = this.gameMenuEnterName?.getStrArr() ?? this.playerNameBytes
      this.finishNameAction?.setText(`Name - ${this.makeString(this.playerNameBytes)}`)
    } else if (gm === this.gameMenuPlay) {
      if (this.settingStringLevel !== null && this.settingsStringTrack !== null && this.micro.levelLoader !== null) {
        this.settingsStringTrack.setOptionsList(this.micro.levelLoader.levelNames[this.settingStringLevel.getCurrentOptionPos()])
        if (this.currentGameMenu === this.trackSelectionMenu) {
          this.selectedTrackByLevel[this.settingStringLevel.getCurrentOptionPos()] = this.settingsStringTrack.getCurrentOptionPos()
        }

        this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()])
        this.settingsStringTrack.setCurrentOptionPos(this.selectedTrackByLevel[this.settingStringLevel.getCurrentOptionPos()])
      }
    }

    if (gm === this.gameMenuMain || gm === this.gameMenuPlay) {
      this.micro.gamePhysics?.enableGenerateInputAI()
    }

    this.currentGameMenu = gm
    if (this.currentGameMenu !== null && !preserveSelection) {
      this.currentGameMenu.selectFirstMenuItem()
    }

    this.isOpeningPauseMenu = false
  }

  rebuildHighscoreMenu(var1: number): void {
    if (this.gameMenuHighscore === null || this.recordManager === null || this.settingStringLevel === null || this.settingsStringTrack === null || this.settingsStringLeague === null || this.micro.levelLoader === null || this.settingStringBack === null) {
      return
    }

    this.gameMenuHighscore.clearVector()
    this.recordManager.openRecordStoreForTrack(this.settingStringLevel.getCurrentOptionPos(), this.settingsStringTrack.getCurrentOptionPos())
    this.gameMenuHighscore.addMenuElement(new TextRender(this.micro.levelLoader.getName(this.settingStringLevel.getCurrentOptionPos(), this.settingsStringTrack.getCurrentOptionPos()), this.micro))
    this.gameMenuHighscore.addMenuElement(new TextRender(`LEAGUE: ${this.settingsStringLeague.getOptionsList()[var1]}`, this.micro))
    const var2 = this.recordManager.getRecordDescription(var1)

    for (let var3 = 0; var3 < var2.length; ++var3) {
      if (var2[var3] !== '') {
        const var4 = new TextRender(`${var3 + 1}.${var2[var3]}`, this.micro)
        var4.setDx(GameCanvas.spriteSizeX[5] + 1)
        if (var3 === 0) {
          var4.setDrawSprite(true, 5)
        } else if (var3 === 1) {
          var4.setDrawSprite(true, 6)
        } else if (var3 === 2) {
          var4.setDrawSprite(true, 7)
        }

        this.gameMenuHighscore.addMenuElement(var4)
      }
    }

    this.recordManager.closeRecordStore()
    if (var2[0] === '') {
      this.gameMenuHighscore.addMenuElement(new TextRender('No Highscores', this.micro))
    }

    this.gameMenuHighscore.addMenuElement(this.settingStringBack)
  }

  saveAndClose(): void {
    if (this.isRecordStoreOpened) {
      this.persistState()

      try {
        this.recordStore?.closeRecordStore()
        this.isRecordStoreOpened = false
      } catch {}
    }

    this.currentGameMenu = null
  }

  persistState(): void {
    this.copyThreeBytesFromArr(16, this.playerNameBytes)

    this.setValue(0, this.perspectiveSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(1, this.shadowsSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(2, this.driverSpriteSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(3, this.bikeSpriteSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(14, this.inputSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(4, this.lookAheadSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(13, this.zoomSetting?.getCurrentOptionPos() ?? 0)
    this.setValue(5, this.settingsStringLeague?.getMaxAvailableOptionPos() ?? 0)
    this.setValue(6, this.settingStringLevel?.getMaxAvailableOptionPos() ?? 0)
    this.setValue(10, this.settingStringLevel?.getCurrentOptionPos() ?? 0)
    this.setValue(11, this.settingsStringTrack?.getCurrentOptionPos() ?? 0)
    this.setValue(12, this.settingsStringLeague?.getCurrentOptionPos() ?? 0)

    for (let i = 0; i < 3; ++i) {
      this.setValue(7 + i, this.unlockedTracksByLevel[i])
    }

    if (this.recordStore === null) {
      return
    }

    if (this.recordStoreRecordId === -1) {
      try {
        this.recordStoreRecordId = this.recordStore.addRecord(this.persistedStateBuffer, 0, 19)
      } catch {}
    } else {
      try {
        this.recordStore.setRecord(this.recordStoreRecordId, this.persistedStateBuffer, 0, 19)
      } catch {}
    }
  }

  run(): void {}

  showAlert(title: string, alertText: string, image: Image | null): void {
    void image
    if (title !== '') {
      this.micro.gameCanvas?.scheduleGameTimerTask(title, 2000)
    }
    console.info(alertText)
  }

  handleMenuSelection(menuElement: IGameMenuElement): void {
    if (menuElement === this.taskStart) {
      if (
        this.settingStringLevel !== null &&
        this.settingsStringTrack !== null &&
        this.settingsStringLeague !== null &&
        this.settingStringLevel.getCurrentOptionPos() <= this.settingStringLevel.getMaxAvailableOptionPos() &&
        this.settingsStringTrack.getCurrentOptionPos() <= this.settingsStringTrack.getMaxAvailableOptionPos() &&
        this.settingsStringLeague.getCurrentOptionPos() <= this.settingsStringLeague.getMaxAvailableOptionPos()
      ) {
        this.micro.gamePhysics?.disableGenerateInputAI()
        this.micro.levelLoader?.loadLevel(this.settingStringLevel.getCurrentOptionPos(), this.settingsStringTrack.getCurrentOptionPos())
        this.micro.gamePhysics?.setMotoLeague(this.settingsStringLeague.getCurrentOptionPos())
        this.restartRequested = true
        this.micro.menuToGame()
      } else {
        this.showAlert('GWTR', 'Complete more tracks to unlock this track/league combo.', null)
      }
      return
    }

    if (menuElement === this.perspectiveSetting) {
      this.micro.gamePhysics?.applyPerspectiveOffset(this.perspectiveSetting.getCurrentOptionPos() === 0)
      LevelLoader.isEnabledPerspective = this.perspectiveSetting.getCurrentOptionPos() === 0
      return
    }

    if (menuElement === this.shadowsSetting) {
      LevelLoader.isEnabledShadows = this.shadowsSetting.getCurrentOptionPos() === 0
      return
    }

    if (menuElement === this.driverSpriteSetting) {
      if (this.driverSpriteSetting.consumeSelectionMenuRequested()) {
        this.driverSpriteSetting.setCurrentOptionPos(this.driverSpriteSetting.getCurrentOptionPos() + 1)
      }
      return
    }

    if (menuElement === this.bikeSpriteSetting) {
      if (this.bikeSpriteSetting.consumeSelectionMenuRequested()) {
        this.bikeSpriteSetting.setCurrentOptionPos(this.bikeSpriteSetting.getCurrentOptionPos() + 1)
      }
      return
    }

    if (menuElement === this.inputSetting) {
      if (this.inputSetting.consumeSelectionMenuRequested()) {
        this.inputSetting.setCurrentOptionPos(this.inputSetting.getCurrentOptionPos() + 1)
      }

      this.micro.gameCanvas?.setInputMode(this.inputSetting.getCurrentOptionPos())
      return
    }

    if (menuElement === this.lookAheadSetting) {
      this.micro.gamePhysics?.setEnableLookAhead(this.lookAheadSetting.getCurrentOptionPos() === 0)
      return
    }

    if (menuElement === this.zoomSetting) {
      if (this.zoomSetting.consumeSelectionMenuRequested()) {
        this.zoomSetting.setCurrentOptionPos(this.zoomSetting.getCurrentOptionPos() + 1)
      }
      return
    }

    if (menuElement === this.confirmYes) {
      if (this.currentGameMenu === this.gameMenuConfirmClear) {
        this.recordManager?.deleteRecordStores()
        this.showAlert('Cleared', 'Highscores have been cleared', null)
      } else if (this.currentGameMenu === this.gameMenuConfirmReset) {
        this.exit()
        this.showAlert('Reset', 'Master reset. Application will be closed.', null)
      }

      this.openMenu(this.currentGameMenu?.getParentMenu() ?? null, false)
      return
    }

    if (menuElement === this.confirmNo) {
      this.openMenu(this.currentGameMenu?.getParentMenu() ?? null, false)
      return
    }

    if (menuElement === this.settingStringBack) {
      this.openMenu(this.currentGameMenu?.getParentMenu() ?? null, true)
      return
    }

    if (menuElement === this.settingStringPlayMenu) {
      if (this.settingStringLevel !== null && this.settingsStringTrack !== null) {
        this.settingStringLevel.setCurrentOptionPos(this.resumeLevelIndex)
        this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.resumeLevelIndex])
        this.settingsStringTrack.setCurrentOptionPos(this.resumeTrackIndex)
      }
      this.openMenu(this.currentGameMenu?.getParentMenu() ?? null, false)
      return
    }

    if (menuElement === this.settingStringGoToMain) {
      this.openMenu(this.gameMenuMain, false)
      return
    }

    if (menuElement === this.settingStringExitGame) {
      this.openMenu(this.currentGameMenu?.getParentMenu() ?? null, false)
      return
    }

    if (menuElement === this.restartTrackAction) {
      if (this.settingsStringLeague !== null && this.settingStringLevel !== null && this.settingsStringTrack !== null && this.settingsStringLeague.getCurrentOptionPos() <= this.settingsStringLeague.getMaxAvailableOptionPos()) {
        this.settingStringLevel.setCurrentOptionPos(this.resumeLevelIndex)
        this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.resumeLevelIndex])
        this.settingsStringTrack.setCurrentOptionPos(this.resumeTrackIndex)
        this.micro.gamePhysics?.setMotoLeague(this.settingsStringLeague.getCurrentOptionPos())
        this.restartRequested = true
        this.micro.menuToGame()
      }
      return
    }

    if (menuElement === this.nextTrackAction) {
      if (!this.completedLastTrack) {
        this.settingsStringTrack?.menuElemMethod(2)
      }

      if (this.settingStringLevel !== null && this.settingsStringTrack !== null && this.settingsStringLeague !== null) {
        this.micro.levelLoader?.loadLevel(this.settingStringLevel.getCurrentOptionPos(), this.settingsStringTrack.getCurrentOptionPos())
        this.micro.gamePhysics?.setMotoLeague(this.settingsStringLeague.getCurrentOptionPos())
        this.persistState()
        this.restartRequested = true
        this.micro.menuToGame()
      }
      return
    }

    if (menuElement === this.settingStringContinue) {
      this.repaint()
      this.micro.menuToGame()
      return
    }

    if (menuElement === this.finishNameAction) {
      this.gameMenuEnterName?.selectFirstMenuItem()
      this.openMenu(this.gameMenuEnterName, false)
      return
    }

    if (menuElement === this.finishOkAction) {
      this.finalizeFinishedMenu()
      return
    }

    if (menuElement === this.settingsStringTrack) {
      if (this.settingsStringTrack.consumeSelectionMenuRequested()) {
        this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.settingStringLevel?.getCurrentOptionPos() ?? 0])
        this.settingsStringTrack.init()
        this.trackSelectionMenu = this.settingsStringTrack.getCurrentMenu()
        this.openMenu(this.trackSelectionMenu, false)
        this.trackSelectionMenu?.scrollToSelection(this.settingsStringTrack.getCurrentOptionPos())
      }

      if (this.settingStringLevel !== null) {
        this.selectedTrackByLevel[this.settingStringLevel.getCurrentOptionPos()] = this.settingsStringTrack.getCurrentOptionPos()
      }
      return
    }

    if (menuElement === this.settingStringLevel) {
      if (this.settingStringLevel.consumeSelectionMenuRequested()) {
        this.gameMenuStringLevel = this.settingStringLevel.getCurrentMenu()
        this.openMenu(this.gameMenuStringLevel, false)
        this.gameMenuStringLevel?.scrollToSelection(this.settingStringLevel.getCurrentOptionPos())
      }

      if (this.micro.levelLoader !== null && this.settingsStringTrack !== null) {
        this.settingsStringTrack.setOptionsList(this.micro.levelLoader.levelNames[this.settingStringLevel.getCurrentOptionPos()])
        this.settingsStringTrack.setAvailableOptions(this.unlockedTracksByLevel[this.settingStringLevel.getCurrentOptionPos()])
        this.settingsStringTrack.setCurrentOptionPos(this.selectedTrackByLevel[this.settingStringLevel.getCurrentOptionPos()])
        this.settingsStringTrack.init()
      }
      return
    }

    if (menuElement === this.settingsStringLeague && this.settingsStringLeague.consumeSelectionMenuRequested()) {
      this.gameMenuLeague = this.settingsStringLeague.getCurrentMenu()
      this.settingsStringLeague.setParentGameMenu(this.currentGameMenu)
      this.openMenu(this.gameMenuLeague, false)
      this.gameMenuLeague?.scrollToSelection(this.settingsStringLeague.getCurrentOptionPos())
    }
  }

  getLoadedSpriteFlags(): number {
    let var1 = 0
    if ((this.driverSpriteSetting?.getCurrentOptionPos() ?? 1) === 0) {
      var1 |= 2
    }

    if ((this.bikeSpriteSetting?.getCurrentOptionPos() ?? 1) === 0) {
      var1 |= 1
    }

    return var1
  }

  applyLoadedSpriteFlags(var1: number): void {
    this.bikeSpriteSetting?.setCurrentOptionPos(1)
    this.driverSpriteSetting?.setCurrentOptionPos(1)
    if ((var1 & 1) > 0) {
      this.bikeSpriteSetting?.setCurrentOptionPos(0)
    }

    if ((var1 & 2) > 0) {
      this.driverSpriteSetting?.setCurrentOptionPos(0)
    }
  }

  getSelectedLevel(): number {
    return this.settingStringLevel?.getCurrentOptionPos() ?? 0
  }

  getSelectedTrack(): number {
    return this.settingsStringTrack?.getCurrentOptionPos() ?? 0
  }

  getSelectedLeague(): number {
    return this.settingsStringLeague?.getCurrentOptionPos() ?? 0
  }

  getZoom(): number {
    return (this.zoomSetting?.getCurrentOptionPos() ?? 0) + 1
  }

  setFinishTime(var1: number): void {
    this.lastFinishTime = var1
  }

  private readStoredNameBytes(var1: number, var2: number): Int8Array {
    switch (var1) {
      case 16: {
        const var3 = new Int8Array(3)
        for (let var4 = 0; var4 < 3; ++var4) {
          var3[var4] = this.persistedStateBuffer[16 + var4]
        }

        if (var3[0] === -127) {
          var3[0] = var2
        }
        return var3
      }
      default:
        return new Int8Array(0)
    }
  }

  private readStoredValue(var1: number, var2: number): number {
    return this.persistedStateBuffer[var1] === -127 ? var2 : this.persistedStateBuffer[var1]
  }

  private copyThreeBytesFromArr(var1: number, var2: Uint8Array): void {
    if (this.isRecordStoreOpened && var1 === 16) {
      for (let i = 0; i < 3; ++i) {
        this.persistedStateBuffer[16 + i] = var2[i]
      }
    }
  }

  private timeToString(time: number): string {
    this.lastFinishSeconds = Math.trunc(time / 100)
    this.lastFinishCentiseconds = Math.trunc(time % 100)
    let timeStr = this.lastFinishSeconds / 60 < 10 ? ` 0${Math.trunc(this.lastFinishSeconds / 60)}` : ` ${Math.trunc(this.lastFinishSeconds / 60)}`
    if (this.lastFinishSeconds % 60 < 10) {
      timeStr += `:0${this.lastFinishSeconds % 60}`
    } else {
      timeStr += `:${this.lastFinishSeconds % 60}`
    }

    if (this.lastFinishCentiseconds < 10) {
      timeStr += `.0${this.lastFinishCentiseconds}`
    } else {
      timeStr += `.${this.lastFinishCentiseconds}`
    }

    return timeStr
  }

  private setValue(pos: number, value: number): void {
    if (this.isRecordStoreOpened) {
      this.persistedStateBuffer[pos] = value
    }
  }

  private exit(): void {
    this.perspectiveSetting?.setCurrentOptionPos(0)
    this.shadowsSetting?.setCurrentOptionPos(0)
    this.driverSpriteSetting?.setCurrentOptionPos(0)
    this.bikeSpriteSetting?.setCurrentOptionPos(0)
    this.lookAheadSetting?.setCurrentOptionPos(0)
    this.zoomSetting?.setCurrentOptionPos(0)
    this.settingsStringLeague?.setCurrentOptionPos(0)
    this.settingsStringLeague?.setAvailableOptions(0)
    this.settingStringLevel?.setCurrentOptionPos(0)
    this.settingStringLevel?.setAvailableOptions(1)
    this.settingsStringTrack?.setCurrentOptionPos(0)
    this.playerNameBytes[0] = 65
    this.playerNameBytes[1] = 65
    this.playerNameBytes[2] = 65
    this.inputSetting?.setCurrentOptionPos(0)
    this.unlockedTracksByLevel[0] = 0
    this.unlockedTracksByLevel[1] = 0
    this.unlockedTracksByLevel[2] = -1
    this.availableLeagues = 0
    this.persistState()
    this.recordManager?.deleteRecordStores()
  }

  private getCountOfRecordStoresWithPrefix(prefixNumber: number): number {
    const storeNames = RecordStore.listRecordStores()
    if (this.recordManager !== null && storeNames.length !== 0) {
      let count = 0

      for (let i = 0; i < storeNames.length; ++i) {
        if (storeNames[i].startsWith(String(prefixNumber))) {
          ++count
        }
      }

      return count
    }

    return 0
  }

  private makeString(value: Uint8Array): string {
    return String.fromCharCode(value[0], value[1], value[2])
  }
}
