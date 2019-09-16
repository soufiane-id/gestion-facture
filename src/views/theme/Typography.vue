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
import http from '../../client/http-common'

export default {
  name: "UploadExcel",
  components: { cTable },
  data() {
    return {
      tableData: [],
      tableHeader: [],
      societeSelectList: [],
      selectedSociete: ""
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
                    self.makeToast('success', cpt + 'ligne(s) ont été enregistré');
                  }
                })
                .catch(function (error) {
                    console.log(error)
                    cpt--;
                    self.makeToast('danger', 'Erreur lors de l\'insertion d\'au moins une echeance !');

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
        this.makeToast('danger', 'Veuillez mentionner la société');
        return;
      }
      this.tableData = convertedData.body;
      this.tableHeader = convertedData.header;
      this.monSuperTraitement(this.tableData);
    },
    makeToast(variant = null, msg) {
        this.$bvToast.toast(msg, {
          title: `Message ${variant || 'default'}`,
          variant: variant,
          solid: true
        })
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