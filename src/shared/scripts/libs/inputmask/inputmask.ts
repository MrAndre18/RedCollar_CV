//@ts-ignore
import Inputmask from 'inputmask'
import type { InputmaskInstance, InputmaskOptions } from './inputmask.type'

const INITIALIZED_ATTR = 'data-inputmask-init'
const PHONE_MASK = '+7 (999) 999-99-99'

const getPhoneInputElements = (selector?: string): NodeListOf<HTMLInputElement> =>
  document.querySelectorAll<HTMLInputElement>(
    selector ?? `[data-mask-phone]:not([${INITIALIZED_ATTR}])`
  )

const createInputmaskInstance = (): InputmaskInstance =>
  Inputmask(PHONE_MASK)

const handleBeforeMask = (value: string): string => {
  let processed = value.replace(/\D/g, '')
  if (processed.startsWith('7') || processed.startsWith('8')) {
    processed = processed.slice(1)
  }
  return processed
}

const applyMask = (input: HTMLInputElement, im: InputmaskInstance): void => {
  im.mask(input)
  input.setAttribute(INITIALIZED_ATTR, '')

  const instance = (input as any).inputmask
  if (instance) {
    instance.option({
      onBeforeMask: handleBeforeMask
    } as InputmaskOptions)
  }
}

export function inputmaskInit(selector?: string): void {
  const inputs = getPhoneInputElements(selector)
  const im = createInputmaskInstance()

  inputs.forEach(input => applyMask(input, im))
}

export function reinit(input: string | HTMLInputElement): void {
  const inputElement =
    typeof input === 'string'
      ? document.querySelector<HTMLInputElement>(input)
      : input

  if (inputElement) {
    inputElement.removeAttribute(INITIALIZED_ATTR)

    if ((inputElement as any).inputmask) {
      (inputElement as any).inputmask.remove()
    }

    inputmaskInit(typeof input === 'string' ? input : undefined)
  } else {
    console.warn(`Input not found: ${input}`)
  }
}

export function reinitAll(): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(`[${INITIALIZED_ATTR}]`)

  inputs.forEach(input => {
    input.removeAttribute(INITIALIZED_ATTR)

    if ((input as any).inputmask) {
      (input as any).inputmask.remove()
    }
  })

  inputmaskInit()
}


function destroy(input: string | HTMLInputElement): void {
  const inputElement =
    typeof input === 'string'
      ? document.querySelector<HTMLInputElement>(input)
      : input;
  if (!inputElement) {
    console.warn(`Input not found: ${input}`);
    return;
  }

  inputElement.removeAttribute(INITIALIZED_ATTR);

  if ((inputElement as any).inputmask) {
    (inputElement as any).inputmask.remove();
  }
}


function destroyAll(): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    `[${INITIALIZED_ATTR}]`
  );
  inputs.forEach(input => {
    input.removeAttribute(INITIALIZED_ATTR);
    if ((input as any).inputmask) {
      (input as any).inputmask.remove();
    }
  });
}

export const inputmaskApi = {
  init: inputmaskInit,
  reinit,
  reinitAll,
  destroy,
  destroyAll,
}
