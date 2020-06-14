const state = {
  dateSuiviClient: null,
};

const getters = {
  getDateSuiviClient: (state) => {
    return state.dateSuiviClient;
  },
};

const mutations = {
  setDateSuiviClient: (state, payload) => {
    console.log("mutation setDateSuiviClient", payload);
    state.dateSuiviClient = payload;
  },
};

// const actions = {
//   date: ({ commit }, payload) => {
//     console.log("action", payload);
//     commit("date", payload);
//   },
// };

export default {
  state,
  getters,
  mutations,
  //actions,
};
