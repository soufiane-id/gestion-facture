import Vue from "vue";
import Vuex from "vuex";
import dashboard from "./modules/dashboard";
import suiviClient from "./modules/suiviClient";
import auth from "./modules/auth";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    filterOperations: "",
    startDate: null,
    endDate: null,
    operationARegler: {}, // Module Reglement Virement
    codeOperation: "", // DetailReglementModule
  },
  mutations: {
    updateFilterOperation(state, message) {
      state.filterOperations = message;
    },
    updateStartDateFilter(state, message) {
      state.startDate = message;
    },
    updateEndDateFilter(state, message) {
      state.endDate = message;
    },
    updateOperationARegler(state, message) {
      state.operationARegler = message;
    },
    updateCodeOperation(state, message) {
      state.codeOperation = message;
    },
  },
  modules: {
    dashboard,
    suiviClient,
    auth,
  },
});
