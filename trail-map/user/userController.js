import { wait } from "../lib/wait.js";
import { dialogs } from "../lib/dialogs.js";

export const userController = {
    //*******************************************************
    //* User Controller
    //*******************************************************

    /**
     * Initialize Firebase User Interface
     * @param {object} auth - Firebase auth
     * @returns {Promise} resolve() - Success | reject(error) - Fail
     */
    init(auth) {
        return new Promise(async (resolve, reject) => {
            try {
                //Load 'UI.html'
                this.html = document.createElement("span");
                this.html.innerHTML = await (await fetch("user/userUI.html")).text();

                // Initialize Firebase Authentication and get a reference to the service
                this.auth = auth;

                resolve();
            } catch(error) {
                reject("AUTH: "+error);
            }
        });
    }, //init

    /**
     * Show Login Form
     * @returns {Promise} 
     */
    showLoginForm() {
        return new Promise((resolve) => {
            let dialog = dialogs.show();
            let form = document.createElement("form");
            form.innerHTML = this.html.querySelector("#login").innerHTML;
            dialog.appendChild(form);

            form.querySelectorAll("button[type=button]")[0].onclick = () => {
                dialog.close();
                resolve();
            };
            form.querySelectorAll("button[type=button]")[1].onclick = async () => {
                dialog.close();
                await this.showNewUserForm();
                resolve();
            };
            form.querySelectorAll("button[type=button]")[2].onclick = async () => {
                let email = await dialogs.prompt("Endereço de E-mail para restauração da senha:", "email");
                if(email !== null) {
                    wait.show();
                    try{
                        await this.auth.resetPassword(email);
                        await dialogs.alert("E-mail para restauração da senha enviado para <b>"+dialogs.escape(email)+"</b>.<br>Verifique sua Caixa de Entrada e seus Spams.");
                        dialog.close();
                        resolve();
                    } catch (error) {
                        await dialogs.alert(dialogs.escape(error.message));
                    } finally {
                        wait.hide();
                    }
                }
            };

            form.onsubmit = async (event) => {
                event.preventDefault();
                
                wait.show();
                let email = form.querySelector("input[type=email]").value;
                let password = form.querySelector("input[type=password]").value;
                try{
                    await this.auth.login(email, password);
                    dialog.close();
                    resolve();
                } catch(error) {
                    await dialogs.alert(dialogs.escape(error.message));
                } finally {
                    wait.hide();
                }
            };
        });
    }, //showLoginForm

    /**
     * Show Logout Form
     * @returns {Promise}
     */
    showLogoutForm() {
        return new Promise((resolve) => {
            let dialog = dialogs.show();
            let form = document.createElement("form");
            form.innerHTML = this.html.querySelector("#logout").innerHTML;
            let user = this.auth.auth.currentUser;
            if(user !== null) {
                form.querySelector("div > div").textContent = user.displayName ? user.displayName : user.email;
                form.querySelector("div > img").src = user.photoURL ? user.photoURL : "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50%' y='52%' dominant-baseline='central' text-anchor='middle' font-size='70'>👤</text></svg>";
            }
            dialog.appendChild(form);

            form.querySelectorAll("button[type=button]")[0].onclick = () => {
                dialog.close();
                resolve();
            };
            form.querySelectorAll("button[type=button]")[1].onclick = async () => {
                if(await dialogs.confirm("Deseja sair da conta?")) {
                    wait.show();
                    try{
                        await this.auth.logout();
                        dialog.close();
                        resolve();
                    } catch(error) {
                        await dialogs.alert(dialogs.escape(error.message));
                    } finally {
                        wait.hide();
                    }
                }
            };
            form.querySelectorAll("button[type=button]")[2].onclick = async () => {
                dialog.close();
                await this.showUserProfileForm();
                resolve();
            };
            
        });
    }, //showLogoutForm

    /**
     * Show New User Form
     * @returns {Promise}
     */
    showNewUserForm() {
        return new Promise((resolve, reject) => {
            let dialog = dialogs.show();
            let form = document.createElement("form");
            form.innerHTML = this.html.querySelector("#newUser").innerHTML;
            dialog.appendChild(form);

            form.querySelectorAll("button[type=button]")[0].onclick = form.querySelectorAll("button[type=button]")[1].onclick = () => {
                dialog.close();
                resolve();
            };

            form.onsubmit = async (event) => {
                event.preventDefault();
                
                wait.show();
                let email = form.querySelector("input[type=email]").value;
                let password = form.querySelectorAll("input[type=password]")[0].value;
                let passwordConfirm = form.querySelectorAll("input[type=password]")[1].value;
                if(password === passwordConfirm) {
                    try{
                        await this.auth.createUser(email, password);
                        dialog.close();
                        resolve();
                    } catch(error) {
                        await dialogs.alert(dialogs.escape(error.message));
                    } finally {
                        wait.hide();
                    }
                } else {
                    await dialogs.alert("Senhas não conferem!");
                }
            };
        });
    }, //showNewUserForm

    /**
     * Show User Profile Form
     * @returns {Promise}
     */
    showUserProfileForm() {
        return new Promise((resolve, reject) => {
            let dialog = dialogs.show();
            let form = document.createElement("form");
            form.innerHTML = this.html.querySelector("#editUser").innerHTML;
            dialog.appendChild(form);

            let currentUser = this.auth.currentUser();
            form.querySelector("#displayName").value = currentUser.displayName ? currentUser.displayName : currentUser.email;
            form.querySelector("#photoURL").src = currentUser.photoURL ? currentUser.photoURL : ("data:image/svg+xml;base64,"+btoa(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='-5' y='80' font-size='90'>&#x1F464;</text></svg>`));

            form.querySelectorAll("button[type=button]")[0].onclick = form.querySelectorAll("button[type=button]")[2].onclick = () => {
                dialog.close();
                resolve();
            };
            form.querySelectorAll("button[type=button]")[1].onclick = async (event) => {
                let emoji = await emojicons.emojiForm();
                let photoURL = "data:image/svg+xml;base64,"+btoa(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='-.075em' y='.9em' font-size='90'>${emoji}</text></svg>`);
                form.querySelector("#photoURL").src = photoURL;
            };
            form.querySelectorAll("button[type=button]")[3].onclick = async (event) => {
                let email = await dialogs.prompt("Novo e-mail:", "email", this.auth.currentUser.email);
                if(email !== null) {
                    wait.show();
                    try{
                        await this.auth.changeEmail(email);
                        await dialogs.alert("E-mail alterado com sucesso. Sessão encerrada.<br>Autentique-se novamente");
                        dialog.close();
                        resolve();
                    } catch (error) {
                        await dialogs.alert(dialogs.escape(error.message));
                    } finally {
                        wait.hide();
                    }
                }
            };
            form.querySelectorAll("button[type=button]")[4].onclick = async (event) => {
                let password1 = await dialogs.prompt("Digite a nova senha:", "password");
                if(password1 !== null){
                    let password2 = await dialogs.prompt("Digite a senha novamente:", "password");
                    if(password2 !== null && password1 === password2) {
                        wait.show();
                        try{
                            await this.auth.changePassword(password2);
                            await dialogs.alert("Senha alterada com sucesso. Sessão encerrada.<br>Autentique-se novamente.");
                            dialog.close();
                            resolve();
                        } catch (error) {
                            await dialogs.alert(dialogs.escape(error.message));
                        } finally {
                            wait.hide();
                        }
                    } else {
                        await dialogs.alert("As senhas digitadas não conferem.");
                    }
                }
            };
            form.querySelectorAll("button[type=button]")[5].onclick = async (event) => {
                if(await dialogs.confirm("Você deseja encerrar sua conta de usuário?<br><b>ATENÇÃO:</b> Essa operação é irreversível.")){
                    wait.show();
                    try{
                        await this.auth.delUser();
                        await dialogs.alert("Conta de usuário encerrada com sucesso. Sessão encerrada.");
                        dialog.close();
                        resolve();
                    } catch (error) {
                        await dialogs.alert(dialogs.escape(error.message));
                    } finally {
                        wait.hide();
                    }
                }
            };

            form.onsubmit = async (event) => {
                event.preventDefault();
                
                wait.show();
                let displayName = form.querySelector("#displayName").value;
                let photoURL = form.querySelector("#photoURL").src;
                let profile = { displayName:displayName, photoURL:photoURL };
                try{
                    await this.auth.setUserProfile(profile);
                    dialog.close();
                    resolve();
                } catch(error) {
                    await dialogs.alert(dialogs.escape(error.message));
                } finally {
                    wait.hide();
                }
            };
            
        });
    } //showUserProfileForm 
};

//*******************************************************
//* Emoji Icon - emojicons.js
//*******************************************************
export const emojicons = {
    genders: [
        "",
        "&#8205;&#9792;&#65039;",
        "&#8205;&#9794;&#65039;"
    ],
    skinTones: [
        "",
        "&#127995;",
        "&#127996;",
        "&#127997;",
        "&#127998;",
        "&#127999;"
    ],
    models: [
        "&#x1f466;", "&#x1f467;", "&#x1f468;", "&#x1f469;", "&#x1f385;",
        "&#x1f46e;", "&#x1f470;", "&#x1f471;", "&#x1f472;", "&#x1f473;",
        "&#x1f474;", "&#x1f475;", "&#x1f476;", "&#x1f477;", "&#x1f478;",
        "&#x1f47c;", "&#x1f481;", "&#x1f482;", "&#x1f486;", "&#x1f487;",
        "&#x1f575;", "&#x1f645;", "&#x1f646;", "&#x1f647;", "&#x1f64b;",
        "&#x1f64d;", "&#x1f64e;", "&#x1f926;", "&#x1f934;", "&#x1f935;",
        "&#x1f936;", "&#x1f937;", "&#x1f939;", "&#x1f977;", "&#x1f9cf;",
        "&#x1f9d1;", "&#x1f9d2;", "&#x1f9d3;", "&#x1f9d4;", "&#x1f9d5;",
        "&#x1f9d6;", "&#x1f9d9;", "&#x1f9db;", "&#x1f9dd;", "&#x1f3c3;",
        "&#x1f3c4;", "&#x1f3c7;", "&#x1f3ca;", "&#x1f3cb;", "&#x1f3cc;",
        "&#x1f483;", "&#x1f574;", "&#x1f57a;", "&#x1f6a3;", "&#x1f6b4;",
        "&#x1f6b5;", "&#x1f6b6;", "&#x1f6c0;", "&#x1f6cc;", "&#x1f938;",
        "&#x1f93c;", "&#x1f93d;", "&#x1f93e;", "&#x1f9b8;", "&#x1f9b9;",
        "&#x1f9cd;", "&#x1f9ce;", "&#x1f9d7;", "&#x1f9d8;", "&#x1f9da;",
        "&#x1f9dc;", "&#x1f930;", "&#x1f931;", "&#x1f46b;", "&#x1f46c;",
        "&#x1f46d;", "&#x1f48f;", "&#x1f491;", "&#x1f485;", "&#x1f4aa;",
        "&#x1f590;", "&#x1f595;", "&#x1f596;", "&#x1f64c;", "&#x1f64f;",
        "&#x1f90c;", "&#x1f90f;", "&#x1f918;", "&#x1f919;", "&#x1f91a;",
        "&#x1f91b;", "&#x1f91c;", "&#x1f91d;", "&#x1f91e;", "&#x1f91f;",
        "&#x1f932;", "&#x1f933;", "&#x1f9b5;", "&#x1f9b6;", "&#x1f9bb;"
    ],
    modelsWithGender: [
        "&#x1f46e;", "&#x1f470;", "&#x1f471;", "&#x1f473;", "&#x1f477;",
        "&#x1f481;", "&#x1f482;", "&#x1f486;", "&#x1f487;", "&#x1f575;",
        "&#x1f645;", "&#x1f646;", "&#x1f647;", "&#x1f64b;", "&#x1f64d;",
        "&#x1f64e;", "&#x1f926;", "&#x1f935;", "&#x1f937;", "&#x1f939;",
        "&#x1f9cf;", "&#x1f9d4;", "&#x1f9d6;", "&#x1f9d9;", "&#x1f9db;",
        "&#x1f9dd;", "&#x1f3c3;", "&#x1f3c4;", "&#x1f3ca;", "&#x1f3cb;",
        "&#x1f3cc;", "&#x1f6a3;", "&#x1f6b4;", "&#x1f6b5;", "&#x1f6b6;",
        "&#x1f938;", "&#x1f93c;", "&#x1f93d;", "&#x1f93e;", "&#x1f9b8;",
        "&#x1f9b9;", "&#x1f9cd;", "&#x1f9ce;", "&#x1f9d7;", "&#x1f9d8;",
        "&#x1f9da;", "&#x1f9dc;"
    ],

    getEmoji(skinTone, gender, model) {
        let modelVerif = this.models[model];
        let emoji = "";
        if (this.modelsWithGender.includes(modelVerif)) {
            emoji += this.models[model] + this.skinTones[skinTone] + this.genders[gender];
        } else {
            emoji += this.models[model] + this.skinTones[skinTone];
        }
        return emoji;
    }, //getEmoji

    emojiForm(emoji) {
        return new Promise(async (resolve) => {
            emoji = (emoji === undefined) ? emojicons.getEmoji(0, 0, 0) : emoji;
            let dialog = document.createElement("dialog");
            dialog.onclose = () => {
                document.body.removeChild(dialog);
                resolve(emoji);
            };

            let form = document.createElement("form");
            form.innerHTML = userController.html.querySelector("#emojicon").innerHTML;
            form.querySelectorAll("button[type=button]")[0].onclick = () => {
                dialog.close();
            };
            let modelSel = 0;
            let models = form.querySelectorAll("div")[2];
            let refreshModel = () => {
                let skinTone = form.querySelector("input[name=skinTone]:checked");
                let gender = form.querySelector("input[name=gender]:checked");
                let options = Array.from(models.querySelectorAll("button"));
                for(let opt of options) {
                    opt.innerHTML = "<img style='width:3rem;height:3rem;' src='data:image/svg+xml;base64,"+btoa(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='-.075em' y='.9em' font-size='90'>${emojicons.getEmoji(skinTone.value, gender.value, options.indexOf(opt))}</text></svg>`)+"'>";
                }
            };
            let skinTones = Array.from(form.querySelectorAll("input[name=skinTone]"));
            for(let skinTone of skinTones){
                skinTone.onchange = () => refreshModel();
            }
            let genders = Array.from(form.querySelectorAll("input[name=gender]"));
            for(let gender of genders){
                gender.onchange = () => refreshModel();
            }
            let br = document.createElement("br");
            br.className = "brLandscape";
            for(let i = 0; i < emojicons.models.length; i++) {
                let button = document.createElement("button");
                button.type="submit";
                button.style = "font-size:2rem;";
                button.onclick = () => modelSel = i;
                models.appendChild(button);
                if((i+1) % 7 === 0) {
                    models.appendChild(br);
                    br = document.createElement("br");
                    br.className = "brLandscape";
                }
            }

            form.onsubmit = (event) => {
                event.preventDefault();
                let skinTone = form.querySelector("input[name=skinTone]:checked");
                let gender = form.querySelector("input[name=gender]:checked");
                emoji = emojicons.getEmoji(skinTone.value, gender.value, modelSel);
                dialog.close();
            };

            dialog.appendChild(form);
            document.body.appendChild(dialog);
            refreshModel();
            dialog.showModal();
        });
    } //emojiForm
};
