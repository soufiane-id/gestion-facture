<template>
  <div>
    <b-modal id="reglementCheque" size="xl" hide-footer @hidden="resetModal">
        <vue-good-wizard
        ref="wizard"
        :steps="steps"
        :onNext="nextClicked" 
        :onBack="backClicked">
        <!--  PAGE 1  -->
        <div slot="page1" >
          <div slot="entete">
            <p v-if="errors.length">
             <!-- <b>Please correct the following error(s):</b> -->
             <ul>
                 <li style="color: red" v-for="(error, k) in errors" :key="k">{{ error }}</li>
             </ul>
            </p> 
             <b-form-group
              label-cols-sm="4"
              label-cols-lg="3"
              label="Montant global : "
             > {{montantGlobalCheque}}</b-form-group>
          </div>  
        <b-row v-for="(input,k) in inputs" :key="k">
            <span>Nom Client : </span>
            <auto :suggestions="clients" 
              filterby="nomClient" 
              v-model="input.client.nomClient"
              @selected="clientSelected">
            </auto>
            <b-form-group id="input-group-2">
              <b-form-input id="montant" v-model="input.montant" size="sm" required placeholder="Entrer le montant .."></b-form-input>
            </b-form-group>
            <font-awesome-icon icon="plus" size="lg" @click="add(k)" v-show="k == inputs.length-1" :style="{ color: 'green' }"/>
            <font-awesome-icon icon="trash-alt" size="lg" @click="remove(k)" v-show="k || ( !k && inputs.length > 1)" :style="{ color: 'red' }"/>
          </b-row>
           <!-- <button @click="test"> get </button> -->
        </div>
       
        <!--  PAGE 2  -->
        <div slot="page2" v-for="(input,k) in inputs" :key="k">
          <b-card>
            <p> Montant :  {{input.montant}}</p>
            <p> Nom client :  {{input.client.nomClient}}</p>
            <font-awesome-icon icon="arrow-circle-down" @click="afficherDetailClient(k)" size="lg"  :style="{ color: '#87ceeb' }"/>
            <b-table
              v-if="k == tableAAfficher"
              id="my-table"
              selectable
              select-mode="multi"
              @row-selected="onRowSelected"
              :items="resultatClient"
              :fields="fields"
              small
              foot-clone
            >
             <template slot="FOOT_montantFacture">{{ montantFactureTotal }}</template>
            </b-table>
            <button
               @click="reglerOperation(k)"
               v-if="k == tableAAfficher"
               type="button"
               class="btn btn-primary"
            > Régler
            </button>
          </b-card>
        </div>

        <!--  PAGE 3  -->
        <div slot="page3">
        </div>
        </vue-good-wizard>  
    </b-modal>
  </div>
</template>

<script>
// import { GoodWizard } from '../dist/vue-good-wizard.es.js';
import VueGoodWizard from '../../commons/Wizard';
import Auto from "../../commons/AutoComplete2";
import http from "../../client/http-common";

export default {
  components: { VueGoodWizard, Auto },
  props: ["operation"],
  name: 'demo',
  data(){
    return {
      clients: [],
      errors: [],
      resultatClient: [],
      tableAAfficher: -1,
      selectedRow: [],
      montantFacturesSelectionnes: 0,
      cpt:0,
      step1: '',
      step2: '',
      cStep: 1,
      fields: [
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: "text-center"
        },
        {
          key: "client.nomClient",
          label: "Nom Client",
          sortable: true,
          class: "text-center"
        },
        {
          key: "numeroDocument",
          sortable: true,
          class: "text-center"
        },
        {
          key: "resteAPayer",
          sortable: true,
          class: "text-center"
        },
        {
          key: "montantFacture",
          sortable: true,
          class: "text-center"
        }
      ],
      steps: [
        {
          label: 'Select Items',
          slot: 'page1',
          // options: {
          //   nextDisabled: false,
          // }
        },
        {
          label: 'Add Constraints',
          slot: 'page2',
        },
        {
          label: 'Review',
          slot: 'page3',
        },
        {
          label: 'Apply',
          slot: 'page4',
          options: {
            nextDisabled: true,
          }
        }
      ],
      inputs: [
            {
                client: {
                  idClient: "",
                  nomClient: ""
                },
                montant:''
            }
       ]
    };
  },
  methods: {
    nextClicked(currentPage) {
      console.log('next clicked', currentPage)
      switch(currentPage) {
        case 0: 
          return this.step1Valid() ? true : false;          
          break;
        default:
          console.log('Sorry, we are out of pages');
      }
      
      return true; //return false if you want to prevent moving to next page
    },
    backClicked(currentPage) {
      console.log('back clicked', currentPage);
      return true; //return false if you want to prevent moving to previous page
    },
    enableSave() {
      this.steps[3].options.nextDisabled = false;
    },
    go() {
      this.$refs.wizard.goTo(this.cStep++);
    },
    add(index) {
      this.cpt++;
      this.inputs.push({client: {idClient: "",nomClient: ""},montant:''});
    },
    remove(index) {
      this.cpt--;
      this.inputs.splice(index, 1);
    },
    clientSelected(client) {
      this.inputs[this.cpt].client.idClient = client.idClient;
      this.inputs[this.cpt].client.nomClient = client.nomClient;
      //this.clientSelectionne = client;
    },
    recupererClients(){
      http
        .get("/listClient")
        .then(response => {
          this.clients = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    recupererEcheancierParClient(idClient) {
      http
        .get("/getEcheanciersByClient/" + idClient)
        .then(response => {
          this.resultatClient = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    reglerOperation(k){
      console.log('selectedRow', this.selectedRow)
      if(this.selectedRow.length < 1){
        this.afficherToast('danger', 'Vous n\'avez sélectionné aucune écheance !');
        return;
      }
      let self=this;
      http.post('reglerOperationsCheque/' + this.operation.codeOperation 
                                    + '/' + this.inputs[k].montant 
                                    + '/' + this.montantFacturesSelectionnes 
                                    , this.selectedRow)
        .then(function (response) {
          // On rafraichi l'ensemble de la page des opérations ( penser à une amélioration !!!!!)
          //self.$emit('refresh');
        })
        .catch(function (error) {
      
        });
    },
    afficherDetailClient(k){
      this.recupererEcheancierParClient(this.inputs[k].client.idClient)
      this.tableAAfficher = k;
    },
    resetModal() {
      this.inputs = [{client: {idClient: "",nomClient: ""},montant:''}]
      this.errors = []
    },
    onRowSelected(items) {
      console.log('items', items)
      this.selectedRow = items;
    },
    step1Valid(){
      this.errors = [];
      let champVide = false;
      /* Vérifier si la somme des cheques est égal au montant de l'operation */ 
      if(this.montantGlobalCheque != this.montantRepartitionCheque){
          this.errors.push("Vérfier les montants !! ");
      }
      /* Vérifier si les champs sont bien renseignés*/
      this.inputs.forEach((element) => {
        if(!element.client.nomClient || !element.montant){
          champVide = true // TODO Voir comment optimiser ce code => Trouver l'equivalent du break pour sortir de la boucle
        }
      });
      if(champVide){
        this.errors.push("Veuillez renseigner tous les champs ");
      }
      if (this.errors.length) {
        return false;
      }
      return true;
    }
  },
  computed: {
    montantGlobalCheque() {
      return this.operation.montantDebit ? this.operation.montantDebit : this.operation.montantCredit
    },
    montantRepartitionCheque(){
      return this.inputs.map(element => element.montant).reduce((a, b) => parseFloat(a) + parseFloat(b), 0.0);
    },
    montantFactureTotal() {
      return this.selectedRow.reduce((accum, item) => {
        this.montantFacturesSelectionnes =  accum + item.montantFacture;
        return this.montantFacturesSelectionnes;
      }, 0.0);
    }
  },
   created() {
    this.recupererClients();
  }
};
</script>