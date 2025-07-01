import { gsap } from 'gsap'

import type { AnimationSettings } from '../config/types'

export abstract class BaseAnimation {
  protected settings: Required<AnimationSettings>
  constructor(settings: Partial<AnimationSettings>) {
    this.settings = {
      type: settings.type ?? 'slide',
      duration: settings.duration ?? 0.5,
      easing: settings.easing ?? 'power1.out',
      delay: settings.delay ?? 0
    }
  }
  abstract animateShow(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void
  abstract animateHide(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void
}

export class SlideAnimation extends BaseAnimation {
  animateShow(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void {
    gsap.to(element, {
      duration: this.settings.duration,
      ease: this.settings.easing,
      delay: this.settings.delay,
      autoAlpha: 1,
      x: 0,
      onStart,
      onComplete
    })
  }
  animateHide(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void {
    gsap.to(element, {
      duration: this.settings.duration,
      ease: this.settings.easing,
      delay: this.settings.delay,
      autoAlpha: 0,
      x: -100,
      onStart,
      onComplete
    })
  }
}

export class FadeAnimation extends BaseAnimation {
  animateShow(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void {
    gsap.to(element, {
      duration: this.settings.duration,
      ease: this.settings.easing,
      delay: this.settings.delay,
      autoAlpha: 1,
      onStart,
      onComplete
    })
  }
  animateHide(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void {
    gsap.to(element, {
      duration: this.settings.duration,
      ease: this.settings.easing,
      delay: this.settings.delay,
      autoAlpha: 0,
      onStart,
      onComplete
    })
  }
}

export class CardsAnimation extends BaseAnimation {
  // При появлении нового слоя: старт из-за левого края (x: "-100%") и перемещение в x: "0%"
  animateShow(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void {
    gsap.fromTo(
      element,
      { x: '-100%' },
      {
        x: '0%',
        duration: this.settings.duration,
        ease: this.settings.easing,
        delay: this.settings.delay,
        onStart,
        onComplete
      }
    )
  }
  // При скрытии слоя: анимированное перемещение из x: "0%" в x: "-100%"
  animateHide(element: HTMLElement, onStart?: () => void, onComplete?: () => void): void {
    gsap.to(element, {
      x: '-100%',
      duration: this.settings.duration,
      ease: this.settings.easing,
      delay: this.settings.delay,
      onStart,
      onComplete
    })
  }
}

export function getAnimation(settings: Partial<AnimationSettings>): BaseAnimation {
  const type = settings.type ?? 'slide'
  switch (type) {
    case 'slide':
      return new SlideAnimation(settings)
    case 'fade':
      return new FadeAnimation(settings)
    case 'cards':
      return new CardsAnimation(settings)
    default:
      return new SlideAnimation(settings)
  }
}
