<template>
  <div >
    <b-row>
      <!-- <b-col sm="2"> -->
        <!-- <b-form-group>
          <b-form-input type="text" v-model="filterSearchSociete" placeholder="Filtre sociétés..."></b-form-input>
          <b-form-input type="text" v-model="filterSearchClient" placeholder="Filtre clients..."></b-form-input>
        </b-form-group> -->
      <!-- </b-col> -->
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
     <button type="button" class="btn btn-info add-new" v-b-modal="'formulaireAjoutEC'" style="float:right"><i class="fa fa-plus"></i> Add New</button>
    </div>

    <Formulaire @refresh="refreshTable"/>
      
    <b-table
      id="my-table"
      :items="filtredEcheanciers"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
      foot-clone
    >
      <template slot="FOOT_societe.nomSociete">
        <span></span>
      </template>
      <template slot="FOOT_client.nomClient">
        <span></span>
      </template>
      <template slot="FOOT_numeroDocument">
        <span></span>
      </template>
      <template slot="FOOT_dateEcheance">
        <span></span>
      </template>
      <template slot="FOOT_montantPaye">
        <span></span>
      </template>
      <template slot="FOOT_resteAPayer">
        <span></span>
      </template>
      <template slot="FOOT_montantFacture">
        <span>{{montantFactureTotal}}</span>
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
import http from "../../client/http-common";
import Formulaire from './EcheancierClientFormulaire';
import moment from 'moment'

export default {
  components: { Formulaire },
  data() {
    return {
      echeanciersClient: [],
      montantFactureTotal: 0,
      startDate: null,
      endDate: null,
      filterSearchSociete: '',
      filterSearchClient: '',
      mapSociete: [],
      perPage: 10,
      currentPage: 1,
      fieldsToShow: [
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "client.nomClient",
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
          key: "dateEcheance",
          sortable: true,
          class: 'text-center'
          //formatter: this.formaterDate
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
        }
      ]
    };
  },
  methods: {
    recupererEcheanciersClient() {
      http
        .get("/listEcheancierClientNonRegle")
        .then(response => {
          this.echeanciersClient = response.data; // JSON are parsed automatically.
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    refreshTable(ech){
      // On valorise le nomSociete à partir de l'id
      let idSoc = ech.societe.idSociete;
      const societeAdded = this.mapSociete.find(soc => soc.idSociete === idSoc);
      ech.societe.nomSociete = societeAdded.nomSociete;
      // refresh
      this.echeanciersClient=[ ...this.echeanciersClient, ech];
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
     }
  },
  computed: {
    rows() {
      return this.echeanciersClient.length;
    },
    filtredEcheanciers: function(){
      this.currentPage = 1;

      let societesFiltres = this.echeanciersClient.filter((ech) => {
        return ech.societe.nomSociete.toLowerCase().match(this.filterSearchSociete.toLowerCase())
      });

      let clientsFiltres = societesFiltres.filter((ech) => {
        return ech.client.nomClient.toLowerCase().match(this.filterSearchClient.toLowerCase())
      });

      // filtre sur les dates
      if(this.startDate !== null && this.endDate !== null){
        let vm = this;
        clientsFiltres = clientsFiltres.filter(function (element) {
          return vm.convertDate(vm.startDate) <=  vm.stringToDate(element.dateEcheance) && vm.stringToDate(element.dateEcheance) <= vm.convertDate(vm.endDate);
        });
      }
      // calculer la somme des factures.
      if (clientsFiltres.length == 0) {
        this.montantFactureTotal = 0;
      } else {
        this.montantFactureTotal = clientsFiltres.map(o=>o.montantFacture).reduce((a,c)=>a+c).toFixed(2);
      }
      return clientsFiltres;
    }
  },
  created() {
    this.recupererEcheanciersClient();
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
</style>
