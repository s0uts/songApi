let failedAttempts=0
const ENTER=13
let auth=false

function handleLogIn(){
    let user = document.getElementById('user').value
    let pass = document.getElementById('pass').value
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            getIndex()
        } else if (xhr.status == 401){
            document.getElementById('failedAuth').innerHTML=`<h1>Failed to login ${failedAttempts} time(s), double-check your input or please register as a new user</h1>`
            failedAttempts++
        } 
    }
    xhr.open('POST', `/auth?user=${user}&pass=${pass}`, true)
    xhr.send()
   
    document.getElementById('user').value=''
    document.getElementById('pass').value=''
}

function handleRegister(){

}

function getIndex(){
    xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.body.parentElement.innerHTML=xhr.responseText
            document.getElementById('submit_button').addEventListener('click', getSong)
            document.addEventListener('keyup', handleKeyUp)
            auth=true
        } 
    }
    xhr.open('GET', `/authenticated`, true)
    xhr.send()
}

function getSong() {
    let songName = document.getElementById('song').value
    if(songName === '') {
        return alert('Please enter a song')
    }
  
    let songDiv = document.getElementById('songInfo')
    songDiv.innerHTML = ''
  
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            songDiv.innerHTML=xhr.response
        }
    }
    xhr.open('GET', `/songs?title=${songName}`, true)
    xhr.send()
}

function handleKeyUp(event) {
    if (auth===false) return //checking if only one button
    event.preventDefault()
    if (event.keyCode === ENTER) {
        document.getElementById("submit_button").click()
    }
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logIn_button').addEventListener('click', handleLogIn)
    document.getElementById('register_button').addEventListener('click', handleRegister)
})