import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'

/** Флаг регистрации плагина (чтобы не вызывать registerPlugin каждый раз) */
let isPluginRegistered = false

/**
 * Переносит классы и data-атрибуты из parent в его первого ребёнка,
 * заменяет parent на этого ребёнка в DOM и возвращает получившийся HTMLElement.
 * @param parent – контейнер-обёртка
 * @returns перенесённый элемент или undefined, если дочернего нет
 */
function moveAttributesToChild(parent: HTMLElement): HTMLElement | undefined {
  const child = parent.firstElementChild as HTMLElement | null
  if (!child) return undefined

  // Перенос классов
  if (parent.className) {
    const classes = parent.className.split(' ').filter(Boolean)
    child.classList.add(...classes)
  }

  // Перенос остальных атрибутов (кроме class)
  Array.from(parent.attributes).forEach(attr => {
    if (attr.name === 'class') return
    child.setAttribute(attr.name, attr.value)
  })

  // Заменяем parent на child
  parent.replaceWith(child)
  return child
}

/**
 * Инициализирует параллакс для элементов
 * с атрибутами data-parallax-container и data-parallax-target.
 * Повторные вызовы безопасны — элементы помечаются
 * data-parallax-init="true" и пропускаются.
 */
export function parallax(): void {
  // Регистрируем плагин один раз
  if (!isPluginRegistered) {
    gsap.registerPlugin(ScrollTrigger)
    isPluginRegistered = true
  }

  const containers = document.querySelectorAll<HTMLElement>('[data-parallax-container]')
  if (!containers.length) return

  containers.forEach(containerEl => {
    // Защита от повторной инициализации контейнера
    if (containerEl.dataset.parallaxInit === 'true') return
    containerEl.dataset.parallaxInit = 'true'

    const parallaxContainer = moveAttributesToChild(containerEl)
    if (!parallaxContainer) return

    const targets = Array.from(
      parallaxContainer.querySelectorAll<HTMLElement>('[data-parallax-target]')
    )

    targets.forEach(targetEl => {
      // Защита от повторной инициализации цели
      if (targetEl.dataset.parallaxInit === 'true') return
      targetEl.dataset.parallaxInit = 'true'

      const parallaxTarget = moveAttributesToChild(targetEl)
      if (!parallaxTarget) return

      // Вычитываем скорость; по умолчанию — 1
      const speedAttr = parallaxTarget.dataset.parallaxSpeed
      const targetSpeed = speedAttr ? +speedAttr : 1

      // Устанавливаем высоту для сохранения эффекта
      gsap.set(parallaxTarget, {
        height: `${targetSpeed > 1 ? 100 * targetSpeed : 120}%`,
      })

      // Запускаем анимацию параллакса
      gsap.to(parallaxTarget, {
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxContainer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
        yPercent: targetSpeed ? -10 * targetSpeed : -10,
      })
    })
  })
}
