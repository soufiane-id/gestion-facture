<template>
  <div>

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
          <b-badge :variant="getBadge(responseInteg.item.statutIntegration)">
            {{responseInteg.item.statutIntegration}}
          </b-badge>
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
          key: "dateOperation",
          label: "Date Opération",
          sortable: true,
          class: "text-center"
        },
        {
          key: "nomOperation",
          label: "Nom Opération",
          sortable: true,
          class: "text-center"
        },
        {
          key: "montantDebit",
          label: "Montant Débit",
          sortable: true,
          class: "text-center"
        },
        {
          key: "montantCredit",
          label: "Montant Crédit",
          sortable: true,
          class: "text-center"
        },
        {
          key: "statutOperation",
          label: "Statut Opération",
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
      loader: "",
    };
  },
  methods: {
    monSuperTraitement(jsonBody) {
      /* Si une des colonnes manque, On arrête !*/
      if(!JSON.stringify(jsonBody).includes("Date")
        || !JSON.stringify(jsonBody).includes("Libellé")
        || !JSON.stringify(jsonBody).includes("Débit")
        || !JSON.stringify(jsonBody).includes("Crédit")
      ){
        toast.error('Les colonnes ne sont pas bonnes !');
        this.loader.hide();
        return;
      }
      /* On formate le nom des colonnes pour les adapter aux champs coté backend*/
      console.log('avant', jsonBody)
      jsonBody = JSON.parse(
        JSON.stringify(jsonBody)
          .split('"Date":')
          .join('"dateOperation":')
          .split('"Libellé":')
          .join('"nomOperation":')
          .split('"Débit":')
          .join('"montantDebit":')
          .split('"Crédit":')
          .join('"montantCredit":')  
      );
        console.log('apres', jsonBody)
      /* On supprime le champ moyenPaiement et les colonnes vides*/
      jsonBody.forEach(function(element) {
        if(element.__EMPTY !== undefined){
          delete element.__EMPTY;
        }
        delete element.moyenPaiement;
      });

      /* On supprime tous les elements n'ayant pas nom d'operation et un montant  */
      jsonBody = jsonBody.filter(operation => {
        if(!operation.nomOperation || (!operation.montantDebit && !operation.montantCredit)) {
          return false;
        }
        return true;
      });

      console.log('apres 2', jsonBody)
      //let arrayRequest = jsonBody;
      let societeString =
        '"societe":{"idSociete":' + this.selectedSociete + "},";
      let self = this;
      console.log('arrayRequest !!!', jsonBody)
      for (let i in jsonBody) {
          /*  Formattage des dates  */
          
          /*console.log("typeof", typeof jsonBody[i].dateOperation)
          var dateParts = jsonBody[i].dateOperation.split("/");
          console.log('dateParts[0]', + dateParts[0])
          console.log('dateParts[1]', + dateParts[1])
          console.log('dateParts[2]', + dateParts[2])
          const regex = /^[0-9]{2}/;
          if (dateParts[2].match(regex)) {  
            //dateParts[2] = "20" + dateParts[2]; // C'est réglé dans le composant ExcelReader -> Voir dateNF
            // month is 0-based, that's why we need dataParts[1] - 1 
            jsonBody[i].dateOperation =
              dateParts[0] + "/" + (+dateParts[1] + 1) + "/" + dateParts[2];
          }
          //console.log('finaaal', jsonBody[i].dateOperation) 
          */
          /* suppression des virgules dans le montantDebit et montantDebit */
          if (jsonBody[i].montantDebit.includes(",")) {
            jsonBody[i].montantDebit = jsonBody[
              i
            ].montantDebit.replace(",", ".");
          }
          if (jsonBody[i].montantCredit.includes(",")) {
            jsonBody[i].montantCredit = jsonBody[i].montantCredit.replace(
              ",",
              "."
            );
          }
      }
      /* insertion dans la BDD*/
      console.log('Data to send !!!!', jsonBody)
      http
        .post("integrerOperations", jsonBody)
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
  mixins: [toast]
};
</script>

<style scoped>
.importId {
  margin-top: 10px;
  margin-left: 460px;
  margin-bottom: 20px;
}
</style>