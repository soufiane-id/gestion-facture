<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <div class="container">
        <img
          style="float:left; width:30px"
          src="../../src/assets/avatars/souf.jpg"
          class="img-avatar"
          alt="admin@bootstrapmaster.com"
        />
        <div style="margin-left: 30px">
          <h6>
            <span>
              <b>{{userName}}</b>
            </span>
            <br />
            <span>{{userRoles}}</span>
          </h6>
        </div>
      </div>
    </template>\
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center">
        <strong>Account</strong>
      </b-dropdown-header>
      <b-dropdown-item>
        <i class="fa fa-bell-o" /> Updates
        <b-badge variant="info">{{ itemsCount }}</b-badge>
      </b-dropdown-item>
      <b-dropdown-item>
        <i class="fa fa-envelope-o" /> Messages
        <b-badge variant="success">{{ itemsCount }}</b-badge>
      </b-dropdown-item>
      <b-dropdown-item>
        <i class="fa fa-tasks" /> Tasks
        <b-badge variant="danger">{{ itemsCount }}</b-badge>
      </b-dropdown-item>
      <b-dropdown-item>
        <i class="fa fa-comments" /> Comments
        <b-badge variant="warning">{{ itemsCount }}</b-badge>
      </b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center">
        <strong>Settings</strong>
      </b-dropdown-header>
      <b-dropdown-item>
        <i class="fa fa-user" /> Profile
      </b-dropdown-item>
      <b-dropdown-item>
        <i class="fa fa-wrench" /> Settings
      </b-dropdown-item>
      <b-dropdown-item>
        <i class="fa fa-usd" /> Payments
        <b-badge variant="secondary">{{ itemsCount }}</b-badge>
      </b-dropdown-item>
      <b-dropdown-item>
        <i class="fa fa-file" /> Projects
        <b-badge variant="primary">{{ itemsCount }}</b-badge>
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item>
        <i class="fa fa-shield" /> Lock Account
      </b-dropdown-item>
      <b-dropdown-item @click="onLogout">
        <i class="fa fa-lock" /> Logout
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from "@coreui/vue";
import { authenticationService } from "../_services/authentication.service";

export default {
  name: "DefaultHeaderDropdownAccnt",
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return { itemsCount: 42, userName: null, userRoles: null };
  },
  methods: {
    onLogout() {
      authenticationService.logout();
      this.$router.push("/login");
    }
  },
  created() {
    this.subscription = authenticationService.currentUser.subscribe(
      userInfo => {
        let obj = JSON.parse(localStorage.getItem("userInfo"));
        this.userName = obj.nom + " " + obj.prenom;
        this.userRoles = obj.roles.toString();
      }
    );
  },
  beforeDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }
};
</script>
