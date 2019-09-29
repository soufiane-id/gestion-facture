<template>
  <div>
    <b-modal id="formulaireAjoutEC" ref="modal" no-close-on-esc hide-footer>
    <b-form @submit="onSubmit" @reset="onReset" v-if="show">
      <!-- Societe -->
      <b-form-group id="input-group-3" label="Societe:" label-for="input-3">
        <b-form-select
          id="input-3"
          v-model="echeancierClient.societe.idSociete"
          size="sm"
          :options="societeSelectList"
          required
        ></b-form-select>
      </b-form-group>

      <!-- Nom Client AutoComplete-->
      <div>
       <auto :suggestions="clients" 
       filterby="nomClient" 
       v-model="echeancierClient.client.nomClient"
       @selected="clientSelected"></auto>
      </div>

      <!-- Nom Client -->
      <!-- <b-form-group id="input-group-1" label="Nom Client:" label-for="input-1">
        <b-form-input
          id="input-1"
          v-model="echeancierClient.nomClient"
          type="text"
          size="sm"
          required
          placeholder="Entrer le client .."
        ></b-form-input>
      </b-form-group> -->

      <!-- Numero document -->
      <b-form-group id="input-group-2" label="Numéro du document:" label-for="input-2">
        <b-form-input id="input-2" v-model="echeancierClient.numeroDocument" required size="sm" placeholder="Entrer le num du document .."></b-form-input>
      </b-form-group>

      <!-- Date de facture -->
      <b-form-group id="input-group-22" label="Date Facture:" label-for="input-2">
        <b-form-input id="input-2"  type = "date" v-model="echeancierClient.dateFacture" required size="sm" placeholder="Entrer la date de la facture.."></b-form-input>
      </b-form-group>

      <!-- Date Echeance -->
      <b-form-group id="input-group-4" label="Date Echeance:" label-for="input-2">
        <b-form-input id="input-2" type = "date" v-model="echeancierClient.dateEcheance" required size="sm" placeholder="Entrer la date d\'echeance.."></b-form-input>
      </b-form-group>

      <!-- Montant Facture -->
      <b-form-group id="input-group-5" label="Montant de la facture:" label-for="input-2">
        <b-form-input id="input-2" v-model="echeancierClient.montantFacture" required size="sm" placeholder="Entrer le montant de la facture .."></b-form-input>
      </b-form-group>

      <!-- Montant Paye -->
      <b-form-group id="input-group-6" label="Montant payé:" label-for="input-2">
        <b-form-input id="input-2" v-model="echeancierClient.montantPaye" required size="sm" placeholder="Entrer le montant payé .."></b-form-input>
      </b-form-group>

      <!-- Reste A payé -->
      <!-- <b-form-group id="input-group-7" label="Reste à payer:" label-for="input-2">
        <b-form-input id="input-2" v-model="echeancierClient.resteAPayer" size="sm" placeholder="Entrer le reste à payer .."></b-form-input>
      </b-form-group> -->

      <!-- Date Reglement Facture -->
      <b-form-group id="input-group-8" label="Date Reglement Facture:" label-for="input-2">
        <b-form-input id="input-2" type = "date" v-model="echeancierClient.dateReglementFacture" required size="sm" placeholder="Entrer la date de reglement.."></b-form-input>
      </b-form-group>
      
      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>
    </b-form>
    <!-- <b-card class="mt-3" header="Form Data Result">
      <pre class="m-0">{{ echeancierClient }}</pre>
    </b-card> -->
    </b-modal>
  </div>
</template>

<script>
import http from "../../client/http-common";
import Auto from "../../commons/AutoComplete2";
import toast from "../../commons/toastr"
import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

export default {
  components: {Auto},
  data() {
    return {
      //selection: '',
      format: "dd/MM/yy",
      societes: [],
      clients: [],
      clientSelectionne: {},
      societeSelectList: [],
      echeancierClient: {
        societe: { idSociete: ""},
        client: {nomClient: ""},
        numeroDocument: "",
        dateFacture: "",
        dateEcheance: "",
        montantFacture: "",
        montantPaye: "",
        resteAPayer: "",
        dateReglementFacture: ""
      },show: true
    };
  },
  methods: {
    formatDate(date) {
    return moment(date).format('DD/MM/YYYY');
  },ajouterEC(){
    this.echeancierClient.dateFacture = this.formatDate(this.echeancierClient.dateFacture);
    this.echeancierClient.dateEcheance = this.formatDate(this.echeancierClient.dateEcheance);
    this.echeancierClient.dateReglementFacture = this.formatDate(this.echeancierClient.dateReglementFacture);
    this.echeancierClient.client = this.clientSelectionne;
    let self=this;
    http.post('echeancierClients',this.echeancierClient)
        .then(function (response) {
        self.$emit('refresh', response.data);
        self.afficherToast('success', 'Echeance insérée avec succès !');
          })
        .catch(function (error) {
        });
    },
    recupererSocietes() {
      http
        .get("/listSociete")
        .then(response => {
          this.societes = response.data;

          this.societes.forEach((societe, index, mechanicsArray) => {
            let selectListOption = {
              value: societe.idSociete,
              text: societe.nomSociete
            };

            this.societeSelectList.push(selectListOption);
          });
        })
        .catch(e => {
          console.log(e);
        });
    },
    recupererClients(){
      http
        .get("/listClient")
        .then(response => {
          this.clients = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.ajouterEC();
      // Hide the modal manually
      this.$nextTick(() => {
          this.$refs.modal.hide()
      });
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our echeancierClient values
      this.echeancierClient.societe.idSociete = "";
      this.echeancierClient.nomClient = "";
      this.echeancierClient.dateFacture = "";
      this.echeancierClient.numeroDocument = ""
      this.echeancierClient.dateEcheance = "";
      this.echeancierClient.montantFacture = "";
      this.echeancierClient.montantPaye = "";
      this.echeancierClient.resteAPayer = "";
      this.echeancierClient.dateReglementFacture = "";
      // Trick to reset/clear native browser echeancierClient validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    clientSelected(client) {
      this.clientSelectionne = client;
    }
  }, created() {
    this.recupererSocietes();
    this.recupererClients();
  }, 
  mixins: [toast]
};
</script>
