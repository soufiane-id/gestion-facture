<template>
  <div >
    <b-row>
      <Formulaire :typePersonne='routeTypePersonne' :factureToEdit='factureToEdit' @refresh="refreshTable"/>

      <b-form inline >
        <b-form-input type="text" v-model="filterSearchSociete" placeholder="Filtre sociétés..."></b-form-input>
        <b-form-input type="text" v-model="filterSearchClient" placeholder="Filtre clients..."></b-form-input>
        <label class="mr-sm-2" for="inlineInput1" style="margin-left:80px;">Facture du: </label>
        <b-input id="input-2" type="date" v-model="startDate" required size="sm" placeholder="Du .."></b-input>
        <label class="mx-sm-2" for="inlineInput2">Au: </label>
        <b-input id="input-63" type="date" v-model="endDate" required size="sm" placeholder="Au .."></b-input>
        <b-button-group  size="sm" class="mx-1" style="height: 28px" @click="clearDatesFilter">
          <b-btn>Cancel</b-btn>
        </b-button-group>
      </b-form>
    </b-row>

    
    <div class="card-tools">
      <b-form-select v-model="selectedOptionAffichage" :options="optionsAffichage" size="sm" class="mt-3" style="width:180px;"></b-form-select>
      <button type="button" class="btn btn-info add-new" @click="modifierFacture(null)" v-b-modal="'formulaireAjoutEC'" style="float:right"><i class="fa fa-plus"></i> Nouvelle Facture</button>
      <button type="button" class="btn btn-light add-new" @click="download" style="float:right"><i class="fa fa-download"></i> Télécharger</button>
    </div>

    <b-table
      id="personne-table"
      :items="filtredEcheanciers"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
    <template v-slot:cell(montantFacture)="data">
        {{data.item.montantFacture}} 
        <b-badge v-if="data.item.operations && data.item.operations.length > 0" variant="primary" title="Num Opération">{{data.item.operations}}</b-badge>   
    </template>

    <template v-slot:custom-foot>
      <tr>
        <td class="bg-gray text-white" :colspan="fieldsToShow.length - 2"></td>
        <td v-if="routeTypePersonne.toLowerCase() == 'client'" class="bg-success text-white text-center">  {{totalRAPClient}} </td>
        <td v-if="routeTypePersonne.toLowerCase() == 'fournisseur'" class="bg-success text-white text-center">  {{totalRAPFrs}} </td>
        <td v-if="routeTypePersonne.toLowerCase() == 'client'" class="bg-success text-white text-center">  {{totalFacturesClient}} </td>
        <td v-if="routeTypePersonne.toLowerCase() == 'fournisseur'" class="bg-success text-white text-center">  {{totalFacturesFrs}} </td>
      </tr>
    </template>

    <template v-slot:cell(action)="xxx">
      <b-col cols="6" sm="4" md="2" xl class="mb-3 mb-xl-0">
        <a v-if="xxx.item.resteAPayer === xxx.item.montantFacture" @click="modifierFacture(xxx.item)" class="edit" title="Modifier" data-toggle="tooltip" style="cursor: pointer" v-b-modal="'formulaireAjoutEC'"><i class="material-icons update-icon">&#xE254;</i></a>
      </b-col>
    </template>

    </b-table>

    <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="my-table"
      align="center"
    ></b-pagination>
  </div>
 
</template>

<script>
import http from "../../../client/http-common";
import Formulaire from './EcheancierClientFormulaire';
import moment from 'moment'
import XLSX from 'xlsx'

export default {
  components: { Formulaire },
  data() {
    return {
      routeTypePersonne : this.$route.params.routeTypePersonne,
      echeanciers: [],
      startDate: null,
      endDate: null,
      totalFacturesClient: 0,
      totalFacturesFrs: 0,
      totalRAPClient: 0,
      totalRAPFrs: 0,
      filterSearchSociete: '',
      filterSearchClient: '',
      mapSociete: [],
      perPage: 10,
      currentPage: 1,
      totalRow: 0,
      fieldsToShow: [
        {
          key: "dateFacture",
          sortable: true,
          class: 'text-center'
        },{
          key: "dateEcheance",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "personne.nomPersonne",
          label: "Nom Client",
          sortable: true,
          class: 'text-center'
          // Variant applies to the whole column, including the header and footer(https://bootstrap-vue.js.org/docs/reference/color-variants/)
          //variant: 'success'
        },
        {
          key: "numeroDocument",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "montantPaye",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "resteAPayer",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "montantFacture",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "action"
        }
      ],
      selectedOptionAffichage: '1', // Par défaut, on affiche les echéances non réglées
      optionsAffichage: [
          { value: '1', text: 'Echéances non réglées' },
          { value: '2', text: 'Echéances réglées' }
      ], 
      factureToEdit: {}
    };
  }, watch : {
    '$route'(to, from){
      this.routeTypePersonne = to.params.routeTypePersonne;
      this.recupererEcheanciers();
    },
    selectedOptionAffichage: function (newValue, oldValue) {
      if(this.routeTypePersonne.toLowerCase() === 'client'){
          newValue == 1 ? this.afficherEcheancesClientNonReglees() : this.afficherEcheancesClientReglees();         
      } else if(this.routeTypePersonne.toLowerCase() === 'fournisseur'){
          newValue == 1 ? this.afficherEcheancesFrsNonReglees() : this.afficherEcheancesFrsReglees();
      }
    }
  },
  methods: {
    recupererEcheanciers() {
      if(this.routeTypePersonne.toLowerCase() === 'client'){
          this.selectedOptionAffichage == 1 ? this.afficherEcheancesClientNonReglees() : this.afficherEcheancesClientReglees();         
      } else if(this.routeTypePersonne.toLowerCase() === 'fournisseur'){
          this.selectedOptionAffichage == 1 ? this.afficherEcheancesFrsNonReglees() : this.afficherEcheancesFrsReglees();
      }
    },
    afficherEcheancesClientReglees(){
      http
        .get("/listEcheancierClientRegle")
        .then(response => {
          this.echeanciers = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    afficherEcheancesClientNonReglees(){
      http
        .get("/listEcheancierClientNonRegle")
        .then(response => {
          this.echeanciers = response.data; 
        })
        .catch(e => {
          console.log(e);
        });
    },
    afficherEcheancesFrsReglees(){
      http
        .get("/listEcheancierFournisseurRegle")
        .then(response => {
          this.echeanciers = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    afficherEcheancesFrsNonReglees(){
      http
        .get("/listEcheancierFournisseurNonRegle")
        .then(response => {
          this.echeanciers = response.data; 
        })
        .catch(e => {
          console.log(e);
        });
    },
    modifierFacture(facture) {
      this.factureToEdit = facture;
    },
    refreshTable(ech){
      // On valorise le nomSociete à partir de l'id
      let idSoc = ech.societe.idSociete;
      const societeAdded = this.mapSociete.find(soc => soc.idSociete === idSoc);
      ech.societe.nomSociete = societeAdded.nomSociete;
      // refresh
      for (var i =0; i < this.echeanciers.length; i++)  {
        if (this.echeanciers[i].idEcheancier === ech.idEcheancier) {
          this.echeanciers.splice(i,1);
          break;
        }
      }
      this.echeanciers= [ ech, ...this.echeanciers];
    },fillMapSociete(){
      http
        .get("/listSociete")
        .then(response => {
          this.mapSociete = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    convertDate(date) {
      //Convert yyyy-mm-dd  to  dd-mm-yyyy
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(date)
      let stringDate = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
      return this.stringToDate(stringDate);
     },
     stringToDate(dateString){
      var dateParts = dateString.split("/");
      
      // month is 0-based, that's why we need dataParts[1] - 1
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
     },
     clearDatesFilter(){
       this.startDate = null;
       this.endDate = null;
     },
     download() {
       console.log("this.filtredEcheanciers", this.filtredEcheanciers)
       const data = XLSX.utils.json_to_sheet(this.filtredEcheanciers)
       const wb = XLSX.utils.book_new()
       XLSX.utils.book_append_sheet(wb, data, 'data')
       XLSX.writeFile(wb,'factures.xlsx')
     }
  },
  computed: {
    rows: {
      get () {
        return this.totalRow;
      },
      set (value) {
        console.log('set rows', value)
        this.totalRow = value
      }
    },
    filtredEcheanciers: function(){
      this.currentPage = 1;

      let societesFiltres = this.echeanciers.filter((ech) => {
        return ech.societe.nomSociete.toLowerCase().match(this.filterSearchSociete.toLowerCase())
      });

      let clientsFiltres = societesFiltres.filter((ech) => {
        return ech.personne.nomPersonne.toLowerCase().match(this.filterSearchClient.toLowerCase())
               ||  ech.numeroDocument.toLowerCase().match(this.filterSearchClient.toLowerCase())
      });

      // filtre sur les dates
      if(this.startDate !== null && this.endDate !== null){
        let vm = this;
        clientsFiltres = clientsFiltres.filter(function (element) {
          return vm.convertDate(vm.startDate) <=  vm.stringToDate(element.dateFacture) && vm.stringToDate(element.dateFacture) <= vm.convertDate(vm.endDate);
        });
      }
      // calculer la somme des factures.
      if(this.routeTypePersonne.toLowerCase() === 'client'){
        if (clientsFiltres.length == 0) {
          this.totalFacturesClient = 0;
          this.totalRAPClient = 0;
        } else {
          this.totalFacturesClient = clientsFiltres.map(o=>o.montantFacture).reduce((a,c)=>a+c).toFixed(2);
          this.totalRAPClient = clientsFiltres.map(o=>o.resteAPayer).reduce((a,c)=>a+c).toFixed(2);
        }
      } else if(this.routeTypePersonne.toLowerCase() === 'fournisseur'){
        if (clientsFiltres.length == 0) {
          this.totalFacturesFrs = 0;
          this.totalRAPFrs = 0;
        } else {
          this.totalFacturesFrs = clientsFiltres.map(o=>o.montantFacture).reduce((a,c)=>a+c).toFixed(2);
          this.totalRAPFrs = clientsFiltres.map(o=>o.resteAPayer).reduce((a,c)=>a+c).toFixed(2);
        }
      }

      console.log('filteredItems.length', clientsFiltres.length)
      this.rows = clientsFiltres.length
      this.currentPage = 1
      
      return clientsFiltres;
    }
  },
  created() {
    this.recupererEcheanciers();
    this.fillMapSociete();
  }
};
</script>
<style>
.add-new {
  float: right;
  height: 25px;
  font-weight: bold;
  font-size: 12px;
  text-shadow: none;
  min-width: 100px;
  border-radius: 50px;
  line-height: 13px;
  margin-bottom: 5px;
}
.update-icon {
  color: #FFC107;
}
</style>
