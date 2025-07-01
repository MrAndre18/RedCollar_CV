import type { GlobalConfig } from './types'

export const defaultConfig: GlobalConfig = {
  animation: {
    type: 'slide',
    duration: 0.5,
    easing: 'power1.out',
    delay: 0.1
  },
  events: {}
}
