const getMaxValue = maxLength => {
  return Number('9'.repeat(maxLength))
}

const handleInput = (e, maxLength, buttons, maxValue) => {
  const input = e.currentTarget,
    reg = /^\d+$/,
    value = input.value

  if (value.length > maxLength) input.value = value.slice(0, maxLength)

  if (!reg.test(value) || !value) input.value = value.replace(/\D/g, '')

  checkValue({ sub: buttons.sub, add: buttons.add }, input, maxValue)
}

const handleChange = (e, maxValue, buttons) => {
  const input = e.currentTarget,
    value = input.value

  if (value === '' || value.startsWith('0')) input.value = '1'
  else if (value > maxValue) input.value = maxValue

  checkValue({ sub: buttons.sub, add: buttons.add }, input, maxValue)
}

const checkValue = (buttons, input, maxValue) => {
  const subBtn = buttons.sub,
    addBtn = buttons.add,
    value = +input.value

  if (subBtn) {
    if (value <= 1) subBtn.disabled = true
    else subBtn.disabled = false
  }

  if (addBtn) {
    if (value === maxValue) addBtn.disabled = true
    else addBtn.disabled = false
  }
}

const increment = (e, input, maxValue, subButton) => {
  const button = e.currentTarget,
    value = input.value

  if (value >= maxValue) return

  input.value = Number(value) + 1

  checkValue({ add: button, sub: subButton }, input, maxValue)
}

const decrement = (e, input, maxValue, addButton) => {
  const button = e.currentTarget,
    value = input.value

  if (value <= 1) return

  input.value = Number(value) - 1

  checkValue({ sub: button, add: addButton }, input, maxValue)
}

const counterInputCheck = () => {
  const counters = document.querySelectorAll('[data-type=counter]')

  counters.forEach(counter => {
    const input = counter.querySelector('[data-counter=input]'),
      maxLength = input.getAttribute('maxlength'),
      addButton = counter.querySelector('[data-counter-button=add]'),
      subButton = counter.querySelector('[data-counter-button=sub]'),
      maxValue = +input.dataset.counterMax || getMaxValue(maxLength)

    checkValue({ sub: subButton, add: addButton }, input, maxValue)

    input.addEventListener('input', e =>
      handleInput(e, maxLength, { sub: subButton, add: addButton }, maxValue)
    )

    input.addEventListener('change', e =>
      handleChange(e, maxValue, { sub: subButton, add: addButton })
    )

    addButton.addEventListener('click', e => increment(e, input, maxValue, subButton))

    subButton.addEventListener('click', e => decrement(e, input, maxValue, addButton))
  })
}

export { counterInputCheck }
