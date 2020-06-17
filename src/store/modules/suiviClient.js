const state = {
  dateSuiviClient: null,
  clientHistorique: {}, // stocke la note du client des 6 dernieres semaines
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
  updateClientHistorique: (state, payload) => {
    state.clientHistorique = payload;
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
