<template>
  <div>
    <b-modal
      id="formulaireAjoutEC"
      ref="modal"
      @hidden="onReset"
      no-close-on-esc
      hide-footer
    >
      <b-form @submit="onSubmit" @reset="onReset" v-if="show">
        <!-- Societe -->
        <b-form-group id="input-group-3" label="Societe:" label-for="input-3">
          <b-form-select
            id="input-1"
            v-model="echeancierClient.societe.idSociete"
            size="sm"
            :options="societeSelectList"
            required
          ></b-form-select>
        </b-form-group>

        <!-- Nom Client AutoComplete-->
        <div>
          <span>Nom {{ typePersonne }}: </span>
          <AutoComplete
            :suggestions="personnes"
            filterby="nomPersonne"
            v-model="echeancierClient.personne.nomPersonne"
            @selected="clientSelected"
          >
          </AutoComplete>
        </div>

        <!-- Numero document -->
        <b-form-group
          id="input-group-2"
          label="Numéro du document:"
          label-for="input-2"
        >
          <b-form-input
            id="input-2"
            v-model="echeancierClient.numeroDocument"
            size="sm"
            placeholder="Entrer le num du document .."
          ></b-form-input>
        </b-form-group>

        <!-- Date de facture -->
        <b-form-group
          id="input-group-22"
          label="Date Facture:"
          label-for="input-2"
        >
          <b-form-input
            id="input-4"
            type="date"
            v-model="echeancierClient.dateFacture"
            required
            size="sm"
            placeholder="Entrer la date de la facture.."
          ></b-form-input>
        </b-form-group>

        <!-- Date Echeance -->
        <!-- <b-form-group id="input-group-4" label="Date Echeance:" label-for="input-2">
        <b-form-input id="input-5" type = "date" v-model="echeancierClient.dateEcheance" size="sm" placeholder="Entrer la date d\'echeance.."></b-form-input>
      </b-form-group> -->

        <!-- Montant Facture -->
        <b-form-group
          id="input-group-5"
          label="Montant de la facture:"
          label-for="input-2"
        >
          <b-form-input
            id="input-6"
            v-model="echeancierClient.montantFacture"
            required
            size="sm"
            placeholder="Entrer le montant de la facture .."
          ></b-form-input>
        </b-form-group>

        <!-- Montant Paye -->
        <!-- <b-form-group id="input-group-6" label="Montant payé:" label-for="input-2">
        <b-form-input id="input-7" v-model="echeancierClient.montantPaye" size="sm" placeholder="Entrer le montant payé .."></b-form-input>
      </b-form-group> -->

        <!-- Reste A Payer -->
        <!-- <b-form-group id="input-group-9" label="Reste à payer:" label-for="input-9">
        <b-form-input id="input-9" v-model="echeancierClient.resteAPayer" size="sm" placeholder="Entrer le reste à payer .."></b-form-input>
      </b-form-group> -->

        <!-- Date Reglement Facture -->
        <!-- <b-form-group id="input-group-8" label="Date Reglement Facture:" label-for="input-2">
        <b-form-input id="input-8" type = "date" v-model="echeancierClient.dateReglementFacture" size="sm" placeholder="Entrer la date de reglement.."></b-form-input>
      </b-form-group> -->

        <b-button type="submit" variant="primary">Submit</b-button>
        <b-button type="reset" variant="danger">Reset</b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import http from "../../../client/http-common";
import AutoComplete from "../../../commons/AutoComplete2";
import toast from "../../../commons/toast/toast";
import moment from "moment";
import "moment/locale/fr";
moment.locale("fr");

export default {
  props: ["typePersonne", "factureToEdit"],
  components: { AutoComplete },
  data() {
    return {
      //selection: '',
      format: "dd/MM/yy",
      societes: [],
      personnes: [],
      clientSelectionne: {},
      societeSelectList: [],
      factureAModifier: {}, //we replicate the props data into a variable to avoid mutating a prop directly
      echeancierClient: {
        societe: { idSociete: "" },
        personne: { nomPersonne: "" },
        numeroDocument: "",
        dateFacture: "",
        dateEcheance: "",
        montantFacture: "",
        montantPaye: "",
        resteAPayer: "",
        dateReglementFacture: "",
      },
      show: true,
    };
  },
  methods: {
    formatDate(date) {
      if (date) {
        return moment(date).format("DD/MM/YYYY");
      }
      return null;
    },
    unFormatDate(date) {
      if (date) {
        return moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
      }
      return null;
    },
    ajouterEC() {
      this.echeancierClient.dateFacture = this.formatDate(
        this.echeancierClient.dateFacture
      );
      this.echeancierClient.dateEcheance = this.formatDate(
        this.echeancierClient.dateEcheance
      );
      this.echeancierClient.dateReglementFacture = this.formatDate(
        this.echeancierClient.dateReglementFacture
      );
      if (!this.fromUpdate()) {
        this.echeancierClient.personne = this.clientSelectionne;
      }
      let self = this;
      http
        .post("echeancierClients", this.echeancierClient)
        .then(function(response) {
          self.$emit("refresh", response.data);
          toast.success("Echeance insérée avec succès !");
        })
        .catch(function(error) {})
        .finally(function() {
          self.clearForm(self);
        });
    },
    recupererSocietes() {
      http
        .get("/listSociete")
        .then((response) => {
          this.societes = response.data;

          this.societes.forEach((societe, index, mechanicsArray) => {
            let selectListOption = {
              value: societe.idSociete,
              text: societe.nomSociete,
            };

            this.societeSelectList.push(selectListOption);
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    recupererClients() {
      //alert(this.typePersonne)
      if (this.typePersonne.toLowerCase() === "client") {
        http
          .get("/listClient")
          .then((response) => {
            this.personnes = response.data;
          })
          .catch((e) => {
            console.log(e);
          });
      } else if (this.typePersonne.toLowerCase() === "fournisseur") {
        http
          .get("/listFournisseur")
          .then((response) => {
            this.personnes = response.data;
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.ajouterEC();
      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onReset(evt) {
      console.log(this);
      evt.preventDefault();
      // Reset our echeancierClient values
      this.clearForm(this);
      // Trick to reset/clear native browser echeancierClient validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    clearForm(obj) {
      obj.echeancierClient.idEcheancier = "";
      obj.echeancierClient.societe.idSociete = "";
      obj.echeancierClient.personne.nomPersonne = "";
      obj.echeancierClient.dateFacture = "";
      obj.echeancierClient.numeroDocument = "";
      obj.echeancierClient.dateEcheance = "";
      obj.echeancierClient.montantFacture = "";
      obj.echeancierClient.montantPaye = "";
      obj.echeancierClient.resteAPayer = "";
      obj.echeancierClient.dateReglementFacture = "";
    },
    clientSelected(client) {
      this.clientSelectionne = client;
    },
    fromUpdate() {
      if (this.factureToEdit != null) {
        this.factureAModifier = this.$_.cloneDeep(this.factureToEdit);
        return true;
        //return Object.keys(this.factureAModifier).length > 0;
      }
      return false;
    },
  },
  created() {
    this.recupererSocietes();
  },
  mounted() {
    /* Evenement lors de l'ouverture du modal ayant l'id 'formulaireAjoutEC' */
    this.$root.$on("bv::modal::shown", (bvEvent, modalId) => {
      // FIXME Ce bout de code s'execute plusieurs fois !!!!!!!
      if (modalId === "formulaireAjoutEC") {
        this.recupererClients();
      }
      if (this.fromUpdate()) {
        this.echeancierClient = this.$_.cloneDeep(this.factureAModifier);
        this.echeancierClient.dateFacture = this.unFormatDate(
          this.factureAModifier.dateFacture
        );
        this.echeancierClient.dateEcheance = this.unFormatDate(
          this.factureAModifier.dateEcheance
        );
        this.echeancierClient.dateReglementFacture = this.unFormatDate(
          this.factureAModifier.dateReglementFacture
        );
        /*this.echeancierClient.idEcheancier = this.factureAModifier.idEcheancier;
        this.echeancierClient.societe.idSociete = this.factureAModifier.societe.idSociete;
        this.echeancierClient.personne.idPersonne = this.factureAModifier.personne.idPersonne;
        this.echeancierClient.personne.nomPersonne = this.factureAModifier.personne.nomPersonne;
        this.echeancierClient.personne.typePersonne = this.factureAModifier.personne.typePersonne;
        this.echeancierClient.dateFacture = this.unFormatDate(this.factureAModifier.dateFacture);
        this.echeancierClient.numeroDocument = this.factureAModifier.numeroDocument
        this.echeancierClient.dateEcheance = this.unFormatDate(this.factureAModifier.dateEcheance);
        this.echeancierClient.montantFacture = this.factureAModifier.montantFacture;
        this.echeancierClient.montantPaye = this.factureAModifier.montantPaye;
        this.echeancierClient.resteAPayer = this.factureAModifier.resteAPayer;
        this.echeancierClient.dateReglementFacture = this.unFormatDate(this.factureAModifier.dateReglementFacture);*/
      }
    });
  },
};
</script>
