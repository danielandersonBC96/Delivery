import db from '../Config/database.js'



export const createOrder = (req, res) => {
    const { total, paymentMethod, cartItems } = req.body;
    const user_id = req.userId;  // Extraído do token JWT

    if (!total || !paymentMethod || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando ou carrinho vazio' });
    }

    const query = `INSERT INTO orders (user_id, total, payment_method) VALUES (?, ?, ?)`;
    db.run(query, [user_id, total, paymentMethod], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao criar pedido', error: err.message });
        }

        const orderId = this.lastID;

        const orderItemQuery = `INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)`;

        // Garantir que todos os itens sejam inseridos corretamente
        const insertItems = cartItems.map(item => {
            return new Promise((resolve, reject) => {
                db.run(orderItemQuery, [orderId, item.productId, item.quantity, item.price], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        Promise.all(insertItems)
            .then(() => res.status(201).json({ message: 'Pedido criado com sucesso', orderId }))
            .catch(err => res.status(500).json({ message: 'Erro ao adicionar itens ao pedido', error: err.message }));
    });
};


//Obter pedidos de um usario especifico
export const getUserOrders = (req, res) => {
    const userId = req.userId;  // Obtendo o ID do token

    const query = `SELECT * FROM orders WHERE user_id = ?`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao obter pedidos', error: err.message });
        }
        res.status(200).json({ orders: rows });
    });
};





// Criar itens de pedido
export const createOrderItem = (req, res) => {
    const { order_id, food_id, quantity, price } = req.body;

    const query = `INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)`;

    db.run(query, [order_id, food_id, quantity, price], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao criar item de pedido', error: err.message });
        }
        res.status(201).json({ message: 'Item de pedido criado com sucesso!', orderItemId: this.lastID });
    });
};

// Obter itens de pedido
export const getOrderItems = (req, res) => {
    const { order_id } = req.params;

    const query = `SELECT * FROM order_items WHERE order_id = ?`;

    db.all(query, [order_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao obter itens do pedido', error: err.message });
        }
        res.status(200).json({ orderItems: rows });
    });
};