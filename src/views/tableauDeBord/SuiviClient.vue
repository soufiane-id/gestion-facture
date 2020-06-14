<template>
  <div>
    <!-- <b-card-group deck>
      <b-card no-body class="bg-danger">
        <b-card-body class="pb-0">
          <h1 class="mb-0 text-center">
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
          <h1 class="mb-0 text-center">
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
          <h1 class="mb-0 text-center">
            {{ clientsAlerteComm.length }}
          </h1>
          <p class="text-center">Client(s) avec alerte commercial</p>
        </b-card-body>
      </b-card>

      <b-card no-body class="bg-danger">
        <b-card-body class="pb-0">
          <h1 class="mb-0 text-center">
            {{ clientsUrgenceComm.length }}
          </h1>
          <p class="text-center">Client(s) avec urgence commercial</p>
        </b-card-body>
      </b-card>
    </b-card-group> -->

    <div>
      <date-picker
        :lang="lang"
        v-model="date"
        type="week"
        @change="onWeekChange"
        placeholder="Choisir une semaine.."
        :disabled-date="notAfterToday"
      ></date-picker>
    </div>
    <div>
      <b-button
        :variant="variantBtnSync"
        :disabled="disableBtnSync"
        @click="synchronize"
        style="float:right"
        ><i class="fa fa-refresh"></i> Synchroniser</b-button
      >
      <button
        type="button"
        class="btn btn-light add-new"
        @click="download"
        style="float:right"
      >
        <i class="fa fa-download"></i> Télécharger
      </button>
    </div>

    <div>
      <TableSuivi :dateSuiviClient="date" />
      <div class="vld-parent">
        <Loading
          :active.sync="isLoading"
          color="#2DD1EE"
          loader="bars"
        ></Loading>
      </div>
    </div>
  </div>
</template>

<script>
import http from "../../client/http-common";
import { utilsMixin } from "../../commons/utils/utilsMixin";
import XLSX from "xlsx";
import DatePicker from "vue2-datepicker";
//import TableSuivi from "./TableSuivi";
import "vue2-datepicker/index.css";
import moment from "moment";
import toast from "../../commons/toast/toast";
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  components: {
    DatePicker,
    Loading,
    TableSuivi: () => ({
      // the component we want to lazy load
      component: import("./TableSuivi"),
      // the component to show if our ChildComponent is taking some time to load
      //loading: LoadingState,
      // the component to show if ChildComponent fails to load
      //error: ErrorState,
      // the time to wait before showing LoadingState
      //delay: 1000,
      // the time to wait before we give up and show ErrorState
      //timeout: 5000,
    }),
  },
  data() {
    return {
      //date: "",
      variantBtnSync: "",
      disableBtnSync: "",
      momentFormat: {
        // Date to String
        stringify: (date) => {
          return date ? moment(date).format("LL") : "";
        },
      },
      lang: {
        formatLocale: {
          firstDayOfWeek: 1,
        },
      },
      isBusy: false,
      isLoading: false,
    };
  },
  methods: {
    ...mapMutations(["setHistoriqueClient"]),
    recupererDonneesClients(date) {
      this.isBusy = true;
      http
        .get("/getHistoriqueClient", {
          params: {
            date: date,
          },
        })
        .then((response) => {
          this.setHistoriqueClient(response.data); // JSON are parsed automatically.
          this.isBusy = false;
          this.synchronizeStyle(
            this.historiqueClient.length > 0
              ? this.historiqueClient[0].isSynchronized
              : null,
            date
          );
        })
        .catch((e) => {
          console.log(e);
        });
    },
    download() {
      console.log("this.filtredEcheanciers", this.historiqueClient);
      const data = XLSX.utils.json_to_sheet(this.historiqueClient);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, data, "data");
      XLSX.writeFile(wb, "suiviClient.xlsx");
    },
    synchronize() {
      if (!this.date) {
        toast.error("Veuillez choisir une semaine ..");
        return;
      }
      this.isLoading = true;
      let self = this;
      http
        .post("/synchronize", this.date)
        .then((response) => {
          self.recupererDonneesClients(this.date);
          self.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    synchronizeStyle(isSynchronized, date) {
      //1ere entrée OU cas où il n y a pas d historique pour la semaine en cours
      if (
        date == null ||
        (isSynchronized == null && this.isDateWithinCurrentweek(date))
      ) {
        this.disableBtnSync = false;
        this.variantBtnSync = "success";
      }
      // Cas où il n y a pas d'historique pour les semaines passées
      else if (isSynchronized == null && !this.isDateWithinCurrentweek(date)) {
        this.disableBtnSync = true;
        this.variantBtnSync = "success";
      }
      // Cas historique Synchronise
      else if (isSynchronized) {
        this.variantBtnSync = "success";
        // Semaine actuelle
        if (this.isDateWithinCurrentweek(date)) {
          this.disableBtnSync = false;
        } else {
          //Semaines passées
          this.disableBtnSync = true;
        }
      } else {
        alert("cas non prevu ...");
        this.variantBtnSync = "danger";
        this.disableBtnSync = false;
      }
    },
    onWeekChange(date) {
      this.recupererDonneesClients(date);
    },
    notAfterToday(date) {
      return date > new Date();
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
      "getDateSuiviClient",
    ]),
    date: {
      get() {
        return this.getDateSuiviClient;
      },
      set(value) {
        this.$store.commit("setDateSuiviClient", value);
        this.date; // On réappelle la méthode get() pour valoriser lu numéro de la semaine dans le champ datepicker
      },
    },
  },
  created() {
    this.recupererDonneesClients();
  },
  mixins: [utilsMixin],
};
</script>
