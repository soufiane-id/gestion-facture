<template>
    <div>
        <div>
            <span v-show="!edit" 
            @click="toggleEdit(this)" >{{value}}</span>
            
            <input type="text"
                class="input form-control"
                ref="input"
                v-model="changedValue"
                v-show="edit"
                @blur="saveEdit(changedValue)"
                v-on:keyup.enter="$event.target.blur()"> <br>
        </div>
    </div>
</template>

<script>
export default {
    data() {
      return {
          edit: false,
          changedValue: ''
      }
    }, 
    props:['value'],
    methods: {
    toggleEdit: function(){
        this.edit = true;
        this.changedValue  = this.value
        // Focus input field
        this.$nextTick(function () {
            this.$refs.input.focus();
        })
    },
    saveEdit: function(newValue){
        console.log('value to save ', newValue);
        this.edit = false;
        this.$emit('update', newValue);
        this.changedValue=''
    }
    }
}
</script>

<style scoped>
.input {
    margin: auto;
    max-width: 90px;
    max-height: 20px;
}
</style>