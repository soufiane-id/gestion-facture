import 'izitoast/dist/css/iziToast.min.css'
import iZtoast from 'izitoast'

const toast = {
    error: (message, title = 'Error') => {
        return iZtoast.error({
            title: title,
            timeout: 10000,
            message: message,
            position: 'topRight'
        });
    },
    success: (message, title = 'Success') => {
        return iZtoast.success({
            title: title,
            message: message,
            position: 'topRight'
        });
    }, 
    confirm: (message, callback) => {
        return iZtoast.question({
            timeout: 20000,
            close: false,
            overlay: true,
            toastOnce: true,
            message,
            id: 'question',
            zindex: 999,
            position: 'center',
            buttons: [
                ['<button>OUI</button>', function (instance, toast) {
                    if(typeof callback === 'function'){
                        callback();
                    }
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
                ['<button><b>NON</b></button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }, true]
            ]
        });
    }
};

export default toast;