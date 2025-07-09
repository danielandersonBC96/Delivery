import sqlite3 from 'sqlite3';

// Abre conexão com o banco SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('✅ Conexão com o banco de dados estabelecida.');

    // Depois de abrir o banco, garantir que a tabela orders tem a coluna status
    addStatusColumnIfNotExists();
  }
});

// Cria tabela de seções do menu (category) com coluna image
db.run(`
  CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NULL
  )
`, (err) => {
  if (err) console.error('❌ Erro ao criar tabela category:', err.message);
  else console.log('✅ Tabela "category" criada/verificada com sucesso.');
});

// Cria tabela de alimentos com relação à seção do menu
db.run(`
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    section_id INTEGER,
    FOREIGN KEY (section_id) REFERENCES category(id)
  )
`, (err) => {
  if (err) console.error('❌ Erro ao criar tabela foods:', err.message);
  else console.log('✅ Tabela "foods" criada/verificada com sucesso.');
});

// Tabelas de usuários, pedidos e order_items seguem iguais
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  )
`, (err) => {
  if (err) console.error('❌ Erro ao criar tabela users:', err.message);
  else console.log('✅ Tabela "users" criada/verificada com sucesso.');
});

// Cria tabela orders com coluna status
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    discount REAL DEFAULT 0,
    status TEXT DEFAULT 'pendente',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) console.error('❌ Erro ao criar tabela orders:', err.message);
  else console.log('✅ Tabela "orders" criada/verificada com sucesso.');
});

// Cria tabela order_items
db.run(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    name TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_id) REFERENCES foods(id)
  )
`, (err) => {
  if (err) console.error('❌ Erro ao criar tabela order_items:', err.message);
  else console.log('✅ Tabela "order_items" criada/verificada com sucesso.');
});

// Função para adicionar a coluna 'status' na tabela orders caso não exista (migração simples)
function addStatusColumnIfNotExists() {
  db.get(`PRAGMA table_info(orders)`, (err, row) => {
    if (err) {
      console.error('❌ Erro ao verificar tabela orders:', err.message);
      return;
    }

    // Consultar se a coluna 'status' existe
    db.all(`PRAGMA table_info(orders)`, (err, columns) => {
      if (err) {
        console.error('❌ Erro ao obter colunas da tabela orders:', err.message);
        return;
      }

      const hasStatus = columns.some(col => col.name === 'status');

      if (!hasStatus) {
        db.run(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pendente'`, (err) => {
          if (err) {
            console.error('❌ Erro ao adicionar coluna status na tabela orders:', err.message);
          } else {
            console.log('✅ Coluna "status" adicionada na tabela orders.');
          }
        });
      } else {
        console.log('✅ Coluna "status" já existe na tabela orders.');
      }
    });
  });
}

export default db;
