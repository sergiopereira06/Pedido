document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // CONFIGURAÇÃO
    // =====================
    const TARGET = {
        // Defina aqui o ponto alvo (exemplo: Av. Paulista, São Paulo)
        lat: -22.39204649138872, // latitude
        lng: -41.78362615734, // longitude
        radiusMeters: 120, // raio permitido (m)
        requiredAccuracy: 200 // só confia no ponto se a precisão (accuracy) for <= este valor (m)
    };


    // =====================
    // ELEMENTOS
    // =====================
    const el = (id) => document.getElementById(id);
    const dot = el('statusDot');
    const txt = el('statusText');
    const debug = el('debug');
    const content = el('content');
    const blocked = el('blocked');
    const btnRequest = el('btnRequest');
    const btnSim = el('btnSim');


    // Preenche UI de configuração
    el('cfgLat').textContent = TARGET.lat;
    el('cfgLng').textContent = TARGET.lng;
    el('cfgRadius').textContent = TARGET.radiusMeters;
    el('cfgRequiredAcc').textContent = TARGET.requiredAccuracy;
    el('needRadius').textContent = TARGET.radiusMeters;


    // =====================
    // UTIL: distância Haversine (em metros)
    // =====================
    function haversineMeters(lat1, lon1, lat2, lon2){
        const R = 6371e3; // raio da Terra em metros
        const toRad = (v)=> v * Math.PI/180;
        const dLat = toRad(lat2-lat1);
        const dLon = toRad(lon2-lon1);
        const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }


    function setStatus(kind, message){
        dot.className = `dot ${kind}`;
        txt.textContent = message;
    }
    function showDebug(position){
        if(!position){ debug.textContent = ''; return; }
        const {latitude, longitude, accuracy} = position.coords;
        debug.innerHTML = `lat: ${latitude.toFixed(6)}\nlon: ${longitude.toFixed(6)}\naccuracy: ±${Math.round(accuracy)}m`;
    }


    function updateAccess(position){
        showDebug(position);
        if(!position){
            content.classList.add('hidden');
            blocked.classList.remove('hidden');
            return;
        }
        const {latitude, longitude, accuracy} = position.coords;
        const dist = haversineMeters(latitude, longitude, TARGET.lat, TARGET.lng);


        // Checa precisão mínima
        if (accuracy > TARGET.requiredAccuracy){
            setStatus('warn', `Precisão insuficiente (±${Math.round(accuracy)}m). Aguardando sinal melhor…`);
            content.classList.add('hidden');
            blocked.classList.remove('hidden');
            return;
        }


        if (dist <= TARGET.radiusMeters){
            setStatus('ok', `Dentro da área (distância ${dist.toFixed(1)} m)`);
            content.classList.remove('hidden');
            blocked.classList.add('hidden');
        } else {
            setStatus('bad', `Fora da área (distância ${dist.toFixed(1)} m)`);
            content.classList.add('hidden');
            blocked.classList.remove('hidden');
        }
    }
    // =====================
    // Geolocalização
    // =====================
    let watchId = null;
    function startWatch(){
        if(!('geolocation' in navigator)){
            setStatus('bad', 'Geolocalização não suportada neste navegador.');
            return;
        }
        setStatus('idle', 'Solicitando localização…');
        btnRequest.disabled = true;
        watchId = navigator.geolocation.watchPosition(updateAccess, onGeoError, {
            enableHighAccuracy: true,
            maximumAge: 1000, // aceita posição com até 1s de cache
            timeout: 15000
        });
    }


    function onGeoError(err){
        btnRequest.disabled = false;
        switch(err.code){
            case 1: setStatus('bad', 'Permissão negada. Ative a localização para continuar.'); break; // PERMISSION_DENIED
            case 2: setStatus('warn', 'Posição indisponível. Tente mover-se para céu aberto.'); break; // POSITION_UNAVAILABLE
            case 3: setStatus('warn', 'Tempo esgotado ao obter localização. Tente novamente.'); break; // TIMEOUT
            default: setStatus('bad', 'Erro desconhecido de geolocalização.');
        }
        showDebug(null);
        content.classList.add('hidden');
        blocked.classList.remove('hidden');
    }
    btnRequest.addEventListener('click', startWatch);


    // =====================
    // (Opcional) Simulador p/ testes locais
    // Ative mostrando o botão no código se quiser simular.
    // =====================
    // btnSim.classList.remove('hidden');
    btnSim.addEventListener('click', ()=>{
        const fake = { coords:{ latitude: TARGET.lat, longitude: TARGET.lng, accuracy: 10 } };
            updateAccess(fake);
    });


    // Dica automática: se for localhost, tenta iniciar diretamente
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1'){
        setTimeout(()=> btnRequest.click(), 300);
    }

    if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log("Latitude: " + latitude + ", Longitude: " + longitude);
      // Aqui você pode usar as coordenadas como quiser, por exemplo, exibir em um mapa.
    },
    (error) => {
      console.error("Erro ao obter a localização: " + error.message);
    }
  );
} else {
  console.error("Geolocalização não é suportada por este navegador.");
}

})
