// Задать data-swiper-hover-wrapper для обертки, в пределах которой должно учитываться движение мыши
// data-swiper-hover - на сам слайдер, который нужно переключать

import type Swiper from 'swiper'

type TMouseMoveSlidesChange = (slider: Swiper, e: MouseEvent) => void

const mouseMoveSlidesChange: TMouseMoveSlidesChange = (slider, e) => {
  const slidesCount = slider.slides?.length ?? 0
  if (slidesCount <= 1) return

  const target = e.currentTarget as HTMLElement
  const width = target.clientWidth
  const segment = Math.round(width / slidesCount)

  const mouseX = e.clientX - target.getBoundingClientRect().left
  let index = Math.floor(mouseX / segment)
  slider.slideTo(Math.min(index, slidesCount - 1))
}

interface HTMLElementWithSwiper extends HTMLElement {
  swiper?: Swiper
}
interface HandlerPair {
  onMouseMove: (e: MouseEvent) => void
  onMouseLeave: () => void
}
const handlerMap = new WeakMap<HTMLElement, HandlerPair>()

export const hoverControlledSlider = (): void => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const wrappers = document.querySelectorAll<HTMLElement>('[data-swiper-hover-wrapper]')
  if (!wrappers.length) return

  wrappers.forEach(wrapper => {
    // Всегда сбрасываем старые слушатели
    const old = handlerMap.get(wrapper)
    if (old) {
      wrapper.removeEventListener('mousemove', old.onMouseMove)
      wrapper.removeEventListener('mouseleave', old.onMouseLeave)
      handlerMap.delete(wrapper)
    }

    const sliderEl = wrapper.querySelector<HTMLElementWithSwiper>('[data-swiper-hover]')
    const slider = sliderEl?.swiper
    if (isMobile || !slider) return

    // Захватываем instance один раз
    const onMouseMove = (e: MouseEvent) => mouseMoveSlidesChange(slider, e)
    const onMouseLeave = () => slider.slideTo(0)

    wrapper.addEventListener('mousemove', onMouseMove)
    wrapper.addEventListener('mouseleave', onMouseLeave)
    handlerMap.set(wrapper, { onMouseMove, onMouseLeave })
  })
}
