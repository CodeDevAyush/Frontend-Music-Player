let hamburgers = document.querySelectorAll(".hamburger");
let popups = document.querySelectorAll(".popup");

//add hamburb for login details

hamburgers.forEach((hamburger, i) => {
    hamburger.addEventListener("click", () => {
        const popup = popups[i];
        if (!popup) return;

        popup.classList.toggle(`newElement${i + 1}`);
        popup.classList.toggle("show");
    });
});




let left = document.querySelector(".left");
let open = document.querySelector(".open");
let boxContainer = document.querySelector(".box-container");
let playlist = document.querySelector(".playlist");
let loginBtn = document.querySelector(".loginBtn");
let boxContainer2 = document.querySelector(".box-container2");
let loginBtn2 = document.querySelector(".loginBtn2");


function movePlayList() {
    if (window.innerWidth < 1020) {
        open.appendChild(playlist);
    } else {
        left.appendChild(playlist);
    }
}
window.addEventListener("resize", movePlayList);
movePlayList();

function login(islogin=false) {
    if(islogin) {
        boxContainer.classList.add("remove");
        playlist.classList.add("show");
        boxContainer2.classList.add("remove");
    }
}

document.querySelector(".profile").classList.add("remove");
loginBtn.addEventListener("click", () => {
    login(true);    
    document.querySelector(".login").classList.add("remove");
    document.querySelector(".profile").classList.remove("remove");
    
});

loginBtn2.addEventListener("click", () => {
    login(true);    
    document.querySelector(".login2").classList.add("remove");
    document.querySelector(".hamburger").classList.add("remove");
    document.querySelector(".popup").classList.add("remove");
    document.querySelector(".profile").classList.remove("remove");
});


function formatTime(seconds) {
    seconds = Math.floor(seconds); 
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



// fetch songs from folder

let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for(let i=0; i<as.length; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currFolder}/`)[1].split(".mp3")[0]);
        }
    }

    //creat song list

    let songUL = document.querySelector(".cardCollection").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li data-fullsong="${song}"> 
            <img src="images/play.svg" alt="" class="play">
            <img src="images/song.jpeg" alt="" class="cardimg">
            <div>
                <div>${decodeURI(song.split("-")[0])}</div>
                <div>${decodeURI(song.split("-")[1])}</div>
            </div>   
        </li>`;
    }

    //select song to play 

        Array.from(document.querySelector(".cardCollection").getElementsByTagName("li")).forEach (e => {
            e.addEventListener("click", () => {
                let track = e.getAttribute("data-fullsong") + ".mp3";
                
                playMusic(track);
                document.getElementById("playBtn").src = "images/pause.svg";
            });
            
        });
    return songs;
}

//play song

    const playMusic = (track, pause=false) =>{
        currentSong.src = `/${currFolder}/` + track;
        if(!pause){
            currentSong.play();
            play.src= "pause.svg";
        }
        const songNames = document.querySelectorAll(".songName");
        songNames.forEach(el => {
            el.innerHTML = decodeURI(track.split("-")[0]);
        });

        const artistNames = document.querySelectorAll(".artistName");
        artistNames.forEach(el => {
            el.innerHTML = decodeURI(track.split("-")[1].split(".mp3")[0]);
        });
    }

// Show playlist 

    async function displayPlaylists() {
        let a = await fetch(`/Songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let albums = document.querySelector(".playlist ul");
        Array.from(anchors).forEach(async e => {
            if(e.href.includes("/Songs/")){
                let folder = e.href.split("/").slice(-2)[1];

                //get meta data of the folder
                let a = await fetch(`/Songs/${folder}/info.json`);
                let response = await a.json();
                console.log(response);             
                albums.innerHTML = albums.innerHTML + `
                <li data-folder="${folder}" class="folder">
                    <img src="/Songs/${folder}/cover.jpeg" alt="">
                    <div class="info">${response.title}</div>
                     <div class="playNow flex align-center">
                        <img src="images/play.svg" alt="">
                        <div>PlayNow</div>
                    </div>
                </li>`
            }
            
            // load Playlist from folder
                Array.from(document.getElementsByClassName("folder")).forEach(e => {
                    e.addEventListener("click", async item =>{
                        songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);     
                    })
                });
        })
    }

//main function

async function main(){
    await getSongs("Songs/Playlist1");
    playMusic(songs[0]+".mp3", true);

    // display playlists
    await displayPlaylists()
    

    //function play, previous, next button
        play.addEventListener("click", ()=> {
            if(currentSong.paused){
                currentSong.play();
                document.getElementById("playBtn").src = "images/pause.svg";
            } else {
                currentSong.pause();
                document.getElementById("playBtn").src = "images/play2.svg";
            }
        });

        next.addEventListener("click", () => {
            let currentFilename = currentSong.src.split("/").slice(-1)[0];
            let index = songs.indexOf(currentFilename.replace(".mp3", ""));

            // Move to next, or loop back to first song
            let nextIndex = (index + 1) % songs.length;

            playMusic(songs[nextIndex] + ".mp3");
            document.getElementById("playBtn").src = "images/pause.svg";
        });

        previous.addEventListener("click", () => {
            let currentFilename = currentSong.src.split("/").slice(-1)[0];
            let index = songs.indexOf(currentFilename.replace(".mp3", ""));

            // Move to next, or loop back to first song
            let prevIndex = (index - 1) % songs.length;
            if(prevIndex >= 0){
            playMusic(songs[prevIndex] + ".mp3");
            document.getElementById("playBtn").src = "images/pause.svg";
            }
        });

    //timeupdate

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".currTime").innerHTML = formatTime(currentSong.currentTime);
        document.querySelector(".totalTime").innerHTML = formatTime(currentSong.duration);
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if(currentSong.currentTime == currentSong.duration) {
            document.getElementById("playBtn").src = "images/play2.svg";
        }   
    })

    // circle move for song play

    document.querySelector(".trackLine").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        percent = Math.max(0, Math.min(100, percent)); // clamp
        percent = Math.round(percent);

        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".playFill").style.width = percent + "%";

        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //change volume 
    //  {
            document.querySelector(".circle2").style.left = "100%";
            document.querySelector(".volumeFill").style.width = "100%";
            currentSong.volume = 1;

            document.querySelector(".volumeLine").addEventListener("click", e => {
                let rect = e.target.getBoundingClientRect();
                let percent = Math.max(0, Math.min(100, (e.offsetX / rect.width) * 100)); // clamp 0–100
                percent = Math.round(percent);

                document.querySelector(".circle2").style.left = percent + "%";
                document.querySelector(".volumeFill").style.width = percent + "%";

                const volume = percent / 100;
                currentSong.volume = volume;
                currentSong.muted = (volume === 0);

                if (currentSong.muted) {
                    document.getElementById("mutebtn").src = "images/unmute.svg";
                    isMuted = true;
                } else {
                    document.getElementById("mutebtn").src = "images/volume.svg";
                    isMuted = false;
                }
            });

            let isMuted = false;
            let lastVolume = 1;

            document.querySelector(".mute").addEventListener("click", () => {
                if (!isMuted) {
                    lastVolume = currentSong.volume || 1;
                    currentSong.muted = true;
                    currentSong.volume = 0;
                    document.querySelector(".circle2").style.left = "0%";
                    document.querySelector(".volumeFill").style.width = "0%";
                    isMuted = true;
                    document.getElementById("mutebtn").src = "images/unmute.svg";
                } else {
                    currentSong.muted = false;
                    currentSong.volume = lastVolume;
                    const percent = Math.round(lastVolume * 100);
                    document.querySelector(".circle2").style.left = percent + "%";
                    document.querySelector(".volumeFill").style.width = percent + "%";
                    isMuted = false;
                    document.getElementById("mutebtn").src = "images/volume.svg";
                }
            });
    //  }

    //show currently paling song
        let isclicked = false;

        document.querySelector(".nowplay").addEventListener("click", () =>{
            document.querySelector(".nowplaying").classList.toggle("remove");
            
            if (!isclicked) {
                document.querySelector(".nowplay img").src = "images/nowplaying2.svg";
                isclicked = true;
            } else {
                document.querySelector(".nowplay img").src = "images/nowplaying.svg";
                isclicked = false;
            }

        });

    //home button

        document.querySelector(".home").addEventListener("click", () => {
            location.reload();
        })

    //full screen

    // document.querySelector(".fullscreenAppear").classList.add("remove");
        document.querySelector(".fullScreen").addEventListener("click", () =>{
            document.querySelector(".fullscreenAppear").classList.toggle("remove");
            document.querySelector(".header").classList.toggle("remove");
            document.querySelector(".container").classList.toggle("remove");
        });

    //plus button 

        let isclicked2 = false;

        document.querySelector(".songinfo button").addEventListener("click", () => {     
            if (!isclicked2) {
                document.querySelector(".songinfo button img").src = "images/tick.svg";
                isclicked2 = true;
            } else {
                document.querySelector(".songinfo button img").src = "images/plus.svg";
                isclicked2 = false;
            }

        })

    // profile button 
        document.querySelector(".accDetails").classList.add("remove");
        
        document.querySelector(".profile button").addEventListener("click", () => {     
            document.querySelector(".accDetails").classList.toggle("remove");
        })

    

}
main();