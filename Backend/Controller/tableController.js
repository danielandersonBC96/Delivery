import db from '../Config/database.js';

// Criar nova mesa
export const createTable = (req, res) => {
  const { name, capacity, location, is_available = 1, icon = 'MdTableRestaurant' } = req.body;

  if (!name || !capacity) {
    return res.status(400).json({ error: 'Nome e capacidade são obrigatórios' });
  }

  const sql = `INSERT INTO tables (name, capacity, location, is_available, icon) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [name, capacity, location, is_available, icon], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, message: 'Mesa criada com sucesso!' });
  });
};

// Buscar todas as mesas
export const getAllTables = (req, res) => {
  db.all(`SELECT * FROM tables`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ tables: rows });
  });
};

// Atualizar mesa
export const updateTable = (req, res) => {
  const { name, capacity, location, is_available, icon } = req.body;
  const { id } = req.params;

  const sql = `UPDATE tables SET name = ?, capacity = ?, location = ?, is_available = ?, icon = ? WHERE id = ?`;
  db.run(sql, [name, capacity, location, is_available, icon, id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Mesa atualizada com sucesso.' });
  });
};

// Deletar mesa
export const deleteTable = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM tables WHERE id = ?`, [id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Mesa removida com sucesso' });
  });
};

// Popular 50 mesas automaticamente com ícones
export const seedTables = (req, res) => {
  const locations = ['A', 'B', 'C', 'D', 'E'];
  const capacities = [2, 4, 6];
  const icons = ['MdTableRestaurant', 'GiTable', 'TbTable', 'AiOutlineTable'];

  const insertSql = `INSERT INTO tables (name, capacity, location, is_available, icon) VALUES (?, ?, ?, ?, ?)`;

  let insertedCount = 0;
  for (let i = 1; i <= 50; i++) {
    const name = `Mesa ${i}`;
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    const location = locations[i % locations.length];
    const is_available = Math.random() < 0.7 ? 1 : 0;
    const icon = icons[i % icons.length];

    db.run(insertSql, [name, capacity, location, is_available, icon], function (err) {
      if (err) {
        console.error(`Erro ao inserir ${name}:`, err.message);
      } else {
        insertedCount++;
        console.log(`Mesa ${name} criada com ID ${this.lastID}`);

        // Envia resposta quando terminar o último insert
        if (insertedCount === 50) {
          res.json({ message: '50 mesas criadas com sucesso!' });
        }
      }
    });
  }
};
