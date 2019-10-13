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
               @click="ajouterOperation(k)"
               v-if="k == tableAAfficher"
               type="button"
               class="btn btn-primary"
            > Ajouter
            </button>
          </b-card>
        </div>

        <!--  PAGE 3  -->
        <div slot="page3" v-for="(operation,k) in echeanciersRecap" :key="k">
           <b-card class="bg-secondary text-center">
              <p> Montant :  {{operation.montant}}</p>
              <p> Nom client :  {{operation.echeances[0].client.nomClient}}</p>
              <p>
             <ul>           
               <li v-for="(row, k) in operation.echeances" :key="k"> 
              <b-card class="bg-info text-center">
              <span>Numéro Document : {{ row.numeroDocument }}</span> <br> 
              <span>MontantFacture : {{ row.montantFacture }}</span> <br> 
              <span>Nom Société : {{ row.societe.nomSociete }}</span>
              </b-card>
              </li>
              </ul>
              </p> 
          </b-card> 
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
import toast from "../../commons/toast/toast"

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
          label: 'Identifier les Clients',
          slot: 'page1',
          // options: {
          //   nextDisabled: false,
          // }
        },
        {
          label: 'Selectionner les factures',
          slot: 'page2',
        },
        {
          label: 'Recapitulatif',
          slot: 'page3',
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
       ],
       echeanciersRecap: []
    };
  },
  methods: {
    nextClicked(currentPage) {
      console.log('next clicked', currentPage)
      switch(currentPage) {
        case 0: 
          console.log('this.inputs', this.inputs)
          return this.step1Valid() ? true : false;          
          break;
        case 2:
          console.log('click save')
          this.reglerOperation(this.echeanciersRecap)   
          break;
        default:
          console.log('Sorry, we are out of pages');
      }
      
      return true; //return false if you want to prevent moving to next page
    },
    backClicked(currentPage) {
      console.log('back clicked', currentPage);
      switch(currentPage) {
        case 1: 
          this.tableAAfficher = -1;
          break;
      }
      return true; //return false if you want to prevent moving to previous page
    },
    enableSave() {
      this.steps[3].options.nextDisabled = false;
    },
    go() {
      this.$refs.wizard.goTo(this.cStep++);
    },
    add(index) {
      /* On vérifie d'abord que le client est saisi avant de dajouter une nouvelle ligne*/
      if(this.inputs[this.inputs.length-1].client.idClient){
        this.cpt++;
        this.inputs.push({client: {idClient: "",nomClient: ""},montant:''});
      }else{
        toast.error('Veuillez d\'abord mentionner un client');
      }
      
    },
    remove(index) {
      this.cpt--;
      this.inputs.splice(index, 1);
    },
    clientSelected(client) {
      this.inputs[this.cpt].client.idClient = client.idClient;
      this.inputs[this.cpt].client.nomClient = client.nomClient;
      console.log('clientSelected : this.iputs', this.inputs)
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
    ajouterOperation(k){
      let factures = {};
      factures.key = k;
      factures.montant = this.inputs[k].montant;
      factures.montantSelectionne = this.montantFacturesSelectionnes;
      factures.echeances = this.selectedRow;
      console.log('factures', factures)
      // On test si le client n'a pas deja emis de factures
      const keyExist = this.echeanciersRecap.some((item) => {
        return item.key == k
      })
      if(keyExist){
          const filtred = this.echeanciersRecap.filter((item) => {
            return item.key != k 
          })
          this.echeanciersRecap = filtred;
      }
      this.echeanciersRecap.push(factures)
      toast.success("OK !");
    },
    reglerOperation(recap){
      let self=this;
      for (let i in recap) {
        http.post('reglerOperationsCheque/' + this.operation.codeOperation 
                                    + '/' + recap[i].montant
                                    + '/' + recap[i].montantSelectionne
                                    , recap[i].echeances)
        .then(function (response) {
          toast.success({
            message: "Successfully inserted record!"
          });
        })
        .catch(function (error) {
      
        });
      }
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