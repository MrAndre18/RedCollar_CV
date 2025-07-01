//@ts-ignore
import Accordion from 'accordion-js'
import 'accordion-js/dist/accordion.min.css'

import type {
  AccordionApi,
  AccordionElementInstance,
  AccordionInstance,
  AccordionOptions
} from './accordion.type'

const defaultOptions: AccordionOptions = {
  duration: 500,
  showMultiple: false,
  elementClass: 'accordion',
  triggerClass: 'accordion__trigger',
  activeClass: 'active',
  panelClass: 'accordion__content'
}

const instances = new Map<HTMLElement, AccordionInstance>()
const eventHandlers = {
  open: new Set<(element: HTMLElement) => void>(),
  close: new Set<(element: HTMLElement) => void>()
}

const getElement = (selector: HTMLElement | string): HTMLElement | null => {
  if (typeof selector === 'string') {
    const element = document.querySelector(selector)
    return element instanceof HTMLElement ? element : null
  }
  return selector instanceof HTMLElement ? selector : null
}

const getContainer = (element: HTMLElement): HTMLElement | null => {
  const container = element.closest('[data-accordion-container]')
  return container instanceof HTMLElement ? container : null
}

const destroyAccordion = (container: HTMLElement) => {
  const instance = instances.get(container)
  if (!instance) return

  instance.destroy?.()

  instance.elements?.forEach(element => {
    const button = element.querySelector('[data-accordion-button]')
    if (button) {
      const newButton = button.cloneNode(true)
      button.parentNode?.replaceChild(newButton, button)
    }
  })

  instances.delete(container)
  container.removeAttribute('data-accordion-init')
}

const initializeAccordion = (container: HTMLElement) => {
  if (instances.has(container)) return

  const instance = new Accordion(container, {
    ...defaultOptions,
    showMultiple: container.dataset.multiple === 'true',
    onOpen: (element: HTMLElement) => {
      eventHandlers.open.forEach(handler => handler(element))
      defaultOptions.onOpen?.(element)
    },
    onClose: (element: HTMLElement) => {
      eventHandlers.close.forEach(handler => handler(element))
      defaultOptions.onClose?.(element)
    }
  }) as unknown as AccordionInstance

  instance.elements = Array.from(container.querySelectorAll('[data-accordion]')).filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  )

  for (const [index, element] of instance.elements.entries()) {
    element.dataset.expanded === 'true' && instance.open(index)
  }

  instances.set(container, instance)
  container.setAttribute('data-accordion-init', '')
}

export const accordionApi: AccordionApi = {
  initAll() {
    document
      .querySelectorAll<HTMLElement>('[data-accordion-container]')
      .forEach(initializeAccordion)
  },

  init(selector) {
    const container = getElement(selector)
    if (container) initializeAccordion(container)
  },

  reinitAll() {
    instances.forEach((_inst, container) => {
      destroyAccordion(container)
      initializeAccordion(container)
    })
  },

  reinit(selector) {
    const container = getElement(selector)
    if (container) {
      destroyAccordion(container)
      initializeAccordion(container)
    }
  },

  destroyAll() {
    instances.forEach((_inst, container) => destroyAccordion(container))
  },

  destroy(selector) {
    const container = getElement(selector)
    if (container) destroyAccordion(container)
  },

  openAll() {
    instances.forEach(instance => {
      instance.elements?.forEach((_el, index) => instance.open(index))
    })
  },

  open(selector) {
    const element = getElement(selector)
    if (!element) return

    const container = getContainer(element)
    const instance = container ? instances.get(container) : null
    if (!instance) return

    const index = instance.elements?.indexOf(element) ?? -1
    if (index !== -1) instance.open(index)
  },

  closeAll() {
    instances.forEach(instance => {
      instance.elements?.forEach((_el, index) => instance.close(index))
    })
  },

  close(selector) {
    const element = getElement(selector)
    if (!element) return

    const container = getContainer(element)
    const instance = container ? instances.get(container) : null
    if (!instance) return

    const index = instance.elements?.indexOf(element) ?? -1
    if (index !== -1) instance.close(index)
  },

  on(event, callback) {
    eventHandlers[event].add(callback)
  },

  off(event, callback) {
    eventHandlers[event].delete(callback)
  },

  getInstance(selector) {
    const element = getElement(selector)
    if (!element) return null

    const container = getContainer(element)
    return container ? (instances.get(container) ?? null) : null
  },

  getElementInstance(selector) {
    const element = getElement(selector)
    if (!element || !element.matches('[data-accordion]')) return null

    const container = getContainer(element)
    const instance = container ? instances.get(container) : null
    if (!instance) return null

    const index = instance.elements?.indexOf(element) ?? -1
    if (index === -1) return null

    return {
      element,
      index,
      open: () => instance.open(index),
      close: () => instance.close(index),
      isOpen: () => element.classList.contains('active')
    }
  }
}
