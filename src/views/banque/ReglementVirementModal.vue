<template>
  <div>
    <b-modal
      id="reglementOperation"
      ref="modal"
      title="Réglement"
      size="lg"
      header-bg-variant="light"
      @hidden="resetModal"
      @cancel="resetModal"
      @ok="handleOk"
    >
      <div>
        <b-form-group label-cols-sm="4" label-cols-lg="3" label="Montant de l'opération : ">
          {{
          operation.montantDebit
          ? this.getValeurAbsolue(operation.montantDebit)
          : operation.montantCredit
          }}
        </b-form-group>

        <b-form-radio-group
          v-model="selectedSociete"
          :options="optionSociete"
          value-field="idSociete"
          text-field="nomSociete"
        ></b-form-radio-group>
      </div>
      <div class="card-tools button-magic">
        <button @click="magicBouton" type="button" class="btn btn-warning add-new">
          <i class="fa fa-cog fa-spin fa-1x fa-fw"></i> Magic Button
        </button>
      </div>

      <!-- Nom Client AutoComplete-->
      <div v-if="operation.montantCredit && operation.montantCredit >= 0">
        <span>
          <strong>Nom Client :</strong>
        </span>
        <Autocomplete
          :suggestions="listAutoComplete"
          filterby="nomPersonne"
          v-model="autoCompleteModel"
          @selected="personneSelected"
        ></Autocomplete>
      </div>

      <!-- Nom Fournisseur AutoComplete-->
      <div v-if="operation.montantDebit">
        <span>Nom Fournisseur :</span>
        <Autocomplete
          :suggestions="listAutoComplete"
          filterby="nomPersonne"
          v-model="autoCompleteModel"
          @selected="personneSelected"
        ></Autocomplete>
      </div>

      <div style="margin-top:15px;">
        <b-form-checkbox size="sm" style="float:right;" v-model="selectAll" @change="selectAllRows">
          {{
          selectAll ? "Tout Désélectionner" : "Selectionner Tout"
          }}
        </b-form-checkbox>
        <!-- Table des clients/Frs-->
        <b-table
          ref="selectableTable"
          id="virement-table"
          selectable
          select-mode="multi"
          @row-selected="onRowSelected"
          :items="resultatPersonne"
          :fields="clientColumns"
          :per-page="perPage"
          :current-page="currentPage"
          small
        >
          <template v-slot:custom-foot>
            <tr v-if="montantFactureTotal >= 0">
              <td class="bg-light text-white" :colspan="clientColumns.length - 2"></td>
              <td class="bg-success text-white text-center">{{ montantFactureTotal }}</td>
            </tr>
          </template>
        </b-table>

        <b-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          aria-controls="virement-table"
          align="center"
        ></b-pagination>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Autocomplete from "../../commons/AutoComplete2";
import http from "../../client/http-common";
import knapsack from "../../commons/subset/Knapsack";
import toast from "../../commons/toast/toast";
import { utilsMixin } from "../../commons/utils/utilsMixin";
import { refreshOperationsEventBus } from "../../main";

export default {
  props: ["operation"],
  components: {
    Autocomplete,
  },
  data() {
    return {
      autoCompleteModel: "", // Dette technique !
      listAutoComplete: [],
      selectedRow: [],
      montantFacturesSelectionnes: 0,
      resultatPersonne: [],
      idPersonneSelected: "",
      arrMontantFacture: [],
      optionSociete: [],
      selectedSociete: "",
      selectAll: false,
      perPage: 20,
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
          key: "numeroDocument",
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
    valoriserClientOuFrs() {
      if (this.operation.montantDebit != null) {
        http
          .get("/listFournisseur")
          .then((response) => {
            this.listAutoComplete = response.data;
          })
          .catch((e) => {
            console.log(e);
          });
      } else if (this.operation.montantCredit != null) {
        http
          .get("/listClient")
          .then((response) => {
            this.listAutoComplete = response.data;
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    personneSelected(personne) {
      console.log(personne);
      console.log(
        `Customer Selected:\nid: ${personne.idPersonne}\nname: ${personne.nomPersonne}`
      );
      this.idPersonneSelected = personne.idPersonne;
      this.recupererEcheancierParClient(personne.idPersonne);
    },
    /*fournisseurSelected(fournisseur) {
      this.idFournisseurSelected = fournisseur.idPersonne;
      this.recupererEcheancierParFournisseur(fournisseur.idPersonne);
    },*/
    recupererEcheancierParClient(idPersonne) {
      http
        .get("/getEcheanciersByPersonne", {
          params: {
            idPersonne: idPersonne,
            idSociete: this.selectedSociete ? this.selectedSociete : "",
          },
        })
        .then((response) => {
          this.arrMontantFacture = [];
          this.resultatPersonne = response.data;
          this.recupererMontantsFacture(this.resultatPersonne);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    onChange(value) {
      // do something with the current value
    },
    resetModal() {
      this.autoCompleteModel = "";
      this.listAutoComplete = [];
      this.resultatPersonne = [];
      this.selectedRow = [];
      this.arrMontantFacture = [];
      this.selectedSociete = "";
      this.selectAll = false;
    },
    onRowSelected(items) {
      console.log("items", items);
      this.selectedRow = items;
    },
    handleOk(bvModalEvt) {
      console.log("selectedRow", this.selectedRow);
      if (this.selectedRow.length < 1) {
        toast.error("Vous n'avez sélectionné aucune écheance !");
        return;
      }

      // On valorise le champ moyenPaiment
      this.selectedRow.forEach((element) => {
        element.moyenPaiement = "VIREMENT";
      });

      let self = this;
      if (this.operation.montantDebit != null) {
        http
          .post(
            "reglerOperations/" +
              this.operation.codeOperation +
              "/" +
              this.montantFacturesSelectionnes,
            this.selectedRow
          )
          .then(function (response) {
            // On rafraichi l'ensemble de la page des opérations ( penser à une amélioration !!!!!)
            refreshOperationsEventBus.$emit("refreshOperationsATraiter");
            refreshOperationsEventBus.$emit(
              "refreshOperationsEnAttenteFacture"
            );
            toast.success("Réglement par virement effectué avec succès!");
          })
          .catch(function (error) {});
      } else if (this.operation.montantCredit != null) {
        http
          .post(
            "reglerOperations/" +
              this.operation.codeOperation +
              "/" +
              this.montantFacturesSelectionnes,
            this.selectedRow
          )
          .then(function (response) {
            // On rafraichi l'ensemble de la page des opérations ( penser à une amélioration !!!!!)
            refreshOperationsEventBus.$emit("refreshOperationsATraiter");
            refreshOperationsEventBus.$emit(
              "refreshOperationsEnAttenteFacture"
            );
            toast.success("Réglement par virement effectué avec succès!");
          })
          .catch(function (error) {});
      }
    },
    recupererMontantsFacture(resultat) {
      resultat.forEach((element) => {
        this.arrMontantFacture.push(element.resteAPayer);
      });
    },
    magicBouton() {
      let montantCible = this.operation.montantDebit
        ? this.getValeurAbsolue(this.operation.montantDebit)
        : this.operation.montantCredit;

      let self = this;
      this.getEcheancesParMontantFacture(
        this.arrMontantFacture,
        montantCible,
        this.idPersonneSelected,
        function (response) {
          console.log("response", response);
          self.resultatPersonne = response;
          toast.success("Solution trouvée .. ");
        }
      );
    },
    recupererSocietes() {
      http
        .get("/listSociete")
        .then((response) => {
          this.optionSociete = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    selectAllRows(event) {
      event
        ? this.$refs.selectableTable.selectAllRows()
        : this.$refs.selectableTable.clearSelected();
    },
  },
  mounted() {
    /* Evenement lors de l'ouverture du modal ayant l'id 'reglementOperation' */
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === "reglementOperation") {
        this.recupererSocietes();
        this.valoriserClientOuFrs();
      }
    });
  },
  computed: {
    rows() {
      return this.resultatPersonne.length;
    },
    montantFactureTotal() {
      this.montantFacturesSelectionnes = this.calculSommeArray(
        this.selectedRow.map((row) => row.resteAPayer)
      );
      return this.montantFacturesSelectionnes;

      /*return this.selectedRow.reduce((accum, item) => {
        this.montantFacturesSelectionnes =  accum + item.montantFacture;
        return this.montantFacturesSelectionnes;
      }, 0.0);*/
    },
    clientColumns() {
      return [
        {
          key: "personne.nomPersonne",
          label: this.operation.montantDebit ? "Fournisseur" : "Client",
        },
        ...this.fields,
      ];
    },
    // ,
    // fournisseurColumns(){
    //   return [{key: "fournisseur.nomFournisseur", label: "Fournisseur"}, ...this.fields]
    // }
  },
  mixins: [knapsack, toast, utilsMixin],
};
</script>

<style scoped>
.button-magic {
  margin-bottom: 40px;
}
</style>
