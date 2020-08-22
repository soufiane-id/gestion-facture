<template>
  <div>
    <b-modal
      id="addRoleForm"
      ref="modal"
      title="Ajouter role"
      size="lg"
      header-bg-variant="light"
      @hidden="onReset"
      hide-footer
    >
      <b-form @submit="onSubmit" @reset="onReset">
        <!-- Nom -->
        <b-form-group id="nomRole" label="Nom:" label-for="input-2">
          <b-form-input
            id="input-nom-role"
            v-model="nomRole"
            size="sm"
            placeholder="Entrer le nom .."
            required
          ></b-form-input>
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
      nomRole: "",
    };
  },
  methods: {
    onSubmit(evt) {
      http
        .post("/role", this.nomRole)
        .then((res) => {})
        .catch((error) => console.log(error));
      evt.preventDefault();
    },
    onReset(evt) {
      this.nomRole = "";
    },
  },
  created() {},
};
</script>

<style>
</style>