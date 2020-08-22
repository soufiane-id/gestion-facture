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
      <button type="button" class="btn btn-info add-new" v-b-modal="'addUserForm'">
        <i class="fa fa-plus"></i> Ajouter Utilisateur
      </button>
    </div>

    <UtilisateursDetails v-if="loadDetails" :user="user" />
    <AddUserForm />

    <b-table
      id="my-table"
      :items="filtredUtilisateurs"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
      <template v-slot:cell(NomComplet)="filtredUtilisateurs">
        <a
          href="javascript:;"
          @click="ouvrirDetail(filtredUtilisateurs.item)"
          v-b-modal="'detailUtilisateurs'"
        >{{ filtredUtilisateurs.item.nom.toUpperCase() }}, {{ filtredUtilisateurs.item.prenom }}</a>
      </template>
    </b-table>

    <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="my-table"
      align="center"
    ></b-pagination>
  </div>
</template>

<script>
import http from "../../client/http-common";
import UtilisateursDetails from "./UtilisateursDetails";
import AddUserForm from "./forms/AddUserForm";
import toast from "../../commons/toast/toast";

export default {
  components: { UtilisateursDetails, AddUserForm },
  data() {
    return {
      filterSearch: "",
      user: {},
      perPage: 10,
      currentPage: 1,
      fieldsToShow: [
        {
          key: "NomComplet",
          sortable: true,
          class: "text-center",
        },
        {
          key: "username",
          label: "Login",
          sortable: true,
          class: "text-center",
        },
        {
          key: "action",
        },
      ],
      loadDetails: false,
    };
  },
  methods: {
    recupererUtilisateurs() {
      http
        .get("/listUsers")
        .then((response) => {
          this.$store.commit("setUsers", response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    ouvrirDetail(user) {
      this.user = user;
      this.loadDetails = true;
    },
  },
  computed: {
    rows() {
      return this.$store.state.gestionUtilisateurs.utilisateurs.length;
    },
    filtredUtilisateurs: function () {
      this.currentPage = 1;
      return this.$store.state.gestionUtilisateurs.utilisateurs.filter(
        (utilisateur) => {
          return utilisateur.nom
            .toLowerCase()
            .match(this.filterSearch.toLowerCase());
        }
      );
    },
  },
  created() {
    this.recupererUtilisateurs();
  },
};
</script>