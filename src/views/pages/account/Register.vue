<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form id="registerForm">
                  <h1>Créer votre compte</h1>
                  <p class="text-muted">Veuillez entrer vos informations</p>
                  <b-row class="form-group">
                    <b-col md="6">
                      <b-input-group prepend="Prénom" class="mb-2">
                        <b-form-input placeholder="Prénom" v-model="newUser.prenom"></b-form-input>
                      </b-input-group>
                    </b-col>
                    <b-col md="6">
                      <b-input-group prepend="Nom" class="mb-2">
                        <b-form-input placeholder="Nom" v-model="newUser.nom"></b-form-input>
                      </b-input-group>
                    </b-col>
                  </b-row>

                  <b-row class="form-group">
                    <b-col md="12">
                      <b-input-group>
                        <b-input-group-prepend>
                          <b-input-group-text>Email</b-input-group-text>
                        </b-input-group-prepend>
                        <b-form-input
                          id="email"
                          type="email"
                          placeholder="Email"
                          autocomplete="new-password"
                          v-model="newUser.username"
                        ></b-form-input>
                      </b-input-group>
                    </b-col>
                  </b-row>

                  <b-row class="form-group">
                    <b-col md="12">
                      <b-input-group>
                        <b-input-group-prepend>
                          <b-input-group-text>Password</b-input-group-text>
                        </b-input-group-prepend>
                        <b-form-input
                          id="password"
                          type="password"
                          placeholder="Password"
                          autocomplete="new-password"
                          v-model="newUser.password"
                        ></b-form-input>
                      </b-input-group>
                    </b-col>
                  </b-row>

                  <b-row class="form-group">
                    <b-col md="12">
                      <b-input-group>
                        <b-input-group-prepend>
                          <b-input-group-text>Confirm Password</b-input-group-text>
                        </b-input-group-prepend>
                        <b-form-input
                          type="password"
                          placeholder="Password"
                          autocomplete="new-password"
                          v-model="newUser.repassword"
                        ></b-form-input>
                      </b-input-group>
                    </b-col>
                  </b-row>

                  <b-row>
                    <b-col cols="6" class="text-right">
                      <router-link to="/login" class="nav-link">
                        <b-button variant="link" class="px-6">Se connecter à un compte existant</b-button>
                      </router-link>
                    </b-col>
                    <b-col cols="6">
                      <b-button variant="primary" class="px-4" @click="register">Créer</b-button>
                    </b-col>
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newUser: {
        username: "",
        password: "",
        repassword: "",
        nom: "",
        prenom: ""
      }
    };
  },
  methods: {
    register() {
      this.$store.dispatch("register", this.newUser);
    }
  }
};
</script>


<style>
</style>