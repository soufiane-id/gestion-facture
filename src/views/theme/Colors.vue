<template>
  <div >
    <b-row>
      <b-col sm="3">
        <b-form-group>
          <b-form-input type="text" id="name" v-model="filterSearch" placeholder="Filtrer ..."></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>
    <div class="card-tools">
        <b-button class="btn btn-success" style="float:right" v-b-modal="'formulaireAjoutEC'">Add New <i class="fas fa-user-plus fa-fw"></i></b-button>
    </div>

    <Formulaire @refresh="refreshTable"/>
      
    <b-table
      id="my-table"
      :items="filtredEcheanciers"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
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

export default {
  components: { Formulaire },
  data() {
    return {
      echeanciersClient: [],
      filterSearch: '',
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
          key: "dateFacture",
          sortable: true,
          class: 'text-center'
          // formatter : this.formaterDate,
          // filterByFormatted : true
        },
        {
          key: "dateEcheance",
          sortable: true,
          class: 'text-center'
          //formatter: this.formaterDate
        },
        {
          key: "montantFacture",
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
          key: "dateReglementFacture",
          sortable: true,
          class: 'text-center'
          //formatter : this.formaterDate
        }, 
        {
          key: "action"
        }
      ]
    };
  },
  methods: {
    recupererEcheanciersClient() {
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
  computed: {
    rows() {
      return this.echeanciersClient.length;
    },filtredEcheanciers: function(){
      this.currentPage = 1;
      return this.echeanciersClient.filter((ech) => {
        return String(ech.montantFacture).match(this.filterSearch)
                || ech.client.nomClient.toLowerCase().match(this.filterSearch.toLowerCase())
                || ech.societe.nomSociete.toLowerCase().match(this.filterSearch.toLowerCase())
                || ech.numeroDocument.toLowerCase().match(this.filterSearch.toLowerCase())
      });
    }
  },
  created() {
    this.recupererEcheanciersClient();
    this.fillMapSociete();
  }
};
</script>
