
import moment from 'moment'

export const utilsMixin = {
    methods: {
        getValeurAbsolue(nombre) {
            if(nombre < 0){
              return nombre * -1;
            }
            return nombre;
          },
          /**
           * Calcul la somme des valeurs du tableau @param array
           */
        calculSommeArray(array) {
            return Number(array.reduce((a,c)=>this.toNumber(a)+this.toNumber(c), 0)).toFixed(2);
          },
          /**  
            * Si le montant est null ou undefined ou NaN
            *  return 0
           */
        toNumber(obj){
            return obj ? obj : 0;
          },
        getWeekNumber(d) {
            // Copy date so don't modify original
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            // Set to nearest Thursday: current date + 4 - current day number
            // Make Sunday's day number 7
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
            // Get first day of year
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            // Calculate full weeks to nearest Thursday
            var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
            // Return array of year and week number
            return [d.getUTCFullYear(), weekNo];
          },
          /**
           * Determine si une date appartient à la semaine actuelle. 
           * Si la date est nulle, on return true
           * @param {*} date 
           */
          isDateWithinCurrentweek(date) {
            if(date == null) {
              return true;
            }
            var inputDate = moment(date).add(12, 'hours');
            var startOfWeek = moment().startOf('isoWeek').toDate();
            var endOfWeek   = moment().endOf('isoWeek').toDate();

            if(startOfWeek < inputDate && inputDate < endOfWeek) {
              return true;
            }
            return false;
          }
    }
}