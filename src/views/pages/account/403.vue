<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">403</h1>
            <h4 class="pt-3">Oops! Pas question de vous laisser passer.</h4>
            <p class="text-muted">La page que vous demandez ne vous est pas autorisée...</p>
          </div>
        </b-col>
      </b-row>
      <b-row class="justify-content-center">
        <b-col md="2">
          <b-input-group>
            <b-button href="/accueil" variant="info">Revenir en lieu sûr</b-button>
          </b-input-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>