// Polyfill some Js features(EC6¨) in input file for bundling
import '@babel/polyfill'
import { login } from './login'
import { displayMap } from './mapbox'

// DOM ELEMENTS
const mapbox = document.getElementById('map')
const loginForm = document.querySelector('form')

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
      email = document.getElementById('email').value
      password = document.getElementById('password').value
      console.log(email, password)
      login(email, password)
  })
}









