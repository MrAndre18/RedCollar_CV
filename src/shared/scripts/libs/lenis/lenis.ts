import Lenis, { type LenisOptions } from 'lenis'
import { BREAKPOINT_DESKTOP } from '@shared/scripts/config'

export interface IScrollManager {
  init(options?: Partial<LenisOptions>): void
  destroy(): void
  start(): void
  stop(): void
  enableScroll(): void
  disableScroll(): void
}

class ScrollManager implements IScrollManager {
  private lenis: Lenis | null = null
  private headerSelector = '[data-header="body"]'
  private mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINT_DESKTOP + 1}px)`)

  constructor() {
    this.handleMediaChange = this.handleMediaChange.bind(this)
    this.handleAnchorClick = this.handleAnchorClick.bind(this)
  }

  public init(options: Partial<LenisOptions> = {}): void {
    if (this.lenis) return

    this.lenis = new Lenis({
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      duration: 1.2,
      easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      autoRaf: true,
      ...options,
    })

    // enable/disable Lenis by breakpoint
    this.mediaQuery.addEventListener('change', this.handleMediaChange)
    this.lenis.start()

    // ловим клики по якорям (один раз на документ)
    document.addEventListener('click', this.handleAnchorClick, true)
  }

  private handleMediaChange(e: MediaQueryListEvent): void {
    e.matches ? this.lenis?.start() : () => {
      this.lenis?.stop()
      this.enableScroll()
    }
  }

  public start(): void {
    this.lenis?.start()
  }

  public stop(): void {
    this.lenis?.stop()
  }

  public destroy(): void {
    this.mediaQuery.removeEventListener('change', this.handleMediaChange)
    document.removeEventListener('click', this.handleAnchorClick, true)
    this.lenis?.destroy()
    this.lenis = null
    document.documentElement.style.overflow = ''
  }

  public disableScroll(): void {
    this.stop()
    document.documentElement.style.overflow = 'hidden'
  }

  public enableScroll(): void {
    document.documentElement.style.overflow = ''
    this.start()
  }

  /**
   * Обработчик кликов по якорным ссылкам (инкапсулировано)
   */
  private handleAnchorClick(e: MouseEvent): void {
    const link = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('a[href^="#"]:not([href="#"])')
    if (!link) return

    // игнорируем внешние якоря и ссылки без id на странице
    const anchor = link.getAttribute('href')
    if (!anchor || anchor === '#') return

    const id = anchor.startsWith('#') ? anchor.slice(1) : anchor
    const target = document.getElementById(id)
    if (!target) return

    e.preventDefault()
    this.scrollToAnchor(target, link)
  }

  /**
   * Скроллим к якорю с учётом header и data-anchor-offset у ссылки
   */
  private scrollToAnchor(target: HTMLElement, link?: HTMLElement | null): void {
    // Высота фиксированного header
    const header = document.querySelector<HTMLElement>(this.headerSelector)
    const headerRect = header?.getBoundingClientRect()
    const headerHeight = headerRect ? headerRect.height : 0

    // Смещение с data-anchor-offset (может быть null)
    let offset = 0
    if (link) {
      const attr = link.getAttribute('data-anchor-offset')
      if (attr) offset = parseInt(attr, 10) || 0
    }

    // Итоговый offset: вниз — отрицательно, вверх — положительно
    const finalOffset = -headerHeight + offset

    if (this.lenis) {
      this.lenis.scrollTo(target, {
        offset: finalOffset,
        immediate: false,
      })
    } else {
      // fallback без lenis
      const y = target.getBoundingClientRect().top + window.scrollY + finalOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }
}

// **Экспорт одного экземпляра**
const scrollManager = new ScrollManager()
export { scrollManager }
