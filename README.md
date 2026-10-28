**English** | [Português](README.pt-BR.md)

# Trail Map

A web app to record hiking trails and view them on a map. It was my final project for my IT technical program: I combined geolocation, an interactive map, user login and data persistence in an app that runs straight in the browser.

The idea came from a real problem in the Jaboticabal region, in Brazil: many local trails are only known by people who already walk them. With Trail Map, someone who knows a trail records it with GPS and shares it so others can follow the same path.

[Open the live version](https://trilhasapp2024.firebaseapp.com/)

## What you can do

- follow your position on the map using the device's GPS;
- start a new trail by walking or by adding points manually;
- see the distance covered while mapping;
- save trails to Cloud Firestore;
- browse trails registered in the region;
- create an account, sign in, edit your profile and pick an avatar;
- delete trails created by your account.

The map uses Leaflet with OpenTopoMap topographic layers. Firebase handles authentication, the database and hosting.

## Tech stack

- HTML, CSS and JavaScript with ES Modules;
- Leaflet 1.9.4;
- OpenTopoMap;
- Firebase Authentication;
- Cloud Firestore;
- Firebase Hosting.

There is no build step and no frontend framework. Libraries are loaded from a CDN.

## Running locally

Because the project uses JavaScript modules and loads HTML files with `fetch`, opening `index.html` directly is not enough. Serve the folder over HTTP.

With Python installed:
```bash
python -m http.server 5500
```

Then open [http://localhost:5500](http://localhost:5500).

The browser will ask for access to your location. On a computer without GPS, you can still add points by clicking the map after starting a new trail.

## Project structure
```text
trail-map/
|-- app/
|   |-- app.html          # Map and menu elements
|   `-- app.js            # Geolocation, trails and main integration
|-- assets/               # Project diagrams
|-- docs/                 # Academic presentation material
|-- lib/
|   |-- auth.js           # Authentication operations
|   |-- dialogs.js        # Interface dialogs
|   |-- firebase.js       # Firebase initialization
|   |-- firestore.js      # Firestore operations
|   `-- wait.js           # Loading indicator
|-- user/
|   |-- userController.js # Sign-up, sign-in and profile
|   `-- userUI.html       # User forms
|-- .firebaserc           # Firebase project used by the CLI
|-- firebase.json         # Hosting and Firestore configuration
|-- firestore.rules       # Access rules for trails
|-- index.html
|-- main.css
|-- main.js
`-- README.md
```

## Academic context

This was my final project for the IT technical program, built with three classmates, with me as team lead. It was approved with a grade of 9 out of 10, tested on 3 real trails and selected for presentation at COTUCA, in Campinas. The repository includes the presentation material and project diagrams, and the full written report (in Portuguese) is in this [Google document](https://docs.google.com/document/d/1M1xf7TWg6O3uCA8R9Qm7mECjuBNUaH_jo0MSsFUL4WE/edit?usp=sharing).

## Author

Developed by Daniel Augusto Silva.
