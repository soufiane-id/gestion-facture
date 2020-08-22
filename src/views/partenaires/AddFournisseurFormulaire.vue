<template>
  <div>
    <b-modal id="formulaireAjoutFournisseur" ref="modal" hide-footer>
      <b-form @submit="onSubmit" @reset="onReset" v-if="show">
        <!-- Nom Fournisseur -->
        <b-form-group id="input-group-1" label="Nom Fournisseur:" label-for="input-1">
          <b-form-input
            v-if="fournisseurToEdit.isEdit"
            id="input-1"
            v-model="fournisseurToEdit.fournisseur.nomPersonne"
            type="text"
            size="sm"
            required
          ></b-form-input>
          <b-form-input
            v-if="!fournisseurToEdit.isEdit"
            id="input-1"
            v-model="fournisseur.nomPersonne"
            type="text"
            size="sm"
            required
            placeholder="Entrer un fournisseur .."
          ></b-form-input>
        </b-form-group>

        <div class="center-div">
          <b-button type="submit" variant="primary">Submit</b-button>
          <b-button type="reset" variant="danger">Reset</b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import http from "../../client/http-common";
import toast from "../../commons/toast/toast";
import moment from "moment";
import "moment/locale/fr";
moment.locale("fr");

export default {
  data() {
    return {
      format: "dd/MM/yy",
      fournisseur: {
        nomPersonne: "",
      },
      show: true,
    };
  },
  props: ["fournisseurToEdit"],
  methods: {
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    ajouterFournisseur() {
      let self = this;
      http
        .post(
          "fournisseurs",
          self.fournisseurToEdit.isEdit
            ? self.fournisseurToEdit.fournisseur
            : self.fournisseur
        )
        .then(function (response) {
          if (!self.fournisseurToEdit.isEdit) {
            self.$emit("refresh", response.data);
          }
          toast.success("Fournisseur inséré avec succès !");
        })
        .catch(function (error) {})
        .finally(function () {
          self.fournisseur.nomPersonne = "";
        });
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.ajouterFournisseur();
      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our fournisseur values
      this.fournisseur.nomPersonne = "";
      // Trick to reset/clear native browser echeancierFournisseur validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
  },
};
</script>