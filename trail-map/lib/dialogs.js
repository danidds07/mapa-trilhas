//*******************************************************
//* Util Dialogs - dialogs.js
//*******************************************************
export const dialogs = {
    /**
     * Escape dynamic text before inserting it into an HTML message
     * @param {String} value
     * @returns {String} safe HTML text
     */
    escape(value) {
        let element = document.createElement("div");
        element.textContent = value === undefined || value === null ? "" : String(value);
        return element.innerHTML;
    },

    /**
     * Show a dialog element
     * @returns {Element} dialog element
     */
    show() {
        let dialog = document.createElement("dialog");
        dialog.onclose = () => document.body.removeChild(dialog);
        document.body.appendChild(dialog);
        dialog.showModal();
        return dialog;
    },
    
    /**
     * Show a alert screen
     * @param {String} message - message to show
     * @returns {Promise} resolve() - On close
     */
    alert(message) {
        return new Promise((resolve)=>{
            let dialog = dialogs.show();
            dialog.innerHTML = message+"<hr>";
            dialog.oncancel = (event) => {
                event.preventDefault();
                dialog.close();
                resolve();                
            };

            let confirm = document.createElement("button");
            confirm.style.fontSize = "1rem";
            confirm.innerHTML = "&#10004;";
            confirm.onclick = () => {
                dialog.close();
                resolve();
            };
            dialog.appendChild(confirm);
        });
    },
    
    /**
     * Show a confirm screen
     * @param {String} message - message to show
     * @returns {Promise} resolve(true) - Ok | resolve(false) - Cancel
     */
    confirm(message) {
        return new Promise((resolve)=>{
            let dialog = dialogs.show();
            dialog.innerHTML = message+"<hr>";
            dialog.oncancel = (event) => {
                event.preventDefault();
                dialog.close();
                resolve(false);                
            };
            let confirm = document.createElement("button");
            confirm.style.marginRight = "0.1rem";
            confirm.style.fontSize = "1rem";
            confirm.innerHTML = "&#10004;";
            confirm.onclick = () => {
                dialog.close();
                resolve(true);
            };
            dialog.appendChild(confirm);
            let cancel = document.createElement("button");
            cancel.style.marginLeft = "0.1rem";
            cancel.style.fontSize = "1rem";
            cancel.innerHTML = "&#10008;";
            cancel.onclick = () => {
                dialog.close();
                resolve(false);
            };
            dialog.appendChild(cancel);
        });
    },
    
    /**
     * Show a prompt screen
     * @param {String} message - message to show
     * @param {String} type - input type="text" | "number" | ...
     * @param {String} value - input value="value"
     * @returns {Promise} resolve(value) - Ok | resolve(null) - Cancel
     */
    prompt(message, type, value) {
        return new Promise((resolve)=>{
            message = message === undefined ? "" : message;
            type = type === undefined ? "text" : type;
            value = value === undefined ? "" : value;
            let id = "i" + new Date().getTime();
            let dialog = dialogs.show();
            let form = document.createElement("form");
            let messageElement = document.createElement("div");
            messageElement.innerHTML = message;
            let input = document.createElement("input");
            input.id = id;
            input.type = type;
            input.value = value;
            input.required = true;
            form.appendChild(messageElement);
            form.appendChild(input);
            form.appendChild(document.createElement("hr"));
            dialog.appendChild(form);
            dialog.oncancel = (event) => {
                event.preventDefault();
                dialog.close();
                resolve(null);
            };

            let confirm = document.createElement("button");
            confirm.type = "submit";
            confirm.style.marginRight = "0.1rem";
            confirm.style.fontSize = "1rem";
            confirm.innerHTML = "&#10004;";
            form.onsubmit = (event) => {
                event.preventDefault();
                dialog.close();
                resolve(input.value);
            };
            form.appendChild(confirm);
            let cancel = document.createElement("button");
            cancel.type = "button";
            cancel.style.marginLeft = "0.1rem";
            cancel.style.fontSize = "1rem";
            cancel.innerHTML = "&#10008;";
            cancel.onclick = () => {
                dialog.close();
                resolve(null);
            };
            form.appendChild(cancel);
        });
    }
    
};
