const login = async (email, password) => {
  try {
    const res = await axios.post('http://localhost:8000/api/v1/users/login', {
      email,
      password
    })

    if (res.data.status === 'success'){
      firstName = res.data.data.user.name.split(' ')[0]
      alert(`Welcome to Natours ${firstName}!`)

      // change to the home view after 1.5s
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (error) {
    // error.response.data where the json res object comes in
    alert(error.response.data.message)
  }
}

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault(); // this prevents the page loading another page

  email = document.getElementById('email').value
  password = document.getElementById('password').value
  login(email, password)
})
