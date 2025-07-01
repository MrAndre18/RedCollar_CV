import type { IHeaderConfig } from '../types'
import { HeaderController } from './header-controller'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// --- Плавная смена темы хедера по секциям
function initHeaderThemeScroll(headerController: HeaderController) {
  const headerBody = document.querySelector('[data-header="body"]') as HTMLElement
  if (!headerBody) return

  // Удаляет все возможные классы header-body_*
  function clearHeaderColorClass() {
    headerBody.classList.forEach(className => {
      if (className.startsWith('header-body_')) {
        headerBody.classList.remove(className)
      }
    })
  }

  ScrollTrigger.getAll().forEach(t => {
    if (t.vars && (t.vars as any).id === 'header-theme') t.kill()
  })

  // Для возврата цвета после закрытия панели
  let lastSectionColor: string | null = null

  function setHeaderTheme(sectionColor: string | null) {
    if (headerController.activePanel) {
      clearHeaderColorClass()
      lastSectionColor = sectionColor
      return
    }
    clearHeaderColorClass()
    if (sectionColor) {
      headerBody.classList.add(`header-body_${sectionColor}`)
    }
    lastSectionColor = sectionColor
  }

  const colorSections = Array.from(document.querySelectorAll<HTMLElement>('[data-section-color]'))

  colorSections.forEach(section => {
    const sectionColor = section.getAttribute('data-section-color')
    if (!sectionColor) return

    ScrollTrigger.create({
      id: 'header-theme',
      trigger: section,
      start: () => {
        // Когда нижний край хедера касается верха секции
        const header = document.querySelector('[data-header="body"]') as HTMLElement;
        const headerRect = header.getBoundingClientRect();
        return `top-=${headerRect.height - 130
          } top`;
      },
      end: 'bottom top',
      onEnter: () => setHeaderTheme(sectionColor),
      onEnterBack: () => setHeaderTheme(sectionColor),
      onLeave: () => setHeaderTheme(null),
      onLeaveBack: () => setHeaderTheme(null),
      // markers: true,
    })
  })

  // Хуки для скрытия темы при открытии панели
  headerController.onPanelOpen = () => {
    clearHeaderColorClass()
  }
  headerController.onPanelClose = () => {
    clearHeaderColorClass()
    if (lastSectionColor) {
      headerBody.classList.add(`header - body_${lastSectionColor}`)
    }
  }
}

// --- Синхронизация панелей и dropdown-меню
export function syncPanelsAndDropdowns(controller: HeaderController, delay = 350) {
  const dropdownTriggers = Array.from(document.querySelectorAll('[data-dropdown-trigger]')) as HTMLElement[];
  let pendingDropdown: HTMLElement | null = null;

  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Если панель активна
      if (controller.activePanel) {
        e.preventDefault();
        pendingDropdown = trigger;
        // Закрываем активную панель через handleToggle
        const activeButton = controller.activeButton;
        if (activeButton) {
          controller.handleToggle(activeButton);
        } else if (controller.activePanel) {
          // fallback если вдруг нет activeButton
          controller.activePanel.hide();
          controller.activePanel = undefined;
        }
        // Открываем dropdown после закрытия панели
        setTimeout(() => {
          if (pendingDropdown) {
            openDropdown(pendingDropdown);
            pendingDropdown = null;
          }
        }, delay);
      }
      // Если панель не открыта — обычное поведение (ничего не делаем)
    }, true);
  });
}

// --- Явно открывает dropdown (без эмуляции клика)
function openDropdown(trigger: HTMLElement) {
  trigger.setAttribute('aria-expanded', 'true');
  // Убрать активные на других
  const menus = document.querySelectorAll('.dropdown__menu');
  menus.forEach(menu => menu.classList.remove('dropdown__menu_open'));

  const menu = trigger.parentElement?.querySelector('.dropdown__menu');
  if (menu) {
    menu.classList.add('dropdown__menu_open');
    menu.classList.remove('hidden');
  }
}

// --- Основной класс для инициализации хедера
export class Header {
  controller: HeaderController

  constructor(config: IHeaderConfig) {
    this.controller = new HeaderController(config)
    initHeaderThemeScroll(this.controller)
    syncPanelsAndDropdowns(this.controller)
  }
}
