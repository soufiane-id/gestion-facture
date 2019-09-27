<template>
  <b-table :items="items" :fields="fields" v-model="visibleRows" foot-clone>
    <template slot="FOOT_a" >
      {{ aTotal }}
    </template>
    <template slot="FOOT_b" >
      {{ bTotal }}
    </template>
  </b-table>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { a: 1, b: 2 },
        { a: 3, b: 4 },
        { a: 1.5, b: 3 }
      ],
      fields: ['a', 'b'],
      // b-table will populate this array with the visible rows in the table
      visibleRows: []
    }
  },
  computed: {
    aTotal() {
      console.log(this.visibleRows)
      return this.visibleRows.reduce((accum, item) => { return accum + item.a }, 0.0)
    },
    bTotal() {
      return this.visibleRows.reduce((accum, item) => { return accum + item.b }, 0.0)
    }
  }
}
</script>