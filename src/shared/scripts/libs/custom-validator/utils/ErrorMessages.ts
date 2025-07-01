import type { TErrorMessages, TLangErrorMessages } from './model/UtilsTypes'

const errorMessages: TLangErrorMessages = {
  ru: {
    required: 'Это поле не может быть пустым',
    minlength: 'Минимум {{minlength}} символов',
    email: 'Введите корректный email',
    tel: 'Введите корректный номер телефона',
    number: 'Введите корректное число',
    'text-only': 'Введите корректное имя',
    'text-cyrillic': 'Только кириллица',
    'text-english': 'Только латиница',
    'positive-number': 'Введите положительное число',
    checkbox: 'Это обязательное поле',
    radio: 'Выберите один из вариантов',
  },
  en: {
    required: 'This field cannot be empty',
    minlength: 'Minimum {{minlength}} characters',
    email: 'Enter a valid email address',
    tel: 'Enter a valid phone number',
    number: 'Enter a valid number',
    'text-only': 'Enter a valid name',
    'text-cyrillic': 'Only Cyrillic characters are allowed',
    'text-english': 'Only English characters are allowed',
    'positive-number': 'Enter a positive number',
    checkbox: 'Please check the box',
    radio: 'Please select an option',
  }
}

export const setErrorMessages = (options: TLangErrorMessages): void => {
  for (const lang in options) {
    if (options[lang]) {
      errorMessages[lang] = {
        ...(errorMessages[lang] || {}),
        ...options[lang]
      }
    }
  }
}

const interpolateMessage = (
  message: string,
  variables: Record<string, string | number>
): string => {
  return message.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return key in variables ? String(variables[key]) : `{{${key}}}`
  })
}

export const getErrorMessage = (
  key: string,
  variables: Record<string, string | number> = {}
): string => {
  const message = getErrorMessages()[key]
  return interpolateMessage(message, variables)
}

export const getErrorMessages = (): TErrorMessages => {
  return errorMessages[document.documentElement.lang] || errorMessages.ru
}
