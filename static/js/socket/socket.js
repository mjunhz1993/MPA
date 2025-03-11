function socket_config(d){
    return new WebSocket(d.url+':'+d.port+'?user='+d.user_id+'&host='+window.location.hostname);
}

const socket = socket_config({
    url: 'https://421fcb4a-d6db-4832-9ec6-fecac5fef5d9-00-abv9xfffgws6.riker.replit.dev',
    port: '8080',
    user_id: user_id
});

function socket_check(){
    if (socket && socket.readyState === WebSocket.OPEN){ return true }
    return false
}

function socket_send(msg){
    socket.send(msg);
}

socket.addEventListener("message", (msg) => {
    if(!socket_check()){ return }
    msg = JSON.parse(msg.data);
    console.log(msg);
    // runTrigger({ id:msg.data.id });
});

socket.addEventListener("open", (event) => {});

function closeConnection(){
    if(socket.readyState === WebSocket.OPEN){
        socket.close(1000, 'Closing connection');
    }
}

socket.onclose = function(event){
    console.log('WebSocket connection closed:', event);
};