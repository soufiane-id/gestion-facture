<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form id="loginForm">
                  <h1>Connexion</h1>
                  <p class="text-muted">Veuillez entrer vos identifiants</p>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend>
                      <b-input-group-text>
                        <i class="icon-user"></i>
                      </b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      id="username"
                      type="text"
                      class="form-control"
                      placeholder="Username"
                      autocomplete="username email"
                      v-model="user.username"
                    />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend>
                      <b-input-group-text>
                        <i class="icon-lock"></i>
                      </b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input
                      id="password"
                      type="password"
                      class="form-control"
                      placeholder="Password"
                      autocomplete="current-password"
                      v-model="user.password"
                    />
                  </b-input-group>
                  <b-row>
                    <b-col cols="6" class="text-right">
                      <router-link to="/register" class="nav-link">
                        <b-button variant="link" class="px-6">Créer un compte</b-button>
                      </router-link>
                    </b-col>
                    <b-col cols="6">
                      <b-button variant="primary" class="px-4" @click="tryLogin">Se conneter</b-button>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col cols="12" class="form-group" style="padding-top: 20px;">
                      <div v-show="message" class="alert alert-danger" role="alert">{{message}}</div>
                    </b-col>
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
            <!-- <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <h2>Inscription</h2>
                  <p>Vous n'avez pas encore de compte ? Créez-en un !</p>
                  <b-button variant="primary" class="active mt-3">Créer!</b-button>
                </div>
              </b-card-body>
            </b-card>-->
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { authenticationService } from "../../../_services/authentication.service";

export default {
  data() {
    return {
      user: {
        username: "",
        password: ""
      }
    };
  },
  methods: {
    tryLogin() {
      authenticationService.login(this.user);
    }
  },
  computed: {
    message() {
      return this.$store.state.auth.erreurAuth;
    }
  }
};
</script>
