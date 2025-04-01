import {createReadStream, createWriteStream} from 'fs';
import {Transform, pipeline} from 'stream';
import {Express} from 'express'
import axios from 'axios';
const express = require('express');
const app:Express = express();
app.use(express.json());
const PORT = 3000;

//Ponemos a escuchar al servidor en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hola mundo!');
});

let wordList = ["quia", "sunt", "qui", "est", "ea", "et"];

app.get('/texto/', async (req,res)=>{
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/1`);
    res.json(response.data);
    // FILTRAR PALABRAS
})
