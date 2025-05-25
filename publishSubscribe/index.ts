import express, { Request, Response } from 'express';
import { createClient } from 'redis';

const app = express();
app.use(express.json());

const publisher = createClient({ url: 'redis://localhost:6379' });
const subscriber = createClient({ url: 'redis://localhost:6379' });

// Mapa en memoria para simular usuarios y suscripciones
const userSubscriptions: Record<string, Set<string>> = {};

// Endpoint para que un usuario se suscriba a un equipo o jugador
app.post('/subscribe', (req, res) => {
    const { userId, type, name } = req.body;
    if (!userId || !type || !name) {
        res.status(400).send('Datos de suscripción incompletos');
        return;
    }
    const channel = `goal:${type}:${name}`;
    if (!userSubscriptions[userId]) userSubscriptions[userId] = new Set();
    userSubscriptions[userId].add(channel);
    res.json({ message: `Suscrito a ${channel}` });
});

// Simulación: recibir notificaciones de goles y reenviarlas a usuarios suscritos
async function setupSubscriptions() {
    await subscriber.connect();
    // Suscribirse a todos los goles de equipos y jugadores (wildcard no soportado, así que ejemplo fijo)
    const channels = [
        'goal:team:Nacional',
        'goal:player:Gabriel Baez',
        // Agrega más canales según tus necesidades
    ];
    for (const channel of channels) {
        await subscriber.subscribe(channel, (message) => {
            // Notificar a los usuarios suscritos a este canal
            Object.entries(userSubscriptions).forEach(([userId, subs]) => {
                if (subs.has(channel)) {
                    console.log(`Notificación para usuario ${userId}: ${message}`);
                    // Aquí podrías enviar la notificación por WebSocket, push, etc.
                }
            });
        });
    }
}

// Endpoint para simular un gol (publicar evento)
app.post('/goal', async (req: Request, res: Response) => {
    const { team, player, minute, match } = req.body;
    if (!team || !player || !minute || !match) {
        res.status(400).json({ error: 'Datos de gol incompletos' });
    }
    const goalData = { player, minute, match };

    // Publicar en canal de equipo
    await publisher.publish(`goal:team:${team}`, JSON.stringify(goalData));
    // Publicar en canal de jugador
    await publisher.publish(`goal:player:${player}`, JSON.stringify(goalData));

    res.json({ message: 'Gol publicado' });
});

async function main() {
    await publisher.connect();
    await setupSubscriptions();
    app.listen(3000, () => {
        console.log('Servidor escuchando en http://localhost:3000');
    });
}

main().catch(console.error);