import http from "../../client/http-common";
import toast from "../../commons/toast/toast";

export default {
    methods: {
        getEcheancesParMontantFacture(montantsArray, cible, personneId, callback){
            if(typeof montantsArray === 'undefined' || montantsArray.length == 0){
                toast.error('il n\'y a pas d\'echeances !');
                return;
            }
            let result = this.getSubsetsThatSumTo(montantsArray,Number(cible));
            if (typeof result === 'undefined' || result.length == 0) {
                toast.error('Pas de solution !!');
                return;
            }
            if(result.length > 1){
                toast.error('Il y a plusieurs solutions. Veuillez affiner le montant total !');
                return;
            }  
          http
            .get("/getEcheanciersByMontants/" + result + '/' 
                + personneId)
            .then(response => {
                if(typeof callback === 'function'){
                    callback(response.data);
                }
              
            })
            .catch(e => {
              console.log(e);
            });
        },
        getSubsetsThatSumTo(numbers, target) {
            let wheel = [0];
            let resultsCount = 0;
            let sum = 0;
            let result = [];

            const start = new Date();
            do {
                sum = this.incrementWheel(0, sum, numbers, wheel);
                //Use subtraction comparison due to javascript float imprecision
                if (sum != null && Math.abs(target - sum) < 0.000001) {
                    //Found a subset. Display the result.
                    result.push(numbers.filter(function(num, index) {
                        return wheel[index] === 1;
                    }));
                    console.log(numbers.filter(function(num, index) {
                        return wheel[index] === 1;
                    }).join(' + ') + ' = ' + target);
                    resultsCount++;
                }
            } while (sum != null);
            const end = new Date();

            console.log('--------------------------');
            console.log(`Processed ${numbers.length} numbers in ${(end - start) / 1000} seconds (${resultsCount} results)`);
            console.log('--------------------------');

            return result;
        }, 
        incrementWheel(position, sum, numbers, wheel) {
            if (position === numbers.length || sum === null) {
                return null;
            }
            wheel[position]++;
            if (wheel[position] === 2) {
                wheel[position] = 0;
                sum -= numbers[position];
                if (wheel.length < position + 2) {
                    wheel.push(0);
                }
                sum = this.incrementWheel(position + 1, sum, numbers, wheel);
            }
            else {
                sum += numbers[position];
            }
            return sum;
        }, 
        /**
         * @deprecated Since version 1.0. Will be deleted in version 3.0. Use bar instead.
        */
       getSubsets(array, sum) {
        console.log('array', array)
        console.log('sum', sum)
        function fork(i = 0, s = 0, t = []) {
        if (Number(s).toFixed(2) === sum.toFixed(2)) {
            result.push(t);
            return;
        }
        if (i === array.length) {
            return;
        }
        //if (s + array[i] <= sum) { // shout circuit for positive numbers only
            fork(i + 1, (+parseFloat(s).toFixed(2) + +parseFloat(array[i]).toFixed(2)).toFixed(2), t.concat(Number(array[i]).toFixed(2)));
        //}
        fork(i + 1, s, t);
    }

        var result = [];
        fork();
        return result;
    }
    }
  }