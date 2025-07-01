import type { Modal } from "./modal"

export interface ModalOptions {
  renderToBody?: boolean
  trapFocus?: boolean
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean

  onInit?: (modal: Modal) => void
  onOpen?: (modal: Modal) => void
  onClose?: (modal: Modal) => void
}

export type ModalEvents = 'onInit' | 'onOpen' | 'onClose'
