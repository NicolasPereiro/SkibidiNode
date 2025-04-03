import { createReadStream, createWriteStream } from 'fs';
import { Transform, pipeline, Readable } from 'stream';
import { Express } from 'express'
import axios from 'axios';
const express = require('express');
const app: Express = express();
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

/*const removeWords = new Transform({
    transform(chunk, encoding, callback){
        const data = chunk.toString();
        const words = data.split(' ');
        const filteredWords = words.filter((word:string) => !wordList.includes(word));
        const result = filteredWords.join(' ');
        callback();
    }
})*/

const censorWords = new Transform({
    transform(chunk, encoding, callback) {
        const data = chunk.toString();
        const words = data.split(' ');
        const censoredWords = words.map((word: string) => wordList.includes(word) ? '****' : word);
        const result = censoredWords.join(' ');
        this
        callback();
    }
})

app.get('/texto/', async (req, res) => {
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/1`);
    const text = response.data.body; // Extraer el texto del cuerpo de la respuesta
    // Crear un Readable stream para emitir el texto
    const readableStream = new Readable({
        read() {
            this.push(text); // Emitir el texto
            this.push(null); // Indicar el final del stream
        }
    });
    pipeline(
        readableStream,
        censorWords,
        createWriteStream('output.txt'), // Escribo el texto en un archivo
        (err) => { // Callback para manejar errores o éxito
            if (err) {
                console.error('Error en el pipeline:', err);
                res.status(500).send('Error al procesar el texto');
            } else {
                console.log('Texto procesado y guardado en output.txt');
                res.send('Texto procesado y guardado en output.txt');
            }
        }
    );

});