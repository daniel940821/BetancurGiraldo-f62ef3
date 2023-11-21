// ELEMENTOS CONEXION
// INPUTS
const description = document.getElementById("description");
const title=document.getElementById("title")
const tag=document.getElementById("tag")
// BOTONES
const save=document.getElementById("save");
// CONTAINERS CONEXION
const welcomeMessage=document.querySelector(".container_Global");
const sectionCreateNote=document.querySelector(".container_Create");
const createNote=document.querySelector(".container_CreateNote");
const sectionAllNotes = document.querySelector(".container_Notes")
const allNotes=document.querySelector(".container_Note")
const sectionArchivedNotes=document.querySelector(".container_ArchivedNotes")
const archivedNotes=document.querySelector(".container_Archive")
const sectionCategory=document.querySelector(".container_Category")
const category=document.querySelector(".container_Tags")
// ELEMENTOS LISTADO NOTAS DESARCHIVADAS
const containerAllNote = document.querySelector(".container_AllNote")
const messageNote = document.querySelector(".selectNote")
const selectedNote=document.querySelector(".selectedNote")
const titleSelected=document.querySelector(".contentTitleSelected")
const descriptionSelected=document.querySelector(".contentDescriptionSelected")
const tagSelected=document.querySelector(".contentTagSelected")
// ELEMENTOS PARA RUD NOTAS DESARCHIVADAS
const deleteNote=document.querySelector(".delete")
const archiveNote=document.querySelector(".archive")
const updateButton=document.querySelector(".updateButton")
// ELEMENTOS LISTADO NOTAS ARCHIVADAS
const containerAllNoteA = document.querySelector(".container_AllNoteA")
const messageNoteA = document.querySelector(".selectNoteA")
const selectedNoteA=document.querySelector(".selectedNoteA")
const titleSelectedA=document.querySelector(".contentTitleSelectedA")
const descriptionSelectedA=document.querySelector(".contentDescriptionSelectedA")
const tagSelectedA=document.querySelector(".contentTagSelectedA")
// ELEMENTOS PARA RUD NOTAS ARCHIVADAS
const deleteNoteA=document.querySelector(".deleteA")
const archiveNoteA=document.querySelector(".archiveA")
const updateButtonA=document.querySelector(".updateButtonA")
// ELEMENTOS CATEGORY/TAGS
const selectCategory = document.getElementById("categories")
const packCategory=document.querySelector(".container_NoteCategory")

// OBJECT JSON
let noteObject={}
let tagObject={}
// funcion para dar reset a estilos
function resetFeatures(){
    welcomeMessage.style.display="none"
    sectionCreateNote.style.display="none"
    sectionAllNotes.style.display="none"
    sectionArchivedNotes.style.display="none"
    sectionCategory.style.display="none"
    createNote.style.background="none"
    allNotes.style.background="none"
    archivedNotes.style.background="none"
    category.style.background="none"
}

// funcion para limpiar los campos
function clearFields(){
    title.value=""
    description.value=""
    tag.value=""
}

// configuracion para interfaz de Create notas
createNote.addEventListener("click",function (){
    resetFeatures()
    createNote.style.background="#494949"
    sectionCreateNote.style.display="flex"
    clearFields()
})

// configuracion para interfaz de Read,Update,Delete notas desarchivadas
allNotes.addEventListener("click",async function (){
    resetFeatures()
    containerAllNote.textContent=""
    messageNote.style.display="flex"
    allNotes.style.background="#494949"
    sectionAllNotes.style.display="flex"
    selectedNote.style.display="none"
    await setNotes()
})

archivedNotes.addEventListener("click",async function (){
    resetFeatures()
    containerAllNoteA.textContent=""
    messageNoteA.style.display="flex"
    archivedNotes.style.background="#494949"
    sectionArchivedNotes.style.display="flex"
    selectedNoteA.style.display="none"
    await setNotesA()
})

category.addEventListener("click",function (){
    resetFeatures()
    packCategory.innerHTML=""
    welcomeTags()
    category.style.background="#494949"
    sectionCategory.style.display="flex"
    setTags()
})

//  CREATE NOTE  

//Función en input para limitar la cantidad de caracteres
const count = document.querySelector(".count");
const limit= 255;
description.addEventListener("input", function () {
    const content = description.value;
    const remainingChars = limit - content.length;
    if (remainingChars >= 0) {
        count.textContent = remainingChars;
    } else {
        description.value = content.slice(0, limit);
        count.textContent = 0;
    }
});

// Proceso para almacenamiento de notas en la base de datos
save.addEventListener("click",async function(){
    const titleContent=title.value;
    const descriptionContent=description.value;
    if(titleContent=="" && descriptionContent==""){
        showReject("complete all inputs");
    }else if(titleContent==""){
        showReject("Please fill out the title");
    }else if(descriptionContent==""){
        showReject("Please fill out the description");
    }
    else{
        noteObject.title=titleContent
        noteObject.contentNote=descriptionContent
        noteObject.idUser=1
        const endPointGetTag="http://localhost:8080/tag";
        let tagSearch;
        if(tag.value!=""){
            const dataTag= await searchAll(endPointGetTag)
            if(dataTag.length !=0){
                for(let i=0; i<dataTag.length;i++){
                    if(dataTag[i].name==tag.value.toLowerCase()){
                        tagSearch=dataTag[i];
                        break;
                    }
                    if(i==dataTag.length-1){
                        tagObject.name=tag.value.toLowerCase();
                        tagSearch= await postTag(tagObject,endPointGetTag)
                    }
                }
            }else{
                tagObject.name=tag.value.toLowerCase();
                tagSearch= await postTag(tagObject,endPointGetTag)
            }
        }
        if(tagSearch){
            noteObject.idTag=tagSearch.idTag
        }

        const endPointCreateNote="http://localhost:8080/note";
        postNote(noteObject,endPointCreateNote)
    }
})


// POST DE UNA NOTA EN LA SECCION CREAR NOTAS
async function postNote(object,link){
    const res = await fetch(link, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(object),
    });
    if (res.status == 200){
        showAlert("save")
        clearFields()
    }else{
        showReject("We have a little problem, try again")
    }
}


// ALL UNARCHIVED NOTES
async function setNotes(){
    const endPointGetNotes="http://localhost:8080/note";
    const notes = await searchAll(endPointGetNotes)
    notes.forEach(async note =>  {
        let textTag=""
        if(note.archived==false){
            if(note.idTag!=null){
                const endPointGetTag="http://localhost:8080/tag/"+note.idTag;
                const data = await searchAll(endPointGetTag);
                textTag=data.name;
            }
            const noteContent = createNoteElement(note, textTag);
            containerAllNote.appendChild(noteContent);
            noteContent.addEventListener("click", () => handleNoteClick(note));
        }
    })
}

function createNoteElement(note, textTag) {
    const noteContent = document.createElement("div");
    noteContent.classList.add("noteContent");
    noteContent.id = note.idNote;

    const titleElement = document.createElement("p");
    titleElement.classList.add("titleNote");
    titleElement.textContent = note.title;

    const hrElement = document.createElement("hr");

    const contentElement = document.createElement("p");
    contentElement.classList.add("contentNote");
    contentElement.textContent = note.contentNote;

    const tagElement = document.createElement("p");
    tagElement.classList.add("tagNote");
    tagElement.textContent = textTag;

    noteContent.appendChild(titleElement);
    noteContent.appendChild(hrElement);
    noteContent.appendChild(contentElement);
    noteContent.appendChild(tagElement);

    return noteContent;
}

// Funcion acorde a la tarjeta clickeada
const count1 = document.querySelector(".count1");
async function handleNoteClick(note) {
    messageNote.style.display = "none";
    selectedNote.style.display = "flex";
    selectedNote.id = note.idNote;
    titleSelected.value=note.title
    descriptionSelected.value=note.contentNote
    count1.textContent=255-descriptionSelected.value.length
    if(note.idTag!=null){
        const endPointGetTag="http://localhost:8080/tag/"+note.idTag;
        const data = await searchAll(endPointGetTag);
        tagSelected.value=data.name
    }else{
        tagSelected.value=""
    }
}

//Función en textarea para limitar la cantidad de caracteres
const limit1= 255;
descriptionSelected.addEventListener("input", function () {
    const content = descriptionSelected.value;
    const remainingChars = limit1 - content.length;
    if (remainingChars >= 0) {
        count1.textContent = remainingChars;
    } else {
        descriptionSelected.value = content.slice(0, limit);
        count1.textContent = 0;
    }
});

// Metodo para eliminar una vez se le da al contenedor delete
deleteNote.addEventListener("click",async ()=>{
    const endPointDeleteNote="http://localhost:8080/note/"+selectedNote.id;
    await deleteId(endPointDeleteNote);
    simulateClick(allNotes);
})
// Metodo para archivar una vez se le da al contenedor delete
archiveNote.addEventListener("click",async ()=>{
    const endPointUpdateNote="http://localhost:8080/note";
    let data = await verifyUpdate();
    data.archived=true
    await updateId(endPointUpdateNote,data);
    simulateClick(archivedNotes);
})

updateButton.addEventListener("click",async ()=>{
    const endPointUpdateNote="http://localhost:8080/note";
    let data = await verifyUpdate();
    await updateId(endPointUpdateNote,data);
    simulateClick(allNotes);
})

// FUNCION QUE VERIFICA DATOS ANTES DE HACER UN UPDATE
async function verifyUpdate(){
    const endPointGetNote="http://localhost:8080/note/"+selectedNote.id;
    let data = await searchAll(endPointGetNote)
    data.title=titleSelected.value
    data.contentNote= descriptionSelected.value
    if(data.idTag!=undefined){
        const endPointGetTag="http://localhost:8080/tag/"+data.idTag;
        const dataTag = await searchAll(endPointGetTag)
        if(dataTag.name==tagSelected.value){
        }else {
            const find = await verifyTag(tagSelected.value)
            data.idTag=find
        }
    }else if(tagSelected.value!=""){
        const value= await verifyTag(tagSelected.value)
        data.idTag=value
    }
    return data
}

async function verifyTag(tag){
    let find =false
    const endPointGetTag="http://localhost:8080/tag";
    const dataTag = await searchAll(endPointGetTag);
    for(let i=0; i<dataTag.length;i++){
        if(dataTag[i].name==tag.toLowerCase()){
            find = dataTag[i].idTag;
            break;
        }
    }
    if(find){
        return find;
    }else{
        const endPointPostTag="http://localhost:8080/tag";
        tagObject.name= tag.toLowerCase();
        const object= await postTag(tagObject,endPointPostTag)
        return object.idTag;
    }
}

// ALL ARCHIVED NOTES
async function setNotesA(){
    const endPointGetNotes="http://localhost:8080/note";
    const notes = await searchAll(endPointGetNotes)
    notes.forEach(async note =>  {
        let textTag=""
        if(note.archived==true){
            if(note.idTag!=null){
                const endPointGetTag="http://localhost:8080/tag/"+note.idTag;
                const data = await searchAll(endPointGetTag);
                textTag=data.name;
            }
            const noteContent = createNoteElement(note, textTag);
            containerAllNoteA.appendChild(noteContent);
            noteContent.addEventListener("click", () => handleNoteClickA(note));
        }
    })
}

// Funcion acorde a la tarjeta clickeada
const count1A = document.querySelector(".count1A");
async function handleNoteClickA(note) {
    messageNoteA.style.display = "none";
    selectedNoteA.style.display = "flex";
    selectedNoteA.id = note.idNote;
    titleSelectedA.value=note.title
    descriptionSelectedA.value=note.contentNote
    count1A.textContent=255-descriptionSelectedA.value.length
    if(note.idTag!=null){
        const endPointGetTag="http://localhost:8080/tag/"+note.idTag;
        const data = await searchAll(endPointGetTag);
        tagSelectedA.value=data.name
    }else{
        tagSelectedA.value=""
    }
}

//Función en textarea para limitar la cantidad de caracteres
const limit1A= 255;
descriptionSelectedA.addEventListener("input", function () {
    const content = descriptionSelectedA.value;
    const remainingChars = limit1A - content.length;
    if (remainingChars >= 0) {
        count1A.textContent = remainingChars;
    } else {
        descriptionSelectedA.value = content.slice(0, limit);
        count1A.textContent = 0;
    }
});

// Metodo para eliminar una vez se le da al contenedor delete
deleteNoteA.addEventListener("click",async ()=>{
    const endPointDeleteNote="http://localhost:8080/note/"+selectedNoteA.id;
    await deleteId(endPointDeleteNote);
    simulateClick(archivedNotes);
})
// Metodo para desarchivar una vez se le da al contenedor delete
archiveNoteA.addEventListener("click",async ()=>{
    const endPointUpdateNote="http://localhost:8080/note";
    let data = await verifyUpdateA();
    data.archived=false
    await updateId(endPointUpdateNote,data);
    simulateClick(allNotes);
})

updateButtonA.addEventListener("click",async ()=>{
    const endPointUpdateNote="http://localhost:8080/note";
    let data = await verifyUpdateA();
    await updateId(endPointUpdateNote,data);
    simulateClick(archivedNotes);
})


// FUNCION QUE VERIFICA DATOS ANTES DE HACER UN UPDATE
async function verifyUpdateA(){
    const endPointGetNote="http://localhost:8080/note/"+selectedNoteA.id;
    let data = await searchAll(endPointGetNote)
    data.title=titleSelectedA.value
    data.contentNote= descriptionSelectedA.value
    if(data.idTag!=undefined){
        const endPointGetTag="http://localhost:8080/tag/"+data.idTag;
        const dataTag = await searchAll(endPointGetTag)
        if(dataTag.name==tagSelectedA.value){
        }else {
            const find = await verifyTag(tagSelectedA.value)
            data.idTag=find
        }
    }else if(tagSelectedA.value!=""){
        const value= await verifyTag(tagSelectedA.value)
        data.idTag=value
    }
    return data
}


// METODOS PARA SECCION ARCHIVADOS Y DESARCHIVADOS
// Funcion que simula click en el contenedor para actualizar el contenido
function simulateClick(element) {
    var event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(event);
}

// GET DE TODOS LOS DATOS ALMACENADOS
async function searchAll(url){
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

// DELETE DE UN ELEMENTO POR ID
async function deleteId(link){
    const res = await fetch(link, {
        method: "DELETE",
    });
    if(res.status==200){
        showAlert("Delete")
    }
}

// UPDATE DE UN ELEMENTO POR ID
async function updateId(link,object){
    const res = await fetch(link, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(object),
    });
    if(res.status==200){
        showAlert("Update")
    }
}
// POST DE UNA ETIQUETA
async function postTag(object,link){
    const res = await fetch(link, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(object),
    });
    if (res.status == 200){
        const responseObject = await res.json();
        return responseObject;
    }else{
        showReject("We have a little problem, try again")
    }
}

/* TAGS */
function welcomeTags(){
    packCategory.innerHTML=`<p class="text_Category">
    <span class="material-symbols-outlined">
    style
    </span>
    select the TAG to see your notes
</p>`
}
async function setTags(){
    const endPointGetTags="http://localhost:8080/tag";
    const data = await searchAll(endPointGetTags)
    selectCategory.innerHTML=""
    const option = document.createElement("option")
    option.value="None"
    option.text="None"
    selectCategory.appendChild(option)
    for (let i =0 ; i< data.length;i++) {
        const option = document.createElement("option")
        if(data[i].name==""){
            option.value=data[i].idTag
            option.text="Non asigned TAG"
        }else{
            option.value=data[i].idTag
            option.text=data[i].name
        }
        selectCategory.appendChild(option)
    }
}
// Listener segun el option seleccionado
selectCategory.addEventListener("change",async ()=>{
    const optionSelectedId =selectCategory.value
    const selectedIndex = selectCategory.selectedIndex;
    const selectedOption = selectCategory.options[selectedIndex];
    const selectedText = selectedOption.text;
    if(optionSelectedId=="None"){
        welcomeTags()
    }else{
        packCategory.innerHTML=""
        endPointGetNote="http://localhost:8080/note"
        const data = await searchAll(endPointGetNote)
        let count =0;
        for (let i =0 ; i< data.length;i++) {
            if((data[i].idTag==optionSelectedId ||data[i].idTag==null) && selectedText=="Non asigned TAG"){
                count++
                const noteContent = createNoteElementTags(data[i])
                packCategory.appendChild(noteContent);
            }else  if(data[i].idTag==optionSelectedId){
                count++
                const noteContent = createNoteElementTags(data[i])
                packCategory.appendChild(noteContent);
            }
        }
        if(count==0){
            packCategory.innerHTML=`<p class="text_Category">
                <span class="material-symbols-outlined">
                add_circle
                </span>
                You don't have notes with this TAG
            </p>`
        }
    }
})


function createNoteElementTags(note) {
const noteContent = document.createElement("div");
noteContent.classList.add("filterNote");

const titleElement = document.createElement("p");
titleElement.classList.add("filterTitle");
titleElement.textContent = note.title;

const hrElement = document.createElement("hr");

const contentElement = document.createElement("p");
contentElement.classList.add("filterDescription");
contentElement.textContent = note.contentNote;

const statusElement = document.createElement("p");
statusElement.classList.add("filterStatus");
if(note.archived==false){
    statusElement.textContent = "Unarchived";
}else{
    statusElement.textContent = "Archived";
}

noteContent.appendChild(titleElement);
noteContent.appendChild(hrElement);
noteContent.appendChild(contentElement);
noteContent.appendChild(statusElement);

return noteContent;
}

// SWEET ALERT SUCCESS
function showAlert(message) {
    Swal.fire({
        title: message,
        text: "success",
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
function showReject(message) {
    Swal.fire({
        title: 'Error',
        text: message,
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