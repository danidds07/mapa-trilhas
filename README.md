# Trail Map

Aplicação web para registrar trilhas e depois visualizá-las num mapa. Foi meu Trabalho
de Conclusão de Curso: juntei geolocalização, mapa interativo, login de usuário e
persistência de dados numa aplicação que roda direto no navegador.

[Abrir a versão publicada](https://trilhasapp2024.firebaseapp.com/)

## O que dá para fazer

- acompanhar sua posição no mapa pelo GPS do dispositivo;
- iniciar uma nova trilha caminhando ou adicionando pontos manualmente;
- ver a distância percorrida durante o mapeamento;
- salvar trilhas no Cloud Firestore;
- consultar trilhas cadastradas na região;
- criar uma conta, entrar, editar o perfil e escolher um avatar;
- excluir as trilhas criadas pela sua conta.

O mapa usa o Leaflet com as camadas topográficas do OpenTopoMap. O Firebase cuida da
autenticação, do banco de dados e da hospedagem.

## Tecnologias

- HTML, CSS e JavaScript com ES Modules;
- Leaflet 1.9.4;
- OpenTopoMap;
- Firebase Authentication;
- Cloud Firestore;
- Firebase Hosting.

Não há etapa de build nem framework de frontend. As bibliotecas são carregadas por CDN.

## Como executar no computador

Como o projeto usa módulos JavaScript e carrega arquivos HTML com `fetch`, abrir o
`index.html` diretamente não é suficiente. Sirva a pasta por HTTP.

Com Python instalado:
```bash
python -m http.server 5500
```

Depois, acesse [http://localhost:5500](http://localhost:5500).

O navegador vai pedir acesso à sua localização. Em um computador sem GPS, você ainda
pode adicionar pontos clicando no mapa depois de iniciar uma nova trilha.

### Configuração do Firebase

A configuração usada pelo navegador está em `app/app.js` e aponta para o projeto
`trilhasapp2024`. A chave de API de uma aplicação web Firebase é pública por definição.
A proteção dos dados depende das regras do Firestore, do Firebase Authentication e,
quando configurado, do App Check.

Os arquivos `firebase.json`, `.firebaserc` e `firestore.rules` mantêm a configuração do
deploy e as regras do banco junto do código. As trilhas têm leitura pública para
aparecer no mapa, mas somente usuários autenticados podem criar registros. Cada usuário
só pode excluir as próprias trilhas. Alterações diretas em registros existentes são
bloqueadas.

Trilhas antigas que não possuem o campo `userId` continuam visíveis, mas precisam ser
removidas pelo Console do Firebase caso seja necessário. A aplicação não assume a
propriedade desses registros.

## Como publicar uma nova versão

O código curto mostrado na tela de versões do Firebase Hosting, como `13a268`, é o
identificador de um deploy. Ele não é a versão do SDK Firebase usada nos arquivos
JavaScript.

No Windows, abra o PowerShell dentro da pasta do projeto e instale o Firebase CLI:
```powershell
npm.cmd install -g firebase-tools
firebase.cmd login
```

O projeto já está associado ao `trilhasapp2024`, então não é necessário executar
`firebase init`. A configuração também impede que o README, as regras e os documentos
acadêmicos sejam publicados junto com a aplicação.

Teste a configuração localmente:
```powershell
firebase.cmd serve --only hosting
```

Antes do primeiro deploy desta versão, publique as regras do Firestore:
```powershell
firebase.cmd deploy --only firestore -m "Protege as trilhas por usuário"
```

Antes de mexer na versão que está no ar, publique um canal de prévia:
```powershell
firebase.cmd hosting:channel:deploy revisao --expires 1d
```

Abra o endereço fornecido pelo comando e teste o carregamento, o login e o mapa. O
canal de prévia usa o mesmo Authentication e o mesmo Firestore de produção, então
qualquer trilha criada ali também será real. Se precisar testar gravação e exclusão,
use um registro de teste e remova-o ao terminar.

Quando estiver satisfeito, publique o site em produção:
```powershell
firebase.cmd deploy --only hosting -m "Atualiza aplicação"
```

Esse comando cria uma nova versão no Hosting e passa a servi-la nos endereços
`trilhasapp2024.web.app` e `trilhasapp2024.firebaseapp.com`.

## Estrutura do projeto
```text
trail-map/
|-- app/
|   |-- app.html          # Elementos do mapa e do menu
|   `-- app.js            # Geolocalização, trilhas e integração principal
|-- assets/               # Diagramas do projeto
|-- docs/                 # Material da apresentação acadêmica
|-- lib/
|   |-- auth.js           # Operações de autenticação
|   |-- dialogs.js        # Diálogos da interface
|   |-- firebase.js       # Inicialização do Firebase
|   |-- firestore.js      # Operações no Firestore
|   `-- wait.js           # Indicador de carregamento
|-- user/
|   |-- userController.js # Cadastro, login e perfil
|   `-- userUI.html       # Formulários do usuário
|-- .firebaserc           # Projeto Firebase usado pelo CLI
|-- firebase.json         # Configuração do Hosting e do Firestore
|-- firestore.rules       # Regras de acesso às trilhas
|-- index.html
|-- main.css
|-- main.js
`-- README.md
```

## Contexto acadêmico

Foi meu TCC do técnico em Informática, feito em equipe com mais três colegas (eu como
líder do grupo). Fomos aprovados com nota 9. O repositório tem o material de
apresentação e os diagramas do projeto, e o texto completo do trabalho está neste
[documento do Google](https://docs.google.com/document/d/1M1xf7TWg6O3uCA8R9Qm7mECjuBNUaH_jo0MSsFUL4WE/edit?usp=sharing).

## Autor

Desenvolvido por Daniel Augusto Silva.
