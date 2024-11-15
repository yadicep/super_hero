$(document).ready(function(){
    $('input[name="inputSearch"]').on('change', function(){
        if ($(this).val() === 'id'){
            $('#buscarID').removeClass('d-none');
            $('#buscarNombre').addClass('d-none');
            $('#foundHero').addClass('d-none');}
        else{
            $('#buscarID').addClass('d-none');
            $('#buscarNombre').removeClass('d-none');
            $('#foundHero').addClass('d-none');}
    });
    $('#formSearch').on('submit', function(event){
        event.preventDefault();
        if ($('input[name="inputSearch"]:checked').val() === 'id'){
            const idHero = $('#idHero').val().trim();
            if (validarData(idHero)){ 
                infoID(idHero);}               
            else{
                alert('¡Ingresa el número correctamente!');}}
        else{
            const nombre = $('#nombre').val().trim();
            if (nombre) {
                infoNombre(nombre);}
            else{
                alert('¡Ingresa el nombre correctamente!');}}
    });
    $('#idHero, #nombre').on('input', function(){
        $('#foundHero').addClass('d-none');
    });
    $('#nombre').on('input', function(){
        const consulta = $(this).val().trim();
        if (consulta.length > 0){
            sugerirHero(consulta);}
        else{
            $('#nombresSugeridos').empty();}
    });
});

function validarData(input){
    return /^\d+$/.test(input);
}

function infoID(id){
    $.ajax({
        url: `https://www.superheroapi.com/api.php/4905856019427443/${id}`,
        method: 'GET',
        success: function(data){infoHero(data);},
        error: function(){alert('Ha habido un error al obtener la información. Intenta de nuevo...');}
    });
}

function infoNombre(nombre){
    $.ajax({
        url: `https://www.superheroapi.com/api.php/4905856019427443/search/${nombre}`,
        method: 'GET',
        success: function(data){
            if (data.results && data.results.length > 0){
                infoHero(data.results[0]);}
            else{
                alert('Héroe no encontrado.');}
        },
        error: function(){alert('Ha habido un error al obtener la información. Intenta de nuevo...');}
    });
}

function sugerirHero(consulta){
    $.ajax({
        url: `https://www.superheroapi.com/api.php/4905856019427443/search/${consulta}`,
        method: 'GET',
        success: function(data){
            $('#nombresSugeridos').empty();
            if (data.results){
                const resultadosLimitados = data.results.slice(0,5);
                resultadosLimitados.forEach(heroe =>{
                    $('#nombresSugeridos').append(`<li class="list-group-item itemSugerencia" data-id="${heroe.id}">${heroe.name}</li>`);
                });
                $('.itemSugerencia').on('click', function(){
                    const nombreSeleccionado = $(this).text();
                    $('#nombre').val(nombreSeleccionado);
                    $('#nombresSugeridos').empty();
                });
            }
        }
    });
}

function infoHero(data){
    $('#foundHero').removeClass('d-none');
    $('#results').removeClass('d-none').html(`
        <div class="col-lg-6 col-12 mb-4">
            <div class="card h-100 d-flex flex-row">
                <img src="${data.image.url}" class="img-fluid w-50 h-75" alt="${data.name}">
                <div class="card-body w-50">
                    <p class="card-text"><span class="subtitulo">Nombre:</span> ${data.name}</p>
                    <p class="card-text"><span class="subtitulo">Conexiones:</span> ${data.connections["group-affiliation"]}</p>
                    <p class="card-text"><span class="subtitulo">Publicado por:</span> ${data.biography.publisher}</p>
                    <p class="card-text"><span class="subtitulo">Ocupación:</span> ${data.work.occupation}</p>
                    <p class="card-text"><span class="subtitulo">Primera Aparición:</span> ${data.biography["first-appearance"]}</p>
                    <p class="card-text"><span class="subtitulo">Altura:</span> ${data.appearance.height.join(' - ')}</p>
                    <p class="card-text"><span class="subtitulo">Peso:</span> ${data.appearance.weight.join(' - ')}</p>
                    <p class="card-text"><span class="subtitulo">Alianzas:</span> ${data.biography.aliases.join(', ')}</p>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-12">
            <div id="graficoHeroe" style="height: 300px; width: 100%;"></div>
            <div id="contenedorLeyenda"></div>
        </div>
    `);
    pastelHero(data.powerstats, data.name);
}

function pastelHero(estadisticas, nombre){
    const grafico = new CanvasJS.Chart("graficoHeroe",{
        animationEnabled: true,
        theme: "light1",
        title:{
            text: `Estadísticas de poder de ${nombre}`
        },
        legend:{
            horizontalAlign: "center",
            verticalAlign: "bottom",
            fontSize: 15,
            fontFamily: "Moderustic"
        },
        data:[{
            type: "pie",
            startAngle: 220,
            yValueFormatString: "##0",
            indexLabel: "{y} - {label}",
            showInLegend: true,
            legendText: "{label}",
            dataPoints: [
                {y: parseInt(estadisticas.intelligence), label: "Intelligence"},
                {y: parseInt(estadisticas.strength), label: "Strength"},
                {y: parseInt(estadisticas.speed), label: "Speed"},
                {y: parseInt(estadisticas.durability), label: "Durability"},
                {y: parseInt(estadisticas.power), label: "Power"},
                {y: parseInt(estadisticas.combat), label: "Combat"}
            ],
            click: function(e){
                const estadistica = e.dataPoint.label;
                grafico.options.title.text = `Estadística de ${estadistica} para ${nombre}`;
                grafico.render();
            }
        }]
    });
    grafico.render();
}