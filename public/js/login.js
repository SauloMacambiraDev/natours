import axios from 'axios'
import { showAlert } from './alerts'

export const login = async (email, password) => {

  try {
    const res = await axios.post('http://localhost:8000/api/v1/users/login', {
      email,
      password
    })
    if (res.data.status === 'success'){

      const firstName = res.data.data.user.name.split(' ')[0]
      // change to the home view after 1.5s
      showAlert('success', `Welcome to Natours ${firstName}!`)
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (error) {
    // error.response.data where the json res object comes in
    showAlert('error', error.response.data.message)
  }
}

export const logout = async () => {
  try {

    const res = await axios.get('http://localhost:8000/api/v1/users/logout')
    if(res.data.status === 'success'){
      showAlert('success', `You're logging out..`)
      window.setTimeout(() => {
        // Force reload from the server
        location.reload(true)
      }, 1500)
    }
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.')
  }
}

