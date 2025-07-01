import gsap from 'gsap'

import type { IPanelConfig } from '../types'
import { animationRegistry } from './animation-registry'

export class HeaderPanel {
  el: HTMLElement
  config: IPanelConfig

  constructor(el: HTMLElement, config: IPanelConfig) {
    this.el = el
    // Задаём значения по умолчанию для анимации и позиционирования
    this.config = {
      animation: {
        duration: 0.5,
        easing: 'power2.out'
      },
      position: {
        relativeTarget: { x: 'trigger', y: 'trigger' },
        position: { x: 'left right', y: 'top top' }, // ← панель появится справа от триггера
        offset: { x: 10, y: 0 }
      },
      ...config
    }
    this.initState()
  }

  initState() {
    const animType = this.config.animation?.type || 'fade'
    switch (animType) {
      case 'slide-left':
        gsap.set(this.el, { clipPath: 'inset(0% 100% 0% 0%)', pointerEvents: 'none' })
        break
      case 'clip':
        gsap.set(this.el, { clipPath: 'inset(0% 0% 100% 0%)', pointerEvents: 'none' })
        break
      case 'fade':
        gsap.set(this.el, { opacity: 0, pointerEvents: 'none' })
        break
      case 'slide':
        gsap.set(this.el, { x: -50, opacity: 0, pointerEvents: 'none' })
        break
      default:
        gsap.set(this.el, { opacity: 0, pointerEvents: 'none' })
        break
    }
  }

  /**
   * Вычисляет и применяет позиционирование панели.
   * @param options Объект с triggerEl и headerEl.
   */
  applyPositioning(options: { triggerEl?: HTMLElement; headerEl?: HTMLElement } = {}) {
    const pos = this.config.position!

    // --- Ось Y ---
    const yTarget = pos.relativeTarget?.y || 'header'
    const yPosComposite = pos.position?.y || 'top bottom'
    const yOffset = pos.offset?.y || 0

    const [panelAnchorY, targetAnchorY] = yPosComposite.split(' ')
    let targetRectY: DOMRect
    if (yTarget === 'trigger' && options.triggerEl) {
      targetRectY = options.triggerEl.getBoundingClientRect()
    } else if (yTarget === 'header' && options.headerEl) {
      const headerBody = options.headerEl.querySelector('[data-header="body"]') as HTMLElement
      targetRectY = headerBody
        ? headerBody.getBoundingClientRect()
        : options.headerEl.getBoundingClientRect()
    } else if (yTarget === 'window') {
      targetRectY = { top: 0, height: window.innerHeight, bottom: window.innerHeight } as DOMRect
    } else {
      targetRectY = { top: 0, height: 0, bottom: 0 } as DOMRect
    }
    let targetAnchorCoordY = 0
    if (targetAnchorY === 'top') {
      targetAnchorCoordY = targetRectY.top
    } else if (targetAnchorY === 'center') {
      targetAnchorCoordY = targetRectY.top + targetRectY.height / 2
    } else if (targetAnchorY === 'bottom') {
      targetAnchorCoordY = targetRectY.bottom
    }
    const panelRect = this.el.getBoundingClientRect()
    let panelAnchorCoordY = 0
    if (panelAnchorY === 'top') {
      panelAnchorCoordY = 0
    } else if (panelAnchorY === 'center') {
      panelAnchorCoordY = panelRect.height / 2
    } else if (panelAnchorY === 'bottom') {
      panelAnchorCoordY = panelRect.height
    }
    const top = targetAnchorCoordY - panelAnchorCoordY + yOffset

    // --- Ось X ---
    const xTarget = pos.relativeTarget?.x || 'header'
    const xPosComposite = pos.position?.x || 'left left'
    const xOffset = pos.offset?.x || 0

    const [panelAnchorX, targetAnchorX] = xPosComposite.split(' ')
    let targetRectX: DOMRect
    if (xTarget === 'trigger' && options.triggerEl) {
      targetRectX = options.triggerEl.getBoundingClientRect()
    } else if (xTarget === 'header' && options.headerEl) {
      const headerBody = options.headerEl.querySelector('[data-header="body"]') as HTMLElement
      targetRectX = headerBody
        ? headerBody.getBoundingClientRect()
        : options.headerEl.getBoundingClientRect()
    } else if (xTarget === 'window') {
      targetRectX = { left: 0, width: window.innerWidth, right: window.innerWidth } as DOMRect
    } else {
      targetRectX = { left: 0, width: 0, right: 0 } as DOMRect
    }
    let targetAnchorCoordX = 0
    if (targetAnchorX === 'left') {
      targetAnchorCoordX = targetRectX.left
    } else if (targetAnchorX === 'center') {
      targetAnchorCoordX = targetRectX.left + targetRectX.width / 2
    } else if (targetAnchorX === 'right') {
      targetAnchorCoordX = targetRectX.right
    }
    let panelAnchorCoordX = 0
    if (panelAnchorX === 'left') {
      panelAnchorCoordX = 0
    } else if (panelAnchorX === 'center') {
      panelAnchorCoordX = panelRect.width / 2
    } else if (panelAnchorX === 'right') {
      panelAnchorCoordX = panelRect.width
    }
    const left = targetAnchorCoordX - panelAnchorCoordX + xOffset

    this.el.style.position = 'absolute'
    this.el.style.top = `${top}px`
    this.el.style.left = `${left}px`
  }

  show() {
    this.config.on?.beforeShow && this.config.on.beforeShow(this)
    let tween: gsap.core.Tween
    if (this.config.animation?.custom) {
      tween = this.config.animation.custom(this.el, true, this.config.animation)
    } else {
      const typeKey =
        this.config.animation?.type && this.config.animation?.type in animationRegistry
          ? this.config.animation.type
          : 'fade'
      const animFn = animationRegistry[typeKey as keyof typeof animationRegistry]
      tween = animFn(this.el, true, this.config.animation || {})
    }
    tween.eventCallback('onStart', () => {
      this.config.on?.show && this.config.on.show(this)
    })
    tween.eventCallback('onComplete', () => {
      this.config.on?.afterShow && this.config.on.afterShow(this)
    })
    return tween
  }

  hide() {
    this.config.on?.beforeHide && this.config.on.beforeHide(this)
    let tween: gsap.core.Tween
    if (this.config.animation?.custom) {
      tween = this.config.animation.custom(this.el, false, this.config.animation)
    } else {
      const typeKey =
        this.config.animation?.type && this.config.animation?.type in animationRegistry
          ? this.config.animation.type
          : 'fade'
      const animFn = animationRegistry[typeKey as keyof typeof animationRegistry]
      tween = animFn(this.el, false, this.config.animation || {})
    }
    tween.eventCallback('onStart', () => {
      this.config.on?.hide && this.config.on.hide(this)
    })
    tween.eventCallback('onComplete', () => {
      this.config.on?.afterHide && this.config.on.afterHide(this)
    })
    return tween
  }
}
