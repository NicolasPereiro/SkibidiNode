Instalar Redis:  
Docker:  
```bash
docker run --name redis -p 6379:6379 -d redis:8.0-rc1
```

Instalar dependencias:  
```bash
npm install express redis axios nodemon
npm install --save-dev typescript ts-node @types/node @types/express
```

Compilar TypeScript:  
```bash
npx tsc --init
npx nodemon ./index.ts
```

