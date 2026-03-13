import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const examplePath = path.join(root, '.env.example');
const envPath = path.join(root, '.env');

if (!fs.existsSync(examplePath)) {
  console.error('No existe .env.example en la raiz del proyecto.');
  process.exit(1);
}

if (fs.existsSync(envPath)) {
  console.log('.env ya existe. No se sobrescribio.');
  process.exit(0);
}

fs.copyFileSync(examplePath, envPath);
console.log('.env creado desde .env.example');
console.log('Siguiente paso: abre .env y reemplaza URL y ANON KEY de Supabase.');

