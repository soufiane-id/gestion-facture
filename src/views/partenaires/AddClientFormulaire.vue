<template>
  <div>
    <b-modal id="formulaireAjoutClient" ref="modal" hide-footer>
      <b-form @submit="onSubmit" @reset="onReset" v-if="show">
        <!-- Nom Client -->
        <b-form-group id="input-group-1" label="Nom Client:" label-for="input-1">
          <b-form-input
            v-if="clientToEdit.isEdit"
            id="input-1"
            v-model="clientToEdit.client.nomPersonne"
            type="text"
            size="sm"
            required
          ></b-form-input>
          <b-form-input
            v-if="!clientToEdit.isEdit"
            id="input-1"
            v-model="client.nomPersonne"
            type="text"
            size="sm"
            required
            placeholder="Entrer un client .."
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
      client: {
        nomPersonne: "",
      },
      show: true,
    };
  },
  props: ["clientToEdit"],
  methods: {
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
    ajouterClient() {
      let self = this;
      http
        .post(
          "clients",
          self.clientToEdit.isEdit ? self.clientToEdit.client : self.client
        )
        .then(function (response) {
          if (!self.clientToEdit.isEdit) {
            self.$emit("refresh", response.data);
          }
          toast.success("Client inséré avec succès !");
        })
        .catch(function (error) {})
        .finally(function () {
          self.client.nomPersonne = "";
        });
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.ajouterClient();
      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our client values
      this.client.nomPersonne = "";
      // Trick to reset/clear native browser echeancierClient validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
  },
};
</script>