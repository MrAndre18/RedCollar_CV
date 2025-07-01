const clickHandler = (e: Event, el: HTMLElement) => {
  e.preventDefault();
  const url = el.getAttribute('data-redirect');
  if (!url) return;
  const tgt = el.getAttribute('target');
  // Если задан target="_blank" или любой другой — используем window.open
  if (tgt) {
    window.open(url, tgt);
  } else {
    // иначе — привычный переход
    window.location.assign(url);
  }
}

export const redirectLinks = () => {
  const links = document.querySelectorAll('[data-redirect]') as NodeListOf<HTMLElement>;
  for (const link of links) {
    link.removeEventListener('click', e => clickHandler(e, link));
    link.addEventListener('click', e => clickHandler(e, link));
  }
}