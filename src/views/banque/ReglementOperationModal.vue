<template>
  <div>
    <b-modal
      id="reglementOperation"
      ref="modal"
      title="Réglement"
      size="lg"
      header-bg-variant="light"
      @hidden="resetModal"
      @cancel="resetModal"
      @ok="handleOk"
    >
      <div>
        <b-form-group
          label-cols-sm="4"
          label-cols-lg="3"
          label="Montant de l'opération : "
        >{{operation.montantDebit ? operation.montantDebit : operation.montantCredit}}</b-form-group>
      </div>
      <div class="card-tools button-magic">
        <button
          @click="getEcheancesParMontantFacture"
          type="button"
          class="btn btn-warning add-new"
        >
          <i class="fa fa-cog fa-spin fa-1x fa-fw"></i> Magic Button
        </button>
      </div>

      <!-- Nom Client AutoComplete-->
      <div v-if="operation.montantCredit">
        <span><strong>Nom Client : </strong></span>
        <Autocomplete :suggestions="listAutoComplete" 
              filterby="nomClient"
              v-model="autoCompleteModel"
              @selected="clientSelected">
        </Autocomplete>
      </div>

      <!-- Nom Fournisseur AutoComplete-->
      <div v-if="operation.montantDebit">
        <span>Nom Fournisseur : </span>
        <Autocomplete :suggestions="listAutoComplete" 
              filterby="nomFournisseur"
              v-model="autoCompleteModel"
              @selected="fournisseurSelected">
        </Autocomplete>
      </div>

      <b-table
        ref="selectableTable"
        v-if="operation.montantCredit"
        id="my-table"
        selectable
        select-mode="multi"
        @row-selected="onRowSelected"
        :items="resultatClient"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        small
        foot-clone
      >
        <template slot="FOOT_montantFacture">{{ montantFactureTotal }}</template>
      </b-table>
    </b-modal>
  </div>
</template>

<script>
import Autocomplete from "../../commons/AutoComplete2";
import http from "../../client/http-common";
import knapsack from "../../commons/subset/Knapsack";
import toast from "../../commons/toastr"

export default {
  props: ["operation"],
  components: {
    Autocomplete
  },
  data() {
    return {
      autoCompleteModel:'', // Dette technique ! 
      listAutoComplete: [],
      selectedRow: [],
      montantFacturesSelectionnes: 0,
      resultatClient: [],
      resultatFournisseur: [],
      idClientSelected: '',
      arrMontantFacture : [],
      perPage: 10,
      currentPage: 1,
      fields: [
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: "text-center"
        },
        {
          key: "client.nomClient",
          label: "Nom Client",
          sortable: true,
          class: "text-center"
        },
        {
          key: "numeroDocument",
          sortable: true,
          class: "text-center"
        },
        {
          key: "resteAPayer",
          sortable: true,
          class: "text-center"
        },
        {
          key: "montantFacture",
          sortable: true,
          class: "text-center"
        }
      ]
    };
  },
  methods: {
    valoriserClientOuFrs() {
      console.log('this.operation.montantDebit', this.operation.montantDebit)
      console.log('this.operation.montantCredit', this.operation.montantCredit)
       if (this.operation.montantDebit != null ) {
        http
          .get("/listFournisseur")
          .then(response => {
            this.listAutoComplete = response.data;
          })
          .catch(e => {
            console.log(e);
          });
      } else if (this.operation.montantCredit != null ) {
        http
          .get("/listClient")
          .then(response => {
            this.listAutoComplete = response.data;
          })
          .catch(e => {
            console.log(e);
          });
      }
    },
    clientSelected(client) {
      console.log(client);
      console.log(
        `Customer Selected:\nid: ${client.idClient}\nname: ${client.nomClient}`
      );
      this.idClientSelected = client.idClient;
      this.recupererEcheancierParClient(client.idClient);
    },
    fournisseurSelected(fournisseur) {
      console.log(fournisseur);
      console.log(
        `Customer Selected:\nid: ${fournisseur.idFournisseur}\nname: ${fournisseur.nomFournisseur}`
      );
    },
    recupererEcheancierParClient(idClient) {
      http
        .get("/getEcheanciersByClient/" + idClient)
        .then(response => {
          this.arrMontantFacture = [];
          this.resultatClient = response.data;
          this.recupererMontantsFacture(this.resultatClient);
        })
        .catch(e => {
          console.log(e);
        });
    },
    onChange(value) {
      // do something with the current value
    },
    resetModal() {
      this.autoCompleteModel = '';
      this.listAutoComplete = [];
      this.resultatClient = [];
      this.selectedRow = [];
      this.arrMontantFacture = [];
    },
    onRowSelected(items) {
      console.log('items', items)
      this.selectedRow = items;
    },
    handleOk(bvModalEvt) {
      console.log('selectedRow', this.selectedRow)
      if(this.selectedRow.length < 1){
        this.afficherToast('danger', 'Vous n\'avez sélectionné aucune écheance !');
        return;
      }
      let self=this;
      http.post('reglerOperations/' + this.operation.codeOperation + '/' + this.montantFacturesSelectionnes 
              , this.selectedRow)
        .then(function (response) {
          // On rafraichi l'ensemble de la page des opérations ( penser à une amélioration !!!!!)
          self.$emit('refresh');
        })
        .catch(function (error) {
      
        });

    },
    recupererMontantsFacture(resultat) {
      resultat.forEach(element => {
        this.arrMontantFacture.push(element.montantFacture);
      });
    }, getEcheancesParMontantFacture(){
        if(typeof this.arrMontantFacture === 'undefined' || this.arrMontantFacture.length == 0){
            this.afficherToast('danger', 'il n\'y a pas d\'echeances !');
            return;
        }
        let result = this.getSubsets(
        this.arrMontantFacture,
        this.operation.montantDebit
          ? this.operation.montantDebit
          : this.operation.montantCredit
      );
      if (typeof result === 'undefined' || result.length == 0) {
            this.afficherToast('danger', 'Pas de solution !!');
            return;
        }
      http
        .get("/getEcheanciersByMontants/" + result + '/' + this.idClientSelected)
        .then(response => {
          this.resultatClient = response.data;
          this.afficherToast('success', 'Solution trouvée .. ');
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
   mounted() {
     /* Evenement lors de l'ouverture du modal ayant l'id 'reglementOperation' */
    this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
      if(modalId === 'reglementOperation'){
        this.valoriserClientOuFrs();
      }
    })
  },
  computed: {
    montantFactureTotal() {
      return this.selectedRow.reduce((accum, item) => {
        this.montantFacturesSelectionnes =  accum + item.montantFacture;
        return this.montantFacturesSelectionnes;
      }, 0.0);
    }
  },
  mixins: [knapsack, toast]
};
</script>

<style scoped>
.add-new {
    float: right;
	height: 25px;
	font-weight: bold;
	font-size: 12px;
	text-shadow: none;
	min-width: 100px;
	border-radius: 50px;
	line-height: 13px;
    }

.button-magic {
    margin-bottom:40px;
}
</style>