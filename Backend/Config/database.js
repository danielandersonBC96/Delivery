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

// Criar tabela 'users' se não existir
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.log('Error ao criar a tabela users', err.message);
  } else {
    console.log('Tabela users criada com sucesso');
  }
});

// Criar tabela 'orders' para registrar pedidos
db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
`, (err) => {
      if (err) {
          console.error('Erro ao criar a tabela orders:', err.message);
      } else {
          console.log('Tabela orders criada com sucesso.');

          // Após criar a tabela, adicionar colunas se não existirem
          db.run(`ALTER TABLE orders ADD COLUMN customer_name TEXT DEFAULT ''`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Erro ao adicionar coluna customer_name:', err.message);
            } else {
              console.log('Coluna customer_name adicionada ou já existe.');
            }
          });

          db.run(`ALTER TABLE orders ADD COLUMN phone_number TEXT DEFAULT ''`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Erro ao adicionar coluna phone_number:', err.message);
            } else {
              console.log('Coluna phone_number adicionada ou já existe.');
            }
          });

          db.run(`ALTER TABLE orders ADD COLUMN discount REAL DEFAULT 0`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Erro ao adicionar coluna discount:', err.message);
            } else {
              console.log('Coluna discount adicionada ou já existe.');
            }
          });
      }
  });

// Criar tabela 'order_items' para registrar os itens de cada pedido
db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (food_id) REFERENCES foods(id)
  )`, (err) => {
      if (err) {
          console.error('Erro ao criar a tabela order_items:', err.message);
      } else {
          console.log('Tabela order_items criada com sucesso.');
      }
  });

export default db;
