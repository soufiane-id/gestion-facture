<template>
  <div>
    <b-modal
      id="addUserForm"
      ref="modal"
      title="Ajouter utilisateur"
      size="lg"
      header-bg-variant="light"
      @hidden="onReset"
      hide-footer
    >
      <b-form @submit="onSubmit" @reset="onReset">
        <!-- Nom -->
        <b-form-group id="nomUser" label="Nom:" label-for="input-2">
          <b-form-input
            id="inputNomUser"
            v-model="user.nom"
            size="sm"
            placeholder="Entrer le nom .."
            required
          ></b-form-input>
        </b-form-group>

        <!-- Prénom -->
        <b-form-group id="prenomUser" label="Prénom:" label-for="input-2">
          <b-form-input
            id="input-prenom-user"
            v-model="user.prenom"
            size="sm"
            placeholder="Entrer le prénom .."
            required
          ></b-form-input>
        </b-form-group>

        <!-- Login -->
        <b-form-group id="loginUser" label="Login:" label-for="input-2">
          <b-form-input
            id="input-login-user"
            v-model="user.username"
            size="sm"
            placeholder="Entrer le login .."
            required
          ></b-form-input>
        </b-form-group>

        <!-- Password -->
        <b-form-group id="passwordUser" label="Mot de Passe:" label-for="input-2">
          <b-form-input
            id="input-password-user"
            v-model="user.password"
            size="sm"
            placeholder="Entrer le mot de passe .."
            required
          ></b-form-input>
        </b-form-group>

        <!-- Re-Password -->
        <b-form-group id="repasswordUser" label="Confirmer Mot de Passe:" label-for="input-2">
          <b-form-input
            id="input-repassword-user"
            v-model="user.repassword"
            size="sm"
            placeholder="Confirmer le mot de passe .."
            required
          ></b-form-input>
        </b-form-group>

        <!-- Societe -->
        <b-form-group id="societeUser" label="Activé:" label-for="input-3">
          <b-form-select
            id="input-societe-user"
            v-model="user.enabled"
            size="sm"
            :options="[{value: true,text: 'Oui'}, {value: false,text: 'Non'}]"
            required
          ></b-form-select>
        </b-form-group>

        <!-- Role -->
        <b-form-group id="roleUser" label="Role:" label-for="input-3">
          <b-form-select
            id="input-role-user"
            v-model="user.nomRole"
            size="sm"
            :options="optionsRole"
            required
          ></b-form-select>
        </b-form-group>

        <div class="center-div">
          <b-button type="submit" variant="primary">Submit</b-button>
          <b-button type="reset" variant="danger">Reset</b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import http from "../../../client/http-common";

export default {
  data() {
    return {
      user: {
        nom: "",
        prenom: "",
        username: "",
        password: "",
        repassword: "",
        enabled: "",
        nomRole: "",
      },
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
    onSubmit(evt) {
      http
        .post("/register", this.user)
        .then((res) => {})
        .catch((error) => console.log(error));
      evt.preventDefault();
    },
    onReset(evt) {
      this.user = {};
    },
  },
  created() {
    this.recupererOptionsRole();
  },
};
</script>

<style>
</style>