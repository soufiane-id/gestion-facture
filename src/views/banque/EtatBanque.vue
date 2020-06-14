<template>
  <div>
    <b-table striped hover :items="banques" :fields="fields">
      <template v-slot:cell(solde)="data">
        <b-card :no-body="true">
          <b-card-body class="p-3 clearfix">
            <i class="fa fa-euro bg-info p-3 font-2xl mr-3 float-left"></i>
            <div class="h5 text-info text-center mb-0 mt-2">
              {{ (data.item.soldeCredit - data.item.soldeDebit).toFixed(2) }}
            </div>
            <div
              class="text-muted text-uppercase text-center font-weight-bold font-xs"
            >
              Revenus
            </div>
          </b-card-body>
        </b-card>
      </template>

      <template v-slot:cell(montantStock)="data">
        <b-card v-if="data.item.idBanque == 1" :no-body="true">
          <b-card-body class="p-3 clearfix">
            <i class="fa fa-euro bg-danger p-3 font-2xl mr-3 float-left"></i>
            <!-- <div class="h5 text-danger text-center mb-0 mt-2">{{data.item.montantStock}}</div> -->
            <InlineEdit
              class="h5 text-info text-center mb-0 mt-2"
              :value="data.item.montantStock"
              @update="updateStock"
            >
            </InlineEdit>
            <div
              class="text-muted text-uppercase text-center font-weight-bold font-xs"
            >
              Stock
            </div>
          </b-card-body>
        </b-card>
      </template>
    </b-table>

    <b-container class="bv-example-row">
      <!-- Creances et Dettes -->
      <b-row class="text-center">
        <b-col>Créances et Dettes</b-col>

        <b-col cols="4">
          <b-card class="text-white bg-info">
            <div class="h4 m-0">€ {{ creancesClient }}</div>
            <small class="text-muted">Montant total des créances client.</small>
          </b-card>
        </b-col>

        <b-col cols="4">
          <b-card class="text-white bg-danger">
            <div class="h4 m-0">€ {{ dettesFrs }}</div>
            <small class="text-muted"
              >Montant total des dettes envers les fournisseurs.</small
            >
          </b-card>
        </b-col>
      </b-row>
      <!-- Résultat Final -->
      <b-row class="text-center">
        <b-col>Résultat Final</b-col>

        <b-col cols="8">
          <b-card class="text-white bg-success">
            <div class="h4 m-0">
              <h1>€ {{ resultatNet }}</h1>
            </div>
            <small class="text-muted">Résultat net.</small>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import http from "../../client/http-common";
import InlineEdit from "./InlineEdit";
import toast from "../../commons/toast/toast";

export default {
  components: { InlineEdit },
  data() {
    return {
      banques: [],
      creancesClient: 0,
      dettesFrs: 0,
      fields: [
        {
          key: "nomBanque",
        },
        {
          key: "solde",
        },
        {
          key: "montantStock",
        },
      ],
    };
  },
  methods: {
    recupererDonneesBanques() {
      http
        .get("/listBanque")
        .then((response) => {
          this.banques = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    recupererCreanceClient() {
      http
        .get("/creancesClient")
        .then((response) => {
          this.creancesClient = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    recupererDettesFournisseurs() {
      http
        .get("/dettesFournisseurs")
        .then((response) => {
          this.dettesFrs = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateStock(newValue) {
      http
        .post("/updateStock", newValue)
        .then((response) => {
          this.recupererDonneesBanques();
          toast.success("Stock mis à jour");
        })
        .catch((e) => {
          console.log(e);
          toast.error(
            "Une erreur est survenue lors de la mise à jour du stock"
          );
        });
    },
  },
  computed: {
    resultatNet() {
      return (
        this.banques.map((b) => b.soldeCredit).reduce((a, c) => a + c, 0) +
        this.creancesClient -
        this.banques.map((b) => b.soldeDebit).reduce((a, c) => a + c, 0) -
        this.banques.map((b) => b.montantStock).reduce((a, c) => a + c, 0) -
        this.dettesFrs
      ).toFixed(2);
    },
  },
  created() {
    this.recupererDonneesBanques();
    this.recupererCreanceClient();
    this.recupererDettesFournisseurs();
  },
};
</script>
