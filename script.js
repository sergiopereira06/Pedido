const points = [
    {
        name:'UPA', 
        lat:-22.356046, 
        lng:-41.769842, 
        radius:50, 
        requiredAccuracy:200, 
        btn:'btnUPA', 
        next:1, 
        message:'Aqui foi o nosso primeiro encontro quando você estava doente.'
    },
    {
        name:'Mirante', 
        lat:-22.773328, 
        lng:-41.879568, 
        radius:50, 
        requiredAccuracy:200, 
        btn:'btnMirante', 
        next:2, 
        message:'Aqui ficamos admirando a paisagem e nos aproximamos.'},
    {
        name:'Praia', 
        lat:-22.778823, 
        lng:-41.904344, 
        radius:50, 
        requiredAccuracy:200, 
        btn:'btnPraia', 
        next:null, 
        message:'Aqui foi nosso primeiro beijo e o pedido de namoro!'}
];


const statusEl = document.getElementById('status');
const btnStart = document.getElementById('btnStart');
const actions = document.getElementById('actions');
const messageEl = document.getElementById('message');
const loveSong = document.getElementById('loveSong');


let currentIndex = 0;
let watchId = null;


function haversine(lat1, lon1, lat2, lon2){
    const R = 6371e3;
    const toRad = v => v * Math.PI/180;
    const dLat = toRad(lat2-lat1);
    const dLon = toRad(lon2-lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R*c;
}


function updatePosition(position){
    const {
        latitude, 
        longitude, 
        accuracy
    } = position.coords;
    const point = points[currentIndex];
    const dist = haversine(latitude, longitude, point.lat, point.lng);
    if(accuracy > point.requiredAccuracy){
        statusEl.textContent = `Precisão insuficiente (±${Math.round(accuracy)}m). Aguardando sinal melhor…`;
        return;
    }
    if(dist <= point.radius){
        statusEl.textContent = `Você chegou ao local: ${point.name}`;
        document.getElementById(point.btn).classList.remove('hidden');
    } else {
        statusEl.textContent = `Distância até o local: ${dist.toFixed(1)} m`;
    }
}


function startWatch(){
    if(!navigator.geolocation){
        statusEl.textContent = 'Geolocalização não suportada neste navegador.';
        return;
    }
    btnStart.disabled = true;
    actions.classList.remove('hidden');
    watchId = navigator.geolocation.watchPosition(updatePosition, err => {
    statusEl.textContent = 'Erro ao obter localização.';
    }, {enableHighAccuracy:true, maximumAge:1000, timeout:15000});
}


btnStart.addEventListener('click', startWatch);


function nextPoint(){
    const point = points[currentIndex];
    messageEl.textContent = point.message;
    messageEl.classList.remove('hidden');
    currentIndex = point.next !== null ? point.next : currentIndex;
    if(point.next === null){
        loveSong.classList.remove('hidden');
        loveSong.play();
    }
}


points.forEach(pt => {
    document.getElementById(pt.btn).addEventListener('click', ()=>{
        nextPoint();
        document.getElementById(pt.btn).classList.add('hidden');
    });
});