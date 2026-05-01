const mainContent = document.getElementById('main-content');
const API_URL = 'http://localhost:5000/api';

// --- GESTIÓN DE SESIÓN ---
let usuarioActual = JSON.parse(localStorage.getItem('usuarioZK')) || null;

async function fetchZK(endpoint, options = {}) {
    const usuario = JSON.parse(localStorage.getItem('usuarioZK'));
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (usuario && usuario.uid) {
        headers['usuarioid'] = usuario.uid;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (response.status === 403) {
        alert("⛔ Acceso denegado: No tienes permisos para esta acción.");
    }
    
    return response;
}

// --- VISTA: REGISTRO DE ESTUDIANTES ---
function vistaRegistro() {
    mainContent.innerHTML = `
        <div class="card bg-base-100 shadow-2xl border border-white/5 animate-fadeIn">
            <div class="card-body">
                <h2 class="card-title text-2xl text-primary mb-6">Registro Integral: Estudiante y Acudiente</h2>
                <form id="form-registro-completo" class="space-y-6">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Nombre Estudiante</span></label>
                            <input type="text" name="nombreEstudiante" class="input input-bordered" required>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Documento Estudiante</span></label>
                            <input type="text" name="cedulaNiño" class="input input-bordered">
                        </div>
                    </div>

                    <div class="divider text-secondary font-bold">DATOS DEL ACUDIENTE</div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-200 p-6 rounded-2xl border border-white/5">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold text-secondary italic">Cédula del Acudiente</span></label>
                            <div class="join">
                                <input type="text" id="doc-acudiente" name="cedulaAcudiente" class="input input-bordered join-item w-full" required>
                                <button type="button" onclick="verificarPadre()" class="btn btn-secondary join-item">🔍</button>
                            </div>
                            <label class="label"><span id="status-padre" class="label-text-alt italic opacity-70">Verifica si ya existe</span></label>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold text-gray-300">Nombre Completo</span></label>
                            <input type="text" id="nombre-acudiente" name="nombreAcudiente" class="input input-bordered" required>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold text-gray-300">Correo Electrónico</span></label>
                            <input type="email" id="email-acudiente" name="emailPadre" class="input input-bordered" required>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold text-gray-300">Contraseña Acceso</span></label>
                            <input type="password" id="pass-acudiente" name="passPadre" class="input input-bordered" placeholder="Mínimo 6 caracteres">
                        </div>
                    </div>

                    <div class="divider text-warning font-bold">MÓDULO DE SALUD</div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold text-gray-300">Tipo Sangre</span></label>
                            <select name="sangre" class="select select-bordered w-full">
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div class="form-control col-span-2">
                            <label class="label"><span class="label-text font-bold text-gray-300">EPS / Seguro Médico</span></label>
                            <input type="text" name="eps" class="input input-bordered" placeholder="Nombre de la entidad">
                        </div>
                        <div class="form-control md:col-span-3">
                            <label class="label"><span class="label-text font-bold text-gray-300">Alergias u Observaciones</span></label>
                            <textarea name="alergias" class="textarea textarea-bordered h-20" placeholder="¿Tiene alguna alergia o condición especial?"></textarea>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-full mt-4 shadow-lg">Guardar Registro Integral</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('form-registro-completo').onsubmit = enviarRegistroMaestro;
}

function configurarMenuSegunRol(rol) {
    const menuLateral = document.querySelector('.menu'); 

    if (rol === 'padre') {
        menuLateral.innerHTML = `
            <div class="flex items-center gap-3 px-4 py-6 mb-4">
                <div class="bg-accent text-accent-content rounded-xl p-2 font-black text-xl">ZK</div>
                <span class="text-2xl font-bold tracking-tighter">ZONA KIDS</span>
            </div>
            <li class="menu-title opacity-50 uppercase text-xs font-bold mt-4">Mi Panel</li>
            <li>
                <a onclick="vistaMiHijo()" class="flex gap-4 py-4 hover:bg-accent/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Reporte de Mi Hijo
                </a>
            </li>
            <li><a onclick="cerrarSesion()" class="text-error mt-10">Cerrar Sesión</a></li>
        `;
    } else {
        // Restaurar menú original para admin/profesor si es necesario
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuarioZK');
    firebase.auth().signOut();
    location.reload();
}

// --- VISTA: ASISTENCIA ---
async function vistaAsistencia() {
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold text-secondary italic">Control de Asistencia</h2>
            <div class="badge badge-outline p-4 opacity-70">${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="overflow-x-auto bg-base-100 rounded-xl shadow-xl border border-white/5">
            <table class="table table-zebra w-full">
                <thead>
                    <tr class="bg-base-200">
                        <th>Estudiante / ID</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="lista-asistencia">
                    <tr><td colspan="3" class="text-center py-10"><span class="loading loading-spinner text-primary"></span></td></tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const res = await fetchZK('/estudiantes/todos');
        if (!res.ok) throw new Error("No se pudo cargar la lista.");

        const estudiantes = await res.json();
        const tabla = document.getElementById('lista-asistencia');

        if (estudiantes.length === 0) {
            tabla.innerHTML = `<tr><td colspan="3" class="text-center py-10 opacity-50 italic">No hay estudiantes registrados.</td></tr>`;
            return;
        }

        tabla.innerHTML = estudiantes.map(est => `
            <tr class="hover:bg-base-200 transition-colors">
                <td>
                    <div class="font-bold text-gray-200">${est.nombre || "Sin nombre"}</div>
                    <div class="text-[10px] opacity-40 font-mono">${est.id}</div>
                </td>
                <td>
                    <select id="estado-${est.id}" class="select select-bordered select-sm w-full max-w-xs bg-base-200">
                        <option value="presente">✅ Presente</option>
                        <option value="ausente">❌ Ausente</option>
                        <option value="tarde">🕒 Tarde</option>
                    </select>
                </td>
                <td>
                    <button onclick="guardarAsistencia('${est.id}')" class="btn btn-sm btn-success text-white shadow-md">Guardar</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        document.getElementById('lista-asistencia').innerHTML = `<tr><td colspan="3" class="text-center py-10 text-error">${err.message}</td></tr>`;
    }
}

async function guardarAsistencia(id) {
    const estado = document.getElementById(`estado-${id}`).value;
    try {
        const res = await fetchZK('/asistencia/marcar', {
            method: 'POST',
            body: JSON.stringify({ estudianteId: id, estado: estado })
        });
        if (res.ok) alert("✅ Asistencia guardada");
    } catch (err) { console.error(err); }
}

// --- VISTA: ROLES Y SEGURIDAD ---
function vistaRoles() {
    mainContent.innerHTML = `
        <div class="card bg-base-100 shadow-xl border border-white/5 p-6 mb-8 animate-fadeIn">
            <h2 class="card-title text-2xl text-warning mb-6 italic">🛡️ Gestión de Seguridad</h2>
            <div class="bg-base-200 p-6 rounded-xl">
                <h3 class="font-bold mb-4">Registrar Nuevo Usuario</h3>
                <form id="form-usuario" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" id="reg-nombre" placeholder="Nombre" class="input input-bordered" required>
                    <input type="email" id="reg-email" placeholder="Correo" class="input input-bordered" required>
                    <input type="password" id="reg-pass" placeholder="Contraseña" class="input input-bordered" required>
                    <input type="text" id="reg-cedula" placeholder="Cédula" class="input input-bordered" required>
                    <select id="reg-rol" class="select select-bordered">
                        <option value="profesor">Profesor</option>
                        <option value="admin">Administrador</option>
                        <option value="padre">Padre</option>
                    </select>
                    <input type="text" id="reg-estId" placeholder="ID del Hijo (Opcional)" class="input input-bordered">
                    <button type="submit" class="btn btn-warning md:col-span-2">Crear Cuenta</button>
                </form>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl border border-white/5 p-6">
            <h3 class="font-bold mb-4 text-gray-300">Personal y Usuarios Registrados</h3>
            <div class="overflow-x-auto">
                <table class="table table-sm w-full">
                    <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acción</th></tr></thead>
                    <tbody id="tabla-usuarios-lista"></tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('form-usuario').onsubmit = crearUsuario;
    cargarUsuariosTabla();
}

async function crearUsuario(e) {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('reg-nombre').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-pass').value,
        cedula: document.getElementById('reg-cedula').value,
        rol: document.getElementById('reg-rol').value,
        estudianteId: document.getElementById('reg-estId').value
    };
    try {
        const res = await fetchZK('/usuarios/registrar', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (res.ok) { alert("✅ Usuario creado"); vistaRoles(); }
    } catch (e) { alert("Error al crear usuario"); }
}

async function cargarUsuariosTabla() {
    const tabla = document.getElementById('tabla-usuarios-lista');
    if (!tabla) return;
    try {
        const res = await fetchZK('/usuarios/todos');
        const usuarios = await res.json();
        tabla.innerHTML = usuarios.map(u => `
            <tr class="hover:bg-base-200">
                <td class="font-bold text-gray-200">${u.nombre}</td>
                <td class="opacity-70">${u.email}</td>
                <td>
                    <select onchange="cambiarRol('${u.uid}', this.value)" class="select select-xs select-bordered">
                        <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="profesor" ${u.rol === 'profesor' ? 'selected' : ''}>Profesor</option>
                        <option value="padre" ${u.rol === 'padre' ? 'selected' : ''}>Padre</option>
                    </select>
                </td>
                <td><button onclick="eliminarUsuario('${u.uid}')" class="btn btn-ghost btn-xs text-error">Eliminar</button></td>
            </tr>
        `).join('');
    } catch (e) { tabla.innerHTML = "<tr><td colspan='4' class='text-error'>Error al cargar</td></tr>"; }
}

async function cambiarRol(uid, nuevoRol) {
    try {
        const res = await fetchZK('/usuarios/asignar-rol', {
            method: 'POST',
            body: JSON.stringify({ uid, rol: nuevoRol })
        });
        if (res.ok) alert("✅ Rol actualizado");
    } catch (e) { console.error(e); }
}

async function eliminarUsuario(uid) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
        const res = await fetchZK(`/usuarios/${uid}`, { method: 'DELETE' });
        if (res.ok) { alert("✅ Usuario eliminado"); cargarUsuariosTabla(); }
    } catch (e) { console.error(e); }
}

// --- SISTEMA DE LOGIN ---
async function ejecutarLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    if (!email || !pass) return alert("Por favor, completa todos los campos");

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);
        const uid = userCredential.user.uid;

        const db = firebase.firestore();
        const doc = await db.collection('usuarios').doc(uid).get();

        if (doc.exists) {
            const datosUsuario = { uid, ...doc.data() };
            localStorage.setItem('usuarioZK', JSON.stringify(datosUsuario));
            document.getElementById('login-screen').classList.add('hidden');
            configurarMenuSegunRol(datosUsuario.rol);
            vistaBienvenida();
        } else {
            alert("⚠️ No tienes un perfil asignado.");
        }
    } catch (error) {
        alert("❌ Error: " + error.message);
    }
}

function vistaBienvenida() {
    const usuario = JSON.parse(localStorage.getItem('usuarioZK'));
    if (!usuario) return;
    
    mainContent.innerHTML = `
        <div class="hero bg-base-200 rounded-3xl p-10 border border-white/5 animate-fadeIn">
            <div class="hero-content text-center">
                <div class="max-w-md">
                    <h1 class="text-4xl font-bold text-primary italic">¡Hola, ${usuario.nombre}!</h1>
                    <p class="py-6 opacity-80">Bienvenido al sistema de gestión de Zona Kids.</p>
                    <div class="flex gap-2 justify-center">
                        ${usuario.rol !== 'padre' ? `
                            <button onclick="vistaRegistro()" class="btn btn-primary">Nuevo Registro</button>
                            <button onclick="vistaAsistencia()" class="btn btn-outline">Asistencia</button>
                        ` : `
                            <button onclick="vistaMiHijo()" class="btn btn-accent">Ver Mi Hijo</button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    if (usuarioActual) {
        document.getElementById('login-screen').classList.add('hidden');
        configurarMenuSegunRol(usuarioActual.rol);
        vistaBienvenida();
    }
});

async function verificarPadre() {
    const cedula = document.getElementById('doc-acudiente').value;
    const statusLabel = document.getElementById('status-padre');
    if (!cedula) return;
    statusLabel.innerHTML = 'Buscando...';
    try {
        const res = await fetchZK(`/usuarios/buscar-por-cedula/${cedula}`);
        if (res.ok) {
            const padre = await res.json();
            document.getElementById('nombre-acudiente').value = padre.nombre;
            document.getElementById('email-acudiente').value = padre.email;
            document.getElementById('nombre-acudiente').readOnly = true;
            document.getElementById('email-acudiente').readOnly = true;
            document.getElementById('pass-acudiente').disabled = true;
            statusLabel.innerHTML = "✅ Encontrado";
        } else {
            document.getElementById('nombre-acudiente').readOnly = false;
            document.getElementById('email-acudiente').readOnly = false;
            document.getElementById('pass-acudiente').disabled = false;
            statusLabel.innerHTML = "✨ Nuevo acudiente";
        }
    } catch (err) { statusLabel.innerHTML = "❌ Error"; }
}

async function enviarRegistroMaestro(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const paquete = {
        estudiante: {
            nombre: formData.get('nombreEstudiante'),
            cedula: formData.get('cedulaNiño'),
            salud: { sangre: formData.get('sangre'), eps: formData.get('eps') }
        },
        acudiente: {
            nombre: formData.get('nombreAcudiente'),
            cedula: formData.get('cedulaAcudiente'),
            email: formData.get('emailPadre'),
            password: formData.get('passPadre'),
            esNuevo: !document.getElementById('nombre-acudiente').readOnly
        }
    };

    try {
        const res = await fetchZK('/estudiantes/registro-integral', {
            method: 'POST',
            body: JSON.stringify(paquete)
        });
        if (res.ok) {
            alert("✅ Registro guardado");
            vistaRegistro();
        } else {
            const err = await res.json();
            alert("❌ Error: " + err.error);
        }
    } catch (err) { alert("Error de conexión"); }
}