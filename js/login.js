const loginForm = document.querySelector('#loginForm')

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    // EndPoint to search an user with email
    const searchForEmail="http://betancurgiraldo-f62ef3back.railway.internal/user/validation/"+email;
    const data = await searchUser(searchForEmail);
    if(data!=null){
        if(data.email==email && data.password==password){
            localStorage.setItem('login_success', JSON.stringify({"id":`${data.idUsuario}`,"email":`${data.email}`}))
            showAlert();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2500);
        }else{
            showReject();
        }
    }else{
        showReject();
    }
})
async function searchUser(url){
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

// SWEET ALERT APROVE
function showAlert() {
    Swal.fire({
        title: 'Welcome',
        text: "User",
        icon: 'success',
        confirmButtonText: 'Acept', 
        customClass: {
            container: 'mi-alerta',
            title: 'mi-titulo',
            content: 'mi-contenido',
            confirmButton: 'mi-boton'
        }
    });
}

// SWEET ALERT REJECT
function showReject() {
    Swal.fire({
        title: 'Error',
        text: `Usuario y/o contraseña son incorrectos o no existen`,
        icon: 'error',
        confirmButtonText: 'Cerrar',
        customClass: {
            container: 'mi-alerta-error',
            title: 'mi-titulo-error',
            content: 'mi-contenido-error',
            confirmButton: 'mi-boton-error'
        }
    });
    const margen = document.querySelector("div:where(.swal2-container)");
    margen.style.padding = "30px"
}