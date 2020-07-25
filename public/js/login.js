const login = async (email, password) => {
  try {
    const result = await axios.post('http://localhost:8000/api/v1/users/login', {
      email,
      password
    })

    firstName = result.data.data.user.name.split(' ')[0]
    window.setTimeout(() => {
      alert(`Welcome to Natours ${firstName}!`)
      // change to the home view
    }, 1500)
  } catch (error) {
    console.log(error)
    alert(error.message)
  }
}

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault(); // this prevents the page loading another page

  email = document.getElementById('email').value
  password = document.getElementById('password').value
  login(email, password)
})
