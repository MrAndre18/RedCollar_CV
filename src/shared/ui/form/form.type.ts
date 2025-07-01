import type { IInputValidatorOptions } from '../../../shared/scripts/libs/custom-validator/utils/model/IInputValidator'
import type {
  TElementTarget,
  TFormTarget,
  TInputTarget
} from '../../../shared/scripts/libs/custom-validator/utils/model/UtilsTypes'

export type FormApi = {
  initAll: (config?: IInputValidatorOptions) => void
  isValidForm: (form: TFormTarget) => boolean
  validateForm: (form: TFormTarget) => void
  setFormError: (form: TFormTarget, message: string, errorBlock?: TElementTarget) => void
  resetFormError: (form: TFormTarget, errorBlock?: TElementTarget) => void
  validateField: (input: TInputTarget) => void
  setFormFieldError: (input: TInputTarget, message: string) => void
  resetFormFieldErrors: (input: TInputTarget) => void
  resetFormFieldsErrors: (form: TFormTarget) => void
}
