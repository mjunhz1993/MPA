function socket_config(d){
    return new WebSocket(d.url':'+d.port+'?user='+d.user_id+'&host='+window.location.hostname);
}

const socket = socket_config({
    url: 'https://421fcb4a-d6db-4832-9ec6-fecac5fef5d9-00-abv9xfffgws6.riker.replit.dev',
    port: '8080',
    user_id: user_id
});
const socketTriggers = [];

function socket_check(msg, trigger){
    if (socket && socket.readyState === WebSocket.OPEN){ return socket_id_check(msg, trigger) }
    return false
}
function socket_id_check(msg, trigger){
    if(msg.id == trigger.id){ return true }
    return false
}

function socket_trigger(d){
    if(valEmpty(d.id)){ return }
    if(typeof d.trigger !== "function") { return }
    socketTriggers.push(d);
}

function socket_send(msg){
    socket.send(msg);
}

socket.addEventListener("message", (msg) => {
    socketTriggers.forEach(socketTrigger => {
        if(!socket_check(msg.data, socketTrigger)){ return }
        socketTrigger.trigger();
    });
});

socket.addEventListener("open", (event) => {});

function closeConnection() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Closing connection');
    }
}

socket.onclose = function(event) {
    console.log('WebSocket connection closed:', event);
};