import express from 'express';
import bodyParser from 'body-parser';
import { Low, JSONFile } from 'lowdb';
import shortid from 'shortid';

// incializo express
const app = express();
// cuando  reciba un objeto json lo pueda leer
app.use(bodyParser.json());

const adapter = new JSONFile('./db.json');
const db = new Low(adapter);
await db.read();
db.data = db.data || { users: [] };
const users = db.data.users;

app.get(`/`, (req, res) => {
  return res.status(200).send('Hola Mundo');
});

// const users = [{name: 'John', email: 'john@example.com'}];

app.get(`/api/user`, (req, res) => {
  const name = req.query.name;
  console.log('name', name);
  const userFilter = name ? users.filter((user) => user.name == name) : users;
  return res.status(200).send(userFilter);
});

app.post(`/api/user`, async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;

  if (!(name && email)) {
    const mensaje = {
      msj: 'Faltan campos',
    };
    return res.status(400).send(mensaje);
  }

  const id = shortid.generate();
  const user = { name, email, id };

  users.push(user);
  await db.write();
  return res.status(201).send(user);
});

app.put(`/api/user`, async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const newUser = { name, email, id };

  const index = users.findIndex((user) => user.id == id);
  users[index] = newUser;
  await db.write();
  return res.status(201).send(newUser);
});

app.delete(`/api/user/:id`, async (req, res) => {
  const id = req.params.id;

  const index = users.findIndex((user) => user.id == id);
  users.splice(index, 1);
  await db.write();
  return res.status(204).send();
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
