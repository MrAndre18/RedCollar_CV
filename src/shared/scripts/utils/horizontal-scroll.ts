const DELAY_MS = 150
const DRAG_THRESHOLD = 5 // Минимальное расстояние для активации перетаскивания

type ScrollState = {
  timer: number | null
  enabled: boolean
  isDragging: boolean
  dragStartX: number
  scrollStartX: number
  hasMoved: boolean
}

const stateMap = new WeakMap<HTMLElement, ScrollState>()

const handleLinksScroll = (e: WheelEvent): void => {
  const el = e.currentTarget as HTMLElement
  let st = stateMap.get(el)

  if (!st) {
    st = { timer: null, enabled: false, isDragging: false, dragStartX: 0, scrollStartX: 0, hasMoved: false }
    stateMap.set(el, st)
  }

  if (!st.enabled) {
    if (st.timer === null) {
      st.timer = window.setTimeout(() => {
        const cur = stateMap.get(el)
        if (cur) cur.enabled = true
      }, DELAY_MS)
    }
    return
  }

  if (el.scrollWidth <= el.clientWidth) return

  // Определяем, чем скроллить: deltaX (тачпад/сенсор) или deltaY (обычная мышка)
  let scrollAmount = 0
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    scrollAmount = e.deltaX
  } else {
    scrollAmount = e.deltaY
  }

  if (scrollAmount === 0) return // ничего не делать

  e.stopImmediatePropagation()
  e.preventDefault()
  el.scrollLeft += scrollAmount
}

const handleMouseDown = (e: MouseEvent): void => {
  // Игнорируем правый клик и средний клик
  if (e.button !== 0) return

  const el = e.currentTarget as HTMLElement
  let st = stateMap.get(el)

  if (!st) {
    st = { timer: null, enabled: false, isDragging: false, dragStartX: 0, scrollStartX: 0, hasMoved: false }
    stateMap.set(el, st)
  }

  st.isDragging = true
  st.dragStartX = e.clientX
  st.scrollStartX = el.scrollLeft
  st.hasMoved = false

  // Предотвращаем выделение текста и устанавливаем курсор
  e.preventDefault()
  e.stopPropagation()

  // Принудительно устанавливаем курсор grabbing для всего документа
  document.body.style.cursor = 'grabbing !important'
  document.documentElement.style.cursor = 'grabbing !important'
}

const handleMouseMove = (e: MouseEvent, targetEl?: HTMLElement): void => {
  const el = (targetEl || e.currentTarget) as HTMLElement
  const st = stateMap.get(el)

  if (!st || !st.isDragging) return

  const deltaX = e.clientX - st.dragStartX
  const absDeltaX = Math.abs(deltaX)

  // Проверяем, превысили ли мы порог для активации перетаскивания
  if (absDeltaX > DRAG_THRESHOLD) {
    st.hasMoved = true

    // Обновляем позицию скролла
    el.scrollLeft = st.scrollStartX - deltaX

    e.preventDefault()
  }
}

const handleMouseUp = (e: MouseEvent, targetEl?: HTMLElement): void => {
  const el = (targetEl || e.currentTarget) as HTMLElement
  const st = stateMap.get(el)

  if (!st || !st.isDragging) return

  st.isDragging = false

  // Сбрасываем принудительные стили курсора
  document.body.style.cursor = ''
  document.documentElement.style.cursor = ''

  // Если мышь двигалась значительно, предотвращаем клик
  if (st.hasMoved) {
    e.preventDefault()
    e.stopImmediatePropagation()

    // Дополнительная защита - добавляем временный обработчик для блокировки кликов
    const blockClicks = (clickEvent: Event) => {
      clickEvent.preventDefault()
      clickEvent.stopImmediatePropagation()
    }

    // Блокируем клики на очень короткое время после завершения перетаскивания
    document.addEventListener('click', blockClicks, { capture: true, once: true })
    setTimeout(() => {
      document.removeEventListener('click', blockClicks, { capture: true })
    }, 1)
  }

  st.hasMoved = false
}

const handleMouseLeave = (e: MouseEvent): void => {
  const el = e.currentTarget as HTMLElement
  const st = stateMap.get(el)

  if (!st) return

  // НЕ сбрасываем состояние перетаскивания при выходе мыши - оно должно сохраняться
  // Сбрасываем только состояние скролла колесиком
  if (!st.isDragging) {
    if (st.timer) clearTimeout(st.timer)
    st.timer = null
    st.enabled = false
  }
}

const handleClick = (e: MouseEvent): void => {
  const el = e.currentTarget as HTMLElement
  const st = stateMap.get(el)

  // Предотвращаем клик, если было перетаскивание
  if (st?.hasMoved) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}

export const initHorizontalScroll = (): void => {
  // Глобальные обработчики для перетаскивания за пределами элементов
  let globalHandlersAdded = false

  document.querySelectorAll<HTMLElement>('[data-horizontal-scroll]').forEach(el => {
    stateMap.set(el, {
      timer: null,
      enabled: false,
      isDragging: false,
      dragStartX: 0,
      scrollStartX: 0,
      hasMoved: false
    })

    // Добавляем курсор grab при наведении
    el.style.cursor = 'grab'

    // Обработчики для wheel скролла
    el.addEventListener('mouseenter', () => {
      const st = stateMap.get(el)
      if (st?.timer) clearTimeout(st.timer)
      stateMap.set(el, { ...st!, timer: null, enabled: false })
    })

    el.addEventListener('mouseleave', handleMouseLeave)

    el.addEventListener('wheel', handleLinksScroll, {
      passive: false,
      capture: true
    })

    // Обработчики для перетаскивания мышью
    el.addEventListener('mousedown', (e) => {
      handleMouseDown(e)
      if (e.button === 0) {
        el.style.cursor = 'grabbing'
      }
    })

    el.addEventListener('mousemove', handleMouseMove)

    el.addEventListener('mouseup', (e) => {
      handleMouseUp(e)
      el.style.cursor = 'grab'
    })

    // Обработчик клика для предотвращения случайных кликов после перетаскивания
    el.addEventListener('click', handleClick, { capture: true })

    // Добавляем глобальные обработчики только один раз
    if (!globalHandlersAdded) {
      globalHandlersAdded = true

      // Глобальный mousemove - работает везде, даже за пределами элемента
      document.addEventListener('mousemove', (e) => {
        let hasActiveDrag = false

        document.querySelectorAll<HTMLElement>('[data-horizontal-scroll]').forEach(element => {
          const st = stateMap.get(element)
          if (st?.isDragging) {
            hasActiveDrag = true
            handleMouseMove(e, element)
          }
        })

        // Меняем курсор документа при активном перетаскивании
        if (hasActiveDrag) {
          document.body.style.cursor = 'grabbing'
        } else {
          document.body.style.cursor = ''
        }
      })

      // Глобальный mouseup - завершает перетаскивание везде
      document.addEventListener('mouseup', (e) => {
        document.querySelectorAll<HTMLElement>('[data-horizontal-scroll]').forEach(element => {
          const st = stateMap.get(element)
          if (st?.isDragging) {
            handleMouseUp(e, element)
            element.style.cursor = 'grab'
          }
        })

        // Сбрасываем курсор документа
        document.body.style.cursor = ''
      })

      // Дополнительная защита - сбрасываем все при потере фокуса окна
      window.addEventListener('blur', () => {
        document.querySelectorAll<HTMLElement>('[data-horizontal-scroll]').forEach(element => {
          const st = stateMap.get(element)
          if (st?.isDragging) {
            st.isDragging = false
            st.hasMoved = false
          }
        })
        // Сбрасываем принудительные стили курсора
        document.body.style.cursor = ''
        document.documentElement.style.cursor = ''
      })
    }
  })
}