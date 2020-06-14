<template>
  <div>
    <div v-if="operation.montantDebit">
        <b-alert show variant="danger">Cette opération ne peut être réglé comme transfert d'argent.</b-alert>
    </div>

    <b-modal
      v-else
      id="reglementTransfertArgent"
      ref="modal"
      title="Réglement"
      size="lg"
      header-bg-variant="light"
      @ok="handleOk"
    >
        <div>
          <b-form-select v-model="banqueFrom" :options="optionsBanque" size="sm" class="mt-3"></b-form-select>

          <div class="transfert-arrow">
            <font-awesome-icon icon="angle-double-down"
                v-b-tooltip.hover title="Vers" size="lg" />
          </div>
          
          <b-form-select v-model="banqueTo" :options="optionsBanque" size="sm" class="mt-3"></b-form-select>
        </div>
    </b-modal>
  </div>
</template>

<script>

import http from "../../../client/http-common";
import toast from "../../../commons/toast/toast";
import { refreshOperationsEventBus } from '../../../main';

export default {
  data() {
    return {
      banqueFrom: 2,
      banqueTo: 1,
      optionsBanque: []      
    };
  },
  methods: {
    recupererBanques() {
        http
        .get("/listBanque")
        .then(response => {
          response.data.forEach((banque) => {
            let formatResultBanque = {
              value: banque.idBanque,
              text: banque.nomBanque
            };
            this.optionsBanque.push(formatResultBanque);
          });
        })
        .catch(e => {
          console.log(e);
        });
    },
    handleOk(bvModalEvt) {
      let transfert = {
          codeOperation: this.operation.codeOperation,
          banqueFrom: this.banqueFrom,
          banqueTo: this.banqueTo,
          montant: this.operation.montantCredit
      }
      console.log("url /reglerTransfertArgent/", transfert);
      let self = this;
      http
        .post("/reglerTransfertArgent/", transfert)
        .then(response => {
            toast.success('Transfert effectué avec succès !');
            refreshOperationsEventBus.$emit('refreshOperationsATraiter');
        })
        .catch(e => {
           toast.error('Erreur dans le transfert !');
        });
    }
  },
  computed: {
    
  },
  props: [
    "operation"
  ],
  components: {
  },
  mounted() {
    this.recupererBanques();
  }
};
</script>

<style scoped>
.transfert-arrow {
    width: 0%;
    margin: 30px auto;
}
</style>