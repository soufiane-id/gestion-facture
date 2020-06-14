<template>
  <div>
    <b-modal
      id="reglementSansFacture"
      ref="modal"
      title="Réglement"
      size="lg"
      header-bg-variant="light"
      hide-footer
      @hidden="resetModal"
    >
      <div>
        <b-form-radio-group
          v-model="selected"
          :options="options"
          class="mb-3"
          disabled-field="notEnabled"
        ></b-form-radio-group>
      </div>

      <ReglementSansFactureSubModal
        v-if="selected == 1"
        :operation="operation"
      />

      <ReglementChargeFixeSubModal
        v-if="selected == 2"
        :operation="operation"
      />

      <ReglementImpayeSubModal v-if="selected == 3" :operation="operation" />
    </b-modal>
  </div>
</template>

<script>
import http from "../../../client/http-common";
import ReglementSansFactureSubModal from "./ReglementSansFactureSubModal";
import ReglementChargeFixeSubModal from "./ReglementChargeFixeSubModal";
import ReglementImpayeSubModal from "./ReglementImpayeSubModal";

export default {
  data() {
    return {
      selected: "",
      options: [
        { text: "Sans facture(en attente ou virement par erreur )", value: 1 },
        { text: "Charges fixes", value: 2 },
        { text: "Impayé", value: 3 },
      ],
    };
  },
  methods: {
    resetModal() {
      this.selected = "";
      this.autoCompleteModel = "";
    },
  },
  computed: {},
  props: ["operation"],
  components: {
    ReglementSansFactureSubModal,
    ReglementChargeFixeSubModal,
    ReglementImpayeSubModal,
  },
  created() {},
};
</script>

<style scoped>
.transfert-arrow {
  width: 0%;
  margin: 30px auto;
}
</style>
