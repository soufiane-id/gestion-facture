import { BehaviorSubject } from 'rxjs';
import { Role } from '../_helpers/role';
import router from '../router/index'
import axios from '../client/http-common';
import { store } from "../store/store"

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('userInfo')));

export const authenticationService = {
    login,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() { return currentUserSubject.value },
    isAdmin,
};

function login(user) {
    return axios
        .post('signin', user)
        .then((res) => {
            localStorage.setItem('userInfo', JSON.stringify(res.data))
            currentUserSubject.next();
            router.push('dashboard')
            store.commit('loginError', '')
        })
        .catch((error) => {
            console.log(error)
            store.commit('loginError', 'Utilisateur ou Mot de passe incorrect')
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('userInfo');
}

function isAdmin() {
    let jwtToken = JSON.parse(localStorage.getItem("userInfo")).accessToken;
    var base64Url = jwtToken.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    let roles = JSON.parse(jsonPayload).roles
    let adminRole = roles[roles.findIndex(element => element.authority == Role.Admin)]
    return adminRole ? true : false;
}
