<template>
  <b-row>
    <b-col sm="3">
              <b-form-group>
                <b-form-input type="text" id="name" v-model="filterSearch" placeholder="Filtrer ..."></b-form-input>
              </b-form-group>
      </b-col>
      <b-col sm="12">
        <c-table :table-data="filtredEcheanciers" :per-page=10 :fields="fieldsToShow" hover striped bordered small fixed caption="<i class='fa fa-align-justify'></i> List des écheanciers client"></c-table>
      </b-col>
  </b-row>
    <!-- <div>
      <ul>
        <li v-for="(e, index) in echeanciersClient" :key="index">{{e.montantFacture}}</li>
      </ul>
    </div> -->
</template>

<script>
import ColorTheme from './ColorTheme'
import http from '../../client/http-common'
import cTable from '../../views/base/Table.vue'
import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

export default {
  name: 'colors',
  components: { ColorTheme, cTable },
  data() {
    return {
      echeanciersClient:[],
      filterSearch: '',
      fieldsToShow: [
        {
            key: 'societe.nomSociete',
            label: 'Nom Société',
            sortable: true,
            // Variant applies to the whole column, including the header and footer(https://bootstrap-vue.js.org/docs/reference/color-variants/)
            //variant: 'success'
          },
          {
            key: 'dateFacture',
            sortable: true,
            formatter : (date) => {
              return moment(date).format('DD/MM/YYYY');
            },
            filterByFormatted : true
          },
          {
            key: 'client.nomClient',
            label: 'Nom Client',
            sortable: true,
            // Variant applies to the whole column, including the header and footer(https://bootstrap-vue.js.org/docs/reference/color-variants/)
            //variant: 'success'
          },{
            key: 'montantFacture',
            sortable: true,
          }
        ]
    };
  },
  methods: {
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
    }
  },
  created() {
    this.recupererEcheanciersClient();
  }, 
  computed: {
    filtredEcheanciers: function(){
      return this.echeanciersClient.filter((ech) => {
        return String(ech.montantFacture).match(this.filterSearch) 
                || ech.client.nomClient.match(this.filterSearch)
                || ech.societe.nomSociete.match(this.filterSearch)
      });
    }
  }
}
</script>
