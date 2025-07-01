// Определяем типы для API слайдера
export interface RangeApi {
  initAll(): void
  reInit(element: string | HTMLElement): void
  reInitAll(): void
  isInit(el: string | HTMLElement): boolean
  getInitializedAttribute(element: string | HTMLElement): Attr | null
  setInitializedAttribute(element: string | HTMLElement): void
  triggerInitEvent(element: string | HTMLElement, instance: any): void
  findElement(el: string | HTMLElement): HTMLElement | null
  setBorderMinRangeValue(el: string | HTMLElement, value: number): void
  setCurrentMinRangeValue(el: string | HTMLElement, value: number): void
  getBorderMinRangeValue(el: string | HTMLElement): string | null
  setBorderMaxRangeValue(el: string | HTMLElement, value: number): void
  setCurrentMaxRangeValue(el: string | HTMLElement, value: number): void
  getBorderMaxRangeValue(el: string | HTMLElement): string | null
  triggerRangeChange(input: string | HTMLElement, value: any, instance: any): void
  triggerRangeUpdate(input: string | HTMLElement, value: any, instance: any): void
  getCurrentRangeValue(el: string | HTMLElement): any
}
