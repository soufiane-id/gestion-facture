<template>
    <div>

      <div v-if="!operation.montantDebit">
        <b-alert show variant="danger">Cette opération ne peut être réglé comme charge fixe.</b-alert>
      </div>

      <div v-if="operation.montantDebit">
        <b-form-select v-model="selectedCategorie" :options="options" size="sm" class="mt-3"></b-form-select>

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

      <b-button class="mt-3" variant="success" :disabled="!selectedSociete || !selectedCategorie" block @click="valider">Valider</b-button>
      </div>
        

    </div>
</template>

<script>
import http from "../../../client/http-common";
import toast from "../../../commons/toast/toast";
import {utilsMixin} from "../../../commons/utils/utilsMixin";
import { refreshOperationsEventBus } from '../../../main';

  export default {
    data() {
      return {
        selectedCategorie: null,
        listSociete: [],
        selectedSociete: null,
        options: [
          { value: null, text: 'Séléctionner une catégorie' },
          { value: 'TELEPHONE', text: 'Téléphone' },
          { value: 'SALAIRE', text: 'Salaire' },
          { value: 'AUDIGEC', text: 'AUDIGEC' },
          { value: 'GAZOIL', text: 'Gazoil' },
          { value: 'FRAIS_BANCAIRES', text: 'Frais Bancaires' },
          { value: 'CHARGES_SOCIALES', text: 'Charges Sociales' },
          { value: 'POSTE', text: 'Frais postaux' }
        ]
      };
    }, 
    methods: {
    recupererSocietes() {
      http
        .get("/listSociete")
        .then(response => {
          this.listSociete = response.data;

        })
        .catch(e => {
          console.log(e);
        });
    },
    valider() {
        this.operation.statutOperation = this.selectedCategorie;
        let dataToSend = {
            idSociete: this.selectedSociete,
            montant: this.getValeurAbsolue(this.operation.montantDebit),
            operationBancaire: this.operation
        };
        console.log("url /reglerChargesFixes/", dataToSend);
        let self = this;
        http
        .post("/reglerChargesFixes/", dataToSend)
        .then(response => {
            self.$bvModal.hide('reglementSansFacture'); // Ferme le modal parent
            refreshOperationsEventBus.$emit('refreshOperationsATraiter');
            toast.success('Charge fixe effectué avec succès !');
        })
        .catch(e => {
           toast.error('Erreur lors du Reglement !');
           console.log(e)
        });
    }
    }, 
    created() {
        this.recupererSocietes();
    },
    props: [
        "operation"
    ],
    mixins: [
      utilsMixin
    ]
  }
</script>