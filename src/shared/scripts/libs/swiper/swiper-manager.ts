import type Swiper from 'swiper'

import { destroy as destroySlider, getSlider, init, readySliders, reinit } from './swiper'

class SwiperManager {
  public instances = readySliders

  init(selector: string): void {
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) return
    init(el)
  }

  initAll(): void {
    const sliders = document.querySelectorAll<HTMLElement>('[data-swiper]')
    sliders.forEach(init)
  }

  reinit(selector: string): void {
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) return
    reinit(el)
  }

  reinitAll(): void {
    const sliders = document.querySelectorAll<HTMLElement>('[data-swiper]')
    sliders.forEach(el => reinit(el))
  }

  isInit(selector: string): boolean {
    const el = document.querySelector<HTMLElement>(selector)
    return !!el?.dataset.swiperInit
  }

  get(selector: string): Swiper | undefined {
    const el = document.querySelector<HTMLElement>(selector)
    const sliderID = el?.dataset.swiper
    return sliderID ? getSlider(sliderID) : undefined
  }

  destroy(selector: string): void {
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) return
    destroySlider(el)
  }

  destroyAll(): void {
    const sliders = document.querySelectorAll<HTMLElement>('[data-swiper]')
    sliders.forEach(destroySlider)
  }
}

const swiperApi = new SwiperManager()

export { swiperApi }
