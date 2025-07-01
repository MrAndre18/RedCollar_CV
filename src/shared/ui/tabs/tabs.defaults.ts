import type { TabsOptions } from './tabs.type'

export const defaultTabsOptions: Required<Pick<TabsOptions, 'lazy' | 'animation'>> = {
  lazy: true,
  animation: 'fade'
}