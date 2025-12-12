const express=require('express')
const app=express()
//Middleware
app.use(express.json())

/* Solution avec mongoDB */
const { connectDB, getDB } = require('./db'); // import connexion DB

// Connecte MongoDB avant de lancer le serveur
connectDB().then(() => {
    app.listen(82, () => {
        console.log("Serveur démarré sur http://localhost:82");
    });
});

// Récupérer toutes les équipes
app.get('/equipes', async (req, res) => {
    try {
        const db = getDB(); // récupérer l'objet DB
        const equipes = await db.collection('equipe').find().toArray();
        res.status(200).json(equipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});
app.get('/equipes/:id', async (req, res) => {
    const id = parseInt(req.params.id); // convertir l'ID en nombre

    try {
        const db = getDB(); // récupérer la connexion MongoDB
        const docs = await db.collection('equipe') // nom de la collection au pluriel
            .find({ id: id }) // filtrer sur le champ id
            .toArray();

        if (docs.length === 0) {
            return res.status(404).json({ message: "Équipe non trouvée" });
        }

        res.status(200).json(docs[0]); // renvoyer un seul document
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});
// Ajouter une équipe
app.post('/equipes', async (req, res) => {
    try {
        const db = getDB(); // récupérer la connexion MongoDB
        const equipeData = req.body;

        if (!equipeData.id || !equipeData.name || !equipeData.country) {
            return res.status(400).json({ message: "Tous les champs (id, name, country) sont obligatoires" });
        }

        const result = await db.collection('equipe').insertOne(equipeData);
        res.status(201).json({ message: "Équipe ajoutée", equipe: equipeData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});
app.put('/equipes/:id', async (req, res) => {
    try {
        const db = getDB();
        const paramId = req.params.id;

        const updates = req.body;
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ message: "Données de mise à jour invalides" });
        }

        // Cherche soit en number, soit en string
        const result = await db.collection('equipe').updateOne(
            { $or: [{ id: parseInt(paramId) }, { id: paramId }] },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Équipe non trouvée" });
        }

        res.status(200).json({ message: "Équipe mise à jour", updates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});



// Supprimer une équipe
app.delete('/equipes/:id', async (req, res) => {
    try {
        const db = getDB();
        const id = parseInt(req.params.id);

        const result = await db.collection('equipe').deleteOne({ id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Équipe non trouvée" });
        }

        res.status(200).json({ message: "Équipe supprimée", id: id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});

/*
/*solution avec json
const equipes=require('./equipes.json')
const joueurs=require('./joueurs.json')
app.listen(82,()=>{
    console.log('REST API via ExpressJS')
})

app.get('/equipes', (req,res)=>{
  //  res.send("Liste des Equipes")
  res.status(200).json(equipes)
})
app.get('/equipes/:id',(req,res)=>{
    const id=parseInt(req.params.id)
    const equipe=equipes.find(equipe=>equipe.id=== id)
    res.status(200).json(equipe)
})
app.post('/equipes',(req,res)=>{
    equipes.push(req.body)
    res.status(200).json(equipes)
})
app.put('/equipes/:id',(req,res)=>{
    const id = parseInt(req.params.id)
    let equipe = equipes.find(equipe => equipe.id === id)
    equipe.name = req.body.name,
    equipe.country = req.body.country,
    res.status(200).json(equipe)
})

app.delete('/equipes/:id',(req,res)=>{
    const id = parseInt(req.params.id)
    let equipe = equipes.find(equipe => equipe.id === id)
    equipes.splice(equipes.indexOf(equipe),1)
    res.status(200).json(equipe)
})
app.get('/joueurs', (req,res)=>{
  //  res.send("Liste des Equipes")
  res.status(200).json(joueurs)
})
app.get('/joueurs/:id',(req,res)=>{
    const id=parseInt(req.params.id)
    const joueur=joueurs.find(j=>j.id=== id)
    res.status(200).json(joueur)
})
app.get('/equipes/:id/joueurs', (req, res) => {
    const idEquipe = parseInt(req.params.id);

    const joueursEquipe = joueurs.filter(j => j.idEquipe === idEquipe);

    if (joueursEquipe.length === 0) {
        return res.status(404).json({ message: "Aucun joueur trouvé pour cette équipe" });
    }

    res.status(200).json(joueursEquipe);
});

app.get('/joueurs/:nom', (req, res) => {
    const nom = req.params.nom.toLowerCase(); // récupérer le nom depuis l'URL

    const joueur = joueurs.find(j => j.nom.toLowerCase() === nom);

    res.status(joueur ? 200 : 404).json(
        joueur || { message: "Aucun joueur trouvé avec ce nom" }
    );
});


app.post('/joueurs', (req, res) => {
    const { id, idEquipe, nom, numero, poste } = req.body;

   
    joueurs.push({ id, idEquipe, nom, numero, poste });
    res.status(201).json({ message: "Joueur ajouté", joueurs });
});

app.put('/joueurs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let joueur = joueurs.find(j => j.id === id);

    if (!joueur) return res.status(404).json({ message: "Joueur non trouvé" });

    const { nom, numero, poste, idEquipe } = req.body;

    if (nom) joueur.nom = nom;
    if (numero) joueur.numero = numero;
    if (poste) joueur.poste = poste;
    if (idEquipe) joueur.idEquipe = idEquipe;

    res.status(200).json({ message: "Joueur modifié", joueur });
});

app.delete('/joueurs/:id',(req,res)=>{
    const id = parseInt(req.params.id)
    let joueur = joueurs.find(joueur => joueur.id === id)
    joueurs.splice(joueurs.indexOf(joueur),1)
    res.status(200).json(joueur)
})
*/