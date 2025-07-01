import type { Tabs } from './tabs'

export type TabElement = HTMLButtonElement | HTMLAnchorElement
export type PanelElement = HTMLElement

export interface TabsEvents {
  onInit?: (tabs: Tabs) => void
  onChange?: (args: { activeTab: TabElement; prevTab: TabElement | null }) => void
  onDestroy?: (tabs: Tabs) => void
}

export interface TabsOptions extends TabsEvents {
  lazy?: boolean
  animation?: 'fade' | 'slide' | 'none'
}
