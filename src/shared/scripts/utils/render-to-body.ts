export const renderToBody = (el: HTMLElement): void => {
  if (el.parentElement !== document.body) document.body.appendChild(el)
}
