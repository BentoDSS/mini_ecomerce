from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

import models, schemas
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ComprasJá API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/produtos", response_model=list[schemas.ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(models.Produto).filter(models.Produto.ativo == True).all()
    return produtos

@app.get("/api/admin/produtos", response_model=list[schemas.ProdutoResponse])
def listar_todos_produtos(db: Session = Depends(get_db)):
    # Retorna todos os produtos (ativos e inativos) para o painel admin
    produtos = db.query(models.Produto).all()
    return produtos

@app.post("/api/produtos", response_model=schemas.ProdutoResponse)
def criar_produto(produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    db_produto = models.Produto(**produto.model_dump())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

@app.get("/api/produtos/{produto_id}", response_model=schemas.ProdutoResponse)
def buscar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@app.put("/api/produtos/{produto_id}", response_model=schemas.ProdutoResponse)
def atualizar_produto(produto_id: int, produto: schemas.ProdutoUpdate, db: Session = Depends(get_db)):
    db_produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    for key, value in produto.model_dump().items():
        setattr(db_produto, key, value)
        
    db.commit()
    db.refresh(db_produto)
    return db_produto

@app.delete("/api/produtos/{produto_id}")
def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    db_produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    db.delete(db_produto)
    db.commit()
    return {"message": "Produto deletado com sucesso"}

# ==========================================
# ROTAS DE USUÁRIOS
# ==========================================

@app.get("/api/admin/usuarios", response_model=list[schemas.UsuarioResponse])
def listar_todos_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@app.post("/api/usuarios", response_model=schemas.UsuarioResponse)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
        
    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=usuario.senha, # Em texto puro provisoriamente
        perfil=usuario.perfil,
        ativo=usuario.ativo
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@app.get("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioResponse)
def buscar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario

@app.put("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioResponse)
def atualizar_usuario(usuario_id: int, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db_usuario.nome = usuario.nome
    db_usuario.email = usuario.email
    db_usuario.perfil = usuario.perfil
    db_usuario.ativo = usuario.ativo
    if usuario.senha:
        db_usuario.senha_hash = usuario.senha
        
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@app.delete("/api/usuarios/{usuario_id}")
def deletar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(db_usuario)
    db.commit()
    return {"message": "Usuário deletado com sucesso"}
