import axios from 'axios';
import { showAlert } from './alerts';
// updateData

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
                type === 'password'
                ? `${window.location.origin}/api/v1/users/updatePassword`
                : `${window.location.origin}/api/v1/users/updateProfile`;

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if(res.data.status === 'success'){
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }

  } catch(err) {
    console.log(err.response.data);
    if (err.response.data.status < 500) {
      showAlert('error', err.response.data.message);
    } else {
      showAlert('error', `An error occurred while trying to update your account.`);
    }
  }
}