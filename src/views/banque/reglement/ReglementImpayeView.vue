<template>
    <div>
      <b-table
        id="my-table"
        :items="filtredOperations"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        small
      >
    <template v-slot:cell(statutOperation)="operationsBancaire">
        <b-badge :variant="getBadge(operationsBancaire.item.statutOperation)">{{operationsBancaire.item.statutOperation}}</b-badge>
    </template>

    <template v-slot:cell(action)="operationBancaire">   
      <b-col v-if="operationBancaire.item.statutOperation == 'EN_ATTENTE_FACTURE'" cols="6" sm="4" md="2" xl class="mb-3 mb-xl-0">
          <font-awesome-icon icon="exchange-alt"
           v-b-modal="'reglementOperation'" 
           @click="reglerOperation(operationBancaire.item)" 
           v-b-tooltip.hover title="Virement" size="lg" :style="{color: '5c9ea9'}"/>

      </b-col>

    </template>

    <template v-slot:custom-foot>
      <tr>
        <td class="bg-gray text-white" :colspan="3"></td>
        <td class="bg-success text-white text-center">{{montantFactureDebitTotal}}</td>
        <td class="bg-success text-white text-center">{{montantFactureCreditTotal}}</td>
        <td class="bg-gray text-white" :colspan="2"></td>
      </tr>
    </template> 

    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="my-table"
      align="center"
    ></b-pagination>
    </div>
</template>

<script>
import http from "../../../client/http-common";
import ReglementVirementModule from '../ReglementVirementModal';
import { refreshOperationsEventBus } from '../../../main';

export default {
    data() {
    return {
      operationsBancaire: [],
      perPage: 10,
      currentPage: 1,
      fields: [
        {
          key: "codeOperation",
          sortable: true,
          class: 'text-center'
        },
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
        }
      ]
    };
  },
  methods: {
      afficherReglementsImpayes(){
      http
        .get("/operationsImpaye")
        .then(response => {
          this.operationsBancaire = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    reglerOperation(operation){
      //this.operationARegler = operation;
      this.$store.commit('updateOperationARegler', operation);
    },
    convertDate(date) {
      //Convert yyyy-mm-dd  to  dd-mm-yyyy
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(date)
      let stringDate = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
      return this.stringToDate(stringDate);
     },
     stringToDate(dateString){
      var dateParts = dateString.split("/");
      
      // month is 0-based, that's why we need dataParts[1] - 1
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
     },
    getBadge (status) {
      return status === 'IMPAYE' ? 'warning' : 'danger'
    },
     /**  
      * Si le montant est null ou undefined ou NaN
      *  return 0
      * */
     toNumber(obj){
        return obj ? obj : 0;
     }
  },
  computed: {
    rows() {
      return this.operationsBancaire.length;
    },
    filtredOperations: function(){
      this.currentPage = 1;
      let operationsFiltred = this.operationsBancaire.filter((operation) => {
        return String(operation.montantCredit).match(this.$store.state.filterOperations)
              || String(operation.montantDebit).match(this.$store.state.filterOperations)
              || operation.nomOperation.toLowerCase().match(this.$store.state.filterOperations.toLowerCase())
      });

      // filtre sur les dates
      if(this.$store.state.startDate !== null && this.$store.state.endDate !== null){
        let vm = this;
         operationsFiltred = operationsFiltred.filter(function (element) {
          return vm.convertDate(vm.$store.state.startDate) <=  vm.stringToDate(element.dateOperation) && vm.stringToDate(element.dateOperation) <= vm.convertDate(vm.$store.state.endDate);
        });
      }

      // calculer la somme des montants Débit.
      if (operationsFiltred.length == 0) {
        this.montantFactureDebitTotal = 0;
      } else {
        this.montantFactureDebitTotal = operationsFiltred.map(o=>this.toNumber(o.montantDebit)).reduce((a,c)=>this.toNumber(a)+this.toNumber(c)).toFixed(2);
      }
      // calculer la somme des montants Crédit.
      if (operationsFiltred.length == 0) {
        this.montantFactureCreditTotal = 0;
      } else {
        this.montantFactureCreditTotal = operationsFiltred.map(o=>this.toNumber(o.montantCredit)).reduce((a,c)=>this.toNumber(a)+this.toNumber(c)).toFixed(2);
      }

      return operationsFiltred;
    }
  },
  created() {
      this.afficherReglementsImpayes();

      refreshOperationsEventBus.$on('refreshOperationsEnAttenteFacture', () => {
      this.afficherReglementsSansFacture();
    });
  }, 
  components: {
      ReglementVirementModule
  }
}
</script>

<style scoped>

</style>