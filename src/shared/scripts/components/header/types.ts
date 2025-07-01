import { animationRegistry } from './components/animation-registry'

export type AnimationType = keyof typeof animationRegistry

export interface IHeaderEvents {
  beforeShow?: (instance: any) => void
  show?: (instance: any) => void
  afterShow?: (instance: any) => void
  beforeHide?: (instance: any) => void
  hide?: (instance: any) => void
  afterHide?: (instance: any) => void
}

export interface IAnimationConfig {
  sequentialSwitch?: boolean
  delay?: number
  type?: AnimationType
  duration?: number
  easing?: string
  offsetX?: number
  offsetY?: number
  custom?: (
    element: HTMLElement,
    show: boolean,
    config: Partial<IAnimationConfig>
  ) => gsap.core.Tween
}

export type YPositionComposite = `${'top' | 'center' | 'bottom'} ${'top' | 'center' | 'bottom'}`
export type XPositionComposite = `${'left' | 'center' | 'right'} ${'left' | 'center' | 'right'}`

export type YRelativeTarget = 'header' | 'trigger' | 'window'
export type XRelativeTarget = 'header' | 'trigger' | 'window'

export interface IPositionConfig {
  relativeTarget?: {
    y?: YRelativeTarget
    x?: XRelativeTarget
  }
  position?: {
    y?: YPositionComposite
    x?: XPositionComposite
  }
  offset?: {
    y?: number
    x?: number
  }
}

export interface IPanelConfig {
  animation?: IAnimationConfig
  position?: IPositionConfig
  overlay?: boolean
  on?: IHeaderEvents
  trigger?: 'click' | 'hover'
}

export type DefaultPanelIds = 'menu' | 'menu-mob' | 'catalog' | 'search' | 'compare' | 'favorite'

export interface IHeaderConfig {
  containerSelector?: string
  overlay?: boolean
  on?: IHeaderEvents
  panelsAnimation?: IAnimationConfig
  panelsPosition?: IPositionConfig
  defaultTrigger?: 'click' | 'hover'
  panels?: Partial<Record<DefaultPanelIds, IPanelConfig>>
}
