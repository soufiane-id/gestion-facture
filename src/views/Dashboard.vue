<template>
  <div>
    <div class="card">
      <div class="card-header" style="background-color:white">
        <h3>Rapport Financier :</h3>
      </div>
      <div class="card-body">
        <b-card-group deck>
          <b-card no-body class="bg-danger">
            <b-card-body class="pb-0">
              <h1
                class="mb-0 text-center"
                v-b-tooltip.hover.html.bottom.v-dark="nomsClientsDangereux"
              >
                {{ calculClientDangereux.length }}
              </h1>
              <p class="text-center">Client(s) Dangereux</p>
            </b-card-body>
            <div class="progress-group">
              <div class="progress-group-header">
                <span class="ml-auto font-weight-bold"
                  >{{ pourcentageClientsDangereux }} %
                </span>
              </div>
              <div class="progress-group-bars">
                <b-progress
                  class="progress-xs"
                  :value="pourcentageClientsDangereux"
                  variant="dark"
                ></b-progress>
              </div>
            </div>
          </b-card>

          <b-card no-body class="bg-info">
            <b-card-body class="pb-0">
              <h1
                class="mb-0 text-center"
                v-b-tooltip.hover.html.bottom.v-dark="nomsClientsAbsents"
              >
                {{ clientsAbsentsSemaineEnCours.length }} sur
                {{ historiqueClientActifs.length }}
              </h1>
              <p class="text-center">Client(s) Absents cette semaine</p>
            </b-card-body>
            <div class="progress-group">
              <div class="progress-group-header">
                <span class="ml-auto font-weight-bold"
                  >{{ pourcentageClientsAbsents }} %
                </span>
              </div>
              <div class="progress-group-bars">
                <b-progress
                  class="progress-xs"
                  :value="pourcentageClientsAbsents"
                  variant="dark"
                ></b-progress>
              </div>
            </div>
          </b-card>

          <b-card no-body class="bg-warning">
            <b-card-body class="pb-0">
              <h1
                class="mb-0 text-center"
                v-b-tooltip.hover.html.bottom.v-dark="nomsClientsAlerte"
                variant="success"
              >
                {{ clientsAlerteComm.length }}
              </h1>
              <p class="text-center">Client(s) avec alerte commercial</p>
            </b-card-body>
          </b-card>

          <b-card no-body class="bg-danger">
            <b-card-body class="pb-0">
              <h1
                class="mb-0 text-center"
                v-b-tooltip.hover.html.bottom.v-dark="nomsClientsUrgence"
              >
                {{ clientsUrgenceComm.length }}
              </h1>
              <p class="text-center">Client(s) avec urgence commercial</p>
            </b-card-body>
          </b-card>
        </b-card-group>
      </div>
      <div class="card-footer text-center" style="background-color:white">
        <a href="#/tdb/suiviClient" class="btn btn-primary">Voir détails</a>
      </div>
    </div>
  </div>
</template>

<script>
import http from "../client/http-common";
import { utilsMixin } from "../commons/utils/utilsMixin";
import toast from "../commons/toast/toast";
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
  data() {
    return {
      nomsClientsDangereux: "",
      nomsClientsAbsents: "",
      nomsClientsAlerte: "",
      nomsClientsUrgence: "",
    };
  },
  methods: {
    ...mapMutations(["setHistoriqueClient"]),
    recupererDonneesClients(date) {
      http
        .get("/getHistoriqueClient", {
          params: {
            date: date,
          },
        })
        .then((response) => {
          this.setHistoriqueClient(response.data);
          this.historiqueClientActifs; // On valorise les clients actifs d'abord pour recuperer les Clients Absents.
          this.remplirTooltip();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    remplirTooltip() {
      /** Clients Dangereux*/
      let dangereux = [];
      this.calculClientDangereux.forEach((element) => {
        dangereux.push(element.nomClient + "<br />");
      });
      this.nomsClientsDangereux = dangereux.join("");

      /** Clients Absents*/
      let absents = [];
      this.clientsAbsentsSemaineEnCours.forEach((element) => {
        absents.push(element.nomClient + "<br />");
      });
      this.nomsClientsAbsents = absents.join("");

      /** Alertes */
      let alertes = [];
      this.clientsAlerteComm.forEach((element) => {
        alertes.push(element.nomClient + "<br />");
      });
      this.nomsClientsAlerte = alertes.join("");

      /** Urgences */
      let urgences = [];
      this.clientsUrgenceComm.forEach((element) => {
        urgences.push(element.nomClient + "<br />");
      });
      this.nomsClientsUrgence = urgences.join("");
    },
  },
  computed: {
    ...mapGetters([
      "historiqueClient",
      "historiqueClientActifs",
      "calculClientDangereux",
      "clientsAlerteComm",
      "clientsUrgenceComm",
      "clientsAbsentsSemaineEnCours",
      "pourcentageClientsAbsents",
      "pourcentageClientsDangereux",
    ]),
  },
  created() {
    this.recupererDonneesClients();
  },
};
</script>
