"""Carga inicial de datos. Ejecutar desde backend/: python -m app.db.seed

Es idempotente: se puede correr varias veces sin duplicar nada. Busca cada
registro por su clave natural (username, nombre) y solo crea los que faltan.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def _img(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=600&auto=format&fit=crop"


# ---------------------------------------------------------
# DATOS INICIALES
# ---------------------------------------------------------
USUARIOS = [
    # (username, full_name, email, password, role)
    ("admin", "Administrador Food Store", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente de Prueba", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas caseras con pan de papa"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Acompañamientos", "Papas, empanadas y otros para compartir"),
    ("Bebidas", "Gaseosas, limonadas y cervezas"),
    ("Postres", "Opciones dulces para terminar"),
]

PRODUCTOS = [
    # (categoría, nombre, descripción, precio, stock, imagen)
    ("Hamburguesas", "Hamburguesa clásica", "Medallón de carne, lechuga, tomate y cheddar", 8500, 25, "1568901346375-23c9450c58cd"),
    ("Hamburguesas", "Hamburguesa doble cheddar", "Doble medallón, doble cheddar y panceta", 11200, 15, "1550547660-d9450f859349"),
    ("Hamburguesas", "Hamburguesa veggie", "Medallón de lentejas, rúcula y alioli", 9000, 10, "1553979459-d2229ba7433b"),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y orégano", 9800, 20, "1513104890138-7c749659a591"),
    ("Pizzas", "Pizza margherita", "Tomate, muzzarella fresca y albahaca", 10500, 12, "1574071318508-1cdbab80d002"),
    ("Pizzas", "Pizza pepperoni", "Muzzarella y pepperoni", 11800, 8, "1565299624946-b28f40a0ae38"),
    ("Acompañamientos", "Papas fritas", "Porción grande con sal marina", 4500, 40, "1573080496219-bb080dd4f877"),
    ("Acompañamientos", "Empanadas de carne (x3)", "Carne cortada a cuchillo, al horno", 5400, 30, "1601050690597-df0568f70950"),
    ("Bebidas", "Gaseosa línea cola 500 ml", "Bien fría", 2200, 60, "1622483767028-3f66f32aef97"),
    ("Bebidas", "Limonada con menta", "Limonada casera con menta y jengibre", 3000, 25, "1621263764928-df1444c5e859"),
    ("Bebidas", "Cerveza artesanal 473 ml", "Golden ale", 3800, 3, "1608270586620-248524c67de9"),
    ("Postres", "Helado (1/4 kg)", "Dos gustos a elección", 4800, 18, "1563805042-7684c019e1cb"),
    ("Postres", "Brownie con nueces", "Con salsa de chocolate", 3900, 14, "1606313564200-e75d5e30476c"),
    ("Postres", "Cheesecake de frutos rojos", "Porción individual", 4600, 0, "1533134242443-d4fd215305ad"),
]


def seed() -> None:
    create_all_tables()
    creados = {"usuarios": 0, "categorias": 0, "productos": 0}

    # El seed es un script, no una petición: usa una sesión propia y un único
    # commit al final (si algo falla, no queda nada a medias)
    with Session(engine) as session:
        for username, full_name, email, password, role in USUARIOS:
            if session.exec(select(Usuario).where(Usuario.username == username)).first() is None:
                session.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )
                creados["usuarios"] += 1

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()  # asigna el id para usarlo en los productos
                creados["categorias"] += 1
            categorias[nombre] = categoria

        for cat, nombre, descripcion, precio, stock, foto in PRODUCTOS:
            if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=_img(foto),
                    )
                )
                creados["productos"] += 1

        session.commit()

    print(
        f"Seed OK · creados: {creados['usuarios']} usuarios, "
        f"{creados['categorias']} categorías, {creados['productos']} productos "
        "(los existentes se conservan)"
    )


if __name__ == "__main__":
    seed()
