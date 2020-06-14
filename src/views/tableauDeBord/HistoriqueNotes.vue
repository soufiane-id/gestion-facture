<template>
  <div>
    <b-modal
      id="historiqueNotes"
      ref="modal"
      title="Historique des notes"
      size="lg"
      header-bg-variant="light"
    >
      <b-table striped hover :items="rows" :fields="header"></b-table>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: ["historique"],
  data() {
    return {
      header: [],
      rows: [],
    };
  },
  methods: {
    formatData() {
      console.log("this.historiqueeee", this.historique);
      this.header = Object.keys(this.historique);
      this.rows = Object.values(this.historique);
    },
  },
  created() {
    //alert("creation popup historique note");
    this.formatData();
  },
};
</script>

<style></style>
