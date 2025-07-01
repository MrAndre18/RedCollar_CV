import { accordionApi } from '@shared/ui/accordion/accordion'
import rangeApi from '@shared/ui/range/range'
import { selectApi } from '@shared/ui/select/select'
import { TabsApi } from '@shared/ui/tabs/tabs-manager'
import tooltipApi from '@shared/ui/tooltip/tooltip'

import { formApi } from '../ui/form/form'
import { swiperApi } from './libs/swiper/swiper-manager'
import { inputmaskApi } from './libs/inputmask/inputmask'
import { toastApi } from '@shared/ui/toast/toasts-manager'
import { ModalApi } from './components/modals'
import { dropdownApi } from '@shared/ui/dropdown/dropdown'

export function frontApi() {
  if (!window.frontApi) {
    window.frontApi = {} as any
  }

  window.frontApi.form = formApi
  window.frontApi.toast = toastApi
  window.frontApi.tooltip = tooltipApi
  window.frontApi.range = rangeApi
  window.frontApi.select = selectApi
  window.frontApi.tabs = TabsApi
  window.frontApi.accordion = accordionApi
  window.frontApi.modals = ModalApi
  window.frontApi.swiper = swiperApi
  window.frontApi.inputmask = inputmaskApi
  window.frontApi.dropdown = dropdownApi

  window.frontApi.initAll = () => {
    formApi.initAll()
    toastApi.initAll()
    tooltipApi.initAll()
    rangeApi.initAll()
    selectApi.initAll()
    TabsApi.initAll()
    accordionApi.initAll()
    ModalApi.initAll()
    swiperApi.initAll()
    inputmaskApi.reinitAll()
    dropdownApi.initAll()
  }

  window.frontApi.destroyAll = () => {
    formApi.destroyAll()
    toastApi.destroyAll()
    tooltipApi.destroyAll()
    rangeApi.destroyAll()
    selectApi.destroyAll()
    TabsApi.destroyAll()
    accordionApi.destroyAll()
    ModalApi.destroyAll()
    swiperApi.destroyAll()
    dropdownApi.destroyAll()
  }
}
