type TouchControlsHandlers = {
  keyPressed: (keyCode: number) => void
  keyReleased: (keyCode: number) => void
  back: () => void
}

export class TouchControls {
  private readonly container: HTMLDivElement

  constructor(root: HTMLElement, handlers: TouchControlsHandlers) {
    this.container = document.createElement('div')
    this.container.className = 'touch-controls'
    this.container.addEventListener('contextmenu', (event) => event.preventDefault())

    const keys: Array<[string, string, number]> = [
      ['touch-left', 'Lean backward', 2],
      ['touch-right', 'Lean forward', 5],
      ['touch-up', 'Accelerate', 1],
      ['touch-down', 'Brake', 6],
      ['touch-ok', 'Select', 8],
    ]

    for (const [className, label, keyCode] of keys) {
      const button = this.addButton(className, label)
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        button.setPointerCapture(event.pointerId)
        button.classList.add('pressed')
        handlers.keyPressed(keyCode)
      })

      const release = (): void => {
        button.classList.remove('pressed')
        handlers.keyReleased(keyCode)
      }
      button.addEventListener('pointerup', release)
      button.addEventListener('pointercancel', release)
    }

    this.addButton('touch-back', 'Menu or back').addEventListener('pointerdown', (event) => {
      event.preventDefault()
      handlers.back()
    })

    root.append(this.container)
  }

  update(isInMenu: boolean, isBackAvailable: boolean): void {
    const className = `touch-controls${isInMenu ? ' in-menu' : ''}${isBackAvailable ? ' has-back' : ''}`
    if (this.container.className !== className) {
      this.container.className = className
    }
  }

  private addButton(className: string, label: string): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = className
    button.setAttribute('aria-label', label)
    this.container.append(button)
    return button
  }
}
