const mainContent = document.getElementById('main-content');
const API_URL = 'http://localhost:5000/api';

// --- GESTIÓN DE SESIÓN ---
let usuarioActual = JSON.parse(localStorage.getItem('usuarioZK')) || null;

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
    const menuLateral = document.querySelector('.menu'); // El <ul> de tu HTML

    if (rol === 'padre') {
        // Si es padre, borramos todo el menú y ponemos solo lo suyo
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
            <li><a onclick="location.reload()" class="text-error mt-10">Cerrar Sesión</a></li>
        `;
    }
    // Si es admin o profesor, el menú se queda como está en el HTML original
}

async function enviarRegistro(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        nombre: formData.get('nombre'),
        acudiente: { nombre: formData.get('acudienteNombre'), telefono: formData.get('telefono'), parentesco: formData.get('parentesco') },
        salud: { tipoSangre: formData.get('sangre'), eps: formData.get('eps') }
    };
    try {
        const res = await fetch(`${API_URL}/estudiantes/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) alert("✅ Guardado correctamente");
    } catch (err) { console.error(err); }
}

// --- VISTA: ASISTENCIA ---
async function vistaAsistencia() {
    // 1. Dibujamos la estructura base con un loader
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
                    <tr>
                        <td colspan="3" class="text-center py-10">
                            <span class="loading loading-spinner loading-lg text-primary"></span>
                            <p class="mt-2 opacity-50">Obteniendo lista de estudiantes...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        // 2. Petición al servidor
        const res = await fetch(`${API_URL}/estudiantes/todos`);
        
        // Verificamos si la respuesta es exitosa (código 200)
        if (!res.ok) {
            const errorTxt = await res.text();
            console.error("Respuesta fallida del servidor:", errorTxt);
            throw new Error(`Error ${res.status}: No se pudo conectar con la base de datos.`);
        }

        const datosRecibidos = await res.json();
        
        // --- LOG DE DEPURACIÓN ---
        console.log("DATOS REALES LLEGANDO:", datosRecibidos);
        // -------------------------

        let estudiantes = datosRecibidos;

        // Si el backend envió los datos dentro de una propiedad 'data'
        if (datosRecibidos && datosRecibidos.data) {
            estudiantes = datosRecibidos.data;
        }

        const tabla = document.getElementById('lista-asistencia');

        // 3. Validación de Array
        if (!Array.isArray(estudiantes)) {
            // Intentamos extraer un mensaje de error del objeto recibido
            const msgServer = datosRecibidos.message || datosRecibidos.error || "Formato de datos inválido";
            throw new Error(msgServer);
        }

        // 4. Si la lista está vacía
        if (estudiantes.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-10 opacity-50 italic">
                        No hay estudiantes registrados en el sistema.
                    </td>
                </tr>`;
            return;
        }

        // 5. Renderizar la tabla
        tabla.innerHTML = "";
        estudiantes.forEach(est => {
            // Soporte para registros viejos y nuevos
            const nombreAMostrar = est.nombre || est.nombreEstudiante || "Estudiante sin nombre";
            
            tabla.innerHTML += `
                <tr class="hover:bg-base-200 transition-colors">
                    <td>
                        <div class="font-bold text-gray-200">${nombreAMostrar}</div>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] opacity-40 font-mono bg-base-300 px-1 rounded">${est.id}</span>
                            <button onclick="navigator.clipboard.writeText('${est.id}')" class="btn btn-ghost btn-xs p-0 h-auto min-h-0 text-primary" title="Copiar ID">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                            </button>
                        </div>
                    </td>
                    <td>
                        <select id="estado-${est.id}" class="select select-bordered select-sm w-full max-w-xs bg-base-200">
                            <option value="presente">✅ Presente</option>
                            <option value="ausente">❌ Ausente</option>
                            <option value="tarde">🕒 Tarde</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="guardarAsistencia('${est.id}')" class="btn btn-sm btn-success text-white shadow-md">
                            Guardar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Error cargando asistencia:", err);
        document.getElementById('lista-asistencia').innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-10 bg-error/10 border border-error/20 rounded-xl">
                    <div class="text-error font-bold text-lg">⚠️ Error de Carga</div>
                    <p class="text-sm opacity-80">${err.message}</p>
                    <button onclick="vistaAsistencia()" class="btn btn-xs btn-outline btn-error mt-4">Reintentar</button>
                </td>
            </tr>`;
    }
}

// --- FUNCIÓN PARA COPIAR EL ID ---
function copiarID(id) {
    navigator.clipboard.writeText(id).then(() => {
        // Un pequeño mensaje temporal para confirmar
        alert("✅ ID copiado al portapapeles: " + id);
    });
}

async function guardarAsistencia(id) {
    const estado = document.getElementById(`estado-${id}`).value;
    
    try {
        const res = await fetch(`${API_URL}/asistencia/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estudianteId: id,
                estado: estado,
                observaciones: ""
            })
        });
        
        if (res.ok) alert("¡Asistencia guardada!");
    } catch (err) {
        console.error(err);
    }
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
                    <select id="reg-rol" class="select select-bordered">
                        <option value="profesor">Profesor</option>
                        <option value="admin">Administrador</option>
                        <option value="padre">Padre</option>
                    </select>
                    <input type="text" id="reg-estId" placeholder="ID del Hijo (Solo Padres)" class="input input-bordered">
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
        rol: document.getElementById('reg-rol').value,
        estudianteId: document.getElementById('reg-estId').value
    };
    try {
        const res = await fetch(`${API_URL}/usuarios/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { alert("✅ Usuario creado"); vistaRoles(); }
    } catch (e) { alert("Error al crear usuario"); }
}

async function cargarUsuariosTabla() {
    const tabla = document.getElementById('tabla-usuarios-lista');
    if (!tabla) return;
    try {
        const res = await fetch(`${API_URL}/usuarios/todos`);
        const usuarios = await res.json();
        if (usuarios.length === 0) {
            tabla.innerHTML = `<tr><td colspan="4" class="text-center opacity-50">No hay usuarios.</td></tr>`;
            return;
        }
        tabla.innerHTML = usuarios.map(u => `
            <tr class="hover:bg-base-200">
                <td class="font-bold text-gray-200">${u.nombre}</td>
                <td class="opacity-70">${u.email}</td>
                <td>
                    <span class="badge ${u.rol === 'admin' ? 'badge-error' : 'badge-primary'} badge-outline">
                        ${u.rol.toUpperCase()}
                    </span>
                </td>
                <td><button class="btn btn-ghost btn-xs text-error">Eliminar</button></td>
            </tr>
        `).join('');
    } catch (e) {
        tabla.innerHTML = "<tr><td colspan='4' class='text-error'>Error al cargar lista</td></tr>";
    }
}

// --- SISTEMA DE LOGIN ---
function mostrarLogin() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.remove('hidden');
}

// --- 1. FUNCIÓN DE BIENVENIDA (Defínela primero) ---
function vistaBienvenida() {
    const main = document.getElementById('main-content');

    // Obtenemos los datos del usuario que guardamos en el login
    const usuarioStr = localStorage.getItem('usuarioZK');
    if (!usuarioStr) return;
    const usuario = JSON.parse(usuarioStr);

    if (usuario.rol === 'padre') {
        // --- VISTA PARA PADRES ---
        main.innerHTML = `
            <div class="hero bg-base-200 rounded-3xl p-10 border border-white/5 animate-fadeIn">
                <div class="hero-content text-center">
                    <div class="max-w-md">
                        <h1 class="text-4xl font-bold text-accent italic">¡Hola, ${usuario.nombre}!</h1>
                        <p class="py-6 text-lg opacity-80">Bienvenido al portal familiar. Aquí puedes seguir de cerca el bienestar de tu hijo en Zona Kids.</p>
                        <button onclick="vistaMiHijo()" class="btn btn-accent px-8 shadow-lg">Ver Reporte del Estudiante</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // --- VISTA PARA ADMIN / PROFESOR ---
        main.innerHTML = `
            <div class="hero bg-base-200 rounded-3xl p-10 border border-white/5 animate-fadeIn">
                <div class="hero-content text-center">
                    <div class="max-w-md">
                        <h1 class="text-5xl font-bold text-primary">Zona Kids</h1>
                        <p class="py-6 text-lg opacity-80">Panel de Control Administrativo. Gestiona registros y asistencia profesional.</p>
                        <div class="flex flex-wrap gap-3 justify-center">
                            <button onclick="vistaRegistro()" class="btn btn-primary px-6">Nuevo Registro</button>
                            <button onclick="vistaAsistencia()" class="btn btn-outline px-6">Pasar Asistencia</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

async function ejecutarLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    if (!email || !pass) return alert("Por favor, completa todos los campos");

    try {
        // 1. Autenticación en Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);
        const uid = userCredential.user.uid;

        // 2. Obtener datos extra (rol) desde Firestore
        const db = firebase.firestore();
        const doc = await db.collection('usuarios').doc(uid).get();

        if (doc.exists) {
            const datosUsuario = doc.data();
            localStorage.setItem('usuarioZK', JSON.stringify(datosUsuario));

            // Ocultar login
            document.getElementById('login-screen').style.display = 'none';

            // Configurar el menú según el rol
            configurarMenuSegunRol(datosUsuario.rol);

            vistaBienvenida();
        } else {
            // Si el usuario existe en Auth pero no tiene perfil en Firestore
            console.warn("Usuario sin perfil en Firestore");
            alert("⚠️ Acceso concedido, pero no tienes un rol asignado. Contacta al administrador.");

            // Opcional: Dejarlo entrar pero con menú básico
            document.getElementById('login-screen').style.display = 'none';
            vistaBienvenida();
        }

    } catch (error) {
        console.error("Error de login:", error);
        alert("❌ Error al ingresar: " + error.message);
    }
}

// --- ARRANQUE AUTOMÁTICO CORREGIDO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Zona Kids: Sistema cargado y listo");

    // Si el usuario no está logueado, podrías mostrar login, 
    // por ahora cargamos el registro por defecto para que no veas la pantalla vacía
    vistaRegistro();
});

async function vistaMiHijo() {
    const usuario = JSON.parse(localStorage.getItem('usuarioZK'));
    // usuario.estudiantes ahora es un array: ["id1", "id2"]

    mainContent.innerHTML = `<h2 class="text-3xl font-bold text-accent mb-6">Mis Hijos en Zona Kids</h2>
                             <div id="contenedor-hijos" class="grid gap-6"></div>`;

    const contenedor = document.getElementById('contenedor-hijos');

    // Buscamos los datos de cada hijo en la lista
    for (const idHijo of usuario.estudiantes) {
        const res = await fetch(`${API_URL}/estudiantes/${idHijo}`);
        const hijo = await res.json();

        contenedor.innerHTML += `
            <div class="card bg-base-100 shadow-xl border-l-4 border-accent">
                <div class="card-body">
                    <h3 class="text-xl font-bold">${hijo.nombre}</h3>
                    <p class="opacity-70">Salud: ${hijo.sangre} | EPS: ${hijo.eps}</p>
                    <button class="btn btn-xs btn-outline btn-accent mt-2">Ver Asistencia Detallada</button>
                </div>
            </div>
        `;
    }
}

// Variable global para saber si el acudiente es nuevo o ya existe
let acudienteExistente = false;

async function verificarPadre() {
    const cedula = document.getElementById('doc-acudiente').value;
    const statusLabel = document.getElementById('status-padre');
    
    if (!cedula) return;

    statusLabel.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Buscando...';

    try {
        const res = await fetch(`${API_URL}/usuarios/buscar-por-cedula/${cedula}`);
        
        if (res.ok) {
            const padre = await res.json();
            
            // 1. Llenar campos
            document.getElementById('nombre-acudiente').value = padre.nombre;
            document.getElementById('email-acudiente').value = padre.email;
            
            // 2. Bloquear campos para que no se editen (opcional pero recomendado)
            document.getElementById('nombre-acudiente').readOnly = true;
            document.getElementById('email-acudiente').readOnly = true;
            document.getElementById('pass-acudiente').placeholder = "Cuenta existente (no requiere contraseña)";
            document.getElementById('pass-acudiente').disabled = true;

            statusLabel.innerHTML = "✅ Acudiente encontrado. Se vinculará el nuevo estudiante.";
            statusLabel.classList.add("text-success");
            acudienteExistente = true;
        } else {
            // Si no existe, habilitamos todo para registro nuevo
            acudienteExistente = false;
            document.getElementById('nombre-acudiente').readOnly = false;
            document.getElementById('email-acudiente').readOnly = false;
            document.getElementById('pass-acudiente').disabled = false;
            statusLabel.innerHTML = "✨ Acudiente nuevo. Por favor completa los datos.";
            statusLabel.classList.remove("text-success");
        }
    } catch (err) {
        statusLabel.innerHTML = "❌ Error al verificar";
    }
}
async function enviarRegistroMaestro(e) {
    e.preventDefault();
    
    // Bloqueamos el botón para evitar múltiples clics
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading loading-spinner"></span> Guardando...';

    const formData = new FormData(e.target);
    
    // Estructuramos el paquete de datos
    const paqueteCompleto = {
        estudiante: {
            nombre: formData.get('nombreEstudiante'),
            cedula: formData.get('cedulaNiño'),
            salud: {
                sangre: formData.get('sangre'),
                eps: formData.get('eps')
            }
        },
        acudiente: {
            nombre: formData.get('nombreAcudiente'),
            cedula: formData.get('cedulaAcudiente'),
            email: formData.get('emailPadre'),
            password: formData.get('passPadre'), // Solo se usará si el padre es nuevo
            esNuevo: !document.getElementById('nombre-acudiente').readOnly
        }
    };
    

    try {
        const res = await fetch(`${API_URL}/estudiantes/registro-integral`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paqueteCompleto)
        });

        const data = await res.json();

        if (res.ok) {
            alert("¡Todo guardado!\n- Estudiante creado\n- Padre vinculado correctamente.");
            e.target.reset();
            // Limpiamos el estado del formulario
            document.getElementById('status-padre').innerText = "";
            document.getElementById('nombre-acudiente').readOnly = false;
        } else {
            throw new Error(data.error || "Error desconocido");
        }

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Registrar Estudiante y Crear Cuenta de Padre";
    }
}