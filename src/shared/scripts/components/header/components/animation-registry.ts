import gsap from 'gsap'

import type { IAnimationConfig } from '../types'

export type AnimationFunction = (
  element: HTMLElement,
  show: boolean,
  config: Partial<IAnimationConfig>
) => gsap.core.Tween

export interface IAnimationRegistry {
  fade: AnimationFunction
  slide: AnimationFunction
  clip: AnimationFunction
  'slide-left': AnimationFunction   // Новый тип!
}

// Клип-анимация: по умолчанию сверху вниз
const clip: AnimationFunction = (el, show, config) =>
  gsap.to(el, {
    clipPath: show ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', // сверху вниз!
    pointerEvents: show ? 'auto' : 'none',
    duration: config.duration || 0.5,
    ease: config.easing || 'power2.out',
    delay: config.delay || 0,
  })

// Анимация справа налево через clip-path (slide-left)
const slideLeft: AnimationFunction = (el, show, config) =>
  gsap.to(el, {
    clipPath: show ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)', // справа налево!
    pointerEvents: show ? 'auto' : 'none',
    duration: config.duration || 0.5,
    ease: config.easing || 'power2.out',
    delay: config.delay || 0,
  })

export const animationRegistry: IAnimationRegistry = {
  fade: (el, show, config) =>
    gsap.to(el, {
      opacity: show ? 1 : 0,
      pointerEvents: show ? 'auto' : 'none',
      duration: config.duration || 0.5,
      ease: config.easing || 'power2.out',
      delay: config.delay || 0,
    }),
  slide: (el, show, config) =>
    gsap.to(el, {
      x: show ? 0 : -50,
      opacity: show ? 1 : 0,
      pointerEvents: show ? 'auto' : 'none',
      duration: config.duration || 0.5,
      ease: config.easing || 'power2.out',
      delay: config.delay || 0,
    }),
  clip,                  // по умолчанию сверху вниз!
  'slide-left': slideLeft, // новый тип!
} as const
