export type AnimationType = 'slide' | 'fade' | 'cards'

export interface AnimationSettings {
  type: AnimationType
  duration: number
  easing: string
  delay: number
}

export type ShowHideEvent = (layer: MenuLayerInterface) => void

export interface Events {
  beforeShow?: ShowHideEvent
  show?: ShowHideEvent
  afterShow?: ShowHideEvent
  beforeHide?: ShowHideEvent
  hide?: ShowHideEvent
  afterHide?: ShowHideEvent
}

export interface GlobalConfig {
  animation: AnimationSettings
  events: Events
}

export interface MenuLayerConfig {
  animation?: Partial<AnimationSettings>
  events?: Partial<Events>
}

export interface MenuConfig {
  global?: Partial<GlobalConfig>
  layers?: MenuLayerConfig[]
}

export interface MenuLayerInterface {
  show(): void
  hide(): void
}
