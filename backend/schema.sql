CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(150)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    senha_hash  TEXT          NOT NULL,
    perfil      VARCHAR(10)   NOT NULL DEFAULT 'user',
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE produtos (
    id                  SERIAL PRIMARY KEY,
    nome                VARCHAR(200)   NOT NULL,
    descricao           TEXT,
    preco               NUMERIC(10,2)  NOT NULL,
    quantidade_estoque  INTEGER        NOT NULL DEFAULT 0,
    categoria           VARCHAR(100),
    ativo               BOOLEAN        NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP      DEFAULT NOW(),
    atualizado_em       TIMESTAMP      DEFAULT NOW()
);
