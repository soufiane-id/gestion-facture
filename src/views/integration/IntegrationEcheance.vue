<template>
  <div>
    <!-- Societe -->
    <b-form-group id="input-group-3" label="Societe:" label-for="input-3">
      <b-form-select
        id="input-3"
        v-model="selectedSociete"
        size="sm"
        :options="societeSelectList"
        required
      ></b-form-select>
    </b-form-group>

    <!-- <vue-xlsx-table class="importId" @on-select-file="handleSelectedFile">Importer !</vue-xlsx-table> -->
    <ExcelReader class="importId" @on-select-file="handleSelectedFile">Importer !</ExcelReader>

    <b-col sm="12">

      <b-table
        id="my-table2154"
        :items="responseInteg"
        :fields="fieldsToShow"
        :per-page="perPage"
        :current-page="currentPage"
        small
      >
        <template v-slot:cell(statutIntegration)="responseInteg">
          <b-badge
            :variant="getBadge(responseInteg.item.statutIntegration)"
          >{{responseInteg.item.statutIntegration}}</b-badge>
        </template>
      </b-table>
      <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="my-table"
      align="center"
    ></b-pagination>

    </b-col>
  </div>
</template>

<script>
import http from "../../client/http-common";
import toast from "../../commons/toast/toast";
import ExcelReader from "../../commons/excel/ExcelReader"

export default {
  name: "UploadExcel",
  components: { ExcelReader },
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      responseInteg: [],
      fieldsToShow: [
        {
          key: "dateFacture",
          label: "Date facture",
          sortable: true,
          class: "text-center"
        },
        {
          key: "numeroDocument",
          label: "N° Document",
          sortable: true,
          class: "text-center"
        },
        {
          key: "montantFacture",
          label: "Montant Facture",
          sortable: true,
          class: "text-center"
        },
        {
          key: "nomPersonne",
          label: "Client/Frs",
          sortable: true,
          class: "text-center"
        },
        {
          key: "statutIntegration",
          label: "Statut Integ",
          sortable: true,
          class: "text-center"
        }
      ],
      societeSelectList: [],
      selectedSociete: "",
      loader: "",
    };
  },
  methods: {
    monSuperTraitement(jsonBody) {
      /* Si une des colonnes manque, On arrête !*/
      if(!JSON.stringify(jsonBody).includes("Date facture")
        || !JSON.stringify(jsonBody).includes("Numéro du document")
        || !JSON.stringify(jsonBody).includes("Montant")
        || !JSON.stringify(jsonBody).includes("Soldée")
        || !JSON.stringify(jsonBody).includes("Code tiers")
        || !JSON.stringify(jsonBody).includes("Client")
        || !JSON.stringify(jsonBody).includes("Moyen de paiement")
      ){
        toast.error('Les colonnes ne sont pas bonnes !');
        this.loader.hide();
        return;
      }

      /* On formate le nom des colonnes pour les adapter aux champs coté backend*/
      console.log('avant', jsonBody)
      jsonBody = JSON.parse(
        JSON.stringify(jsonBody)
          .split('"Date facture":')
          .join('"dateFacture":')
          .split('"Numéro du document":')
          .join('"numeroDocument":')
          .split('"Montant":')
          .join('"montantFacture":')
          .split('"Soldée":')
          .join('"soldee":')
          .split('"Code tiers":')
          .join('"codeTiers":')
          .split('"Client":')
          .join('"nomPersonne":')
          .split('"Moyen de paiement":')
          .join('"moyenPaiement":')
      );
        console.log('apres', jsonBody)
      /* On supprime le champ moyenPaiement et les colonnes vides*/
      jsonBody.forEach(function(element) {
        if(element.__EMPTY !== undefined){
          delete element.__EMPTY;
        }
        delete element.moyenPaiement;
      });

      /* On supprime tous les elements n'ayant pas de dateFacture  */
      jsonBody = jsonBody.filter(echeance => {
        if(!echeance.dateFacture || !echeance.montantFacture) {
          return false;
        }
        return true;
      });

      /*  ajout de la societe */
      let societeString =
        '"societe":{"idSociete":' + this.selectedSociete + "},";
      let self = this;
      for (let i in jsonBody) {
          /* On ajoute le champ societe pour toutes les lignes*/
          jsonBody[i] = JSON.parse(
            this.insertAt(JSON.stringify(jsonBody[i]), 1, societeString)
          );

          /*  Formattage des dates  */
          /*console.log('dateParts avant split', + jsonBody[i].dateEcheance)
          const dateParts = jsonBody[i].dateEcheance.split("/");
          const regex = /^[0-9]{2}/;
          if (dateParts[2].match(regex)) {
            dateParts[2] = "20" + dateParts[2];
            // month is 0-based, that's why we need dataParts[1] - 1
            jsonBody[i].dateEcheance =
              dateParts[1] + "/" + (dateParts[0]) + "/" + dateParts[2];
          }
          */
          /* suppression des virgules dans le montantFacture et resteAPayer */
          if (jsonBody[i].montantFacture.includes(",")) {
            jsonBody[i].montantFacture = jsonBody[
              i
            ].montantFacture.replace(",", "");
          }
          /*if (jsonBody[i].resteAPayer.includes(",")) {
            jsonBody[i].resteAPayer = jsonBody[i].resteAPayer.replace(
              ",",
              ""
            );
          }*/
      }
      console.log('DATA TO SEND', jsonBody)
      /* insertion dans la BDD*/
      http
        .post("integrerEcheanciers", jsonBody)
        .then(function(response) {
          self.responseInteg = response.data;
        })
        .catch(function(error) {})
        .finally(function() {
          self.loader.hide();
        });
    },
    insertAt(string, index, stringToInsert) {
      if (index > 0) {
        return (
          string.substring(0, index) +
          stringToInsert +
          string.substring(index, string.length)
        );
      }
      return stringToInsert + string;
    },
    handleSelectedFile(convertedData) {
        console.log('convertedData', convertedData)
      if (!this.selectedSociete) {
        toast.error("Veuillez mentionner la société");
        return;
      }
      this.submit();
      this.monSuperTraitement(convertedData.body);
    },
    submit() {
      console.log(this.$loading);
      this.loader = this.$loading.show({
        // Optional parameters
        container: this.fullPage ? null : this.$refs.formContainer,
        canCancel: true,
        onCancel: this.onCancel
      });
    },
    getBadge(status) {
      return status === "OK" ? "success" : "danger";
    }
  },
  computed: {
    rows() {
      return this.responseInteg.length;
    }
  },
  created() {
    http
      .get("/listSociete")
      .then(response => {
        this.societes = response.data;

        this.societes.forEach((societe, index, mechanicsArray) => {
          let selectListOption = {
            value: societe.idSociete,
            text: societe.nomSociete
          };

          this.societeSelectList.push(selectListOption);
        });
      })
      .catch(e => {
        console.log(e);
      });
  }
};
</script>

<style scoped>
.importId {
  margin-top: 10px;
  margin-left: 460px;
  margin-bottom: 20px;
}
</style>