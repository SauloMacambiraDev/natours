// Polyfill some Js features(EC6¨) in input file for bundling
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

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
const bookBtn = document.querySelector('#book-tour');


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
  const photo = document.querySelector('#photo').files[0];

  const form = new FormData();
  form.append('name', name);
  form.append('email', email);
  form.append('photo', photo);

  updateSettings(form, 'data');
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

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...'
    // In js, on data attribute, whenever wee see tour-id, will be convert to tourId (camel case format)
    const { tourId } = e.target.dataset;
    bookTour(tourId).then((data) => {

      e.target.textContent = 'Book tour now!'
    })
    .catch(err => {
      e.target.textContent = 'Book tour now!'
      showAlert('failure', 'An error occurred. Please try again later')
    });
  })

}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);


