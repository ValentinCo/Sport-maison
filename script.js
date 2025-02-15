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

// Appeler la fonction pour récupérer les données au chargement de la page
fetchData();

document.getElementById('save-button').addEventListener('click', saveData);

//save

async function saveData() {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    const dataToSave = [];

    // Récupérer les données ligne par ligne
    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName('td');
        const rowData = [];
        Array.from(cells).forEach(cell => {
            const input = cell.querySelector('input');
            rowData.push(input ? input.value : cell.textContent);
        });
        dataToSave.push(rowData);
    });

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxrZNcQ1fv315-HikYOoa1jzEeLNMK56glRizPJ7i_EGHGRn-qpovWj8JpkFfGLTM9N/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify(dataToSave), // Envoi de toutes les données d'un coup
        });

        alert('Données envoyées avec succès !');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde des données.');
    }
}


  








