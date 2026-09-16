const dino = document.getElementById('icon-offline');
const container = document.querySelector('.container');

setInterval(() => {
    dino.classList.toggle('run-2');
}, 120);

function cloud() {
    // Creates a new empty HTML element, assigns it the class .cloud, 
    // and inserts it into the game.
    const cloudEl = document.createElement('div');
    cloudEl.classList.add('cloud');
    container.appendChild(cloudEl);

    //Calculates the actual width of the game screen at that moment, 
    // and positions the cloud just beyond that boundary (i.e. off-screen, to the right). 
    // It also selects a random height between 20 and 170px.
    let cloudPosition = container.offsetWidth;
    const randomTop = Math.floor(Math.random() * 150) + 20;
    cloudEl.style.top = randomTop + 'px';

    //Every 20 ms, move the position back by 2 px. As long as the cloud hasn’t moved completely 
    //to the left (< -85, its own width), we continue to move it. 
    // Once it has moved off the screen, the loop is stopped (using `clearInterval`, 
    // otherwise it would run indefinitely for no reason) and the element is removed from 
    // the DOM (using `removeChild`, to avoid accumulating hundreds of invisible 'div's).
    const moveCloud = setInterval(() => {
        if (cloudPosition < -85) { // 85 = width of the cloud
            clearInterval(moveCloud);
            container.removeChild(cloudEl);
        } else {
            cloudPosition -= 2;
            cloudEl.style.transform = `translateX(${cloudPosition}px)`;
        }
    }, 15);

    setTimeout(cloud, Math.random() * 10000);
}

cloud();