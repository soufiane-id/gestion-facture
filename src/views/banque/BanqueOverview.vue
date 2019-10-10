<template>
  <div>
    <ReglementOperationModule v-if="operationARegler.statutOperation != 'VALIDE'" :operation='operationARegler' @refresh = "recupererOperationsBancaire" />
    <ReglementChequeModule :operation='operationARegler' />
    <b-table
      id="my-table"
      :items="operationsBancaire"
      :fields="fields"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
    <template slot="statutOperation" slot-scope="operationsBancaire">
        <b-badge :variant="getBadge(operationsBancaire.item.statutOperation)">{{operationsBancaire.item.statutOperation}}</b-badge>
    </template>
    <template slot="action" slot-scope="operationsBancaire">
      <b-col cols="6" sm="4" md="2" xl class="mb-3 mb-xl-0">
        <b-button block variant="link" v-b-modal="'reglementOperation'" @click="reglerOperation(operationsBancaire.item)">Régler</b-button>
        <b-button block variant="link" v-b-modal="'reglementCheque'" @click="reglerOperation(operationsBancaire.item)">Chèque</b-button>
      </b-col>
    </template> 
    </b-table>
  </div>
</template>

<script>
import http from "../../client/http-common";
import ReglementOperationModule from './ReglementOperationModal';
import ReglementChequeModule from './ReglementChequeModal';

export default {
  components: { ReglementOperationModule, ReglementChequeModule },
data() {
    return {
      operationsBancaire: [],
      operationARegler: '',
      perPage: 10,
      currentPage: 1,
      fields: [
        {
          key: "dateOperation",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "nomOperation",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "montantDebit",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "montantCredit",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "statutOperation",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "action"
        }
      ]
    };
  },
  methods: {
    recupererOperationsBancaire() {
      http
        .get("/listOperationBancaire")
        .then(response => {
          this.operationsBancaire = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    }, 
    getBadge (status) {
      return status === 'VALIDE' ? 'success'
        : status === 'EN_COURS' ? 'warning'
          : status === 'CREE' ? 'danger' : 'primary'
    },
    reglerOperation(operation){
      this.operationARegler = operation;
    }
  },
  created() {
    this.recupererOperationsBancaire();
  }

}  

</script>