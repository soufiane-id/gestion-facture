<template>
  <div>
    <b-modal
      id="detailRoles"
      ref="modal"
      title="Détails Roles"
      size="xl"
      header-bg-variant="light"
      @ok="save"
    >
      <MultiSelect
        v-model="ecrans"
        :options="options"
        :show-select-all-buttons="showSelectAll"
        search-input-class="custom-input-class"
        search-options-placeholder="Search ecran"
        selected-options-placeholder="Search ecran selectionne"
        no-options-text="Pas d'ecran"
        selected-no-options-text="Aucun ecran sélectionné"
      />
    </b-modal>
  </div>
</template>

<script>
import MultiSelect from "../../commons/multiselect/MultiSelect";
import http from "../../client/http-common";
import { EcransEnum } from "../../_helpers/ecranEnum";

export default {
  props: ["role"],
  components: {
    MultiSelect,
  },
  data() {
    return {
      ecrans: [],
      options: Object.values(EcransEnum),
      showSelectAll: true,
    };
  },
  methods: {
    valoriserEcransAutorises() {
      http
        .get("/ecransByRole", {
          params: {
            roleId: this.role.id,
          },
        })
        .then((response) => {
          this.ecrans = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    save() {
      http
        .post("addEcransToRole/" + this.role.id, this.ecrans)
        .then((response) => {})
        .catch((e) => {
          console.log(e);
        });
    },
  },
  created() {
    /* Evenement lors de l'ouverture du modal ayant l'id 'detailRoles' */
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === "detailRoles") {
        this.valoriserEcransAutorises();
      }
    });
  },
};
</script>
