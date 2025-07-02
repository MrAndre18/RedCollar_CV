import config from './config'
import { parallax } from '@shared/ui/parallax/parallax'
import { fancyboxInit } from './libs/fancybox'
import { initOverlayScrollbars } from './utils/overlayScrollbars'
import { scrollManager } from './libs/lenis/lenis'
import { initHorizontalScroll } from './utils/horizontal-scroll'
import { StickyManager } from '@shared/ui/sticky/sticky'

export const commonFunction = (): void => {
  initOverlayScrollbars()
  scrollManager.init()

  parallax()

  fancyboxInit()

  initHorizontalScroll()

  // StickyManager.init()
}

document.addEventListener('DOMContentLoaded', () => {
  config()
  commonFunction()
})
