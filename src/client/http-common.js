import axios from 'axios';
import toast from '../commons/toast/toast';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    "Content-type": "application/json"
  },
  params: {} // do not remove this, its added to add params later in the config
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  if (error.response) {
     toast.error(error.response.data.message);
   }
  return Promise.reject(error);
});

export default instance