<template>
  <div>
    <b-table striped hover :items="banques" :fields="fields"></b-table>
  </div>
</template>

<script>
import http from "../../client/http-common";

  export default {
    data() {
      return {
        banques: [],
        fields: [
          {
            key: 'nomBanque',
            variant: 'info'
          },
          {
            key: 'soldeCredit',
            variant: 'success'
          },
          {
            key: 'soldeDebit',
            variant: 'danger'
          }
        ]
      }
    }, methods: {
        recupererDonneesBanques() {
      http
        .get("/listBanque")
        .then(response => {
          this.banques = response.data;
        })
        .catch(e => {
          console.log(e);
        });
    }
    }, 
    created(){
        this.recupererDonneesBanques();
    }
  }
</script>