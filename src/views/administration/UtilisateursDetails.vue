<template>
  <div>
    <b-modal
      id="detailUtilisateurs"
      ref="modal"
      title="Infos utilisateur"
      size="xl"
      header-bg-variant="light"
      @ok="saveUser"
      @hidden="resetForm"
    >
      <fieldset class="block-border">
        <legend class="block-border">Informations générales</legend>
        <div class="form-group row">
          <!-- NOM -->
          <div class="row col-md-6 item-block">
            <label class="col-sm-3 col-form-label titre">Nom</label>
            <div class="col-sm-8">
              <input type="text" v-model="localUser.nom" class="form-control form-control-sm" />
            </div>
          </div>
          <!-- PRENOM -->
          <div class="row col-md-6 item-block">
            <label class="col-sm-3 col-form-label titre">Prenom</label>
            <div class="col-sm-8">
              <input type="text" v-model="localUser.prenom" class="form-control form-control-sm" />
            </div>
          </div>
          <!-- TELEPHONE FIXE -->
          <div class="row col-md-6 item-block">
            <label class="col-sm-3 col-form-label titre">Tél. Fixe</label>
            <div class="col-sm-8">
              <input type="text" class="form-control form-control-sm" />
            </div>
          </div>
          <!-- TELEPHONE MOBILE -->
          <div class="row col-md-6 item-block">
            <label class="col-sm-3 col-form-label titre">Tél. Mobile</label>
            <div class="col-sm-8">
              <input type="text" class="form-control form-control-sm" />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="block-border">
        <legend class="block-border">Gestion d'accès</legend>
        <div class="form-group row">
          <!-- USERNAME -->
          <div class="row col-md-6 item-block">
            <label class="col-sm-3 col-form-label titre">Email (login)</label>
            <div class="col-sm-8">
              <input type="text" v-model="localUser.username" class="form-control form-control-sm" />
            </div>
          </div>
          <!-- ACTIVE -->
          <div class="row col-md-6">
            <label class="col-sm-3 col-form-label titre">Activé</label>
            <div class="col-sm-8">
              <b-form-select
                size="sm"
                v-model="localUser.enabled"
                :options="optionsActivation"
                class="mt-1"
              ></b-form-select>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="block-border">
        <legend class="block-border">Roles et Visibilité</legend>
        <div class="form-group row">
          <!-- ROLES -->
          <div class="row col-md-6 item-block">
            <label class="col-sm-3 col-form-label titre">Role</label>
            <div class="col-sm-8">
              <b-form-select
                v-model="localUser.roles[0].nomRole"
                :options="optionsRole"
                size="sm"
                class="mt-1"
              ></b-form-select>
            </div>
          </div>
          <!-- VISIBILITE -->
          <div class="row col-md-6">
            <label class="col-sm-3 col-form-label titre">Visibilité</label>
            <div class="col-sm-8">
              <b-form-select
                size="sm"
                v-model="localUser"
                :options="optionsActivation"
                class="mt-1"
              ></b-form-select>
            </div>
          </div>
        </div>
      </fieldset>
    </b-modal>
  </div>
</template>

<script>
import http from "../../client/http-common";
import deepClone from "../../commons/utils/deepClone";

export default {
  props: ["user"],
  mixins: [deepClone],
  data() {
    return {
      localUser: {},
      optionsActivation: [
        { value: true, text: "Oui" },
        { value: false, text: "Non" },
      ],
      optionsRole: [],
    };
  },
  methods: {
    recupererOptionsRole() {
      if (this.$store.state.gestionUtilisateurs.roles.length < 1) {
        http
          .get("/listRoles")
          .then((response) => {
            this.$store.commit("setRoles", response.data);
            this.remplirRoles(response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        this.remplirRoles(this.$store.state.gestionUtilisateurs.roles);
      }
    },
    remplirRoles(roles) {
      for (const role of roles) {
        let elementAInserer = {
          text: role.nomRole,
          value: role.nomRole,
        };
        this.optionsRole.push(elementAInserer);
      }
    },
    saveUser() {
      http
        .post("/updateUser", this.localUser)
        .then((response) => {
          this.$store.commit("updateUser", response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    resetForm() {
      //this.user = {};
    },
  },
  created() {
    // Clone de 'user' by value pour ne pas impacter l'object d'origine.
    this.localUser = this.deep(this.user);
    this.recupererOptionsRole();

    /* Evenement lors de l'ouverture du modal ayant l'id 'detailUtilisateurs' */
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId === "detailUtilisateurs") {
        // A chaque ouverture de la popup, on rafraichi le localUser
        this.localUser = this.deep(this.user);
      }
    });
  },
};
</script>

<style>
fieldset.block-border {
  border: 1px groove #ddd !important;
  padding: 0 1.4em 1.4em 1.4em !important;
  margin: 0 0 1.5em 0 !important;
  -webkit-box-shadow: 0px 0px 0px 0px #000;
  box-shadow: 0px 0px 0px 0px #000;
}
legend.block-border {
  font-size: 1.2em !important;
  font-weight: bold !important;
  text-align: left !important;
  width: auto;
  padding: 0 10px;
  border-bottom: none;
  color: #808080d8;
}
.titre {
  font-weight: bolder;
}
.item-block {
  margin-top: 4px;
}
</style>