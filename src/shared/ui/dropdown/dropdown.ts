// dropdownApi.ts

type TDropdownElement = string | HTMLElement

export interface IDropdownInstance {
  open(): void
  close(): void
  toggle(): void
  destroy(): void
}

export interface IDropdownConfig {
  triggerAttr?: string
  menuAttr?: string
  onInitialize?: (this: IDropdownInstance) => void
  onOpen?: (this: IDropdownInstance) => void
  onClose?: (this: IDropdownInstance) => void
}

const instances = new WeakMap<HTMLElement, IDropdownInstance>()

const getElement = (el: TDropdownElement): HTMLElement | null =>
  typeof el === 'string' ? document.querySelector(el) : el

const isInit = (el: TDropdownElement): boolean => {
  const node = getElement(el)
  return !!node && instances.has(node)
}

export function initDropdown(
  el: TDropdownElement,
  config: IDropdownConfig = {}
): IDropdownInstance | null {
  const container = getElement(el)
  if (!container) return null
  if (instances.has(container)) return instances.get(container)!

  const {
    triggerAttr = 'data-dropdown-trigger',
    menuAttr = 'data-dropdown-menu',
    onInitialize,
    onOpen,
    onClose,
  } = config

  const trigger = container.querySelector<HTMLElement>(`[${triggerAttr}]`)
  const menu = container.querySelector<HTMLElement>(`[${menuAttr}]`)

  if (!trigger || !menu) {
    console.error('[dropdownApi] trigger или menu не найдены в', container)
    return null
  }

  // открывает через добавление класса is-open
  const open = () => {
    menu.classList.add('is-open')
    trigger.setAttribute('aria-expanded', 'true')
    onOpen?.call(instance)
  }

  // закрывает через удаление класса is-open
  const close = () => {
    menu.classList.remove('is-open')
    trigger.setAttribute('aria-expanded', 'false')
    onClose?.call(instance)
  }

  const toggle = () => {
    menu.classList.contains('is-open') ? close() : open()
  }

  const handleToggle = (e: Event) => {
    e.stopPropagation()
    toggle()
  }

  const handleOutsideClick = (e: Event) => {
    if (!container.contains(e.target as Node)) {
      close()
    }
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
    }
  }

  const destroy = () => {
    trigger.removeEventListener('click', handleToggle)
    document.removeEventListener('click', handleOutsideClick, true)
    document.removeEventListener('keydown', handleEscape, true)
    container.removeAttribute('data-dropdown-init')
    instances.delete(container)
  }

  const instance: IDropdownInstance = { open, close, toggle, destroy }

  trigger.addEventListener('click', handleToggle)
  document.addEventListener('click', handleOutsideClick, true)
  document.addEventListener('keydown', handleEscape, true)

  container.setAttribute('data-dropdown-init', 'true')
  instances.set(container, instance)

  onInitialize?.call(instance)

  return instance
}

export function reInitDropdown(
  el: TDropdownElement,
  config: IDropdownConfig = {}
): IDropdownInstance | null {
  const container = getElement(el)
  if (!container) return null
  instances.get(container)?.destroy()
  return initDropdown(container, config)
}

export function destroyDropdown(el: TDropdownElement): void {
  const container = getElement(el)
  const inst = container && instances.get(container)
  if (inst) inst.destroy()
}

export const dropdownApi = {
  init: initDropdown,
  reInit: reInitDropdown,
  destroy: destroyDropdown,
  isInit,
  getInstance: (el: TDropdownElement) => {
    const container = getElement(el)
    return container ? instances.get(container) : undefined
  },
  initAll(config: IDropdownConfig = {}) {
    document
      .querySelectorAll<HTMLElement>('[data-dropdown]')
      .forEach(el => initDropdown(el, config))
  },
  reInitAll(config: IDropdownConfig = {}) {
    document
      .querySelectorAll<HTMLElement>('[data-dropdown]')
      .forEach(el => reInitDropdown(el, config))
  },
  destroyAll() {
    document
      .querySelectorAll<HTMLElement>('[data-dropdown]')
      .forEach(el => destroyDropdown(el))
  },
}
