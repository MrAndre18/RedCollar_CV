import { gsap } from 'gsap'

import { getAnimation } from '../config/animations'
import type {
  AnimationSettings,
  GlobalConfig,
  MenuLayerConfig,
  MenuLayerInterface
} from '../config/types'

export class MenuLayer implements MenuLayerInterface {
  private element: HTMLElement
  private config: MenuLayerConfig
  public animationSettings: Required<AnimationSettings>

  constructor(
    element: HTMLElement,
    config: MenuLayerConfig,
    defaultAnimation: GlobalConfig['animation']
  ) {
    this.element = element
    this.animationSettings = { ...defaultAnimation, ...config.animation }
    this.config = {
      events: { ...config.events }
    }
  }

  // Устанавливает состояние слоя мгновенно:
  // Для типа cards: активный слой – x: "0%", неактивный – x: "-100%"
  initState(isActive: boolean): void {
    if (this.animationSettings.type === 'cards') {
      if (isActive) {
        gsap.set(this.element, { x: '0%', autoAlpha: 1 })
      } else {
        gsap.set(this.element, { x: '-100%', autoAlpha: 1 })
      }
    } else {
      if (isActive) {
        gsap.set(this.element, { x: 0, autoAlpha: 1 })
      } else {
        gsap.set(this.element, { x: 0, autoAlpha: 0 })
      }
    }
  }

  // Анимированное появление слоя; после завершения вызывает callback, если он передан
  show(callback?: () => void): void {
    this.config.events?.beforeShow?.(this)
    const animationInstance = getAnimation(this.animationSettings)
    animationInstance.animateShow(
      this.element,
      () => this.config.events?.show?.(this),
      () => {
        this.config.events?.afterShow?.(this)
        if (callback) callback()
      }
    )
  }

  // Анимированное скрытие слоя; после завершения вызывает callback, если он передан
  hide(callback?: () => void): void {
    this.config.events?.beforeHide?.(this)
    const animationInstance = getAnimation(this.animationSettings)
    animationInstance.animateHide(
      this.element,
      () => this.config.events?.hide?.(this),
      () => {
        this.config.events?.afterHide?.(this)
        if (callback) callback()
      }
    )
  }
}
