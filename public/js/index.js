// Polyfill some Js features(EC6¨) in input file for bundling
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'

// CSS
// import './../css/style.css'

// Image assets
// import './../img/pin.png'


// DOM ELEMENTS
const mapbox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logOutBtn = document.querySelector('.nav__el--logout')


// DELEGATION
if(mapbox) {
  // Dataset property points to all HTML attributes that start with 'data-'
  // So for example, if we add 'data-test', we could access its value by htmlElement.dataset.test
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  // console.log(locations)
  displayMap(locations)
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
      e.preventDefault(); // this prevents the page loading another page
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      login(email, password)
  })
}


if (logOutBtn) logOutBtn.addEventListener('click', logout)






