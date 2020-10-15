import axios from 'axios';
const stripe = Stripe('pk_test_51HYxDiIFea8qjLEftQZ8jpkB64yiiV412AtShuvowzCslZks1OT1gykBg3AiaSsfMBuqiKEoUk9cQfI172SfnwLj00hJdL9YyF');
const { showAlert } = require('./alerts');


export const bookTour = async tourId => {
  try{

    // 1) Get checkout session from API
    // GET request
    const response = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`
      // withCredentials: true
    });

    const { session } = response.data;
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.id
    })

  } catch(err) {
    // console.log(err);
    showAlert('error', err);
  }
}
