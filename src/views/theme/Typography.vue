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

    <vue-xlsx-table class="importId" @on-select-file="handleSelectedFile">Importer !</vue-xlsx-table>

    <b-col sm="12">
      <c-table
        :table-data="tableData"
        :per-page="10"
        :fields="tableHeader"
        hover
        striped
        bordered
        small
        fixed
        caption="<i class='fa fa-align-justify'></i> Echeanciers client à intégrer"
      ></c-table>
    </b-col>
  </div>
</template>

<script>
import cTable from "../../views/base/Table";
import http from "../../client/http-common";
import toast from "../../commons/toastr";

export default {
  name: "UploadExcel",
  components: { cTable },
  data() {
    return {
      tableData: [],
      tableHeader: [],
      societeSelectList: [],
      selectedSociete: "",
      loader:""
    };
  },
  methods: {
    monSuperTraitement(jsonBody) {
      /* On formate le nom des colonnes pour les adapter aux champs coté backend*/
      jsonBody = JSON.parse(
        JSON.stringify(jsonBody)
          .split('"Date échéance":')
          .join('"dateEcheance":')
          .split('"Numéro du document":')
          .join('"numeroDocument":')
          .split('"Montant":')
          .join('"montantFacture":')
          .split('"Soldée":')
          .join('"soldee":')
          .split('"Code tiers":')
          .join('"codeTiers":')
          .split('"Client":')
          .join('"nomClient":')
          .split('"Moyen de paiement":')
          .join('"moyenPaiement":')
          .split('"Solde dû":')
          .join('"resteAPayer":')
      );
      let formattedRequest = JSON.stringify(jsonBody);
      let cpt = 0;

      /* On supprime tous les elements n'ayant pas de dateEcheance + ajout de la societe */
      let arrayRequest = JSON.parse(formattedRequest);
      let societeString = '"societe":{"idSociete":'+this.selectedSociete+'},';
      for (let i in arrayRequest) {
        if (!arrayRequest[i].dateEcheance || !arrayRequest[i].montantFacture) {
          arrayRequest.splice(i, 1);
        } else {
          /* On ajoute le champ societe pour toutes les lignes*/
          arrayRequest[i] = JSON.parse(this.insertAt(JSON.stringify(arrayRequest[i]), 1, societeString));
          
          /*  Formattage des dates  */ 
          const dateParts = arrayRequest[i].dateEcheance.split("/");
          const regex = /^[0-9]{2}/;
          if(dateParts[2].match(regex)){
            dateParts[2] = '20'+dateParts[2];
      	    // month is 0-based, that's why we need dataParts[1] - 1
            arrayRequest[i].dateEcheance = dateParts[1] + '/' + (dateParts[0] - 1) + '/' + dateParts[2];
          }

          /* suppression des virgules dans le montantFacture et resteAPayer */
          if(arrayRequest[i].montantFacture.includes(',')){
            arrayRequest[i].montantFacture = arrayRequest[i].montantFacture.replace(",", "");
          }
          if(arrayRequest[i].resteAPayer.includes(',')){
            arrayRequest[i].resteAPayer = arrayRequest[i].resteAPayer.replace(",", "");
          }
          let self=this;
          /* insertion dans la BDD*/
          http.post('echeancierClients', arrayRequest[i])
                .then(function (response) {
                  cpt++;
                  if(cpt == arrayRequest.length){
                    self.afficherToast('success', cpt + 'ligne(s) ont été enregistré');
                    self.loader.hide();
                  }
                })
                .catch(function (error) {
                    cpt--;
                    self.loader.hide();
                });
        }
      }
      console.log(arrayRequest);
    },
    insertAt(string, index, stringToInsert) {
      if (index > 0){
        return string.substring(0, index) + stringToInsert + string.substring(index, string.length);
      }
        return stringToInsert + string;
    },
    handleSelectedFile(convertedData) {
      if(!this.selectedSociete){
        this.afficherToast('danger', 'Veuillez mentionner la société');
        return;
      }
      this.submit();
      this.tableData = convertedData.body;
      this.tableHeader = convertedData.header;
      this.monSuperTraitement(this.tableData);
      console.log(this.loader);
    },
    submit() {
      console.log(this.$loading);
                  this.loader = this.$loading.show({
                  // Optional parameters
                  container: this.fullPage ? null : this.$refs.formContainer,
                  canCancel: true,
                  onCancel: this.onCancel,
                });                
    }
  }, created() {
    http.get("/listSociete")
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
  }, mixins: [toast]
};
</script>
<style scoped>

.importId {
    margin-top: 10px;
    margin-left: 460px;
    margin-bottom: 20px;
}

</style>