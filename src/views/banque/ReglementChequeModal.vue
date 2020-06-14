<template>
  <div>
    <b-modal id="reglementCheque" size="xl" hide-footer @hidden="resetModal" no-close-on-backdrop>
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
          </div>  

          <dl class="row">
            <dt class="col-sm-3">Montant global </dt>
            <dd class="col-sm-9">{{montantGlobalCheque}}</dd>    

            <dt class="col-sm-3">Société </dt>  
            <dd class="col-sm-9">
              <b-form-radio-group
                v-model="selectedSociete"
                :options="optionSociete"
                value-field="idSociete"
                text-field="nomSociete"
              ></b-form-radio-group>
            </dd>               
          </dl>

          <!-- <b-row v-for="(input,k) in inputs" :key="k">
            <span>Nom Client : </span>
            <AutoComplete :suggestions="clients" 
              filterby="nomPersonne" 
              v-model="input.personne.nomPersonne"
              @selected="personneSelected(k, $event)">
            </AutoComplete>
            <b-form-group id="input-group-2">
              <b-form-input id="montant" v-model="input.montant" size="sm" required placeholder="Entrer le montant .."></b-form-input>
            </b-form-group>
            <font-awesome-icon icon="plus" size="lg" @click="add(k)" v-show="k == inputs.length-1" :style="{ color: 'green' }"/>
            <font-awesome-icon icon="trash-alt" size="lg" @click="remove(k)" v-show="k || ( !k && inputs.length > 1)" :style="{ color: 'red' }"/>
          </b-row> -->
          



          <b-container class="bv-example-row">
            <b-row class="justify-content-md-center" v-for="(input,k) in inputs" :key="k">
              <b-col cols="2" md="auto">
                <div class="input-group-prepend">
                  <span class="input-group-text">Nom client :</span>
                </div>
              </b-col>

              <b-col cols="4">
                <AutoComplete :suggestions="clients" 
                  filterby="nomPersonne" 
                  v-model="input.personne.nomPersonne"
                  @selected="personneSelected(k, $event)">
                </AutoComplete>
              </b-col>

              <b-col cols="4">
                <b-form-group id="input-group-2">
                  <b-form-input id="montant" v-model="input.montant" size="sm" required placeholder="Entrer le montant .."></b-form-input>
                </b-form-group>
              </b-col>

              <b-col cols="1">
                <font-awesome-icon icon="plus" size="lg" @click="add(k)" v-show="k == inputs.length-1" :style="{ color: 'green' }"/>
                <font-awesome-icon icon="trash-alt" size="lg" @click="remove(k)" v-show="k || ( !k && inputs.length > 1)" :style="{ color: 'red' }"/>
              </b-col>
            </b-row>
          </b-container>







        </div>
       
        <!--  PAGE 2  -->
        <div slot="page2" v-for="(input,k) in inputs" :key="k">
          <b-card>
            <p> Montant :  {{input.montant}}</p>
            <p> Nom client :  {{input.personne.nomPersonne}}</p>
            <font-awesome-icon icon="arrow-circle-down" @click="afficherDetailClient(k)" size="lg"  :style="{ color: '#87ceeb' }"/>

            <div class="card-tools button-magic">
              <button
                v-if="k == tableAAfficher"
                @click="magicBoutton(k)"
                type="button"
                class="btn btn-warning add-new"
              >
                <i class="fa fa-cog fa-spin fa-1x fa-fw"></i> Magic Button
              </button>
          </div>

            <b-table
              v-if="k == tableAAfficher"
              id="reglement-cheque"
              selectable
              select-mode="multi"
              @row-selected="onRowSelected"
              :items="resultatClient"
              :fields="fields"
              :per-page="perPage"
              :current-page="currentPage"
              small
            >
              <template v-slot:custom-foot>
                <tr v-if="montantFactureTotal > 0">
                  <td class="bg-light text-white" :colspan="fields.length - 2"></td>
                  <td class="bg-success text-white text-center">{{montantFactureTotal}}</td>
                </tr>
              </template>
             
            </b-table>
            <b-pagination
              v-if="k == tableAAfficher"
              v-model="currentPage"
              :total-rows="rows"
              :per-page="perPage"
              aria-controls="reglement-cheque"
              align="center">     
            </b-pagination>

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
              <p> Nom client :  {{operation.echeances[0].personne.nomPersonne}}</p>
              <p>
             <ul>           
               <li v-for="(row, k) in operation.echeances" :key="k"> 
              <b-card class="bg-info text-center">
                <span>Numéro Document : {{ row.numeroDocument }}</span> <br> 
                <span>MontantFacture : {{ row.resteAPayer}}</span> <br> 
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
import VueGoodWizard from '../../commons/Wizard';
import AutoComplete from "../../commons/AutoComplete2";
import http from "../../client/http-common";
import toast from "../../commons/toast/toast";
import knapsack from "../../commons/subset/Knapsack";
import {utilsMixin} from "../../commons/utils/utilsMixin";
import { refreshOperationsEventBus } from '../../main';

export default {
  mixins: [utilsMixin, knapsack],
  components: { VueGoodWizard, AutoComplete },
  props: ["operation"],
  name: 'demo',
  data(){
    return {
      clients: [],
      errors: [],
      resultatClient: [],
      perPage: 20,
      currentPage: 1,
      tableAAfficher: -1,
      selectedRow: [],
      montantFacturesSelectionnes: 0,
      selectedSociete: '',
      optionSociete: [],
      cpt:0,
      step1: '',
      step2: '',
      cStep: 1,
      fields: [
        {
          key: "dateFacture",
          sortable: true,
          class: "text-center"
        },
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: "text-center"
        },
        {
          key: "personne.nomPersonne",
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
                personne: {
                  idPersonne: "",
                  nomPersonne: ""
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
          return this.isStep1Valid() ? true : false;          
          break;
        case 1: 
          console.log('Validation etape 2 ...', )
          console.log('this.echeanciersRecap', this.echeanciersRecap)        
          return this.isStep2Valid() ? true : false; 
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
      if(this.inputs[this.inputs.length-1].personne.idPersonne){
        this.cpt++;
        this.inputs.push({personne: {idPersonne: "",nomPersonne: ""},montant:''});
      }else{
        toast.error('Veuillez d\'abord mentionner un client');
      }
      
    },
    remove(index) {
      this.cpt--;
      this.inputs.splice(index, 1);
    },
    magicBoutton(k) {
      let self=this;
      this.getEcheancesParMontantFacture(this.resultatClient.map(e => e.resteAPayer), this.inputs[k].montant, this.inputs[k].personne.idPersonne, 
                          function(res){
                            toast.success('Solution trouvée .. ');
                            self.resultatClient = res;
                          });
    },
    personneSelected(k, personne) {
      console.log('cpt = ', this.cpt);
      console.log('this.inputs = ', this.inputs)
      console.log('personne ', personne)
      console.log('k', k)
      this.inputs[k].personne.idPersonne = personne.idPersonne;
      this.inputs[k].personne.nomPersonne = personne.nomPersonne;
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
    recupererEcheancierParClient(idPersonne) {
      http
        .get("/getEcheanciersByPersonne", {
          params: {
            idPersonne: idPersonne,
            idSociete: this.selectedSociete ? this.selectedSociete : ''
          }
        })
        .then(response => {
          this.resultatClient = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    ajouterOperation(k){
      if(this.selectedRow.length < 1) {
         toast.error('Aucune facture sélectionnée !');
         return;
      }
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
      toast.success("Ajouté !");
      console.log('this.echeanciersRecap ', this.echeanciersRecap)
    },
    reglerOperation(recap){
      let self=this;
      console.log("recap", recap)
      //@TODO un appel axios dans une boucle n'est pas fameux ! Penser ayx async/await ?
      for (let i in recap) {
        http.post('reglerOperationsByCheque/' + this.operation.codeOperation 
                                    + '/' + recap[i].montant
                                    + '/' + recap[i].montantSelectionne
                                    , recap[i].echeances)
        .then(function (response) {
          if(i == recap.length - 1){
            self.resetModal();
            refreshOperationsEventBus.$emit('refreshOperationsATraiter');
            self.$bvModal.hide('reglementCheque');
            toast.success("Réglement par chèque efféctué avec succès!");
          }
        })
        .catch(function (error) {
           self.resetModal();
           toast.error('Erreur de réglement');
        });
      }
    },
    afficherDetailClient(k){
      this.selectedRow = [];
      console.log('k', k);
      console.log('this.inputs[k]', this.inputs[k])
      this.recupererEcheancierParClient(this.inputs[k].personne.idPersonne)
      this.tableAAfficher = k;
      //this.montantFactureTotal = 0;
    },
    recupererSocietes() {
      http
        .get("/listSociete")
        .then(response => {
          this.optionSociete = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    resetModal() {
      this.inputs = [{personne: {idPersonne: "",nomPersonne: ""},montant:''}];
      this.errors = [];
      this.selectedSociete = '';
      this.selectedRow = [];
      this.cpt = 0;
      this.echeanciersRecap.splice(0, this.echeanciersRecap.length);
      this.tableAAfficher = -1;
    },
    onRowSelected(items) {
      console.log('iteeeems', items)
      // On valorise le champ moyenPaiment
      items.forEach(element => { element.moyenPaiement = 'CHEQUE' });
      this.selectedRow = items;
      this.operationsARegler = [];
    },
    isStep1Valid(){
      this.errors = [];
      let champVide = false;
      /* Vérifier si la somme des cheques est égal au montant de l'operation */ 
      if(this.montantGlobalCheque != this.montantRepartitionCheque){
          this.errors.push("Vérfier les montants !! ");
      }
      /* Vérifier si les champs sont bien renseignés*/
      this.inputs.forEach((element) => {
        if(!element.personne.nomPersonne || !element.montant){
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
    }, 
    isStep2Valid() {
      if (typeof this.echeanciersRecap === 'undefined' || this.echeanciersRecap.length < 1) {
        toast.error('Vous n\'avez saisi aucune facture !')
        return false;
      }
      console.log('this.echeanciersRecap.length', this.echeanciersRecap.length)
      console.log('this.cpt', this.cpt)
      if(this.echeanciersRecap.length != this.cpt+1) {
        toast.error('Vous n\'avez pas saisi les factures de tous les clients!')
        return false;
      }
      return true;
    }
  },
  computed: {
    rows() {
      return this.resultatClient.length;
    },
    montantGlobalCheque() {
      return this.operation.montantDebit ? this.getValeurAbsolue(this.operation.montantDebit) : this.operation.montantCredit
    },
    montantRepartitionCheque(){
      return this.inputs.map(element => element.montant).reduce((a, b) => parseFloat(a) + parseFloat(b), 0.0).toFixed(2);
    },
    montantFactureTotal() {
      /*return this.selectedRow.reduce((accum, item) => {
        this.montantFacturesSelectionnes =  accum + item.resteAPayer;
        return this.montantFacturesSelectionnes;
      }, 0.0).toFixed(2);*/

      this.montantFacturesSelectionnes = this.calculSommeArray(this.selectedRow.map(row => row.resteAPayer));
       return this.montantFacturesSelectionnes;

    }
  },
   mounted() {
    this.recupererSocietes(); 
    this.recupererClients();
  }
};
</script>
<style scoped>
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
</style>