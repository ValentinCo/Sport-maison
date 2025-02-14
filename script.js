// Fonction pour récupérer les données depuis la feuille "Séances"
async function fetchData() {
    const sheetId = '1W8FjGSf4AThs08PqlocmfmB7mN4wV0PlGHxKa794lbE';
    const apiKey = 'AIzaSyDBBQcb3ueEX7sO5e0CLUO1e1Xc5cHxpOc';
    const range = 'seances'; // Plage de données à récupérer

    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Erreur dans la récupération des données : ' + response.statusText + ' - ' + errorText);
        }

        const data = await response.json();
        const rows = data.values;

        if (!rows || rows.length === 0) {
            console.error('Aucune donnée trouvée dans la feuille.');
            return;
        }

        const sessionSelect = document.getElementById('session-select');
        const table = document.getElementById('data-table');
        const tableHead = table.createTHead();
        const tableBody = table.getElementsByTagName('tbody')[0];
        const saveButton = document.getElementById('save-button');
   
        // Masquer le tableau par défaut
        table.style.display = 'none';
        saveButton.style.display = 'none'; // Masquer le bouton Enregistrer par défaut

        // Vider le select et ajouter l'option par défaut
        sessionSelect.innerHTML = '<option value="">-- Choisissez une séance --</option>';

        // Extraire les noms des colonnes (première ligne du tableau)
        const headers = rows[0]; // La première ligne contient les noms des colonnes
        const sessionNames = new Set();

        // Générer l'en-tête du tableau
        tableHead.innerHTML = ''; // Vider l'en-tête avant de le remplir
        const headerRow = tableHead.insertRow();
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        // Parcourir les lignes restantes (données) pour remplir le select
        rows.slice(1).forEach(row => {
            const sessionName = row[0]; // Supposons que le nom de la séance est en colonne B
            if (sessionName) {
                sessionNames.add(sessionName);
            }
        });

        // Ajouter les options uniques dans le select
        sessionNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sessionSelect.appendChild(option);
        });

// Écouteur d'événement pour afficher les données lorsqu'une séance est sélectionnée
sessionSelect.addEventListener('change', function () {
    const selectedSession = this.value;
    tableBody.innerHTML = ''; // Vider le tableau avant d'afficher les nouvelles données

    if (selectedSession) {
        table.style.display = 'table'; // Afficher le tableau
        saveButton.style.display = 'block'; // Afficher le bouton Enregistrer

        rows.slice(1).forEach(row => {
            const sessionName = row[0]; // Nom de la séance
            if (sessionName === selectedSession) {
                const tr = document.createElement('tr');

                // Parcourir chaque cellule de la ligne (à partir de la 2e colonne pour ne pas décaler la date)
                row.forEach((cell, index) => {
                    const td = document.createElement('td');

                    // Si la cellule contient un lien, créer un lien cliquable
                    if (typeof cell === 'string' && cell.startsWith('http')) {
                        const a = document.createElement('a');
                        a.href = cell;
                        a.target = "_blank"; // Ouvrir dans un nouvel onglet
                        a.textContent = "Lien";
                        td.appendChild(a);
                    }
                    // Vérifier si c'est une colonne modifiable
                    else if (["Repetitions", "Charge", "Reps.1", "Reps.2", "Reps.3", "Note"].includes(headers[index])) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = cell || ''; 
                        input.dataset.column = headers[index]; 
                        td.appendChild(input);
                    } 
                    // Affichage normal du texte
                    else {
                        td.textContent = cell;
                    }

                    tr.appendChild(td);
                });

                // Ajouter la date du jour comme dernière cellule
                const today = new Date().toLocaleDateString(); 
                const dateCell = document.createElement('td');
                dateCell.textContent = today;
                tr.appendChild(dateCell); // Ajouter la date à la fin de la ligne

                tableBody.appendChild(tr);
            }
        });
    } else {
        table.style.display = 'none';
        saveButton.style.display = 'none';
    }
});



    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function saveData() {
    const table = document.getElementById('data-table');
    const rows = Array.from(table.getElementsByTagName('tr'));
    
    const url = 'https://script.google.com/macros/s/AKfycbxKTnznU2muOoA5rEla8eWVsem9gNZxPFXZT4MoyBFnq09ugJCdSzaQFOHSgS0MgNNl/exec'; // URL de ton script Apps Script déployé
    
    const dataToSend = [];
    
    // Récupérer les données du tableau
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(td => {
            const input = td.querySelector('input');
            if (input) {
                rowData.push(input.value); // Si un input existe, récupérer sa valeur
            } else {
                rowData.push(td.textContent); // Sinon, récupérer le texte de la cellule
            }
        });
        if (rowData.length > 0) {
            dataToSend.push(rowData);
        }
    });

    // Envoi des données avec fetch (requête POST)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: dataToSend  // Les données envoyées sous forme de JSON
            })
        });

        const result = await response.text();  // Lire la réponse du serveur
        console.log('Réponse du serveur:', result);

    } catch (error) {
        console.error('Erreur lors de l\'envoi des données:', error);
    }
}





// Appeler la fonction pour récupérer les données au chargement de la page
fetchData();

document.getElementById('save-button').addEventListener('click', saveData);

let accessToken = 'ya29.a0AXeO80RdiNByhnJlPUqnOsPLRst62ZYqfatpts3oa3Y5-WCKEQG3G1ric-0x5zdxeGCs-cKx7l5IDzop01D5t71i46kV5ouE0D4jUAB-VCRMzzqZppH289ZKHNlPlUkoVBOXKJD2Kl8CyQnJbUV_kIIJEZ4vTXoBMXlwnViZaCgYKARESARASFQHGX2MiUW8lAsPoj59GOA-PSSlfwA0175';  // Ton token actuel
let refreshToken = '1//04i5aLnnLGLvWCgYIARAAGAQSNwF-L9Irkp3U0hzeMh6SxpdC-Aow_vkvCXJ5Q3Xi-xjGzzPkU-CEbrhFm3bQ1PQMICuUCl7NzeI'; // Ton refresh token

// Fonction pour rafraîchir le token
async function refreshAccessToken(refreshToken) {
    const clientId = '203719887174-fd5774frjcbojluu5duduatlptp55gm6.apps.googleusercontent.com'; // Ton client_id
    const clientSecret = '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'; // Ton client_secret
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'client_id': clientId,
                'client_secret': clientSecret,
                'refresh_token': refreshToken,
                'grant_type': 'refresh_token'
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('Erreur lors du renouvellement du token :', data.error);
            return null;
        }

        console.log('Token renouvelé avec succès');
        return data.access_token; // Retourne le nouveau token
    } catch (error) {
        console.error('Erreur réseau ou autre lors du renouvellement du token :', error);
        return null;
    }
}

// Fonction pour vérifier le token avant d'effectuer une requête
async function getAccessToken() {
    const expirationTime = 3599; // L'`access_token` expire après 3600 secondes (1 heure)
    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes

    // Si le token est expiré ou sur le point de l'être (moins de 10 minutes), le renouveler
    if (!accessToken || (currentTime + 600 >= expirationTime)) {
        console.log('Le token est expiré ou sur le point d\'expirer, renouvellement nécessaire.');
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
            accessToken = newToken;
        }
    }

    return accessToken;
}
