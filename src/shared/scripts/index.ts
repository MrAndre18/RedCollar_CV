import { accordionExamples } from '@pages/front-api/_components/accordion-examples/accordion-examples'
import { modalExamples } from '@pages/front-api/_components/modal-examples/modal-examples'
import { rangeExamples } from '@pages/front-api/_components/range-examples/range-examples'
import { selectExamples } from '@pages/front-api/_components/select-examples/select-examples'
import { tabsExamples } from '@pages/front-api/_components/tabs-examples/tabs-examples'
import { toastsExamples } from '@pages/front-api/_components/toasts-examples/toasts-examples'
import { tooltipExamples } from '@pages/front-api/_components/tooltip-examples/tooltip-examples'
import { accordionApi } from '@shared/ui/accordion/accordion'
import rangeApi from '@shared/ui/range/range'
import tooltipApi from '@shared/ui/tooltip/tooltip'

import config from './config'
import { frontApi } from './frontApi'

import { swiperApi } from './libs/swiper/swiper-manager'
import { swiperExamples } from '@pages/front-api/_components/swiper-examples/swiper-examples'
import { inputmaskApi } from './libs/inputmask/inputmask'
import { inputmaskExamples } from '@pages/front-api/_components/inputmask-examples/inputmask-examples'

import { toastApi } from '@shared/ui/toast/toasts-manager'
import { TabsApi } from '@shared/ui/tabs/tabs-manager'
import { ModalApi } from './components/modals'
import { selectApi } from '@shared/ui/select/select'
import { formApi } from '@shared/ui/form/form'
import { parallax } from '@shared/ui/parallax/parallax'
import { fancyboxInit } from './libs/fancybox'
import { dropdownApi } from '@shared/ui/dropdown/dropdown'
import { initHeader } from '@widgets/header/header'
import { mobileMenuInit } from '@widgets/mobile-menu/mobile-menu'
import { initOverlayScrollbars } from './utils/overlayScrollbars'
import { scrollManager } from './libs/lenis/lenis'
import { initHorizontalScroll } from './utils/horizontal-scroll'
import { StickyManager } from '@shared/ui/sticky/sticky'
import { initSliderHover } from '@widgets/sliders/slider-hover/slider-hover'
import inputSearchInit from '@widgets/input-search/input-search'
(window as any).process = { env: {} } // Фикс для совместимости с TomSelect

export const commonFunction = (): void => {
  initOverlayScrollbars()
  scrollManager.init()

  formApi.initAll()

  accordionApi.initAll()
  accordionExamples()

  toastApi.initAll()
  toastsExamples()

  TabsApi.initAll()
  tabsExamples()

  ModalApi.initAll()
  modalExamples()

  selectApi.initAll()
  selectExamples()

  tooltipApi.initAll()
  tooltipExamples()

  rangeApi.initAll()
  rangeExamples()

  swiperApi.initAll()
  swiperExamples()

  inputmaskApi.reinitAll()
  inputmaskExamples()

  dropdownApi.initAll()

  parallax()

  fancyboxInit()

  mobileMenuInit()

  initHorizontalScroll()

  initSliderHover()

  StickyManager.init()

  inputSearchInit()
}

console.info(import.meta.env)

document.addEventListener('DOMContentLoaded', () => {
  config()
  frontApi()
  initHeader()
  commonFunction()
})
