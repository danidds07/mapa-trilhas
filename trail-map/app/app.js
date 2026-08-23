import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
import { firebase } from "../lib/firebase.js";
import { userController } from "../user/userController.js";
import { wait } from "../lib/wait.js";
import { firestore } from "../lib/firestore.js";
import { dialogs } from "../lib/dialogs.js";

/* Javascript - app/app.js */
export const app = {

    verticesTrilha: [],
    linhaTrilha: null,
    mapeando: false,
    currentZoom: 17,
    lastCoordsLoaded: null,
    lastTrilhasLoadTime: 0,
    distanciaTotal: 0,
    seguindoPlayer: true,

    /**
     * Init controller
     */
    async init() {
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBJD_5IDTtkmF1J7CNgUgFD4hqKCgs9oMs",
            authDomain: "trilhasapp2024.firebaseapp.com",
            projectId: "trilhasapp2024",
            storageBucket: "trilhasapp2024.appspot.com",
            messagingSenderId: "108150164761",
            appId: "1:108150164761:web:74e406ad0458e1e3798988"
        };

        // **** Start Initialize app ****
        try {
            wait.show();

            //Firebase initialization
            this.firebase = firebase;
            await this.firebase.init(firebaseConfig);

            //Initialize controllers
            await userController.init(this.firebase.auth);

            //Load 'app.html'
            let html = document.createElement("div");
            html.innerHTML = await (await fetch("app/app.html")).text();

            //Add HTML elements from 'app.html'
            this.bMenu = html.querySelector("#bMenu");
            this.menuBackdrop = html.querySelector("#menuBackdrop");
            this.bEncerra = html.querySelector("#bEncerra");
            this.menu = html.querySelector("#menu");
            this.userMenu = html.querySelector("#userMenu");
            this.map = html.querySelector("#mapa");
            this.gravandoBadge = html.querySelector("#gravandoBadge");
            this.distanciaPercorrida = html.querySelector("#distanciaPercorrida");
            this.bCentralizar = html.querySelector("#bCentralizar");

            document.body.appendChild(this.map);
            document.body.appendChild(this.menuBackdrop);
            document.body.appendChild(this.userMenu);
            document.body.appendChild(this.bMenu);
            document.body.appendChild(this.gravandoBadge);
            document.body.appendChild(this.bCentralizar);
            document.body.appendChild(this.bEncerra);
            document.body.appendChild(this.menu);

            this.bEncerra.style.display = "none";
            this.menu.style.display = "none";
            this.bCentralizar.style.display = "none";

            //Função para abrir/fechar o menu lateral com backdrop
            this.toggleMenu = (abrir) => {
                const aberto = (abrir !== undefined) ? abrir : (this.menu.style.display === "none");
                this.menu.style.display = aberto ? "block" : "none";
                this.menuBackdrop.style.display = aberto ? "block" : "none";
            };

            //Botão menu e backdrop
            this.bMenu.onclick = () => this.toggleMenu();
            this.menuBackdrop.onclick = () => this.toggleMenu(false);

            //Botão de centralizar no jogador
            this.bCentralizar.onclick = () => {
                this.seguindoPlayer = true;
                this.bCentralizar.style.display = "none";
                const pos = this.player.getLatLng();
                if (pos.lat !== 0 || pos.lng !== 0) {
                    this.mapa.setView(pos, this.currentZoom);
                }
            };

            //Botão p/ iniciar o mapeamento da trilha
            this.btnNovaTrilha = this.menu.querySelectorAll("button")[0];
            this.btnNovaTrilha.onclick = async () => {
                //Verifica se o usuário está logado
                if (this.firebase.auth.currentUser() === null) {
                    this.toggleMenu(false);
                    await dialogs.alert("Para criar e gravar trilhas, é necessário estar logado.<br>Por favor, faça login ou crie uma conta!");
                    await userController.showLoginForm();
                    return;
                }

                if (await dialogs.confirm("Deseja iniciar o mapeamento de uma nova trilha?<br><small style='color:#555;'>Você pode caminhar ou clicar no mapa para registrar os pontos.</small>")) {
                    this.toggleMenu(false);
                    this.btnNovaTrilha.style.display = "none";
                    this.bEncerra.style.display = "block";
                    this.gravandoBadge.style.display = "flex";
                    this.distanciaTotal = 0;
                    this.distanciaPercorrida.innerText = "0 m";
                    this.mapeando = true;
                    if (this.linhaTrilha !== null) {
                        this.mapa.removeLayer(this.linhaTrilha);
                        this.linhaTrilha = null;
                    }
                    this.verticesTrilha = [];
                    const playerPos = this.player.getLatLng();
                    if (playerPos.lat !== 0 || playerPos.lng !== 0) {
                        this.verticesTrilha.push(playerPos);
                    }
                }
            };

            //Botão p/ encerrar o mapeamento da trilha
            this.bEncerra.onclick = async () => {
                if (this.verticesTrilha.length >= 2) {
                    let titulo = await dialogs.prompt("Digite um título para a trilha:", "text");
                    titulo = titulo === null ? null : titulo.trim();
                    if (titulo !== null && titulo.length > 100) {
                        await dialogs.alert("O título deve ter no máximo 100 caracteres.");
                    } else if (titulo !== null && titulo !== "") {
                        wait.show();
                        try {
                            let medLat = 0;
                            let medLng = 0;
                            for (let i = 0; i < this.verticesTrilha.length; i++) {
                                medLat += this.verticesTrilha[i].lat;
                                medLng += this.verticesTrilha[i].lng;
                            }
                            medLat /= this.verticesTrilha.length;
                            medLng /= this.verticesTrilha.length;

                            let currentUser = this.firebase.auth.currentUser();
                            let data = {
                                titulo: titulo,
                                lat: Number(medLat.toFixed(6)),
                                lng: Number(medLng.toFixed(6)),
                                vertices: JSON.stringify(this.verticesTrilha),
                                userId: currentUser.uid,
                                createdAt: new Date().toISOString()
                            };
                            await firestore.add("trilha", data);
                            await dialogs.alert("A trilha <b>" + dialogs.escape(titulo) + "</b> foi gravada com sucesso!");
                            await this.getTrilhas();
                        } catch (err) {
                            await dialogs.alert("Erro ao gravar a trilha: " + dialogs.escape(err.message || err));
                        } finally {
                            wait.hide();
                        }
                    }
                    // Limpa o traçado azul temporário do mapa e reseta os vértices
                    if (this.linhaTrilha !== null) {
                        this.mapa.removeLayer(this.linhaTrilha);
                        this.linhaTrilha = null;
                    }
                    this.verticesTrilha = [];
                    this.btnNovaTrilha.style.display = "block";
                    this.bEncerra.style.display = "none";
                    this.gravandoBadge.style.display = "none";
                    this.distanciaTotal = 0;
                    this.mapeando = false;
                } else {
                    if (!await dialogs.confirm("A trilha precisa de pelo menos 2 pontos registrados.<br><br>Deseja continuar mapeando (clique no mapa ou caminhe para adicionar pontos)?")) {
                        if (this.linhaTrilha !== null) {
                            this.mapa.removeLayer(this.linhaTrilha);
                            this.linhaTrilha = null;
                            this.verticesTrilha = [];
                        }
                        this.btnNovaTrilha.style.display = "block";
                        this.bEncerra.style.display = "none";
                        this.gravandoBadge.style.display = "none";
                        this.distanciaTotal = 0;
                        this.mapeando = false;
                    }
                }
            };

            //Button login / logout
            this.userMenu.querySelector("button").onclick = async () => {
                if (this.firebase.auth.currentUser() === null) {
                    await userController.showLoginForm();
                } else {
                    await userController.showLogoutForm();
                }
                this.refreshMenu();
            };

            //Function on firebase authentication state changed
            this.firebase.auth.authStateChanged(() => {
                this.refreshMenu();
                if (this.player) this.getTrilhas();
            });

            //Inicia o mapa com limites corretos de zoom para o OpenTopoMap
            this.mapa = L.map('mapa', { 
                zoomControl: false, 
                attributionControl: true,
                minZoom: 10,
                maxZoom: 17
            });
            //Posiciona os botões de zoom no canto inferior esquerdo
            L.control.zoom({ position: 'bottomleft' }).addTo(this.mapa);

            //Define a camada OpenTopoMap
            const tiles = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                minZoom: 10,
                maxZoom: 17,
                subdomains: ['a', 'b', 'c'],
                attribution: '© OpenTopoMap (CC-BY-SA)'
            });
            tiles.addTo(this.mapa);

            //Clique no mapa: fecha menu ou adiciona ponto se estiver mapeando
            this.mapa.on("click", (evt) => {
                if (this.menu.style.display !== "none") {
                    this.toggleMenu(false);
                    return;
                }
                if (this.mapeando) {
                    this.adicionarPontoTrilha(evt.latlng);
                }
            });

            //Quando o usuário arrasta o mapa manualmente, desativa o seguimento automático
            this.mapa.on("dragstart", () => {
                this.seguindoPlayer = false;
                this.bCentralizar.style.display = "flex";
            });

            //Define a posição do mapa pela geolocalização
            this.mapa.locate({ watch: true, enableHighAccuracy: true });

            //Marcador do jogador customizado com ícone de bússola
            const playerIcon = L.divIcon({
                className: 'player-icon-wrapper',
                html: '<div class="player-marker">🧭</div>',
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -20]
            });
            this.player = new L.Marker([0, 0], { icon: playerIcon });
            this.player.addTo(this.mapa);

            //Ao finalizar o zoom 
            this.mapa.on("zoomend", () => {
                this.currentZoom = Math.min(Math.max(this.mapa.getZoom(), 10), 17);
            });

            //Tratamento de erro caso geolocalização seja negada ou falhe
            this.mapa.on("locationerror", (err) => {
                console.warn("Geolocalização indisponível:", err.message);
            });

            //Atualiza a posição do marcador player
            this.mapa.on("locationfound", (evt) => {
                if (this.seguindoPlayer) {
                    this.mapa.setView(evt.latlng, this.currentZoom);
                }
                this.player.setLatLng(evt.latlng);

                let latDir = evt.latlng.lat === 0 ? "" : evt.latlng.lat > 0 ? "N" : "S";
                let latDeg = Math.abs(evt.latlng.lat);
                let latMin = (latDeg - parseInt(latDeg)) * 60;
                let latSec = (latMin - parseInt(latMin)) * 60;
                latDeg = parseInt(latDeg);
                latMin = parseInt(latMin);
                latSec = latSec.toLocaleString(window.navigator.language, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                let lngDir = evt.latlng.lng === 0 ? "" : evt.latlng.lng > 0 ? "E" : "W";
                let lngDeg = Math.abs(evt.latlng.lng);
                let lngMin = (lngDeg - parseInt(lngDeg)) * 60;
                let lngSec = (lngMin - parseInt(lngMin)) * 60;
                lngDeg = parseInt(lngDeg);
                lngMin = parseInt(lngMin);
                lngSec = lngSec.toLocaleString(window.navigator.language, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                this.player.bindPopup(`<table>
                                <tr><td><b>Latitude decimal: </b> <td>${evt.latlng.lat.toLocaleString(window.navigator.language, { maximumFractionDigits: 5, minimumFractionDigits: 5 })}<br>
                                <tr><td><b>Longitude decimal: </b><td>${evt.latlng.lng.toLocaleString(window.navigator.language, { maximumFractionDigits: 5, minimumFractionDigits: 5 })}<br>
                    
                                <tr><td><b>Latitude graus: </b> <td>${latDeg}°${latMin}'${latSec}'' ${latDir}<br>
                                <tr><td><b>Longitude graus: </b><td>${lngDeg}°${lngMin}'${lngSec}'' ${lngDir}<br>
                            </table>`);

                //Mapeamento automático via GPS em movimento (>= 3m)
                if (this.mapeando && (this.verticesTrilha.length === 0 || evt.latlng.distanceTo(this.verticesTrilha[this.verticesTrilha.length - 1]) >= 3)) {
                    this.adicionarPontoTrilha(evt.latlng);
                }
                
                //Só recarrega trilhas se o jogador se moveu mais de 50 metros ou passou mais de 30s
                const now = Date.now();
                if (!this.lastCoordsLoaded || evt.latlng.distanceTo(this.lastCoordsLoaded) >= 50 || (now - this.lastTrilhasLoadTime > 30000)) {
                    this.lastCoordsLoaded = evt.latlng;
                    this.lastTrilhasLoadTime = now;
                    this.getTrilhas();
                }
            });

        } catch (error) {
            alert(error);
        } finally {
            wait.hide();
        }
        // **** End Initialize app ****
    }, //init

    adicionarPontoTrilha(latlng) {
        if (this.verticesTrilha.length > 0) {
            const distSeg = latlng.distanceTo(this.verticesTrilha[this.verticesTrilha.length - 1]);
            this.distanciaTotal += distSeg;
            const distStr = this.distanciaTotal >= 1000 
                ? (this.distanciaTotal / 1000).toFixed(2) + " km" 
                : Math.round(this.distanciaTotal) + " m";
            this.distanciaPercorrida.innerText = distStr;
        }
        this.verticesTrilha.push(latlng);
        if (this.linhaTrilha !== null) this.mapa.removeLayer(this.linhaTrilha);
        this.linhaTrilha = new L.polyline(this.verticesTrilha, {
            color: '#2196F3',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8'
        });
        this.linhaTrilha.addTo(this.mapa);
    },

    refreshMenu() {
        let user = firebase.auth.currentUser();
        let defaultPhotoURL = "data:image/svg+xml;base64," + btoa("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50%' y='52%' dominant-baseline='central' text-anchor='middle' font-size='70'>&#x1F464;</text></svg>");
        if (user === null) {
            //Menu de login (Usuário não autenticado)
            this.userMenu.querySelector("#currentUser").textContent = "";
            this.userMenu.querySelector("button > img").src = defaultPhotoURL;
        } else {
            //Menu de logout (Usuário já autenticado)
            this.userMenu.querySelector("#currentUser").textContent = user.displayName ? user.displayName : user.email;
            this.userMenu.querySelector("button > img").src = user.photoURL ? user.photoURL : defaultPhotoURL;
        }
    }, //refreshMenu

    async getTrilhas() {
        //Obtém a div para exibir as trilhas
        let trilhasProx = document.querySelector("#trilhasProx");
        if (!trilhasProx || !this.player) return;
        trilhasProx.textContent = "";
        //Obtém as coordenadas do jogador
        let coord = this.player.getLatLng();
        //Obtém as trilhas próximas
        try {
            this.trilhas = await firestore.loadCollection("trilha");
        } catch (error) {
            console.error("Erro ao carregar trilhas:", error);
            trilhasProx.innerHTML = "<p style='font-size:0.85rem;color:#b71c1c;text-align:center;margin:10px 0;'>Não foi possível carregar as trilhas.<br><small>Tente novamente em instantes.</small></p>";
            return;
        }

        let encontrou = false;
        let currentUser = this.firebase.auth.currentUser();
        for(let id in this.trilhas) {
            let trilha = this.trilhas[id];
            let trilhaLat = Number(trilha.lat);
            let trilhaLng = Number(trilha.lng);
            let estaProxima = Number.isFinite(trilhaLat) && Number.isFinite(trilhaLng)
                    && Math.abs(trilhaLat - coord.lat) <= 0.1
                    && Math.abs(trilhaLng - coord.lng) <= 0.1;
            if(estaProxima) {
                encontrou = true;
                let itemDiv = document.createElement("div");
                itemDiv.className = "trilha-item";

                let button = document.createElement("button");
                button.className = "btn-trilha";
                button.textContent = "📍 " + trilha.titulo;
                button.title = "Visualizar trilha " + trilha.titulo;
                button.onclick = () => {
                    this.showTrilha(id);
                    this.toggleMenu(false);
                };

                itemDiv.appendChild(button);
                if (currentUser !== null && trilha.userId === currentUser.uid) {
                    let delButton = document.createElement("button");
                    delButton.className = "btn-delete";
                    delButton.textContent = "🗑️";
                    delButton.title = "Excluir trilha " + trilha.titulo;
                    delButton.onclick = () => this.deleteTrilha(id, trilha.titulo);
                    itemDiv.appendChild(delButton);
                }
                trilhasProx.appendChild(itemDiv);
            } else {
                delete(this.trilhas[id]);
            }
        }

        if (!encontrou) {
            trilhasProx.innerHTML = "<p style='font-size:0.85rem;color:#888;text-align:center;margin:10px 0;'>Nenhuma trilha próxima encontrada.<br><small>Clique em 'Nova Trilha' para criar a primeira!</small></p>";
        }
    },

    async deleteTrilha(id, titulo) {
        let currentUser = this.firebase.auth.currentUser();
        let trilha = this.trilhas ? this.trilhas[id] : null;
        if (currentUser === null || trilha === null || trilha === undefined || trilha.userId !== currentUser.uid) {
            await dialogs.alert("Você não tem permissão para excluir esta trilha.");
            return;
        }

        let tituloSeguro = dialogs.escape(titulo);
        if (await dialogs.confirm(`Deseja excluir permanentemente a trilha <b>${tituloSeguro}</b>?`)) {
            try {
                wait.show();
                await firestore.del("trilha", id);
                if (this.linhaTrilha !== null) {
                    this.mapa.removeLayer(this.linhaTrilha);
                    this.linhaTrilha = null;
                }
                await this.getTrilhas();
                await dialogs.alert(`A trilha <b>${tituloSeguro}</b> foi excluída com sucesso.`);
            } catch (err) {
                await dialogs.alert("Erro ao excluir trilha: " + dialogs.escape(err.message || err));
            } finally {
                wait.hide();
            }
        }
    },

    showTrilha(id) {
        let trilha = this.trilhas[id];
        if (!trilha) return;
        if (this.linhaTrilha !== null) this.mapa.removeLayer(this.linhaTrilha);

        let vertices;
        try {
            vertices = JSON.parse(trilha.vertices);
            if (!Array.isArray(vertices) || vertices.length < 2) throw new Error();
            vertices = vertices.map((vertice) => ({
                lat: Number(vertice.lat),
                lng: Number(vertice.lng)
            }));
            if (vertices.some((vertice) => !Number.isFinite(vertice.lat) || !Number.isFinite(vertice.lng)
                    || Math.abs(vertice.lat) > 90 || Math.abs(vertice.lng) > 180)) throw new Error();
        } catch (error) {
            dialogs.alert("Os pontos desta trilha estão inválidos e não podem ser exibidos.");
            return;
        }

        this.linhaTrilha = new L.polyline(vertices, {
            color: '#E53935',
            weight: 4,
            opacity: 0.9
        });
        this.linhaTrilha.addTo(this.mapa);

        //Calcula distância total da trilha
        let distTotal = 0;
        for (let i = 1; i < vertices.length; i++) {
            distTotal += L.latLng(vertices[i]).distanceTo(L.latLng(vertices[i - 1]));
        }
        const distStr = distTotal >= 1000 
            ? (distTotal / 1000).toFixed(2) + " km" 
            : Math.round(distTotal) + " m";

        //Popup com detalhes da trilha
        this.linhaTrilha.bindPopup(`
            <div style="font-family:sans-serif;min-width:140px;padding:2px;">
                <h4 style="margin:0 0 6px 0;color:#d32f2f;">📍 ${dialogs.escape(trilha.titulo)}</h4>
                <div style="font-size:0.85rem;line-height:1.5;">
                    <b>Distância:</b> ${distStr}<br>
                    <b>Pontos GPS:</b> ${vertices.length}
                </div>
            </div>
        `).openPopup();

        //Enquadra a trilha no mapa e mostra o botão de recentralizar
        if (vertices.length > 0) {
            this.mapa.fitBounds(this.linhaTrilha.getBounds(), { padding: [50, 50] });
            this.seguindoPlayer = false;
            this.bCentralizar.style.display = "flex";
        }
    }
}; //app
