<template>
  <div>
    <b-modal id="detailsReglement" size="xl" hide-footer @hidden="resetModal" title="Détails de l'opération">
        <h5><strong style="text-decoration: underline;"> Factures correspondantes à cette opération : </strong></h5>
        <b-table small :fields="fields" :items="echeanciers" responsive="sm">

            <template v-slot:cell(moyenPaiement)="echeanciers">
                <b-badge :variant="getBadge(echeanciers.item.moyenPaiement)">{{echeanciers.item.moyenPaiement}}</b-badge>
            </template>
            
        <!-- <b-tfoot>
          <b-tr>
            <b-td colspan="7" variant="secondary" class="text-right">
              Total Rows: <b>5</b>
            </b-td>
          </b-tr>
        </b-tfoot> -->

        </b-table>
    </b-modal>
  </div>
</template>

<script>

import http from "../../../client/http-common";

export default {
  components: { },
  data(){
    return {
      echeanciers: [],
      fields: [
        {
          key: "dateFacture",
          class: 'text-center'
        },
        {
          key: "societe.nomSociete",
          label: "Nom Société",
          class: 'text-center'
        },
        {
          key: "personne.nomPersonne",
          label: "Nom Client",
          class: 'text-center'
          // Variant applies to the whole column, including the header and footer(https://bootstrap-vue.js.org/docs/reference/color-variants/)
          //variant: 'success'
        },
        {
          key: "numeroDocument",
          class: 'text-center'
        },
        {
          key: "montantPaye",
          class: 'text-center'
        },
        {
          key: "resteAPayer",
          class: 'text-center'
        },
        {
          key: "montantFacture",
          class: 'text-center'
        },
        {
          key: "moyenPaiement",
          class: 'text-center'
        }
      ]
    };
  },
  methods: {
    recupererFacturesParOperation() {
        http
        .get("/listEcheancierParOperation/" + this.$store.state.codeOperation)
        .then(response => {
          this.echeanciers = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    },
    resetModal() {
        // Ne rien faire pour linstant
    },
    getBadge (status) {
        return status === 'VIREMENT' ? 'success' : 'warning';
    }
  },
  computed: {
    
  },
   mounted() {
     /* Evenement lors de l'ouverture du modal ayant l'id 'detailsReglement' */
    this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
      if(modalId === 'detailsReglement'){
        this.recupererFacturesParOperation();
      }
    })
  }
};
</script>