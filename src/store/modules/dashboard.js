const state = {
  historiqueClient: [],
  historiqueClientActifs: [],
  clientsDangereux: [],
  clientsMauvais: [],
  clientsNormaux: [],
  bonsClients: [],
  tresBonsClients: [],
  clientsElite: [],
  clientsInactifs: [],
  clientsAlerteComm: [],
  clientsUrgenceComm: [],
  clientsAbsentsSemaineEnCours: [],
  pourcentageClientsAbsents: 0,
  pourcentageClientsDangereux: 0,
};

const getters = {
  historiqueClient: (state) => {
    return state.historiqueClient;
  },
  historiqueClientActifs: (state) => {
    let actifs = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return (
          historique.noteClient.degre != 10 && historique.noteClient.degre != 11
        );
    });
    state.historiqueClientActifs = actifs;
    return state.historiqueClientActifs;
  },
  calculClientDangereux() {
    let dangereux = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return historique.noteClient.degre == 1;
    });
    state.clientsDangereux = dangereux;
    return state.clientsDangereux;
  },
  calculClientMauvais() {
    let mauvais = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return historique.noteClient.degre == 2;
    });
    state.clientsMauvais = mauvais;
    return state.clientsMauvais;
  },
  calculClientsNormaux() {
    let normaux = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return (
          historique.noteClient.degre == 3 ||
          historique.noteClient.degre == 4 ||
          historique.noteClient.degre == 5
        );
    });
    state.clientsNormaux = normaux;
    return state.clientsNormaux;
  },
  calculBonsClients() {
    let bons = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return (
          historique.noteClient.degre == 6 || historique.noteClient.degre == 7
        );
    });
    state.bonsClients = bons;
    return state.bonsClients;
  },
  calculTresBonsClients() {
    let tresBons = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return historique.noteClient.degre == 8;
    });
    state.tresBonsClients = tresBons;
    return state.tresBonsClients;
  },
  calculClientsElite() {
    let elite = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return historique.noteClient.degre == 9;
    });
    state.clientsElite = elite;
    return state.clientsElite;
  },
  calculClientsInactifs() {
    let inactifs = state.historiqueClient.filter((historique) => {
      if (historique.noteClient != null)
        return (
          historique.noteClient.degre == 10 || historique.noteClient.degre == 11
        );
    });
    state.clientsInactifs = inactifs;
    return state.clientsInactifs;
  },
  getAllData() {
    let res = [];
    res.push(
      getters.calculClientDangereux(),
      getters.calculClientMauvais(),
      getters.calculClientsNormaux(),
      getters.calculBonsClients(),
      getters.calculTresBonsClients(),
      getters.calculClientsElite(),
      getters.calculClientsInactifs()
    );
    return res;
  },
  clientsAlerteComm() {
    return state.historiqueClient.filter((historique) => {
      return historique.noteClient.degre == 4;
    });
  },
  clientsUrgenceComm: (state) => {
    let urgence = state.historiqueClient.filter((historique) => {
      return (
        historique.noteClient.degre == 5 || historique.noteClient.degre == 7
      );
    });
    state.clientsUrgenceComm = urgence;
    return state.clientsUrgenceComm;
  },
  clientsAbsentsSemaineEnCours: (state) => {
    let absents = state.historiqueClientActifs.filter((historique) => {
      return historique.montantSemaineEnCours == 0;
    });
    state.clientsAbsentsSemaineEnCours = absents;
    return state.clientsAbsentsSemaineEnCours;
  },
  pourcentageClientsAbsents: (state) => {
    return (
      (state.clientsAbsentsSemaineEnCours.length /
        state.historiqueClientActifs.length) *
      100
    ).toFixed(2);
  },
  pourcentageClientsDangereux: (state) => {
    return (
      (state.clientsDangereux.length / state.historiqueClientActifs.length) *
      100
    ).toFixed(2);
  },
};

const mutations = {
  setHistoriqueClient(state, value) {
    state.historiqueClient = value;
  },
};

export default {
  state,
  getters,
  mutations,
};
