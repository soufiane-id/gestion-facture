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
     <button @click="clientToEdit.isEdit = false" type="button" class="btn btn-info add-new" v-b-modal="'formulaireAjoutClient'"><i class="fa fa-plus"></i> Add New</button>
    </div>

    <Formulaire :clientToEdit="clientToEdit" @refresh="refreshTable"/>
      
    <b-table
      id="my-table"
      :items="filtredClients"
      :fields="fieldsToShow"
      :per-page="perPage"
      :current-page="currentPage"
      small
    >
    <template slot="action" slot-scope="filtredClients">
      <b-col cols="6" sm="4" md="2" xl class="mb-3 mb-xl-0">
        <a @click="modifierClient(filtredClients.item)" class="edit" title="Modifier" data-toggle="tooltip" style="cursor: pointer" v-b-modal="'formulaireAjoutClient'"><i class="material-icons update-icon">&#xE254;</i></a>
        <a class="delete" title="Supprimer" data-toggle="tooltip" style="cursor: pointer" @click="supprimerClient(filtredClients.item.idClient)"><i class="material-icons delete-icon">&#xE872;</i></a>
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
import http from "../../client/http-common";
import Formulaire from './AddClientFormulaire';

export default {
  components: { Formulaire },
  data() {
    return {
      clients: [],
      filterSearch: '',
      clientToEdit:{
        client: '',
        isEdit: true
      },
      perPage: 10,
      currentPage: 1,
      fieldsToShow: [
        {
          key: "nomClient",
          label: "Nom Client",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "action"
        }
      ]
    };
  },
  methods: {
    recupererClients() {
      http
        .get("/listClient")
        .then(response => {
          this.clients = response.data; // JSON are parsed automatically.
        })
        .catch(e => {
          console.log(e);
        });
    },
    refreshTable(client){
      // refresh
      this.clients=[ ...this.clients, client];
      //this.currentPage = Math.ceil(this.rows/this.perPage);
    },
    modifierClient(client){
      this.clientToEdit.isEdit = true;
      this.clientToEdit.client = client;
    },
    supprimerClient(idClient) {
      http
         .delete("/deleteClient/" + idClient)
         .then(response => {
           this.clients = this.filtredClients.filter(function(cl) { return cl.idClient != idClient; });
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  computed: {
    rows() {
      return this.clients.length;
    },filtredClients: function(){
      this.currentPage = 1;
      return this.clients.filter((client) => {
        return client.nomClient.toLowerCase().match(this.filterSearch.toLowerCase())
      });
    }
  },
  created() {
    this.recupererClients();
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
    }
.material-icons {
  color: #E34724;
}
.update-icon {
  color: #FFC107;
}    
.delete-icon {
  color: #E34724;
}

</style>
