import axios from "axios";
import toast from "../commons/toast/toast";
import router from "../router/index"

const instance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-type": "application/json",
    //'Access-Control-Allow-Origin': '*'
  },
  params: {}, // do not remove this, its added to add params later in the config
});

/** REQUEST INTERCEPTORS */
instance.interceptors.request.use(function (config) {
  if (localStorage.getItem('userInfo')) {
    config.headers.Authorization = "Bearer " + JSON.parse(localStorage.getItem('userInfo')).accessToken;
  }
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

/** RESPONSE INTERCEPTORS */
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    /**
     * Acces à une ressource privée
     */
    console.log('error', error.response)
    if (error.response.status == 403 && error.response.data.message == 'Acces Interdit') {
      router.push('/403')
    } else {
      /**
       * Si le token n'est plus valide => Redirection vers page d'authentification + vider le localstorage
       */
      router.push('/login')
      localStorage.removeItem('token')
    }
    if (error.response) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default instance;