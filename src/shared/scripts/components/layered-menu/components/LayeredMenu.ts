import { headerInstance } from '@widgets/header/header'

import { defaultConfig } from '../config/defaultConfig'
import type { GlobalConfig, MenuConfig } from '../config/types'
import { MenuLayer } from './MenuLayer'

export class LayeredMenu {
  private element: HTMLElement
  private config: GlobalConfig
  private layers: MenuLayer[]
  private currentLayerIndex: number = 0
  private boundClickHandler: EventListener

  constructor(selector: string, config: MenuConfig = {}) {
    const el = document.querySelector(selector)
    if (!el) throw new Error(`Element not found for selector: ${selector}`)
    this.element = el as HTMLElement
    this.config = { ...defaultConfig, ...config.global }
    this.layers = []

    const layerElements = Array.from(
      this.element.querySelectorAll<HTMLElement>('[data-menu-layer]')
    )
    layerElements.forEach((layerEl, index) => {
      const layerConfig = config.layers?.[index] ?? {}
      this.layers.push(new MenuLayer(layerEl, layerConfig, this.config.animation))
    })

    this.boundClickHandler = this.handleClick.bind(this)
    this.element.addEventListener('click', this.boundClickHandler)

    this.layers.forEach((layer, index) => {
      layer.initState(index === 0)
    })

    this.currentLayerIndex = 0
      ; (this.element as any).__layeredMenu__ = this
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement
    const nextTrigger = target.closest('[data-menu-next]')
    const prevTrigger = target.closest('[data-menu-prev]')
    if (nextTrigger) {
      event.preventDefault()
      const attr = nextTrigger.getAttribute('data-menu-next')
      const targetIndex = attr && !isNaN(Number(attr)) ? Number(attr) : this.currentLayerIndex + 1
      this.switchToLayer(targetIndex)
    } else if (prevTrigger) {
      event.preventDefault()
      const attr = prevTrigger.getAttribute('data-menu-prev')
      const targetIndex = attr && !isNaN(Number(attr)) ? Number(attr) : this.currentLayerIndex - 1
      this.switchToLayer(targetIndex)
    }
  }

  private switchToLayer(targetIndex: number): void {
    if (
      targetIndex < 0 ||
      targetIndex >= this.layers.length ||
      targetIndex === this.currentLayerIndex
    ) {
      return
    }

    if (targetIndex > this.currentLayerIndex) {
      this.layers[targetIndex].show(() => {
        this.currentLayerIndex = targetIndex
      })
    } else {
      this.layers[this.currentLayerIndex].hide(() => {
        this.currentLayerIndex = targetIndex
      })
    }
  }

  reset(animated?: boolean): void {
    if (animated && this.currentLayerIndex !== 0) {
      this.layers[this.currentLayerIndex].hide(() => {
        this.currentLayerIndex = 0
      })
    } else {
      this.layers.forEach((layer, index) => {
        layer.initState(index === 0)
      })
      this.currentLayerIndex = 0
    }
  }

  update(): void {
    this.layers = []
    const layerElements = Array.from(
      this.element.querySelectorAll<HTMLElement>('[data-menu-layer]')
    )
    layerElements.forEach((layerEl, index) => {
      this.layers.push(new MenuLayer(layerEl, {}, this.config.animation))
    })
    this.reset()
  }

  destroy(): void {
    this.reset()
    this.element.removeEventListener('click', this.boundClickHandler)
    this.layers = []
    delete (this.element as any).__layeredMenu__
  }

  getLayers(): MenuLayer[] {
    return this.layers
  }

  static getInstance(element: HTMLElement): LayeredMenu | null {
    return (element as any).__layeredMenu__ || null
  }
}
