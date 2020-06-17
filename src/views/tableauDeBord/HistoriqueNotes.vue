<template>
  <div>
    <b-modal
      id="historiqueNotes"
      ref="modal"
      title="Historique des notes"
      size="lg"
      header-bg-variant="light"
      @hidden="resetModal"
    >
      <b-table striped hover :items="rows" bordered></b-table>
    </b-modal>
  </div>
</template>

<script>
import http from "../../client/http-common";
export default {
  data() {
    return {
      rows: [],
    };
  },
  methods: {
    getLast6Notes(client) {
      let self = this;
      http
        .get("/lastNotesClient", {
          params: {
            nomClient: client,
            date: self.$store.state.suiviClient.dateSuiviClient,
          },
        })
        .then((response) => {
          self.rows.push(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    resetModal() {
      this.rows.splice(0, this.rows.length);
    },
  },
  mounted() {
    /* Evenement lors de l'ouverture du modal ayant l'id 'historiqueNotes' */
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === "historiqueNotes") {
        this.getLast6Notes(this.$store.state.suiviClient.clientHistorique);
      }
    });
  },
};
</script>
