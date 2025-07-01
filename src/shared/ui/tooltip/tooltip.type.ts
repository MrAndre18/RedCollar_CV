import type { Instance, Props } from 'tippy.js'

// Храним карты всех инициализированных тултипов
export type TooltipInstanceMap = Map<HTMLElement, Instance>

// Основной API для работы с тултипами
export interface TooltipApi {
  init: (el: string | HTMLElement, options?: Partial<Props>) => void // Инициализация тултипа
  reInit: (el: string | HTMLElement, options?: Partial<Props>) => void // Переинициализация тултипа
  destroy: (el: string | HTMLElement) => void // Уничтожение тултипа
  show: (el: string | HTMLElement) => void // Показать тултип
  hide: (el: string | HTMLElement) => void // Скрыть тултип
  isInit: (el: string | HTMLElement) => boolean // Проверка на инициализацию
  initAll: (options?: Partial<Props>) => void // Инициализация всех тултипов на странице
  destroyAll: () => void // Уничтожение всех тултипов
  reInitAll: (options?: Partial<Props>) => void // Переинициализация всех тултипов
  getInstance: (el: string | HTMLElement) => Instance | null // Получить экземпляр тултипа для элемента
  getElement: (el: string | HTMLElement) => HTMLElement | null // Получить элемент по селектору или объекту
}
