import { renderToBody } from '@shared/scripts/utils/render-to-body'
import type { ModalEvents, ModalOptions } from './modal.type'
import { scrollManager } from '@shared/scripts/libs/lenis/lenis';

export class Modal {
  el!: HTMLElement
  open = false
  opts: ModalOptions
  events = new Map<ModalEvents, Function[]>()

  private onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.opts.closeOnEsc) this.close()
  }

  private onFocusTrap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const els = this.getFocusable()
    if (!els.length) return
    const [first, last] = [els[0], els[els.length - 1]]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  private closeButtons: HTMLElement[] = []
  private backdropEl?: HTMLElement

  constructor(el: string | HTMLElement, opts: ModalOptions = {}) {
    this.opts = this.merge(opts)
    this.init(el, opts)
  }

  init(el: string | HTMLElement, opts: ModalOptions = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el)! : el
    if (!this.el) throw new Error('Modal element not found')

    this.opts = this.merge(opts)
    this.el.setAttribute('role', 'dialog')
    this.el.setAttribute('aria-modal', 'true')
    this.el.classList.remove('active')
      ; (this.el as any).modal = this

    if (this.opts.renderToBody) renderToBody(this.el)

    this.closeButtons = Array.from(this.el.querySelectorAll('[data-modal-close]'))
    this.closeButtons.forEach(btn => btn.addEventListener('click', this.close))

    if (this.opts.closeOnBackdrop) {
      this.backdropEl = this.el.querySelector('[data-modal-backdrop]') as HTMLElement
      this.backdropEl?.addEventListener('click', this.close)
    }

    this.emit('onInit')
    this.opts.onInit?.(this)
  }

  reinit(opts: ModalOptions = {}) {
    this.destroy()
    this.init(this.el, opts)
  }

  openModal() {
    if (this.open) return
    this.el.classList.add('active')
    this.el.setAttribute('aria-hidden', 'false')
    this.open = true
    scrollManager.disableScroll()
    document.addEventListener('keydown', this.onEsc)
    if (this.opts.trapFocus) document.addEventListener('keydown', this.onFocusTrap)
    this.getFocusable()[0]?.focus()
    this.emit('onOpen')
    this.opts.onOpen?.(this)
  }

  close = () => {
    if (!this.open) return
    this.el.classList.remove('active')
    this.el.setAttribute('aria-hidden', 'true')
    this.open = false
    scrollManager.enableScroll()
    document.removeEventListener('keydown', this.onEsc)
    document.removeEventListener('keydown', this.onFocusTrap)
    this.emit('onClose')
    this.opts.onClose?.(this)
  }

  toggle() {
    this.open ? this.close() : this.openModal()
  }

  destroy() {
    this.events.clear()
      ; (this.el as any).modal = null
    this.closeButtons.forEach(btn => btn.removeEventListener('click', this.close))
    this.backdropEl?.removeEventListener('click', this.close)
    document.removeEventListener('keydown', this.onEsc)
    document.removeEventListener('keydown', this.onFocusTrap)
    this.closeButtons = []
    this.backdropEl = undefined
    this.el = null!
  }

  on(evt: ModalEvents, cb: Function) {
    if (!this.events.has(evt)) this.events.set(evt, [])
    this.events.get(evt)!.push(cb)
  }

  private emit(evt: ModalEvents) {
    this.events.get(evt)?.forEach(cb => cb(this))
  }

  private merge(opts: ModalOptions): ModalOptions {
    return {
      renderToBody: true,
      trapFocus: true,
      closeOnEsc: true,
      closeOnBackdrop: true,
      onInit: undefined,
      onOpen: undefined,
      onClose: undefined,
      ...opts
    }
  }

  private getFocusable(): HTMLElement[] {
    return Array.from(
      this.el.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'))
  }
}
