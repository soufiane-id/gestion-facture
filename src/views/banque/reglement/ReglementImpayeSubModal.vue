<template>
    <div>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text">Numéro facture :</span>
            </div>
            <input type="text" class="form-control" aria-label="Small" v-model="numFacture">
            <div class="input-group-append">
                <span class="input-group-btn">
                    <button class="btn btn-search" type="button" @click="trouverFacture()"><i class="fa fa-search fa-fw"></i> Chercher</button>
                </span>
            </div>
        </div>
        <div v-if="facture.length > 0">
            <b-table
            id="facture-table"
            :items="facture"
            :fields="fields"
            :per-page="perPage"
            :current-page="currentPage"
            small>
        </b-table>
        <!-- On ne peut valider que si le montant de loperation est egal au montant payé sur la facture -->
        <b-button class="mt-3" variant="success" :disabled=" operation.montantDebit * (-1) != facture[0].montantPaye" block @click="valider">Valider</b-button>
        </div>
        

    </div> 
</template>

<script>
import http from "../../../client/http-common";
import toast from "../../../commons/toast/toast";
import { refreshOperationsEventBus } from '../../../main';

export default {
 data() {
    return {
        numFacture: '',
        facture: [],
        perPage: 10,
        currentPage: 1,
        fields: [
        {
          key: "dateFacture",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "personne.nomPersonne",
          label: "Nom Client",
          sortable: true,
          class: 'text-center'
        },
        {
          key: "numeroDocument",
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
          key: "montantFacture",
          sortable: true,
          class: 'text-center'
        }
      ]
    };
},
methods: {
    trouverFacture() {
        this.facture.splice(0, this.facture.length); // On vide le résultat
        http
        .get("/getEcheanciersByDocument", {
          params: {
            numeroDocument: this.numFacture,
          }
        })
        .then(response => {
          this.facture.push(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }, 
    valider() {
        let self = this;
        http
        .post("/reglerImpaye/" + this.operation.codeOperation, this.facture[0])
        .then(response => {
            self.$bvModal.hide('reglementSansFacture'); // Ferme le modal parent
            refreshOperationsEventBus.$emit('refreshOperationsATraiter');
            toast.success('Impayé réglé avec succès !');
        })
        .catch(e => {
           toast.error('Erreur lors du Reglement !');
           console.log(e)
        });
    }
},
props: [
    "operation"
]
}
</script>


<style scoped>
html {
  margin: 40px auto;
}
.btn-search {
	  background: #0C5453;
	  border-radius: 6px;
	  color: #fff;
	  border-width: 1px;
	  border-style: solid;
	  border-color: #1c1c1c;
	}
	.btn-search:link, .btn-search:visited {
	  color: #fff;
	}
	.btn-search:active, .btn-search:hover {
	  background: #1c1c1c;
	  color: #fff;
	}
</style>