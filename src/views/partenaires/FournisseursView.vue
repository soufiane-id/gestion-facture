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
      <button
        @click="fournisseurToEdit.isEdit = false"
        type="button"
        class="btn btn-info add-new"
        v-b-modal="'formulaireAjoutFournisseur'"
      >
        <i class="fa fa-plus"></i> Add New
      </button>
    </div>

    <Formulaire :fournisseurToEdit="fournisseurToEdit" @refresh="refreshTable" />

    <b-table
      id="my-table"
      :items="filtredFournisseurs"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
      <template v-slot:cell(action)="filtredFournisseurs">
        <b-col cols="6" sm="4" md="2" xl class="mb-3 mb-xl-0">
          <a
            @click="modifierFournisseur(filtredFournisseurs.item)"
            class="edit"
            title="Modifier"
            data-toggle="tooltip"
            style="cursor: pointer"
            v-b-modal="'formulaireAjoutFournisseur'"
          >
            <i class="material-icons update-icon">&#xE254;</i>
          </a>
          <a
            class="delete"
            title="Supprimer"
            data-toggle="tooltip"
            style="cursor: pointer"
            @click="supprimerFournisseur(filtredFournisseurs.item.idPersonne)"
          >
            <i class="material-icons delete-icon">&#xE872;</i>
          </a>
        </b-col>
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
import Formulaire from "./AddFournisseurFormulaire";
import toast from "../../commons/toast/toast";

export default {
  components: { Formulaire },
  data() {
    return {
      fournisseurs: [],
      filterSearch: "",
      fournisseurToEdit: {
        fournisseur: "",
        isEdit: true,
      },
      perPage: 10,
      currentPage: 1,
      fieldsToShow: [
        {
          key: "nomPersonne",
          sortable: true,
          class: "text-center",
        },
        {
          key: "action",
        },
      ],
    };
  },
  methods: {
    recupererFournisseurs() {
      http
        .get("/listFournisseur")
        .then((response) => {
          this.fournisseurs = response.data; // JSON are parsed automatically.
        })
        .catch((e) => {
          console.log(e);
        });
    },
    refreshTable(fournisseur) {
      // refresh
      this.fournisseurs = [...this.fournisseurs, fournisseur];
      //this.currentPage = Math.ceil(this.rows/this.perPage);
    },
    modifierFournisseur(fournisseur) {
      this.fournisseurToEdit.isEdit = true;
      this.fournisseurToEdit.fournisseur = fournisseur;
    },
    supprimerFournisseur(idFournisseur) {
      let self = this;
      toast.confirm(
        "Etes vous sûr de vouloir supprimer ce fournisseur ?",
        function () {
          http
            .delete("/deletePersonne/" + idFournisseur)
            .then((response) => {
              self.fournisseurs = self.filtredFournisseurs.filter(function (
                cl
              ) {
                return cl.idPersonne != idFournisseur;
              });
            })
            .catch((e) => {
              console.log(e);
            });
        }
      );
    },
  },
  computed: {
    rows() {
      return this.fournisseurs.length;
    },
    filtredFournisseurs: function () {
      this.currentPage = 1;
      return this.fournisseurs.filter((fournisseur) => {
        return fournisseur.nomPersonne
          .toLowerCase()
          .match(this.filterSearch.toLowerCase());
      });
    },
  },
  created() {
    this.recupererFournisseurs();
  },
};
</script>

<style>
.material-icons {
  color: #e34724;
}
.update-icon {
  color: #ffc107;
}
.delete-icon {
  color: #e34724;
}
</style>
