// Polyfill some Js features(EC6¨) in input file for bundling
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'
import { updateSettings } from './updateSettings'


// CSS
// import './../css/style.css'

// Image assets
// import './../img/pin.png'


// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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

if(userDataForm) userDataForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  updateSettings({ name, email }, 'data');
});

if(userPasswordForm) userPasswordForm.addEventListener('submit', async e => {
  e.preventDefault();

  document.querySelector('.btn--save-password').innerHTML = 'Updating...';



  const currentPassword = document.querySelector('#password-current').value;
  const password = document.querySelector('#password').value;
  const passwordConfirm = document.querySelector('#password-confirm').value;

  await updateSettings({ currentPassword, password, passwordConfirm }, 'password');

  document.querySelector('#password-current').value = '';
  document.querySelector('#password').value = '';
  document.querySelector('#password-confirm').value = '';

  document.querySelector('.btn--save-password').innerHTML = 'Save password';
})

if (logOutBtn) logOutBtn.addEventListener('click', logout)






