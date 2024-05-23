const tokenBlacklist = new Set();

const agregarATokenBlacklist = (token) => {
    tokenBlacklist.add(token);
    console.log(`Token añadido a la lista negra: ${token}`);
};

const tokenEnTokenBlacklist = (token) => {
    const estaEnListaNegra = tokenBlacklist.has(token);
    console.log(`Verificando token: ${token}`);
    console.log(`¿Token en lista negra? ${estaEnListaNegra}`);
    return estaEnListaNegra;
};

module.exports = {
    agregarATokenBlacklist,
    tokenEnTokenBlacklist,
};