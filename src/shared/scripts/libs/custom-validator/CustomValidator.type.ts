import type { IInputValidatorOptions } from './utils/model/IInputValidator'
import type { TElementTarget, TFormTarget, TInputTarget } from './utils/model/UtilsTypes'

export type CustomValidatorApi = {
  initAll: (config?: IInputValidatorOptions) => void
  destroyAll: () => void
  isValidForm: (form: TFormTarget) => boolean
  validateForm: (form: TFormTarget) => void
  setFormError: (form: TFormTarget, message: string, errorBlock?: TElementTarget) => void
  resetFormError: (form: TFormTarget, errorBlock?: TElementTarget) => void
  validateField: (input: TInputTarget) => void
  setFormFieldError: (input: TInputTarget, message: string) => void
  resetFormFieldErrors: (input: TInputTarget) => void
  resetFormFieldsErrors: (form: TFormTarget) => void
}
