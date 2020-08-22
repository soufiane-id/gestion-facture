<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">Numéro facture :</span>
      </div>
      <!-- <input type="text" class="form-control" aria-label="Small" v-model="numFacture"> -->
      <b-form-tags
        input-id="tags-basic"
        separator=" ,;"
        placeholder="Ajouter un numéro"
        v-model="numFacture"
        class="form-control"
      ></b-form-tags>
      <div class="input-group-append">
        <span class="input-group-btn">
          <button class="btn btn-search" type="button" @click="trouverFactures()">
            <i class="fa fa-search fa-fw"></i> Chercher
          </button>
        </span>
      </div>
    </div>
    <div v-if="facture.length > 0">
      <b-table
        id="facture-table"
        :items="facture"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        small
      ></b-table>
      <!-- On ne peut valider que si le montant de loperation est egal au montant payé sur la facture -->
      <b-button
        class="mt-3"
        variant="success"
        :disabled="operation.montantDebit * (-1) != facture.map(element => element.montantPaye).reduce((a, b) => a+b, 0.0).toFixed(2)"
        block
        @click="valider"
      >Valider</b-button>
    </div>
  </div>
</template>

<script>
import http from "../../../client/http-common";
import toast from "../../../commons/toast/toast";
import { refreshOperationsEventBus } from "../../../main";

export default {
  data() {
    return {
      numFacture: [],
      facture: [],
      perPage: 10,
      currentPage: 1,
      fields: [
        {
          key: "dateFacture",
          sortable: true,
          class: "text-center",
        },
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: "text-center",
        },
        {
          key: "personne.nomPersonne",
          label: "Nom Client",
          sortable: true,
          class: "text-center",
        },
        {
          key: "numeroDocument",
          sortable: true,
          class: "text-center",
        },
        {
          key: "montantPaye",
          sortable: true,
          class: "text-center",
        },
        {
          key: "resteAPayer",
          sortable: true,
          class: "text-center",
        },
        {
          key: "montantFacture",
          sortable: true,
          class: "text-center",
        },
      ],
    };
  },
  methods: {
    trouverFactures() {
      console.log("this.facture", this.facture);
      this.facture.splice(0, this.facture.length); // On vide le résultat
      http
        .get("/getEcheanciersByDocument/" + this.numFacture)
        .then((response) => {
          response.data.forEach((echeance) => this.facture.push(echeance));
        })
        .catch((e) => {
          console.log(e);
        });
    },
    valider() {
      let self = this;
      http
        .post("/reglerImpaye/" + this.operation.codeOperation, this.facture)
        .then((response) => {
          self.$bvModal.hide("reglementSansFacture"); // Ferme le modal parent
          refreshOperationsEventBus.$emit("refreshOperationsATraiter");
          toast.success("Impayé réglé avec succès !");
        })
        .catch((e) => {
          toast.error("Erreur lors du Reglement !");
          console.log(e);
        });
    },
  },
  props: ["operation"],
};
</script>


<style scoped>
html {
  margin: 40px auto;
}
.btn-search {
  background: #0c5453;
  border-radius: 6px;
  color: #fff;
  border-width: 1px;
  border-style: solid;
  border-color: #1c1c1c;
}
.btn-search:link,
.btn-search:visited {
  color: #fff;
}
.btn-search:active,
.btn-search:hover {
  background: #1c1c1c;
  color: #fff;
}
</style>