import axios from '../../client/http-common';
import router from '../../router/index'
import toast from "../../commons/toast/toast";

const state = {
  erreurAuth: '',
  userName: localStorage.getItem('userInfo') ?
    JSON.parse(localStorage.getItem("userInfo")).nom + " " + JSON.parse(localStorage.getItem("userInfo")).prenom : '',
  roleName: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem("userInfo")).roles.toString() : '',
};

const mutations = {
  loginError(state, msg) {
    state.erreurAuth = msg;
  }
};

const actions = {
  register({ commit }, newUser) {
    axios
      .post('/register', newUser)
      .then((res) => {
        toast.success(res.data.message)
        router.push('login')
      })
      .catch((error) => console.log(error));
  }
};

export default {
  state,
  mutations,
  actions,
};
