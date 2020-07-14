<template>
  <div>
    <b-table-simple hover small caption-top responsive class="tableFixHead" bordered>
      <b-thead head-variant="dark">
        <b-tr>
          <b-th scope="col" class="text-center">Catégorie</b-th>
          <b-th scope="col" class="text-center">Nom Client</b-th>
          <b-th scope="col" class="text-center">Solde</b-th>
          <b-th scope="col" class="text-center">Retard</b-th>
          <b-th scope="col" class="text-center">S-2</b-th>
          <b-th scope="col" class="text-center">S-1</b-th>
          <b-th scope="col" class="text-center">S</b-th>
          <!-- <b-th scope="col">Achats</b-th>
          <b-th scope="col">Payé</b-th>-->
          <b-th scope="col" class="text-center">Note Client</b-th>
        </b-tr>
      </b-thead>
      <b-tbody v-for="(category, k) in getAllData" :key="k">
        <!-- Clients Dangereux -->
        <b-th
          v-if="category.length > 0"
          :rowspan="category.length + 1"
          class="text-center"
        >{{ category[0].noteClient.libelle }}</b-th>
        <b-tr
          v-for="client in category"
          :class="getRowVariant(client.noteClient.degre)"
          :key="client.nomClient"
        >
          <b-td class="text-center" style="font-family: 'Lucida Console'">
            {{ client.nomClient }}
            <!-- <b-badge v-if="client.seuil && client.seuil > 0" variant="danger">
              {{
              client.seuil
              }}
            </b-badge>-->
          </b-td>
          <b-td class="text-center">
            <strong>{{ client.montantSolde }}</strong>
          </b-td>
          <b-td class="text-center">{{ client.retard }}</b-td>
          <b-td class="text-center">{{ client.montantSemaine_2 }}</b-td>
          <b-td class="text-center">{{ client.montantSemaine_1 }}</b-td>
          <b-td class="text-center">{{ client.montantSemaineEnCours }}</b-td>
          <!-- <b-td>{{ client.montantAchatsSemaineEnCours }}</b-td>
          <b-td>{{ client.montantPayeSemaineEnCours }}</b-td>-->
          <b-td class="text-center">
            <b-badge
              :variant="getBadge(client.noteClient.degre)"
              @click="valoriserClient(client.nomClient)"
              v-b-modal="'historiqueNotes'"
            >{{ client.noteClient.libelle }}</b-badge>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
    <historique-notes />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import historiqueNotes from "./HistoriqueNotes";

export default {
  components: {
    historiqueNotes
  },
  data() {
    return {};
  },
  methods: {
    valoriserClient(client) {
      this.$store.commit("updateClientHistorique", client);
    },
    getRowVariant(degre) {
      return degre == 1
        ? "table-danger"
        : degre == 2
        ? "table-warning"
        : degre == 3 || degre == 4 || degre == 5
        ? "table-primary"
        : degre == 6 || degre == 7 || degre == 8 || degre == 9
        ? "table-success"
        : "table-secondary";
    },
    getBadge(degre) {
      return degre == 1
        ? "danger"
        : degre == 2
        ? "warning"
        : degre == 3 || degre == 4 || degre == 5
        ? "primary"
        : degre == 6 || degre == 7 || degre == 8 || degre == 9
        ? "success"
        : "secondary";
    }
  },
  computed: {
    ...mapGetters(["getAllData"])
  },
  props: ["dateSuiviClient"]
};
</script>

<style scoped>
.tableFixHead {
  overflow-y: auto;
  height: 80vh;
}
.tableFixHead thead th {
  position: sticky;
  top: 0;
}
</style>
