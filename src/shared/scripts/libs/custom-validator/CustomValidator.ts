// @ts-ignore
import validator from 'validator'

import { slideDown, slideUp } from '../../utils/slideFunction'
import { getErrorMessage, getErrorMessages } from './utils/ErrorMessages'
import type { IInputValidatorOptions } from './utils/model/IInputValidator'

export class InputValidator {
  el: HTMLInputElement | HTMLSelectElement
  value: string
  type: string
  errorMessage: string
  minlength: string | null
  required: boolean
  isValid: boolean
  afterSubmit: boolean
  errorContainer: HTMLElement
  wrapper: HTMLElement
  options: IInputValidatorOptions | undefined

  constructor(input: HTMLInputElement | HTMLSelectElement, options?: IInputValidatorOptions) {
    this.options = options
    this.el = input
    this.value = input.value
    this.type = this.#getType()
    if (this.type === 'select') {
      this.el.addEventListener('change', () => {
        this.value = this.el.value
      })
    } else {
      this.el.addEventListener('input', () => {
        this.value = this.el.value
      })
    }
    this.errorMessage = input.getAttribute('data-error-message') || getErrorMessages()[this.type]
    this.minlength = input.getAttribute('minlength')
    this.required = input.required
    this.isValid = true
    this.afterSubmit = false
    this.wrapper = input.closest('[data-input-parent]') as HTMLElement
    this.errorContainer = this.#getErrorContainer()
  }

  validate() {
    this.isValid = true
    if (!this.afterSubmit) {
      this.afterSubmit = true
      if (this.type === 'select') {
        this.el.addEventListener('change', () => {
          this.validate()
        })
      } else {
        this.el.addEventListener('input', () => {
          this.validate()
        })
      }
    }
    const valid = this.checkValid()
    this.#switchError(this.errorMessage)

    return valid
  }

  checkValid() {
    if (this.type === 'checkbox') {
      if (this.required && !this.el.checked) {
        this.isValid = false
        this.errorMessage = getErrorMessages().checkbox || getErrorMessages().required
        return false
      }
      this.isValid = true
      return true
    }

    if (this.type === 'radio') {
      // Берём name и ищем все radio с этим name в форме
      const radios = this.el.form
        ? this.el.form.querySelectorAll(`input[type="radio"][name="${this.el.name}"]`) as NodeListOf<HTMLInputElement>
        : document.querySelectorAll(`input[type="radio"][name="${this.el.name}"]`) as NodeListOf<HTMLInputElement>;
      const isChecked = Array.from(radios).some((radio) => radio.checked);

      if (this.required && !isChecked) {
        this.isValid = false
        this.errorMessage = getErrorMessages().radio || getErrorMessages().required
        return false
      }
      this.isValid = true
      return true
    }

    if (this.value !== '') {
      if (this.#checkMinLength()) {
        this.errorMessage =
          this.el.getAttribute('data-error-message') || getErrorMessages()[this.type]
        this.#checkValidCases()
      }
    } else if (this.required) {
      this.isValid = false
      this.errorMessage = getErrorMessages().required
    }
    
    return this.isValid
  }

  visibleError(message?: string) {
    this.errorContainer.classList.add(
      this.options?.errorContainerClass
        ? `${this.options?.errorContainerClass}_visible`
        : 'ui-input__error_visible'
    )
    if (message) this.errorContainer.textContent = message
    else this.errorContainer.textContent = this.errorMessage
    this.wrapper.classList.add(
      this.options?.invalidClass ? this.options?.invalidClass : 'ui-input__invalid'
    )
    slideDown(this.errorContainer, 250)
  }

  removeError() {
    this.errorContainer.classList.remove(
      this.options?.errorContainerClass
        ? `${this.options?.errorContainerClass}_visible`
        : 'ui-input__error_visible'
    )
    this.wrapper.classList.remove(
      this.options?.invalidClass ? this.options?.invalidClass : 'ui-input__invalid'
    )
    slideUp(this.errorContainer, 250, () => {
      this.errorContainer.textContent = ''
    })
  }

  #checkValidCases() {
    const textValue = this.value.replace(/['\s_\-]/g, '')
    const phoneValue = this.value.replace(/\D/g, '')
    const positiveNumberPattern = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/
    const numValue = parseFloat(this.value)

    switch (this.type) {
      case 'email':
        this.isValid = validator.isEmail(this.value)
        break

      case 'text':
        this.isValid = true
        break

      case 'text-only':
        this.isValid =
          validator.isAlpha(textValue, 'ru-RU') || validator.isAlpha(textValue, 'en-US')
        break

      case 'text-cyrillic':
        this.isValid = validator.isAlpha(textValue, 'ru-RU')
        break

      case 'text-english':
        this.isValid = validator.isAlpha(textValue, 'en-EN')
        break

      case 'tel':
        if (phoneValue.length < 11) {
          this.isValid = false
          break
        }
        this.isValid = validator.isMobilePhone(phoneValue)
        break

      case 'positive-number':
        this.isValid = positiveNumberPattern.test(this.value) && parseFloat(this.value) > 0
        break

      case 'number':
        this.isValid = !isNaN(numValue) && isFinite(numValue)
        break

      default:
        break
    }
  }

  #checkMinLength() {
    if (this.minlength && this.value.length < parseInt(this.minlength)) {
      this.isValid = false
      this.errorMessage = getErrorMessage('minlength', { minlength: this.minlength })
      return false
    }
    return true
  }

  #switchError(message: string) {
    if (!this.isValid) this.visibleError(message)
    else this.removeError()
  }

  #getType(): string {
    if (this.el.getAttribute('data-validate') !== 'data-validate')
      return this.el.getAttribute('data-validate') as string
    else return (this.type = this.el.getAttribute('type') as string)
  }

  #getErrorContainer(): HTMLElement {
    if (this.el.dataset.errorContainer) {
      let errorContainer = document.querySelector(
        `[data-error-container="${this.el.dataset.errorContainer}"]:not(input)`
      ) as HTMLElement
      if (errorContainer) {
        errorContainer.classList.add(this.options?.errorContainerClass || 'ui-input__error')
      } else {
        errorContainer = this.wrapper.querySelector(
          '[data-error-container]:not(input)'
        ) as HTMLElement
        console.warn(
          `Warning: The container with the [data-error-container="${this.el.dataset.errorContainer}"] attribute was not found. The default container will be used.`
        )
      }
      return errorContainer
    } else return this.wrapper.querySelector('[data-error-container]') as HTMLElement
  }
}
