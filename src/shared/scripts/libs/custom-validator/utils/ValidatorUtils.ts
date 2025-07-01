import { InputValidator } from '../CustomValidator'
import type { TElementTarget, TFormTarget, TInputTarget } from './model/UtilsTypes'

export const isValidForm = (form: TFormTarget): boolean => {
  const currentForm = getFormElement(form)
  const inputs = Array.from(currentForm.querySelectorAll('[data-validate]')) as HTMLInputElement[]
  let isValid = true

  inputs?.forEach(input => {
    const inputValidator = new InputValidator(input)
    if (!inputValidator.checkValid()) isValid = false
  })

  return isValid
}

export const validateForm = (form: TFormTarget): boolean => {
  const currentForm = getFormElement(form)
  const inputs = Array.from(currentForm.querySelectorAll('[data-validate]')) as HTMLInputElement[]
  let isValid = true

  inputs?.forEach(input => {
    const inputValidator = new InputValidator(input)
    if (!inputValidator.validate()) isValid = false
  })

  return isValid
}

export const setFormError = (form: TFormTarget, message: string, errorBlock?: TElementTarget) => {
  const currentForm = getFormElement(form)

  if (errorBlock) {
    const currentErrorBlock = getElement(errorBlock)
    if (!currentErrorBlock.dataset.formError) currentErrorBlock.dataset.formError = 'true'
    currentErrorBlock.textContent = message
  } else {
    const currentErrorBlock = currentForm.querySelector('[data-form-error]')
    if (currentErrorBlock) currentErrorBlock.textContent = message
    else currentForm.insertAdjacentHTML('beforeend', `<div data-form-error>${message}</div>`)
  }
}

export const resetFormError = (form: TFormTarget, errorBlock?: TElementTarget) => {
  const currentForm = getFormElement(form)

  if (errorBlock) {
    const currentErrorBlock = getElement(errorBlock)
    if (currentErrorBlock) currentErrorBlock.textContent = ''
  } else {
    const currentErrorBlock = currentForm.querySelector('[data-form-error]')
    if (currentErrorBlock) currentErrorBlock.textContent = ''
  }
}

export const resetFormFieldsErrors = (form: TFormTarget) => {
  const currentForm = getFormElement(form)
  const inputs = Array.from(currentForm.querySelectorAll('[data-validate]')) as HTMLInputElement[]

  inputs?.forEach(input => {
    const inputValidator = new InputValidator(input)
    inputValidator.removeError()
  })
  const currentErrorBlock = currentForm.querySelector('[data-form-error]')
  if (currentErrorBlock) currentErrorBlock.innerHTML = ''
}

export const validateField = (input: TInputTarget): boolean => {
  const currentInput = getInputElement(input)
  const inputValidator = new InputValidator(currentInput)
  return inputValidator.validate()
}

export const setFormFieldError = (input: TInputTarget, message: string) => {
  const currentInput = getInputElement(input)
  const inputValidator = new InputValidator(currentInput)
  inputValidator.visibleError(message)
}

export const resetFormFieldErrors = (input: TInputTarget) => {
  const currentInput = getInputElement(input)
  const inputValidator = new InputValidator(currentInput)
  inputValidator.removeError()
}

export const getInputElement = (el: TInputTarget) => {
  const currentInput =
    typeof el === 'string'
      ? (document.querySelector(el) as HTMLInputElement | HTMLSelectElement)
      : el
  if (!currentInput) {
    throw new Error('Input | Select not found :(')
  }
  return currentInput
}

export const getFormElement = (el: TFormTarget) => {
  const currentForm = typeof el === 'string' ? (document.querySelector(el) as HTMLFormElement) : el
  if (!currentForm) {
    throw new Error('Form not found :(')
  }
  return currentForm
}

export const getElement = (el: TElementTarget) => {
  const currentElement = typeof el === 'string' ? (document.querySelector(el) as HTMLElement) : el
  if (!currentElement) {
    throw new Error('Element not found :(')
  }
  return currentElement
}

export const destroyAllFields = (form: TFormTarget) => {
  const currentForm = getFormElement(form)
  const inputs = Array.from(currentForm.querySelectorAll('[data-validate]')) as HTMLInputElement[]

  inputs.forEach(input => {
    const inputValidator = new InputValidator(input)
    if (typeof inputValidator.destroy === 'function') {
      inputValidator.destroy()
    }
  })

  // Убираем общий блок ошибки, если есть
  const currentErrorBlock = currentForm.querySelector('[data-form-error]')
  if (currentErrorBlock) currentErrorBlock.remove()
}
