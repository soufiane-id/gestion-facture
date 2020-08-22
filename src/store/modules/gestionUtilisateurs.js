const state = {
    utilisateurs: [],
    roles: []
};

const mutations = {
    setUsers(state, users) {
        state.utilisateurs = users;
    },
    setRoles(state, roles) {
        state.roles = roles;
    },
    updateUser(state, updatedUser) {
        let index = state.utilisateurs.findIndex((user => user.id == updatedUser.id));
        if (index !== -1) {
            state.utilisateurs.splice(index, 1); // on supprime l element
            state.utilisateurs.splice(index, 0, updatedUser) // On insere le nouveau au meme index que le precedent
        }
    }
};

const actions = {

};

export default {
    state,
    mutations,
    actions,
};
