export default {
    methods: {
        /**
         * Clone en profondeur l'object reçu  (Array ou Object)
         */
        deep(value) {
            if (typeof value !== 'object' || value === null) {
                return value
            }
            if (Array.isArray(value)) {
                return this.deepArray(value)
            }
            return this.deepObject(value)
        },

        deepObject(source) {
            const result = {}
            Object.keys(source).forEach((key) => {
                const value = source[key]
                result[key] = this.deep(value)
            }, {})
            return result
        },

        deepArray(collection) {
            return collection.map((value) => {
                return this.deep(value)
            })
        }

    }
}