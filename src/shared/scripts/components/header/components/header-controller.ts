import { scrollManager } from '@shared/scripts/libs/lenis/lenis';
import type { DefaultPanelIds, IHeaderConfig, IPanelConfig } from '../types';
import { HeaderPanel } from './header-panel';
import gsap from 'gsap';
import { animationRegistry } from './animation-registry';
import type { IAnimationRegistry } from './animation-registry';

export interface IHeaderButton {
  el: HTMLElement;
  trigger: 'click' | 'hover';
  target: HeaderPanel;
}

export class HeaderController {
  headerEl: HTMLElement;
  config: IHeaderConfig;
  buttons: IHeaderButton[] = [];
  activePanel?: HeaderPanel;
  activeButton?: IHeaderButton;
  overlay: HTMLElement | null;
  pendingHoverHideTimer: number | null = null;
  tl: gsap.core.Timeline | null = null;
  sequentialSwitch: boolean;
  switchDelay: number;

  // >>> ДОБАВЛЕНО: хуки для смены темы (использует header-init.ts)
  onPanelOpen?: () => void
  onPanelClose?: () => void

  constructor(config: IHeaderConfig) {
    this.config = config;
    const containerSel = config.containerSelector || `[data-header="container"]`;
    const headerEl = document.querySelector(containerSel) as HTMLElement;
    if (!headerEl) throw new Error('Header container not found');
    this.headerEl = headerEl;
    this.overlay = config.overlay === false ? null : headerEl.querySelector('[data-header="overlay"]');
    this.sequentialSwitch = config.panelsAnimation?.sequentialSwitch ?? false;
    this.switchDelay = config.panelsAnimation?.delay ?? 0;
    this.initPanels();
    this.bindOverlay();
    this.bindGlobalEvents();
    this.bindCloseButtons();
  }

  private initPanels() {
    const panelEls = document.querySelectorAll('[data-header-panel]') as NodeListOf<HTMLElement>;
    panelEls.forEach(panelEl => {
      const panelId = panelEl.getAttribute('data-header-panel')!;
      const specificConfig = (this.config.panels && this.config.panels[panelId as DefaultPanelIds]) || {};
      const mergedAnimation = { ...this.config.panelsAnimation, ...specificConfig.animation };
      const animationAttr = panelEl.getAttribute('data-panel-animation') as keyof IAnimationRegistry | null;
      if (animationAttr && animationAttr in animationRegistry) {
        mergedAnimation.type = animationAttr;
      }
      const mergedPosition = { ...this.config.panelsPosition, ...specificConfig.position };
      const mergedOn = { ...this.config.on, ...specificConfig.on };
      const triggerFromConfig: 'click' | 'hover' | undefined = specificConfig.trigger;
      let determinedTrigger: 'click' | 'hover';
      if (triggerFromConfig) determinedTrigger = triggerFromConfig;
      else if (this.config.defaultTrigger) determinedTrigger = this.config.defaultTrigger;
      else {
        const triggerAttr = (document.querySelector(
          `[data-header="button"][data-target="${panelId}"]`
        ) as HTMLElement)?.getAttribute('data-trigger');
        determinedTrigger = triggerAttr === 'hover' ? 'hover' : 'click';
      }
      const mergedConfig: IPanelConfig = {
        animation: mergedAnimation,
        position: mergedPosition,
        overlay: specificConfig.overlay,
        on: mergedOn,
        trigger: determinedTrigger
      };
      const panel = new HeaderPanel(panelEl, mergedConfig);
      const triggerSel = `[data-header="button"][data-target="${panelId}"]`;
      const triggerEl = document.querySelector(triggerSel) as HTMLElement;
      if (!triggerEl) return;
      const button: IHeaderButton = { el: triggerEl, trigger: determinedTrigger, target: panel };
      this.buttons.push(button);
      if (button.trigger === 'click') {
        triggerEl.addEventListener('click', e => { e.preventDefault(); this.handleToggle(button); });
      } else {
        triggerEl.addEventListener('mouseenter', () => { this.cancelHoverHide(); this.handleToggle(button); });
        triggerEl.addEventListener('mouseleave', () => this.scheduleHoverHide(button));
        panel.el.addEventListener('mouseenter', () => this.cancelHoverHide());
        panel.el.addEventListener('mouseleave', () => this.scheduleHoverHide(button));
      }
    });
  }

  public handleToggle(button: IHeaderButton) {
    this.killTimeline();
    this.cancelHoverHide();
    const isSame = this.activePanel === button.target;
    this.buttons.forEach(btn => btn.el.classList.remove('active'));
    if (!isSame) button.el.classList.add('active');
    this.tl = gsap.timeline({ onComplete: () => { this.tl = null; } });

    if (this.activePanel) {
      this.tl.add(this.activePanel.hide());
      this.tl.add(() => {
        if (isSame) {
          if (this.overlay) this.overlay.classList.remove('active');
          scrollManager.enableScroll();
          this.activePanel = undefined;
          this.activeButton = undefined;
          // >>> ДОБАВЛЕНО: хуки для закрытия панели
          if (typeof this.onPanelClose === 'function') {
            this.onPanelClose();
          }
        }
      });
    }

    if (!isSame) {
      if (this.sequentialSwitch) {
        this.tl.add(() => this.openPanel(button));
      } else {
        this.tl.add(() => { }, `+=${this.switchDelay}`);
        this.tl.add(() => this.openPanel(button));
      }
    }
  }

  private openPanel(button: IHeaderButton) {
    this.activePanel = button.target;
    this.activeButton = button;
    button.target.applyPositioning({ triggerEl: button.el, headerEl: this.headerEl });
    if (this.overlay) {
      if (button.target.config.overlay === false) this.overlay.classList.remove('active');
      else this.overlay.classList.add('active');
    }
    // >>> ДОБАВЛЕНО: хуки для открытия панели
    if (typeof this.onPanelOpen === 'function') {
      this.onPanelOpen();
    }
    this.tl!.add(button.target.show());
    scrollManager.disableScroll();
  }

  private scheduleHoverHide(button: IHeaderButton) {
    if (this.pendingHoverHideTimer) clearTimeout(this.pendingHoverHideTimer);
    this.pendingHoverHideTimer = window.setTimeout(() => {
      if (!button.el.matches(':hover') && !button.target.el.matches(':hover')) {
        this.handleToggle(button);
      }
      this.pendingHoverHideTimer = null;
    }, 250);
  }

  private cancelHoverHide() {
    if (this.pendingHoverHideTimer) {
      clearTimeout(this.pendingHoverHideTimer);
      this.pendingHoverHideTimer = null;
    }
  }

  private bindOverlay() {
    if (this.overlay) this.overlay.addEventListener('click', () => {
      if (this.activeButton && this.activePanel) this.handleToggle(this.activeButton);
    });
  }

  private bindGlobalEvents() {
    window.addEventListener('keyup', this._onKeyUp);
  }

  private bindCloseButtons() {
    const closeButtons = document.querySelectorAll('[data-header-close]')
    closeButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const panelId = (e.currentTarget as HTMLElement).getAttribute('data-header-close')
        if (!panelId) return
        const button = this.buttons.find(b => b.target.el.dataset.headerPanel === panelId)
        if (button && this.activePanel === button.target) {
          this.handleToggle(button)
        }
      })
    })
  }

  private killTimeline() {
    if (this.tl) {
      this.tl.kill();
      this.tl = null;
    }
  }

  destroy() {
    this.killTimeline();
    this.buttons.forEach(({ el, trigger, target }) => {
      const clone = el.cloneNode(true) as HTMLElement;
      el.replaceWith(clone);
      if (trigger === 'hover') target.el.replaceWith(target.el.cloneNode(true) as HTMLElement);
    });
    if (this.overlay) {
      const overlayClone = this.overlay.cloneNode(true) as HTMLElement;
      this.overlay.replaceWith(overlayClone);
    }
    window.removeEventListener('keyup', this._onKeyUp);
    this.buttons = [];
    this.activePanel = undefined;
    this.activeButton = undefined;
    scrollManager.enableScroll();
  }

  hideAll() {
    this.killTimeline();
    this.buttons.forEach(({ el }) => el.classList.remove('active'));
    if (this.activePanel) this.activePanel.hide();
    this.activePanel = undefined;
    this.activeButton = undefined;
    if (this.overlay) this.overlay.classList.remove('active');
    scrollManager.enableScroll();
  }

  public handleToggleActivePanel() {
    if (this.activeButton && this.activePanel) {
      this.handleToggle(this.activeButton);
    }
  }

  private _onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.hideAll();
  };
}
