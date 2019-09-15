<template>
<div>
  <b-row>
      <Formulaire @refresh="refreshTable"/>
  </b-row>
  <b-row>
    <b-col sm="3">
              <b-form-group>
                <b-form-input type="text" id="name" v-model="filterSearch" placeholder="Filtrer ..."></b-form-input>
              </b-form-group>
    </b-col>
  </b-row>
  <b-row>
      <b-col sm="12">
        <c-table :table-data="filtredEcheanciers" :per-page=10 :fields="fieldsToShow" hover striped bordered small fixed caption="<i class='fa fa-align-justify'></i> List des écheanciers client"></c-table>
      </b-col>
  </b-row>
</div>
</template>

<script>
import ColorTheme from './ColorTheme'
import http from '../../client/http-common'
import cTable from '../../views/base/Table.vue'
import moment from 'moment'
import Formulaire from './EcheancierClientFormulaire'
import 'moment/locale/fr'
moment.locale('fr')

export default {
  name: 'colors',
  components: { ColorTheme, cTable, Formulaire },
  data() {
    return {
      echeanciersClient:[],
      mapSociete: [],
      filterSearch: '',
      fieldsToShow: [
        {
            key: 'societe.nomSociete',
            label: 'Nom Société',
            sortable: true
          },
          {
            key: 'nomClient',
            label: 'Nom Client',
            sortable: true,
            // Variant applies to the whole column, including the header and footer(https://bootstrap-vue.js.org/docs/reference/color-variants/)
            //variant: 'success'
          },{
            key: 'numeroDocument',
            sortable: true
          },{
            key: 'dateFacture',
            sortable: true,
            // formatter : this.formaterDate,
            // filterByFormatted : true
          },{
            key: 'dateEcheance',
            sortable: true,
            //formatter: this.formaterDate
          },
          {
            key: 'montantFacture',
            sortable: true,
          },{
            key: 'montantPaye',
            sortable: true,
          },{
            key: 'resteAPayer',
            sortable: true,
          },{
            key: 'dateReglementFacture',
            sortable: true,
            //formatter : this.formaterDate
          }
        ]
    };
  },
  methods: {
    formaterDate(date){
      return moment(date).format('DD/MM/YYYY');
    },
    recupererEcheanciersClient(){
      http
        .get("/listEcheancierClient")
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
    }
  },
  created() {
    this.recupererEcheanciersClient();
    this.fillMapSociete();
  }, 
  computed: {
    filtredEcheanciers: function(){
      return this.echeanciersClient.filter((ech) => {
        return String(ech.montantFacture).match(this.filterSearch) 
                || ech.nomClient.toLowerCase().match(this.filterSearch.toLowerCase())
                || ech.societe.nomSociete.toLowerCase().match(this.filterSearch.toLowerCase())
                || ech.numeroDocument.toLowerCase().match(this.filterSearch.toLowerCase())
      });
    }
  }
}
</script>
