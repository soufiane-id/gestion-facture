export default {
    methods: {
        afficherToast(variant = null, msg){
            this.$bvToast.toast(msg, {
              title: `Message ${variant || 'default'}`,
              variant: variant,
              solid: true
            })
  }
    }
  }
