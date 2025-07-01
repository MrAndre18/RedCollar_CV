import Swiper from 'swiper'
import {
  Autoplay,
  Controller,
  EffectFade,
  FreeMode,
  Keyboard,
  Navigation,
  Pagination,
  Thumbs
} from 'swiper/modules'
import type {
  NavigationOptions,
  PaginationOptions,
  Swiper as SwiperInstance,
  SwiperOptions,
  ThumbsOptions
} from 'swiper/types'

// --- Типы ---
interface SwiperDataAttributes extends DOMStringMap {
  swiper?: string
  swiperParams?: string
  swiperInit?: string
}

interface CustomSwiperElement extends HTMLElement {
  dataset: SwiperDataAttributes
}

type SwiperEventHandler = () => void

// --- Дефолтные настройки Swiper ---
const defaultConfig: SwiperOptions = {
  modules: [EffectFade, Navigation, Pagination, Thumbs, Keyboard, Autoplay, FreeMode, Controller],
  slidesPerView: 'auto',
  speed: 800,
  keyboard: {
    enabled: true,
    onlyInViewport: true
  }
} as const

// --- Хранилище инстансов Swiper ---
const readySliders = new Map<string, SwiperInstance>()

// --- Получение кастомных параметров ---
const getCustomParams = (slider: CustomSwiperElement): SwiperOptions => {
  const params = slider.dataset.swiperParams
  if (!params) return {}

  try {
    return JSON.parse(params)
  } catch (error) {
    console.warn('Failed to parse swiper params:', error)
    return {}
  }
}

// --- Получить Swiper по ID ---
const getSlider = (sliderID?: string): SwiperInstance | undefined => {
  return sliderID ? readySliders.get(sliderID) : undefined
}

// --- Управление навигацией и пагинацией ---
const updateNavigationAndPagination = (swiper: SwiperInstance): void => {
  const sliderElement = swiper.el as CustomSwiperElement
  const sliderID = sliderElement.dataset.swiper

  if (!sliderID) return

  // Обновление навигации
  const navNext = document.querySelector<HTMLElement>(`[data-swiper-button-next="${sliderID}"]`)
  const navPrev = document.querySelector<HTMLElement>(`[data-swiper-button-prev="${sliderID}"]`)

  const shouldShowNav = swiper.snapGrid.length > 1

  if (navNext) navNext.classList.toggle('hidden', !shouldShowNav)
  if (navPrev) navPrev.classList.toggle('hidden', !shouldShowNav)

  // Обновление пагинации
  if (swiper.pagination?.bullets) {
    const shouldShowBullets = swiper.pagination.bullets.length > 1
    const paginationEl = swiper.pagination.el as HTMLElement | null
    paginationEl?.classList.toggle('hidden', !shouldShowBullets)
  }
}

// --- Чистка data-swiper* атрибутов ---
const cleanSwiperDataAttrs = (slider: CustomSwiperElement): void => {
  const datasetKeys = Object.keys(slider.dataset) as Array<keyof SwiperDataAttributes>

  datasetKeys
    .filter(key => (key as string).startsWith('swiper'))
    .forEach(key => {
      delete slider.dataset[key]
    })
}

// --- Формируем итоговый конфиг ---
const buildConfig = (slider: CustomSwiperElement): SwiperOptions => {
  const sliderID = slider.dataset.swiper!
  const userParams = getCustomParams(slider)

  const navigation: NavigationOptions = {
    nextEl: `[data-swiper-button-next="${sliderID}"]`,
    prevEl: `[data-swiper-button-prev="${sliderID}"]`,
    ...((userParams.navigation as NavigationOptions) || {})
  }

  const pagination: PaginationOptions = {
    el: `[data-swiper-pagination="${sliderID}"]`,
    type: 'bullets',
    clickable: true,
    modifierClass: 'slider-pagination-',
    bulletClass: 'slider-pagination__item',
    bulletActiveClass: 'slider-pagination__item_active',
    currentClass: 'slider-pagination__item_current',
    ...((userParams.pagination as PaginationOptions) || {})
  }

  const thumbs: ThumbsOptions = {
    swiper: `[data-swiper-thumbs="${sliderID}"]`,
    ...((userParams.thumbs as ThumbsOptions) || {})
  }

  return {
    ...defaultConfig,
    ...userParams,
    navigation,
    pagination,
    thumbs
  }
}

// --- Регистрация обработчиков событий ---
const registerEventHandlers = (swiper: SwiperInstance): void => {
  const updateUI: SwiperEventHandler = () => updateNavigationAndPagination(swiper)

  const events = ['init', 'resize', 'update', 'breakpoint', 'slidesLengthChange'] as const
  events.forEach(event => {
    swiper.on(event, updateUI)
  })

  // Вызываем сразу для инициализации
  updateUI()
}

// --- Инициализация Swiper ---
const init = (slider: HTMLElement): SwiperInstance | null => {
  const customSlider = slider as CustomSwiperElement
  const sliderID = customSlider.dataset.swiper

  // Проверки валидности
  if (!sliderID) {
    console.warn('Swiper element missing data-swiper attribute')
    return null
  }

  if (customSlider.dataset.swiperInit === 'true' || readySliders.has(sliderID)) {
    return readySliders.get(sliderID) || null
  }

  try {
    const sliderConfig = buildConfig(customSlider)
    const swiperInstance = new Swiper(customSlider, sliderConfig)

    readySliders.set(sliderID, swiperInstance)
    customSlider.dataset.swiperInit = 'true'

    registerEventHandlers(swiperInstance)

    return swiperInstance
  } catch (error) {
    console.error('Failed to initialize Swiper:', error)
    return null
  }
}

// --- Переинициализация Swiper ---
const reinit = (slider: HTMLElement): SwiperInstance | null => {
  const customSlider = slider as CustomSwiperElement
  const sliderID = customSlider.dataset.swiper

  if (!sliderID) {
    console.warn('Swiper element missing data-swiper attribute')
    return null
  }

  // Удаляем старый инстанс
  const oldInstance = readySliders.get(sliderID)
  if (oldInstance) {
    oldInstance.destroy(true, true)
    readySliders.delete(sliderID)
  }

  try {
    const config = buildConfig(customSlider)
    const newInstance = new Swiper(customSlider, config)

    readySliders.set(sliderID, newInstance)
    customSlider.dataset.swiperInit = 'true'

    registerEventHandlers(newInstance)

    return newInstance
  } catch (error) {
    console.error('Failed to reinitialize Swiper:', error)
    return null
  }
}

// --- Удаление Swiper и чистка атрибутов ---
const destroy = (slider: HTMLElement): void => {
  const customSlider = slider as CustomSwiperElement
  const sliderID = customSlider.dataset.swiper

  if (!sliderID) return

  const instance = readySliders.get(sliderID)
  if (instance) {
    try {
      instance.destroy(true, true)
    } catch (error) {
      console.error('Error destroying Swiper instance:', error)
    }
    readySliders.delete(sliderID)
  }

  cleanSwiperDataAttrs(customSlider)
  customSlider.classList.remove('swiper-initialized', 'swiper-container-initialized')
}

// --- Утилитарные функции ---
const getAllSliders = (): Map<string, SwiperInstance> => new Map(readySliders)

const getSliderCount = (): number => readySliders.size

const destroyAll = (): void => {
  readySliders.forEach((instance, id) => {
    try {
      instance.destroy(true, true)
    } catch (error) {
      console.error(`Error destroying Swiper instance ${id}:`, error)
    }
  })
  readySliders.clear()
}

export { getSlider, init, reinit, destroy, getAllSliders, getSliderCount, destroyAll, readySliders }
