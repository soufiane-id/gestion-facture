<template>
  <div>
    <ReglementVirementModule
      v-if="this.$store.state.operationARegler.statutOperation != 'VALIDE'"
      :operation="this.$store.state.operationARegler"
    />
    <ReglementChequeModule
      v-if="this.$store.state.operationARegler.statutOperation != 'VALIDE'"
      :operation="this.$store.state.operationARegler"
    />
    <ReglementSansFacture
      v-if="transfertArgentARegler.statutOperation != 'VALIDE'"
      :operation="operationSF"
    />
    <ReglementTransfertArgent
      v-if="transfertArgentARegler.statutOperation != 'VALIDE'"
      :operation="transfertArgentARegler"
    />

    <div class="card-tools" style="margin-bottom:20px;">
      <b-form-select
        v-model="selectedOptionAffichage"
        :options="optionsAffichage"
        size="sm"
        class="mt-3"
        style="width:180px;"
      ></b-form-select>
    </div>

    <b-form class="container" inline style="margin-bottom:20px;">
      <b-form-input type="text" v-model="filterOperations" placeholder="Filtre opération..."></b-form-input>
      <label class="mr-sm-2" for="inlineInput1" style="margin-left:80px;">Facture du:</label>
      <b-input id="input-2" type="date" v-model="startDate" required size="sm" placeholder="Du .."></b-input>
      <label class="mx-sm-2" for="inlineInput2">Au:</label>
      <b-input id="input-63" type="date" v-model="endDate" required size="sm" placeholder="Au .."></b-input>
      <b-button-group size="sm" class="mx-1" style="height: 28px" @click="clearDatesFilter">
        <b-btn>Cancel</b-btn>
      </b-button-group>
    </b-form>

    <ReglementTabs v-if="showTabs" />

    <b-table
      v-if="!showTabs"
      id="my-table"
      :items="filtredOperations"
      :fields="fields"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
      <template v-slot:cell(statutOperation)="operationsBancaire">
        <b-badge :variant="getBadge(operationsBancaire.item.statutOperation)">
          {{
          operationsBancaire.item.statutOperation
          }}
        </b-badge>
      </template>

      <template v-slot:cell(action)="operationBancaire">
        <b-col
          v-if="operationBancaire.item.statutOperation == 'A_TRAITER'"
          cols="6"
          sm="4"
          md="2"
          xl
          class="mb-3 mb-xl-0"
        >
          <font-awesome-icon
            icon="exchange-alt"
            v-b-modal="'reglementOperation'"
            @click="reglerOperation(operationBancaire.item)"
            v-b-tooltip.hover
            title="Virement"
            size="lg"
            :style="{ color: '5c9ea9' }"
          />

          <font-awesome-icon
            icon="money-check-alt"
            v-b-modal="'reglementCheque'"
            @click="reglerOperation(operationBancaire.item)"
            v-b-tooltip.hover
            title="Chèque / Espèce"
            size="lg"
            :style="{ color: 'b1b135' }"
          />

          <font-awesome-icon
            icon="minus-square"
            v-b-modal="'reglementSansFacture'"
            @click="reglerSansFacture(operationBancaire.item)"
            v-b-tooltip.hover
            title="Reglement Sans Facture"
            size="lg"
            :style="{ color: 'red' }"
          />

          <font-awesome-icon
            icon="arrows-alt-v"
            v-b-modal="'reglementTransfertArgent'"
            @click="reglerTransfertArgent(operationBancaire.item)"
            v-b-tooltip.hover
            title="Transfert Argent"
            size="lg"
            :style="{ color: 'green' }"
          />

          <font-awesome-icon
            @click="supprimerOperation(operationBancaire.item.codeOperation)"
            icon="times"
            v-b-tooltip.hover
            title="Supprimer l'opération"
            size="lg"
            :style="{ color: 'red' }"
          />
        </b-col>
      </template>

      <template v-slot:custom-foot>
        <tr>
          <td class="bg-gray text-white" :colspan="3"></td>
          <td class="bg-success text-white text-center">{{ montantFactureDebitTotal }}</td>
          <td class="bg-success text-white text-center">{{ montantFactureCreditTotal }}</td>
          <td class="bg-gray text-white" :colspan="2"></td>
        </tr>
      </template>
    </b-table>
    <b-pagination
      v-if="!showTabs"
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
import ReglementVirementModule from "./ReglementVirementModal";
import ReglementChequeModule from "./ReglementChequeModal";
import ReglementSansFacture from "./reglement/ReglementSansFactureModal";
import ReglementTransfertArgent from "./reglement/ReglementTransfertArgentModal";
import DetailReglementModule from "./reglement/DetailReglementModal";
import ReglementTabs from "./reglement/ReglementTabs";
import { refreshOperationsEventBus } from "../../main";
import toast from "../../commons/toast/toast";

export default {
  components: {
    ReglementVirementModule,
    ReglementChequeModule,
    DetailReglementModule,
    ReglementTabs,
    ReglementTransfertArgent,
    ReglementSansFacture,
  },
  data() {
    return {
      operationsBancaire: [],
      operationARegler: this.$store.state.operationARegler,
      operationSF: "",
      transfertArgentARegler: "",
      showTabs: false,
      montantFactureDebitTotal: 0,
      montantFactureCreditTotal: 0,
      perPage: 10,
      currentPage: 1,
      fields: [
        {
          key: "codeOperation",
          sortable: true,
          class: "text-center width-10",
        },
        {
          key: "dateOperation",
          sortable: true,
          class: "text-center width-10",
        },
        {
          key: "nomOperation",
          class: "text-center long-text width-40",
        },
        {
          key: "montantDebit",
          class: "text-center width-10",
        },
        {
          key: "montantCredit",
          class: "text-center width-10",
        },
        {
          key: "statutOperation",
          class: "text-center width-10",
        },
        {
          key: "action",
          class: "text-center width-10",
        },
      ],
      selectedOptionAffichage: "1", // Par défaut, on affiche les echéances non réglées
      optionsAffichage: [
        { value: "1", text: "Opérations non traitées" },
        { value: "2", text: "Opérations traitées" },
      ],
    };
  },
  methods: {
    reglerSansFacture(operation) {
      this.operationSF = operation;
    },
    reglerTransfertArgent(operation) {
      this.transfertArgentARegler = operation;
    },
    supprimerOperation(codeOperation) {
      let self = this;
      toast.confirm(
        "Etes vous sûr de vouloir supprimer cette opération ?",
        function () {
          http
            .delete("/deleteOperation/" + codeOperation)
            .then((response) => {
              self.operationsBancaire = self.filtredOperations.filter(function (
                op
              ) {
                return op.codeOperation != codeOperation;
              });
            })
            .catch((e) => {
              console.log(e);
            });
        }
      );
    },
    recupererOperationsBancaire() {
      if (this.selectedOptionAffichage == 1) {
        this.afficherOperationsATraiter();
      }
    },
    afficherOperationsATraiter() {
      http
        .get("/operationsBancairesATraiter")
        .then((response) => {
          this.operationsBancaire = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getBadge(status) {
      return status === "VALIDE"
        ? "success"
        : status === "EN_COURS"
        ? "warning"
        : status === "A_TRAITER"
        ? "danger"
        : "primary";
    },
    reglerOperation(operation) {
      //this.operationARegler = operation;
      this.$store.commit("updateOperationARegler", operation);
    },
    clearDatesFilter() {
      this.startDate = null;
      this.endDate = null;
    },
    stringToDate(dateString) {
      var dateParts = dateString.split("/");

      // month is 0-based, that's why we need dataParts[1] - 1
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    },
    convertDate(date) {
      //Convert yyyy-mm-dd  to  dd-mm-yyyy
      function pad(s) {
        return s < 10 ? "0" + s : s;
      }
      var d = new Date(date);
      let stringDate = [
        pad(d.getDate()),
        pad(d.getMonth() + 1),
        d.getFullYear(),
      ].join("/");
      return this.stringToDate(stringDate);
    },
    /**
     * Si le montant est null ou undefined ou NaN
     *  return 0
     * */
    toNumber(obj) {
      return obj ? obj : 0;
    },
  },
  watch: {
    selectedOptionAffichage: function (newValue, oldValue) {
      if (newValue == 1) {
        this.showTabs = false;
        this.afficherOperationsATraiter();
      } else {
        this.showTabs = true;
      }
    },
  },
  computed: {
    rows() {
      return this.operationsBancaire.length;
    },
    filterOperations: {
      get() {
        return this.$store.state.filterOperations;
      },
      set(value) {
        console.log("commit new filterOperations value");
        this.$store.commit("updateFilterOperation", value);
      },
    },
    startDate: {
      get() {
        return this.$store.state.startDate;
      },
      set(value) {
        this.$store.commit("updateStartDateFilter", value);
      },
    },
    endDate: {
      get() {
        return this.$store.state.endDate;
      },
      set(value) {
        this.$store.commit("updateEndDateFilter", value);
      },
    },
    filtredOperations: function () {
      this.currentPage = 1;

      let operationsFiltred = this.operationsBancaire.filter((operation) => {
        return (
          String(operation.montantCredit).match(
            this.$store.state.filterOperations
          ) ||
          String(operation.montantDebit).match(
            this.$store.state.filterOperations
          ) ||
          String(operation.codeOperation).match(
            this.$store.state.filterOperations
          ) ||
          operation.nomOperation
            .toLowerCase()
            .match(this.$store.state.filterOperations.toLowerCase())
        );
      });

      // filtre sur les dates
      if (
        this.$store.state.startDate !== null &&
        this.$store.state.endDate !== null
      ) {
        let vm = this;
        operationsFiltred = operationsFiltred.filter(function (element) {
          return (
            vm.convertDate(vm.$store.state.startDate) <=
              vm.stringToDate(element.dateOperation) &&
            vm.stringToDate(element.dateOperation) <=
              vm.convertDate(vm.$store.state.endDate)
          );
        });
      }

      // calculer la somme des montants Débit.
      if (operationsFiltred.length == 0) {
        this.montantFactureDebitTotal = 0;
      } else {
        this.montantFactureDebitTotal = operationsFiltred
          .map((o) => this.toNumber(o.montantDebit))
          .reduce((a, c) => this.toNumber(a) + this.toNumber(c))
          .toFixed(2);
      }
      // calculer la somme des montants Crédit.
      if (operationsFiltred.length == 0) {
        this.montantFactureCreditTotal = 0;
      } else {
        this.montantFactureCreditTotal = operationsFiltred
          .map((o) => this.toNumber(o.montantCredit))
          .reduce((a, c) => this.toNumber(a) + this.toNumber(c))
          .toFixed(2);
      }
      return operationsFiltred;
    },
  },
  created() {
    this.recupererOperationsBancaire();

    refreshOperationsEventBus.$on("refreshOperationsATraiter", () => {
      this.afficherOperationsATraiter();
    });
  },
};
</script>
<style >
/* Mask long text then show it when hover */
.long-text {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  word-break: break-all;
  white-space: nowrap;
}
.width-10 {
  width: 10%;
}
.width-40 {
  width: 40%;
}
tr > td:hover {
  overflow: visible;
  white-space: unset;
}
</style>