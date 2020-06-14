<template>
    <div>
      <b-tabs content-class="mt-3" vertical lazy>
        <!-- <b-form inline style="margin-bottom:20px;">
          <b-form-input type="text" size="sm" placeholder="Chercher..."></b-form-input>
        </b-form> -->
        <b-tab title="En attente de facture" active><ReglementSansFactureView /></b-tab>
        <b-tab title="Transferts d'argent"> <TransfertArgentView /> </b-tab>
        <b-tab title="Réglements charges fixes"><ReglementChargeFixeView /></b-tab>
        <b-tab title="Réglements impayés"><ReglementImpayeView /></b-tab>
        <b-tab title="Réglements validés"><ReglementValideView /> </b-tab>
      </b-tabs>
    </div>
</template>

<script>

import TransfertArgentView from './TransfertArgentView';
import ReglementSansFactureView from './ReglementSansFactureView'
import ReglementValideView from './ReglementValideView'
import ReglementChargeFixeView from './ReglementChargeFixeView'
import ReglementImpayeView from './ReglementImpayeView'

export default {
    data() {
        return {

        };
    }, 
    methods: {

    },
    computed: {
        
    },
    components: {
       TransfertArgentView, ReglementSansFactureView, ReglementValideView, ReglementChargeFixeView, ReglementImpayeView
    }
}
</script>