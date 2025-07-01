import { Modal } from './modal'
import type { ModalOptions } from './modal.type'

type GlobalEvt = 'init' | 'open' | 'close'

class ModalManager {
  private map = new Map<HTMLElement, Modal>()
  private listeners = new Map<GlobalEvt, Function[]>()
  private triggers = new WeakSet<HTMLElement>()

  initAll(opts: ModalOptions = {}) {
    document.querySelectorAll<HTMLElement>('[data-modal]')
      .forEach(el => this.init(el, opts))
    this.bindTriggers()
  }

  init(el: string | HTMLElement, opts: ModalOptions = {}) {
    const target = typeof el === 'string'
      ? document.querySelector<HTMLElement>(el)
      : el

    if (!target?.dataset.modal || this.map.has(target)) return

    const modal = new Modal(target, {
      ...opts,
      onInit: m => {
        opts.onInit?.(m)
        this.emit('init', m)
      },
      onOpen: m => {
        opts.onOpen?.(m)
        this.emit('open', m)
      },
      onClose: m => {
        opts.onClose?.(m)
        this.emit('close', m)
      }
    })

    this.map.set(target, modal)
  }

  bindTriggers() {
    document.querySelectorAll<HTMLElement>('[data-modal-trigger]').forEach(btn => {
      if (this.triggers.has(btn)) return

      const key = btn.dataset.modalTrigger
      if (!key) return

      const el = document.querySelector<HTMLElement>(`[data-modal="${key}"]`)
      const modal = el && this.get(el)
      if (modal) {
        btn.addEventListener('click', () => modal.openModal())
        this.triggers.add(btn)
      }
    })
  }

  get(el: string | HTMLElement): Modal | undefined {
    const target = typeof el === 'string'
      ? document.querySelector<HTMLElement>(el)
      : el
    return target ? this.map.get(target) : undefined
  }

  show(el: string | HTMLElement) {
    this.get(el)?.openModal()
  }

  hide(el: string | HTMLElement) {
    this.get(el)?.close()
  }

  destroy(el: string | HTMLElement) {
    const target = typeof el === 'string'
      ? document.querySelector<HTMLElement>(el)
      : el
    const inst = target && this.map.get(target)
    if (inst) {
      inst.destroy()
      this.map.delete(target!)
    }
  }

  destroyAll() {
    this.map.forEach(modal => modal.destroy())
    this.map.clear()
  }

  onAny(evt: GlobalEvt, cb: (modal: Modal) => void) {
    if (!this.listeners.has(evt)) this.listeners.set(evt, [])
    this.listeners.get(evt)!.push(cb)
  }

  private emit(evt: GlobalEvt, modal: Modal) {
    this.listeners.get(evt)?.forEach(cb => cb(modal))
  }
}

// Оставляем приватный экземпляр
const manager = new ModalManager()

// Экспорт только нужных методов
export const ModalApi = {
  initAll: manager.initAll.bind(manager),
  init: manager.init.bind(manager),
  show: manager.show.bind(manager),
  hide: manager.hide.bind(manager),
  destroy: manager.destroy.bind(manager),
  destroyAll: manager.destroyAll.bind(manager),
  get: manager.get.bind(manager),
  onAnyInit: (cb: (modal: Modal) => void) => manager.onAny('init', cb),
  onAnyOpen: (cb: (modal: Modal) => void) => manager.onAny('open', cb),
  onAnyClose: (cb: (modal: Modal) => void) => manager.onAny('close', cb)
}
