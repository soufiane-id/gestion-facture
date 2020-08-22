<template>
  <div>
    <b-row>
      <b-col sm="3">
        <b-form-group>
          <b-form-input type="text" id="name" v-model="filterSearch" placeholder="Filtrer ..."></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>

    <div class="card-tools">
      <button type="button" class="btn btn-info add-new" v-b-modal="'addRoleForm'">
        <i class="fa fa-plus"></i> Ajouter Role
      </button>
    </div>

    <RolesDetails v-if="loadDetails" :role="role" />
    <AddRoleForm />

    <b-table
      id="role-table"
      :items="filtredRoles"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
      <template v-slot:cell(nomRole)="filtredRoles">
        <a
          href="javascript:;"
          @click="ouvrirDetail(filtredRoles.item)"
          v-b-modal="'detailRoles'"
        >{{ filtredRoles.item.nomRole}}</a>
      </template>
    </b-table>
  </div>
</template>

<script>
import http from "../../client/http-common";
import RolesDetails from "./RolesDetails";
import AddRoleForm from "./forms/AddRoleForm";
import toast from "../../commons/toast/toast";

export default {
  components: { RolesDetails, AddRoleForm },
  data() {
    return {
      filterSearch: "",
      perPage: 10,
      currentPage: 1,
      fieldsToShow: [
        {
          key: "nomRole",
          sortable: true,
          class: "text-center",
        },
      ],
      loadDetails: false,
    };
  },
  methods: {
    recupererRoles() {
      if (this.$store.state.gestionUtilisateurs.roles.length < 1) {
        http
          .get("/listRoles")
          .then((response) => {
            this.$store.commit("setRoles", response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    ouvrirDetail(role) {
      this.role = role;
      this.loadDetails = true;
    },
  },
  computed: {
    rows() {
      return this.$store.state.gestionUtilisateurs.roles.length;
    },
    filtredRoles: function () {
      this.currentPage = 1;
      return this.$store.state.gestionUtilisateurs.roles.filter((role) => {
        return role.nomRole
          .toLowerCase()
          .match(this.filterSearch.toLowerCase());
      });
    },
  },
  created() {
    this.recupererRoles();
  },
};
</script>

<style>
</style>