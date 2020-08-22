import { BehaviorSubject } from 'rxjs';
import router from '../router/index'
import axios from '../client/http-common';
import { store } from "../store/store"

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('userInfo')));

export const authenticationService = {
    login,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() { return currentUserSubject.value },
    getRoleByName
};

function login(user) {
    return axios
        .post('signin', user)
        .then((res) => {
            currentUserSubject.next(res.data);
            router.push('accueil')
            store.commit('loginError', '')
            localStorage.setItem('userInfo', JSON.stringify(res.data))
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

function getRoleByName(nameRole) {
    store.state.auth.ecransAutorises = [];
    return new Promise(resolve => {
        axios
            .get("/roleByName", {
                params: {
                    roleName: nameRole,
                },
            })
            .then((response) => {
                response.data.ecranAutorise.forEach(ecran => {
                    store.state.auth.ecransAutorises.push(ecran.nomEcran)
                });
                resolve(response.data);
            })
            .catch((e) => {
                console.log(e);
            });
    });
}