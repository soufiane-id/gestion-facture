<template>
    <div style="position:relative" v-bind:class="{'open':openSuggestion}">
        <input class="form-control" type="text" :value="value" @input="updateValue($event.target.value)"
          @keydown.enter = 'enter'
          @keydown.down = 'down'
          @keydown.up = 'up'
        >
        <ul class="dropdown-menu" style="width:100%">
            <li v-for="(suggestion, index) in matches" :key="(suggestion, index).id"
                v-bind:class="{'active': isActive(index)}"
                @click="suggestionClick(index)"
            >
              <a>{{ suggestion[filterby] }}
              </a>
            </li>
        </ul>
    </div>
</template>

<script>
export default {

  props: {

    value: {
      type: String,
      required: true
    },

    suggestions: {
      type: Array,
      required: true
    },
      filterby: {
        type: String
      }

  },

  data () {
    return {
      open: false,
      selectedItem: null,
      current: 0
    }
  },

  computed: {
    // Filtering the suggestion based on the input
    matches () {
        return this.suggestions.filter((item) =>
                 item[this.filterby].toLowerCase().includes(this.value.toLowerCase()));   
    },

    openSuggestion () {
      return this.value && 
             this.matches.length !== 0 &&
             this.open === true
    }
  },

  methods: {

    updateValue (value) {
      if (this.open === false) {
        this.open = true
        this.current = 0
      }
      this.$emit('input', value)
    },

    // When enter pressed on the input
    enter () {
      this.selectedItem = this.matches[this.current];
      this.$emit('selected', JSON.parse(JSON.stringify(this.selectedItem)));
      this.$emit('input', this.matches[this.current][this.filterby])
      this.open = false
      },

    // When up pressed while suggestions are open
    up () {
      if (this.current > 0) {
        this.current--
      }
    },

    // When up pressed while suggestions are open
    down () {
      if (this.current < this.matches.length - 1) {
        this.current++
      }
    },

    // For highlighting element
    isActive (index) {
      return index === this.current
    },

    // When one of the suggestion is clicked
    suggestionClick (index) {
      this.selectedItem = this.matches[index];
      this.$emit('selected', JSON.parse(JSON.stringify(this.selectedItem)));
      this.$emit('input', this.matches[index][this.filterby]);
      this.open = false
    }

  }

}
</script>

<style lang="scss" scoped>
@import '../assets/scss/dropdown.min.scss';
</style>