/*eslint-disable*/

if (localStorage.getItem('pickedServer') === 'america' || localStorage.getItem('pickedServer') === null) {
  localStorage.setItem('pickedServer', 'america');
} else if (localStorage.getItem('pickedServer') === 'europe') {
  localStorage.setItem('pickedServer', 'europe');
} else {
  localStorage.setItem('pickedServer', 'lan');
}

export const giveInputs = {};
