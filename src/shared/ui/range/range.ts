import rangeLib from 'nouislider'
import wNumb from 'wnumb'

// Если потребуется, можно заменить any на конкретный тип API из range
type RangeInstance = any

// Функция для обновления значений в range__border
function updateBorders(element: string | HTMLElement): void {
  const el = getElement(element)
  if (!el) return

  // Получаем минимальное и максимальное значение из атрибутов
  const min = Number(el.getAttribute('data-min') || 0)
  const max = Number(el.getAttribute('data-max') || 100)

  // Находим элементы с классом range__border
  const minBorder = el.querySelector<HTMLElement>('.range__border--min')
  const maxBorder = el.querySelector<HTMLElement>('.range__border--max')

  // Обновляем текст в этих элементах
  if (minBorder) minBorder.textContent = `${min}`
  if (maxBorder) maxBorder.textContent = `${max}`
}

// Функция для наблюдения за изменениями атрибутов
function observeMinMaxChanges(element: string | HTMLElement): void {
  const el = getElement(element)
  if (!el) return

  const observer = new MutationObserver(() => {
    updateBorders(el)
  })

  // Наблюдаем за изменениями атрибутов min и max
  observer.observe(el, {
    attributes: true,
    attributeFilter: ['data-min', 'data-max']
  })
}

/**
 * (6) Нахождение конкретного:
 * Функция для получения HTMLElement по селектору или, если передан уже сам элемент.
 */
function getElement(el: string | HTMLElement): HTMLElement | null {
  return typeof el === 'string' ? document.querySelector<HTMLElement>(el) : el
}

/**
 * Функция для генерации кастомных событий.
 * Используется для отправки событий range:init, range:change и range:update.
 */
function dispatchEvent(element: string | HTMLElement, eventName: string, detail: any = {}): void {
  const el = getElement(element)
  if (!el) return
  const event = new CustomEvent(eventName, { detail })
  el.dispatchEvent(event)
}

/**
 * (2) Проверка на то, что элемент уже инициализирован.
 * Функция проверяет наличие атрибута data-range-init со значением "true".
 */
function isInit(el: string | HTMLElement): boolean {
  const element = getElement(el)
  if (!element) return false
  return element.getAttribute('data-range-init') === ''
}

/**
 * (3) Установка атрибута data-range-init.
 * Функция помечает элемент как инициализированный.
 */
function setInitializedAttribute(element: string | HTMLElement): void {
  const el = getElement(element)
  if (!el) return
  el.setAttribute('data-range-init', '')
}

/**
 * Функция для получения атрибута data-range-init.
 */
function getInitializedAttribute(element: string | HTMLElement): Attr | null {
  const el = getElement(element)
  return el ? el.getAttributeNode('data-range-init') : null
}

/**
 * Вспомогательная функция для регулировки ширины инпута в зависимости от длины введённого текста.
 */
function adjustInputWidth(input: HTMLInputElement | null): void {
  if (!input) return
  const textLength = input.value.length
  input.style.width = `${Math.min(200, textLength * 11)}px`
}

/**
 * Функция обновления слайдера по значениям, введённым в инпуты.
 * Вызывается при изменении input'ов.
 */
function updateRange(element: string | HTMLElement): void {
  const el = getElement(element)
  if (!el) return

  const rangeBody = el.querySelector<HTMLElement>('.range__body')
  if (!rangeBody || !(rangeBody as any).range) return

  const step = Number((el as HTMLElement).dataset.step) || 1
  const min = Number((el as HTMLElement).dataset.min) || 0
  const max = Number((el as HTMLElement).dataset.max) || 100

  const lowerInput = el.querySelector<HTMLInputElement>('.range__lower')
  const upperInput = el.querySelector<HTMLInputElement>('.range__upper')

  let lowerValue = lowerInput ? Number(lowerInput.value.replace(/\s/g, '')) || min : min
  let upperValue = upperInput ? Number(upperInput.value.replace(/\s/g, '')) || max : max

  lowerValue = Math.max(min, Math.min(lowerValue, upperValue - step))
  upperValue = Math.min(max, Math.max(upperValue, lowerValue + step))

  const rangeInst = (rangeBody as HTMLElement & { range?: RangeInstance }).range as RangeInstance
  rangeInst.updateOptions({ range: { min, max } })
  rangeInst.set([lowerValue, upperValue])

  adjustInputWidth(lowerInput)
  adjustInputWidth(upperInput)
}

/**
 * (4) Генерация события инициализации (range:init).
 * Позволяет вручную отослать событие инициализации.
 */
function triggerInitEvent(element: string | HTMLElement, instance: RangeInstance): void {
  const el = getElement(element)
  if (!el) return
  dispatchEvent(el, 'range:init', { id: el.id || null, instance })
}

/**
 * (12) Генерация события range:change.
 * Позволяет вручную отправить событие change для инпута.
 */
function triggerRangeChange(
  input: string | HTMLElement,
  value: any,
  instance: RangeInstance
): void {
  const el = getElement(input)
  if (!el) return
  dispatchEvent(el, 'range:change', { value, instance })
}

/**
 * (13) Генерация события range:update.
 * Позволяет вручную отправить событие update для инпута.
 */
function triggerRangeUpdate(
  input: string | HTMLElement,
  value: any,
  instance: RangeInstance
): void {
  const el = getElement(input)
  if (!el) return
  dispatchEvent(el, 'range:update', { value, instance })
}

/**
 * (1) Инициализация одного экземпляра слайдера:
 * - Создание экземпляра слайдера.
 * - (2) Защита от повторной инициализации.
 * - (3) Установка атрибута data-range-init.
 * - (4) Генерация события range:init.
 * - (12) Генерация события range:change.
 * - (13) Генерация события range:update.
 */
function initAllInstance(element: string | HTMLElement): void {
  const el = getElement(element)
  if (!el) return
  if (isInit(el)) return // защита от повторной инициализации

  const rangeBody = el.querySelector<HTMLElement>('.range__body')
  if (!rangeBody) return

  const start = el.dataset.start ? el.dataset.start.split(',') : [0]
  const connect = start.length === 1 ? 'lower' : true
  const step = Number(el.dataset.step) || 1
  const min = Number(el.dataset.min) || 0
  const max = Number(el.dataset.max) || 100

  // Создаем форматтер один раз
  const myFormatter = wNumb({ decimals: 0, thousand: ' ' })

  // Создаем слайдер и сохраняем его экземпляр; явно приводим результат к RangeInstance
  const rangeInstance = rangeLib.create(rangeBody, {
    start: start,
    connect: connect,
    step: step,
    range: { min, max },
    // format: wNumb({ decimals: 0, thousand: ' ' })
    format: {
      to: (value: number): string => myFormatter.to!(value),
      from: (value: string): number | false => myFormatter.from!(value)
    }
  }) as RangeInstance
    ; (rangeBody as HTMLElement & { range?: RangeInstance }).range = rangeInstance

  // Устанавливаем атрибут data-range-init
  setInitializedAttribute(el)

  // Наблюдаем за изменениями атрибутов min и max
  observeMinMaxChanges(el)

  // Устанавливаем атрибут data-range-init (пункт 3)
  setInitializedAttribute(el)

  // При каждом обновлении слайдера генерируется событие range:update (пункт 13)
  rangeInstance.on('update', function (values: any, handle: number) {
    const lowerInput = el.querySelector<HTMLInputElement>('.range__lower')
    const upperInput = el.querySelector<HTMLInputElement>('.range__upper')

    if (handle === 0 && lowerInput) {
      lowerInput.value = values[0]
      adjustInputWidth(lowerInput)
      triggerRangeUpdate(lowerInput, values[0], rangeInstance)
    } else if (handle === 1 && upperInput) {
      upperInput.value = values[1]
      adjustInputWidth(upperInput)
      triggerRangeUpdate(upperInput, values[1], rangeInstance)
    }
  })

  // При изменении слайдера генерируется событие range:change (пункт 12)
  rangeInstance.on('change', function (values: any, handle: number) {
    const lowerInput = el.querySelector<HTMLInputElement>('.range__lower')
    const upperInput = el.querySelector<HTMLInputElement>('.range__upper')

    if (handle === 0 && lowerInput) {
      triggerRangeChange(lowerInput, values[0], rangeInstance)
    } else if (handle === 1 && upperInput) {
      triggerRangeChange(upperInput, values[1], rangeInstance)
    }
  })

  // Обработчики событий для инпутов, обновляющие слайдер
  const handleInput = (event: Event): void => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/\s+/g, '')
    adjustInputWidth(input)
  }

  const lowerInput = el.querySelector<HTMLInputElement>('.range__lower')
  const upperInput = el.querySelector<HTMLInputElement>('.range__upper')

  if (lowerInput) {
    lowerInput.addEventListener('input', handleInput)
    lowerInput.addEventListener('change', () => updateRange(el))
    lowerInput.addEventListener('keypress', function (e: KeyboardEvent) {
      const key = e.which || e.keyCode
      if (key === 13) {
        // Enter
        updateRange(el)
      }
    })
  }

  if (upperInput) {
    upperInput.addEventListener('input', handleInput)
    upperInput.addEventListener('change', () => updateRange(el))
    upperInput.addEventListener('keypress', function (e: KeyboardEvent) {
      const key = e.which || e.keyCode
      if (key === 13) {
        // Enter
        updateRange(el)
      }
    })
  }

  // Генерируем событие инициализации range:init (пункт 4)
  triggerInitEvent(el, rangeInstance)
}

/**
 * Модуль, который будет экспортирован и доступен через window.frontApi.range.
 * Здесь собраны функции по каждому из ваших пунктов.
 */
const rangeApi = {
  // (1) Инициализация всех слайдеров
  initAll: function (): void {
    const elements = document.querySelectorAll<HTMLElement>('.range')
    elements.forEach(el => initAllInstance(el))
  },

  // (5) Переинициализация конкретного слайдера
  reInit: function (element: string | HTMLElement): void {
    const el = getElement(element)
    if (!el) return
    const rangeBody = el.querySelector<HTMLElement>('.range__body')
    if (rangeBody && (rangeBody as HTMLElement & { range?: RangeInstance }).range) {
      ; ((rangeBody as HTMLElement & { range?: RangeInstance }).range as RangeInstance).destroy()
    }
    el.removeAttribute('data-range-init')
    initAllInstance(el)
  },
  // Переинициализация всех range
  reInitAll: function (): void {
    const elements = document.querySelectorAll<HTMLElement>('.range')
    elements.forEach(el => {
      rangeApi.reInit(el)
    })
  },
  // (2) Проверка и (3) получение/установка атрибута data-range-init
  isInit: isInit,
  destroy: destroyInstance,
  destroyAll: destroyAllInstances,
  getInitializedAttribute: getInitializedAttribute,
  setInitializedAttribute: setInitializedAttribute,
  // (4) Генерация события инициализации
  triggerInitEvent: triggerInitEvent,
  // (6) Нахождение конкретного элемента
  findElement: getElement,
  // (7) Установка границы минимального значения
  setBorderMinRangeValue: function (el: string | HTMLElement, value: number): void {
    const element = getElement(el)
    if (!element) return
    element.setAttribute('data-min', String(value))
    updateRange(element)
  },
  // (8) Установка текущего минимального значения
  setCurrentMinRangeValue: function (el: string | HTMLElement, value: number): void {
    const element = getElement(el)
    if (!element) return
    const rangeBody = element.querySelector<HTMLElement>('.range__body')
    if (!rangeBody || !(rangeBody as any).range) return
    const current = (rangeBody as any).range.get()
    const newStart = Array.isArray(current) ? [value, current[1]] : value
      ; (rangeBody as any).range.set(newStart)
    element.setAttribute(
      'data-start',
      Array.isArray(newStart) ? `[${newStart[0]},${newStart[1]}]` : String(newStart)
    )
  },
  // (9) Получение границы минимального значения
  getBorderMinRangeValue: function (el: string | HTMLElement): string | null {
    const element = getElement(el)
    return element ? element.getAttribute('data-min') : null
  },
  // (10) Установка границы максимального значения
  setBorderMaxRangeValue: function (el: string | HTMLElement, value: number): void {
    const element = getElement(el)
    if (!element) return
    element.setAttribute('data-max', String(value))
    updateRange(element)
  },
  // (14) Установка текущего максимального значения
  setCurrentMaxRangeValue: function (el: string | HTMLElement, value: number): void {
    const element = getElement(el)
    if (!element) return
    const rangeBody = element.querySelector<HTMLElement>('.range__body')
    if (!rangeBody || !(rangeBody as any).range) return
    const current = (rangeBody as any).range.get()
    const newStart = Array.isArray(current) ? [current[0], value] : value
      ; (rangeBody as any).range.set(newStart)
    element.setAttribute(
      'data-start',
      Array.isArray(newStart) ? `[${newStart[0]},${newStart[1]}]` : String(newStart)
    )
  },
  // (11) Получение границы максимального значения
  getBorderMaxRangeValue: function (el: string | HTMLElement): string | null {
    const element = getElement(el)
    return element ? element.getAttribute('data-max') : null
  },
  // (12) Генерация события range:change
  triggerRangeChange: triggerRangeChange,
  // (13) Генерация события range:update
  triggerRangeUpdate: triggerRangeUpdate,
  // Дополнительно: получение текущего значения слайдера
  getCurrentRangeValue: function (el: string | HTMLElement): any {
    const element = getElement(el)
    if (!element) return
    const rangeBody = element.querySelector<HTMLElement>('.range__body')
    if (!rangeBody || !(rangeBody as any).range) return
    return (rangeBody as any).range.get()
  }
}

function destroyInstance(element: string | HTMLElement): void {
  const el = getElement(element);
  if (!el) return;
  const rangeBody = el.querySelector<HTMLElement>('.range__body');
  if (!rangeBody) return;
  const inst = (rangeBody as any).range;
  if (inst && typeof inst.destroy === 'function') {
    inst.destroy();
    delete (rangeBody as any).range;
  }
  el.removeAttribute('data-range-init');
}

function destroyAllInstances(): void {
  document.querySelectorAll<HTMLElement>('.range').forEach(el => destroyInstance(el));
}

export function rangeInit() {
  rangeApi.initAll()
}

export default rangeApi
export const initAll = rangeApi.initAll
