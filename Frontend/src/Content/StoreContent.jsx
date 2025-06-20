import { createContext, useState, useEffect } from "react";
import { food_list } from "../assets/frontend_assets/assets";

// Preços dos acompanhamentos (definidos no código)
const acompanhamento_principal = [
  { name: "Vinagrete", preco: 2.5 },
  { name: "Vatapá", preco: 3 },
  { name: "Maionese", preco: 2.8 },
  { name: "Farofa", preco: 2 },
];

const acompanhamento_refri = [
  { name: "Refrigerante 300 ml", preco: 3 },
  { name: "Refrigerante 1l", preco: 5 },
  { name: "Refrigerante 2l", preco: 7 },
];

const acompanhamento_arroz = [
  { name: "Arroz Branco", preco: 4 },
  { name: "Arroz com brócolis", preco: 5 },
  { name: "Arroz Carreteiro", preco: 6 },
  { name: "Arroz Tropeiro", preco: 5.5 },
];

const acompanhamento_batata = [
  { name: "Batata média 1 pessoa", preco: 3.5 },
  { name: "Batata grande 2 pessoas", preco: 6.5 },
  { name: "Batata família", preco: 8.5 },
];

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Inicializa o estado do carrinho como array
  const [cartItems, setCartItems] = useState([]);

  // Função para adicionar ao carrinho
  const addToCart = (cartItem) => {
    if (!cartItem || !cartItem.id || !cartItem.price) {
      console.warn("Item inválido:", cartItem);
      return;
    }

    const existingItemIndex = cartItems.findIndex(
      (item) => item.product._id === cartItem.id
    );

    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      updatedCartItems[existingItemIndex].acompanhamentos = cartItem.extras || [];
      setCartItems(updatedCartItems);
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          product: { _id: cartItem.id, ...cartItem },
          quantity: 1,
          acompanhamentos: cartItem.extras || [],
        },
      ]);
    }
  };

  // Função para remover do carrinho (corrigida)
  const removeFromCart = (productId) => {
    if (!productId) {
      console.warn("ItemId inválido:", itemId);
      return;
    }

    setCartItems((prev) => {
      // Filtra o array removendo o item com product._id igual a itemId
      const updatedCartItems = prev.filter(
        (item) => String(item.product._id) !== String(productId)
      );

      if (updatedCartItems.length === prev.length) {
        console.warn(`Item com ID ${itemId} não encontrado no carrinho.`);
      }

      return updatedCartItems;
    });
  };

  // Função para calcular o preço de acompanhamento
  const getAcompanhamentoPrice = (acomp) => {
    if (!acomp || !acomp.name) {
      console.warn("Acompanhamento inválido:", acomp);
      return 0;
    }

    const allAcompanhamentos = [
      ...acompanhamento_principal,
      ...acompanhamento_refri,
      ...acompanhamento_arroz,
      ...acompanhamento_batata,
    ];

    const selectedAcompanhamento = allAcompanhamentos.find(
      (a) => a.name === acomp.name
    );
    return selectedAcompanhamento ? selectedAcompanhamento.preco : 0;
  };

  // Função para calcular o total do carrinho
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    let acompanhamentoTotal = 0;

    cartItems.forEach((item) => {
      totalAmount += item.product.price * item.quantity;

      item.acompanhamentos.forEach((acomp) => {
        acompanhamentoTotal += acomp.price * item.quantity;
      });
    });

    return totalAmount + acompanhamentoTotal;
  };

  // UseEffect para debug do estado do carrinho
  useEffect(() => {
    console.log("Estado atual do carrinho:", JSON.stringify(cartItems, null, 2));
  }, [cartItems]);

  // Contexto com todas as funções e valores
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
