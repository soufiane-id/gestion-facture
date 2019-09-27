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
      <b-form-group label="Choix Opération : ">
        <b-form-radio-group
          id="radio-group-2"
          v-model="selectedOperation"
          name="radio-sub-component"
        >
          <b-form-radio :value="VALUE_DEBIT" @change="handleChange($event)">Débit</b-form-radio>
          <b-form-radio :value="VALUE_CREDIT" @change="handleChange($event)">Crédit</b-form-radio>
        </b-form-radio-group>
      </b-form-group>

      <div class="card-tools button-magic">
        <button
          @click="getEcheancesParMontantFacture"
          type="button"
          class="btn btn-warning add-new"
        >
          <i class="fa fa-cog fa-spin fa-1x fa-fw"></i> Magic Button
        </button>
      </div>

      <Autocomplete
        v-if="selectedOperation == VALUE_CREDIT"
        :items="listAutoComplete"
        filterby="nomClient"
        @change="onChange"
        title="Chercher Client.."
        @selected="clientSelected"
      />
      <Autocomplete
        v-if="selectedOperation == VALUE_DEBIT"
        :items="listAutoComplete"
        filterby="nomFournisseur"
        @change="onChange"
        title="Chercher Frs.."
        @selected="fournisseurSelected"
      />

      <b-table
        ref="selectableTable"
        v-if="selectedOperation == VALUE_CREDIT"
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
import Autocomplete from "../../commons/Autocomplete";
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
      listAutoComplete: [],
      selectedOperation: "",
      selectedRow: [],
      VALUE_DEBIT: "Débit",
      VALUE_CREDIT: "Crédit",
      resultatClient: [],
      resultatFournisseur: [],
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
          key: "montantFacture",
          sortable: true,
          class: "text-center"
        }
      ]
    };
  },
  methods: {
    handleChange: function(e) {
      console.log(e);
      if (e === this.VALUE_DEBIT) {
        http
          .get("/listFournisseur")
          .then(response => {
            this.listAutoComplete = response.data;
          })
          .catch(e => {
            console.log(e);
          });
      } else if (e === this.VALUE_CREDIT) {
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
      this.selectedOperation = "";
      this.resultatClient = [];
      this.selectedRow = [];
      this.arrMontantFacture = [];
    },
    onRowSelected(items) {
      this.selectedRow = items;
    },
    handleOk(bvModalEvt) {},
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
        .get("/getEcheanciersByMontants/" + result)
        .then(response => {
          this.resultatClient = response.data;
          this.afficherToast('success', 'Solution trouvée .. ');
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  computed: {
    montantFactureTotal() {
      return this.selectedRow.reduce((accum, item) => {
        return accum + item.montantFacture;
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
    margin-bottom:60px;
}
</style>