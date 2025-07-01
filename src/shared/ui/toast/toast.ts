import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

import { ToastEvent, type ToastOptions, type ToastifyInstance } from './toast.type'

gsap.registerPlugin(Draggable)

const addSwipeDraggable = (node: HTMLElement, onClose: () => void) => {
  Draggable.create(node, {
    type: 'x',
    edgeResistance: 0.7,
    bounds: { minX: -window.innerWidth, maxX: window.innerWidth },
    inertia: true,
    onDragEnd: function () {
      if (Math.abs(this.x) > 100) {
        gsap.to(node, {
          x: this.x > 0 ? 500 : -500,
          opacity: 0,
          duration: 0.3,
          onComplete: onClose
        })
      } else {
        gsap.to(node, { x: 0, duration: 0.2, opacity: 1 })
      }
    }
  })
  gsap.set(node, { x: 0, opacity: 1 })
}

export class Toast {
  private toastifyInstance?: ToastifyInstance
  private autoCloseTimer?: number
  private _resolvedCloseEl?: HTMLElement

  // Новое: храним все элементы с data-toast-close и обработчик
  private _closeEls: HTMLElement[] = []
  private _onAnyCloseClick = (e: MouseEvent) => {
    e.stopPropagation()
    this.hide()
  }

  public isClosed = true

  constructor(
    public options: ToastOptions & { node?: HTMLElement; closeElement?: string | HTMLElement }
  ) {
    if (!options.node && !options.text) {
      throw new Error('[Toast] options.node or options.text required')
    }

    if (options.node) {
      options.node.dataset.toastInit = 'true'
    }

    queueMicrotask(() => {
      document.dispatchEvent(new CustomEvent(ToastEvent.Init, { detail: { instance: this } }))
      document.dispatchEvent(new CustomEvent(ToastEvent.GlobalInit, { detail: { instance: this } }))
    })
  }

  public show(): void {
    clearTimeout(this.autoCloseTimer)

    if (!this.isClosed) {
      this.resetAutoClose()
      return
    }

    this.isClosed = false

    let options = { ...this.options }
    let nodeClone: HTMLElement | undefined

    if (options.node instanceof HTMLElement) {
      nodeClone = options.node.cloneNode(true) as HTMLElement

      addSwipeDraggable(nodeClone, () => this.hide())

      // Навешиваем обработчик на все элементы с data-toast-close
      this.addCloseListeners(nodeClone)

      options = {
        ...options,
        node: nodeClone,
        text: undefined
      }
    }

    this.toastifyInstance = Toastify({
      ...options,
      callback: () => {
        this.options.onClick?.(this)
      }
    })

    this.toastifyInstance.showToast()
    this.options.onShown?.(this)

    this.resetAutoClose()

    document.dispatchEvent(new CustomEvent(ToastEvent.Open, { detail: { instance: this } }))
    document.dispatchEvent(new CustomEvent(ToastEvent.GlobalOpen, { detail: { instance: this } }))
  }

  public hide(): void {
    if (this.isClosed) return
    this.isClosed = true
    clearTimeout(this.autoCloseTimer)
    this.toastifyInstance?.hideToast()
    this.options.onHidden?.(this)

    // Снимаем все обработчики закрытия
    this.removeCloseListeners()

    document.dispatchEvent(new CustomEvent(ToastEvent.Close, { detail: { instance: this } }))
    document.dispatchEvent(new CustomEvent(ToastEvent.GlobalClose, { detail: { instance: this } }))
  }

  public destroy(): void {
    this.hide()
    if (this.options.node) {
      delete this.options.node.dataset.toastInit
    }
    this.removeCloseListeners()
  }

  private resetAutoClose(): void {
    clearTimeout(this.autoCloseTimer)
    const d = this.options.duration
    if (typeof d === 'number' && d > 0) {
      this.autoCloseTimer = window.setTimeout(() => this.hide(), d)
    }
  }

  // ---- data-toast-close support ----
  private addCloseListeners(node: HTMLElement) {
    // Находим все элементы с data-toast-close внутри node
    this._closeEls = Array.from(node.querySelectorAll<HTMLElement>('[data-toast-close]'))
    // Если сам node тоже с data-toast-close — добавляем его
    if (node.hasAttribute('data-toast-close')) {
      this._closeEls.push(node)
    }
    // Навешиваем обработчик на все найденные элементы
    this._closeEls.forEach(el => el.addEventListener('click', this._onAnyCloseClick))
  }

  private removeCloseListeners() {
    this._closeEls.forEach(el => el.removeEventListener('click', this._onAnyCloseClick))
    this._closeEls = []
  }
}
