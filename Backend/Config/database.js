import sqlite3 from 'sqlite3';

// Conexão com o banco de dados
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida.');
    }
});

// Criar a tabela 'foods' se ela não existir
db.run(`CREATE TABLE IF NOT EXISTS foods (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT
)`, (err) => {
    if (err) {
        console.error('Erro ao criar a tabela foods:', err.message);
    } else {
        console.log('Tabela foods verificada/criada com sucesso.');
    }
});

//Criar Tabela de 'users' se ela nao existir 
db.run(

`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)` , ( err)=>{
  if (err) {
  console.log('Error ao criar a tabela users', err.message)  
  } else {
     console.log('Tabela users criada com sucesso ')
  }
});


export default db;
