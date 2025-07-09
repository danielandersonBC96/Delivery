import db from '../Config/database.js';

// ✅ Criar uma nova categoria com imagem
export const createCategory = (req, res) => {
  const { category } = req.body;
  const image = req.file?.filename;

  if (!category || !image) {
    return res.status(400).json({ message: 'Categoria e imagem são obrigatórios.' });
  }

  const sql = `INSERT INTO category (title, image) VALUES (?, ?)`;

  db.run(sql, [category, image], function (err) {
    if (err) {
      console.error('Erro ao criar categoria:', err.message);
      return res.status(500).json({ message: 'Erro ao criar categoria' });
    }

    res.status(201).json({ message: 'Categoria criada com sucesso', id: this.lastID });
  });
};

// ✅ Buscar todas as categorias (com imagem se quiser)
export const getAllCategories = (req, res) => {
  const sql = `SELECT * FROM category`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err.message);
      return res.status(500).json({ message: 'Erro ao buscar categorias' });
    }

    res.json({ categories: rows });
  });
};

// ✅ Renomear uma categoria
export const renameCategory = (req, res) => {
  const { oldCategory, newCategory } = req.body;

  if (!oldCategory || !newCategory) {
    return res.status(400).json({ message: 'Categorias antiga e nova são obrigatórias.' });
  }

  const sql = `UPDATE category SET title = ? WHERE title = ?`;

  db.run(sql, [newCategory, oldCategory], function (err) {
    if (err) {
      console.error('Erro ao renomear categoria:', err.message);
      return res.status(500).json({ message: 'Erro ao renomear categoria' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    res.json({ message: `Categoria "${oldCategory}" renomeada para "${newCategory}".` });
  });
};

// ✅ Deletar uma categoria
export const deleteCategory = (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({ message: 'Categoria é obrigatória.' });
  }

  const sql = `DELETE FROM category WHERE title = ?`;

  db.run(sql, [category], function (err) {
    if (err) {
      console.error('Erro ao deletar categoria:', err.message);
      return res.status(500).json({ message: 'Erro ao deletar categoria.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    res.status(200).json({
      message: `Categoria "${category}" deletada com sucesso!`,
      deletedCount: this.changes,
    });
  });
};
