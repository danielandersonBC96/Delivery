
// No controlador onde você adiciona o alimento
import db from '../Config/database.js';
export const createFood = async (req, res) => {
    const { name, description, price, category } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : null; // Caminho relativo para a imagem

    // Validação simples
    if (!name || !description || !price || !category) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Adicionando ao banco de dados
    const sql = `INSERT INTO foods (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)`;
    try { 
        const dbInstance = await db; // Aguarda a conexão com o banco de dados
        const result = await dbInstance.run(sql, [name, description, price, category, image]);

        // Retorna a imagem com o URL correto
        res.status(201).json({ 
            id: result.lastID, 
            name, 
            description, 
            price, 
            category, 
            image: `http://localhost:4000/${image}` // URL completa da imagem
        });
    } catch (err) {
        console.error('Erro ao inserir no banco de dados:', err);
        return res.status(500).json({ message: 'Erro ao adicionar produto' });
    }
};



export const updateFood = async (req, res) => {
    const id = req.params.id;
    const { name, description, price, category } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : null; // New image if uploaded

    // Check required fields
    if (!name || !description || !price || !category) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const dbInstance = await db; // Await database connection
        
        // Get existing food item to check for current image
        const existingFood = await dbInstance.get('SELECT * FROM foods WHERE id = ?', [id]);
        if (!existingFood) {
            return res.status(404).json({ message: 'Alimento não encontrado' });
        }

        // Update food item, including new image if uploaded
        const updatedImage = image || existingFood.image; // Keep existing image if no new one
        const sql = `
            UPDATE foods 
            SET name = ?, description = ?, price = ?, category = ?, image = ? 
            WHERE id = ?
        `;
        const result = await dbInstance.run(sql, [name, description, price, category, updatedImage, id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Alimento não encontrado para atualização' });
        }

        res.json({
            message: 'Alimento atualizado com sucesso',
            data: {
                id,
                name,
                description,
                price,
                category,
                image: `http://localhost:4000/${updatedImage}`
            }
        });
    } catch (err) {
        console.error('Erro ao atualizar no banco de dados:', err);
        return res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
};

export const getAllFoods = (req, res) => {
    const { page = 0, limit = 10 } = req.query; // Padrão: página 0, 10 itens por página

    // Calcula o offset para o banco de dados
    const offset = page * limit; // O offset deve ser multiplicado pela página

    // Consulta para obter os alimentos com limite e offset
    const sql = `SELECT * FROM foods LIMIT ? OFFSET ?`;

    db.all(sql, [Number(limit), Number(offset)], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Retorna as URLs das imagens completas
        const foodsWithImageUrls = rows.map(food => ({
            ...food,
            image: food.image ? `http://localhost:4000/uploads/${food.image.replace('uploads/', '')}` : 'http://localhost:4000/uploads/default-image.png' // Provide a default image if food.image is null
        }));

        // Consulta para contar o total de alimentos
        const countSql = `SELECT COUNT(*) as total FROM foods`;

        db.get(countSql, [], (err, countRow) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Envia a resposta com dados e informações de paginação
            res.json({
                data: foodsWithImageUrls, // Lista de alimentos
                totalCount: countRow.total, // Total de alimentos
                page: Number(page), // Página atual
                limit: Number(limit) // Limite de itens por página
            });
        });
    });
};





export const deleteFood = (req, res) => {
    const { name } = req.params; // Extrai o nome diretamente de `req.params`

    db.run('DELETE FROM foods WHERE name = ?', [name], function (err) { // Usa `name` no SQL
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Alimento não encontrado' });
        }
        res.json({ message: 'Alimento deletado com sucesso' });
    });
};


// ✅ Atualizado para funcionar corretamente com SQLite e fornecer imagem com URL completa
export const getFoodById = async (req, res) => {
  const { id } = req.params;

  const sql = `SELECT * FROM foods WHERE id = ?`;

  try {
    const dbInstance = await db;
    dbInstance.get(sql, [id], (err, row) => {
      if (err) {
        console.error('Erro ao buscar no banco de dados:', err);
        return res.status(500).json({ message: 'Erro ao buscar o produto' });
      }

      if (!row) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      // ✅ Corrige o caminho da imagem para a URL completa
      row.image = row.image
        ? `http://localhost:4000/uploads/${row.image.replace('uploads/', '')}`
        : 'http://localhost:4000/uploads/default-image.png';

      res.status(200).json(row);
    });
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};
