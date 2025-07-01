export type AccordionInstance = {
  open: (index: number) => void
  close: (index: number) => void
  destroy?: () => void
  elements?: HTMLElement[]
}

export type AccordionElementInstance = {
  element: HTMLElement
  index: number
  open: () => void
  close: () => void
  isOpen: () => boolean
}

export type AccordionOptions = {
  duration?: number
  showMultiple?: boolean
  elementClass?: string
  triggerClass?: string
  activeClass?: string
  panelClass?: string
  onOpen?: (element: HTMLElement) => void
  onClose?: (element: HTMLElement) => void
}

export type AccordionApi = {
  initAll: () => void
  init: (selector: HTMLElement | string) => void
  reinitAll: () => void
  reinit: (selector: HTMLElement | string) => void
  destroyAll: () => void
  destroy: (selector: HTMLElement | string) => void
  openAll: () => void
  open: (selector: HTMLElement | string) => void
  closeAll: () => void
  close: (selector: HTMLElement | string) => void
  on: (event: 'open' | 'close', callback: (element: HTMLElement) => void) => void
  off: (event: 'open' | 'close', callback: (element: HTMLElement) => void) => void
  getInstance: (selector: HTMLElement | string) => AccordionInstance | null
  getElementInstance: (selector: HTMLElement | string) => AccordionElementInstance | null
}
