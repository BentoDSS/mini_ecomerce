import React from "react";

export default function CardProduto({ produto }) {
  return (
    <div className="product-card glass-panel">
      <div className="product-image">
        <span className="product-icon">🛍️</span>
      </div>
      <div className="product-content">
        <div className="product-category">{produto.categoria || "Geral"}</div>
        <h3 className="product-title">{produto.nome}</h3>
        <p className="product-desc">
          {produto.descricao || "Sem descrição disponível para este produto."}
        </p>
        <div className="product-footer">
          <span className="product-price">
            R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
          </span>
          <button className="add-to-cart">Comprar</button>
        </div>
      </div>
    </div>
  );
}
