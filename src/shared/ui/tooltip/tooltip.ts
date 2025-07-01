import tippy, { type Instance, type Props } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

const TOOLTIP_INIT_ATTR = 'data-tooltip-init'

// Карта всех инициализированных тултипов
const tooltipInstances: Map<HTMLElement, Instance> = new Map()

// Вспомогательная функция: получить элемент по селектору или напрямую
function getElement(el: string | HTMLElement): HTMLElement | null {
  if (!el) return null
  if (typeof el === 'string') return document.querySelector<HTMLElement>(el)
  return el
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Инициализация тултипа на элементе
function init(el: string | HTMLElement, options: Partial<Props> = {}): void {
  const element = getElement(el)
  if (!element || element.hasAttribute(TOOLTIP_INIT_ATTR)) return

  destroy(el) // Безопасно на всякий

  // Прочитать конфиг из data-tooltip-config
  let config: Partial<Props> = {}
  const configAttr = element.getAttribute('data-tooltip-config')
  if (configAttr) {
    try {
      config = JSON.parse(configAttr)
    } catch {
      // Промахнулся с JSON — идём дальше
    }
  }

  // Приоритет: options > config из data-tooltip-config
  const mergedConfig: Partial<Props> = { ...config, ...options }

  // Задаём дефолты, если не передали явно
  const instance = tippy(element, {
    theme: 'custom',
    appendTo: () => element,
    trigger: isTouchDevice() ? 'click' : mergedConfig.trigger || 'mouseenter focus',
    ...mergedConfig
  })

  tooltipInstances.set(element, instance)
  element.setAttribute(TOOLTIP_INIT_ATTR, 'true')
}

// Уничтожение тултипа
function destroy(el: string | HTMLElement): void {
  const element = getElement(el)
  if (!element) return

  const instance = tooltipInstances.get(element)
  if (instance) {
    instance.destroy()
    tooltipInstances.delete(element)
    element.removeAttribute(TOOLTIP_INIT_ATTR)
  }
}

// Переинициализация тултипа с опциями
function reInit(el: string | HTMLElement, options: Partial<Props> = {}): void {
  destroy(el)
  init(el, options)
}

// Показать тултип
function show(el: string | HTMLElement): void {
  const element = getElement(el)
  if (!element) return
  const instance = tooltipInstances.get(element)
  if (instance) instance.show()
}

// Скрыть тултип
function hide(el: string | HTMLElement): void {
  const element = getElement(el)
  if (!element) return
  const instance = tooltipInstances.get(element)
  if (instance) instance.hide()
}

// Проверка инициализации
function isInit(el: string | HTMLElement): boolean {
  const element = getElement(el)
  return !!element?.hasAttribute(TOOLTIP_INIT_ATTR)
}

// Инициализация всех тултипов по селектору [data-tooltip]
function initAll(options: Partial<Props> = {}): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-tooltip]'))
  elements.forEach(el => init(el, options))
}

// Уничтожение всех тултипов
function destroyAll(): void {
  // Сначала собираем все элементы, чтобы не мутировать Map в цикле
  const elements = Array.from(tooltipInstances.keys())
  elements.forEach(el => destroy(el))
}

// Переинициализация всех тултипов
function reInitAll(options: Partial<Props> = {}): void {
  destroyAll()
  initAll(options)
}

// Получение экземпляра тултипа для элемента
function getInstance(el: string | HTMLElement): Instance | null {
  const element = getElement(el)
  return element ? tooltipInstances.get(element) || null : null
}

// ===================
// Экспортируемый API
// ===================
const tooltipApi = {
  init,
  reInit,
  destroy,
  show,
  hide,
  isInit,
  initAll,
  destroyAll,
  reInitAll,
  getInstance
}

export default tooltipApi
