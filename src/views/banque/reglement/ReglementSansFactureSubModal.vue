<template>
    <div>
      <!-- Societe -->
      <b-form-group id="input-group-3" label="Societe:" label-for="input-3">
        <b-form-select
          id="input-3"
          size="sm"
          v-model="selectedSociete"
          :options="listSociete"
          value-field="idSociete"
          text-field="nomSociete"
          required
        ></b-form-select>
      </b-form-group>

      <!-- Nom Client AutoComplete-->
      <div v-if="operation.montantCredit">
        <span><strong>Nom Client : </strong></span>
        <Autocomplete :suggestions="listClient" 
              filterby="nomPersonne"
              v-model="autoCompleteModel"
              @selected="clientSelected">
        </Autocomplete>
      </div>

      <div v-if="client.nomPersonne">
      <h6 style="margin-top:20px;"> Vous êtes sur le point de créer une différence de Réglement ayant les informations suivantes : </h6>
      <b-card
        border-variant="warning"
        header="Détails différence de réglement"
        header-bg-variant="transparent"
        align="center"
        style="margin:auto; max-width: 300px;"
      >
        <b-card-text>
          <li><b>Nom société :</b> {{listSociete.find(soc => soc.idSociete == selectedSociete).nomSociete}} </li>
          <li><b>Nom client :</b> {{client.nomPersonne}} </li>
          <li><b>Montant Facture :</b> {{operation.montantCredit}} </li>
          <li><b>Date Echeance :</b> {{operation.dateOperation}} </li>
        </b-card-text>
      </b-card>
      </div>

      <b-button class="mt-3" variant="success" :disabled="!selectedSociete || !client.nomPersonne" block @click="handleOk">Valider</b-button>

    </div>
</template>

<script>

import http from "../../../client/http-common";
import Autocomplete from "../../../commons/AutoComplete2";
import toast from "../../../commons/toast/toast";

import { refreshOperationsEventBus } from '../../../main';

export default {
    data() {
        return {
        autoCompleteModel:'', // Dette technique ! 
        listClient: [],
        client: {},
        listSociete: [],
        selectedSociete: {}
        };
    },
    components: {
        Autocomplete
    },
    methods: {
    handleOk() {
        let dataToSend = {
            idClient: this.client.idPersonne,
            idSociete: this.selectedSociete,
            montantFacture: this.operation.montantCredit,
            operationBancaire: this.operation
        };
        console.log("url /reglerSansFacture/", dataToSend);
        let self = this;
        http
        .post("/reglerSansFacture/", dataToSend)
        .then(response => {
            self.$bvModal.hide('reglementSansFacture'); // Ferme le modal parent
            refreshOperationsEventBus.$emit('refreshOperationsATraiter');
            toast.success('Reglement sans facture effectué avec succès !');
        })
        .catch(e => {
           toast.error('Erreur lors du Reglement !');
           console.log(e)
        });
    },
    recupererClients() {
      http
          .get("/listClient")
          .then(response => {
            this.listClient = response.data;
          })
          .catch(e => {
            console.log(e);
          });
    },
    clientSelected(client) {
        console.log('client', client)
      this.client = client;
    },
    recupererSocietes() {
      http
        .get("/listSociete")
        .then(response => {
          this.listSociete = response.data;

        })
        .catch(e => {
          console.log(e);
        });
    }
    }, 
    created() {
        this.recupererClients();
        this.recupererSocietes();
    },
    props: [
        "operation"
    ]
}
</script>

<style scoped>

</style>