from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float
    quantidade_estoque: int = 0
    categoria: Optional[str] = None
    ativo: bool = True

class ProdutoResponse(ProdutoBase):
    id: int
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(ProdutoBase):
    pass

class UsuarioBase(BaseModel):
    nome: str
    email: str
    perfil: str = "user"
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(UsuarioBase):
    senha: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True
