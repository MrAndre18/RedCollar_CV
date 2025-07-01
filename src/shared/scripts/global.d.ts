import type { AccordionApi } from '@shared/ui/accordion/accordion.type'
import type { RangeApi } from '@shared/ui/range/range.type'
import type { selectApi } from '@shared/ui/select/select.type'
import type { TabsApi } from '@shared/ui/tabs/tabs-manager'
import type { ToastApi } from '@shared/ui/toast/toast'
import type { TooltipApi } from '@shared/ui/tooltip/tooltip.type'
import type { swiperApi } from './libs/swiper/swiper-manager'

import type { FormApi } from '../ui/form/form.type'
import type { ModalApi } from './components/modals'
import type { CustomValidatorApi } from './libs/custom-validator/CustomValidator.type'
import type { inputmaskApi } from './libs/inputmask/inputmask'
import type { dropdownApi } from '@shared/ui/dropdown/dropdown'

declare global {
  interface Window {
    frontApi: {
      form: FormApi
      toast: ToastApi
      modals: typeof ModalApi
      tooltip: TooltipApi
      range: RangeApi
      select: selectApi
      tabs: TabsApi
      accordion: typeof AccordionApi
      swiper: typeof swiperApi
      inputmask: typeof inputmaskApi
      dropdown: typeof dropdownApi
      initAll: () => void
      destroyAll: () => void
    }
    customValidator: CustomValidatorApi
  }
}
