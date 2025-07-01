import { InputValidator } from './CustomValidator'
import { setErrorMessages } from './utils/ErrorMessages'
import {
  destroyAllFields,
  isValidForm,
  resetFormError,
  resetFormFieldErrors,
  resetFormFieldsErrors,
  setFormError,
  setFormFieldError,
  validateField,
  validateForm
} from './utils/ValidatorUtils'
import type { IInputValidatorOptions } from './utils/model/IInputValidator'

let globalValidatorConfig: IInputValidatorOptions | undefined

export function validateInit(config?: IInputValidatorOptions) {
  setValidatorEvents()
  validatorInitFunction(config)
}

export const validatorInitFunction = (config?: IInputValidatorOptions) => {
  const forms = Array.from(
    document.querySelectorAll('form:not([data-form-init])')
  ) as HTMLFormElement[]
  if (forms.length === 0) return

  if (config) {
    globalValidatorConfig = config
    if (globalValidatorConfig.errorMessages) setErrorMessages(globalValidatorConfig.errorMessages)
  }

  forms.forEach(form => {
    form.setAttribute('data-form-init', '')
    const inputs = Array.from(form.querySelectorAll('[data-validate]')) as (
      | HTMLInputElement
      | HTMLSelectElement
    )[]

    form.addEventListener('submit', e => {
      e.preventDefault()
      let firstErrorElement: HTMLInputElement | HTMLSelectElement | null = null
      let isValidForm = true
      inputs.forEach(input => {
        const inputValidator = new InputValidator(input, globalValidatorConfig)

        if (!inputValidator.validate()) {
          isValidForm = false
          if (!firstErrorElement) {
            firstErrorElement = input
          }
        }
      })

      if (isValidForm) {
        // Код для валидной формы
      } else {
        if (firstErrorElement) {
          ;(firstErrorElement as HTMLInputElement | HTMLSelectElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
          ;(firstErrorElement as HTMLInputElement | HTMLSelectElement).focus()
        }
      }
    })
  })
}

export const validatorDestroyFunction = () => {
  const forms = Array.from(document.querySelectorAll('form[data-form-init]')) as HTMLFormElement[]
  if (forms.length === 0) return

  forms.forEach(form => {
    // Удаляем submit listener
    const handler = (form as any)._validatorSubmitHandler
    if (handler) {
      form.removeEventListener('submit', handler)
      delete (form as any)._validatorSubmitHandler
    }

    // Убираем признак и ошибки формы
    form.removeAttribute('data-form-init')
    resetFormError(form)
    resetFormFieldsErrors(form)

    // Для каждого поля вызываем destroy
    destroyAllFields(form)
  })
}

function setValidatorEvents() {
  window.customValidator = {
    initAll: validatorInitFunction,
    destroyAll: validatorDestroyFunction,
    resetFormError,
    isValidForm,
    validateField,
    resetFormFieldsErrors,
    validateForm,
    resetFormFieldErrors,
    setFormFieldError,
    setFormError
  }
}
