

var canvas = null;
var ctx = null;

CAM_SIZE = 8;
CAM_SPEED = 2;
TILE_SIZE = 16;

var tileset = new Image();
tileset.src = "07_testTileSet.png";

// posición del personaje / cámara
var campos = { x: 36, y: 36 }

// para movimiento
var hor, ver;
hor = ver = 0;

// indica si hace falta trazar el rayo
var trace_ray = false;

// storage para los puntos del rayo
var ray = [];
var modo = "vision";
var tile_images = true;

var mapa = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
			[1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
			[1,0,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,1],
			[1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,1],
			[1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,1],
			[1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,1,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];

var i, j;
var tile_mask = new Array(mapa.length);
for( i = 0; i < mapa.length; i++ )
{
	tile_mask[i] = new Array(mapa[0].length);
	for( j = 0; j < mapa[0].length; j++ )
	{
		tile_mask[i][j] = 0;
	}
}

function clear_mask()
{
	var i, j;
	for( i = 0; i < tile_mask.length; i++ )
	{
		for( j = 0; j < tile_mask[0].length; j++ )
		{
			tile_mask[i][j] = 0;
		}
	}
}

function apply_tiles_to_mask()
{
	var i, t, camtile, alfa;
	camtile = get_tile(campos.x, campos.y);
	for( i = 0; i < ray.length; i++ )
	{
		t = get_tile( ray[i].x, ray[i].y );

		alfa = dist_euclid( { x: t.x, y: t.y }, { x: camtile.x, y: camtile.y } ) / Number(document.getElementById('visiondist').value);

		tile_mask[t.y][t.x] = Math.min(1, Math.max(alfa, 0));
	}
}

// http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
function bresenham( mapa, x0, y0, x1, y1 )
{
	var ret, x, y, t0, t1, dx, dy, sx, sy, error, error2;
	ret = [];

	// se guarda en un objeto porque antes estaba hecho por ray, residual PAPORSI
	t0 = { x: x0, y: y0 };
	t1 = { x: x1, y: y1 };

	// diferencial
	dx = Math.abs( t1.x - t0.x );
	dy = Math.abs( t1.y - t0.y );

	// direcciones
	sx = t0.x < t1.x ? 1 : -1;
	sy = t0.y < t1.y ? 1 : -1;

	// error
	error = dx - dy;

	// actuales
	x = t0.x;
	y = t0.y;

	// el truco de 2* es para evitar dividir dy entre 2 para ver si es mayor o menor que 0.5,
	// así conseguimos trabajar con enteros en vez de reales, que a veces falla por redondeo
	var ttt = get_tile( x, y );
	while( x != t1.x && y != t1.y && mapa[ttt.y][ttt.x] == 0 )
	{
		error2 = 2 * error;
		if( error2 > -dy )
		{
			error = error - dy;
			x = x + sx;
			ret.push( { x: x, y: y } );
		}
		if( error2 < dx )
		{
			error = error + dx;
			y = y + sy;
			ret.push( { x: x, y: y } );
		}
		ttt = get_tile( x, y );
	}
	return ret;

	// Comprobamos puntos para que sea más exacto, aunque lo que después dibujamos sean tiles.
	// Esto lo hacemos así para aprovechar en la visión, que si irá por tiles para poder dibujarla fácilmente.
	// Aún así, se puede arreglar el algoritmo en http://lifc.univ-fcomte.fr/home/~ededu/projects/bresenham/
}

function rotate2d( x0, y0, x1, y1, angle )
{
	var dx, dy;
	dx = x1 - x0;
	dy = y1 - y0;
	return { x: x0 + dx * Math.cos(angle) - dy * Math.sin(angle),
			 y: y0 + dx * Math.sin(angle) + dy * Math.cos(angle) };
}

function deg2rad( a )
{
	return (2*Math.PI*a)/360;
}

function changeMode(a)
{
	modo = a;
}

var update = function() {

	var i,j;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = "#000000";

	// si nos hemos movido
	if( ver != 0 || hor != 0 )
	{
		// pedimos actualizar el ray
		trace_ray = true;

		// colisiones cutres
		var t = get_tile(
				campos.x + CAM_SPEED * hor,
				campos.y + CAM_SPEED * ver
			);
		if( mapa[t.y][t.x] != 1 )
		{
			campos.x = campos.x + hor * CAM_SPEED;
			campos.y = campos.y + ver * CAM_SPEED;
		}
	}

	var endpoint, tmp_store;
	endpoint = { x: mousePos.x, y: mousePos.y };
	// actualizamos el ray si es preciso ( si se ha movido o el raton o la cámara )
	if( trace_ray == true )
	{
		ray = [];
		trace_ray = false;
		var sweep0, sweep1, step;
		sweep0 = Number(document.getElementById('sweep_angle').value);
		//sweep1 = Number(document.getElementById('sweep1').value);
		step = Number(document.getElementById('sweep_step').value);
		if( modo == "vision" )
		{
			for( i = -(sweep0/2); i < (sweep0/2); i+=step  )
			{
				tmp_store = bresenham( mapa, campos.x, campos.y, endpoint.x, endpoint.y );
				endpoint = rotate2d( campos.x, campos.y, mousePos.x, mousePos.y, deg2rad(i) );
				ray = ray.concat(tmp_store);
			}
		}
		else if( modo == "ray" )
		{
			ray = bresenham( mapa, campos.x, campos.y, mousePos.x, mousePos.y );
		}
		clear_mask();
		apply_tiles_to_mask();
	}

	tilepack = Number(document.getElementById('tilepack').value);
	// dibujar mapa
	for( i = 0; i < mapa.length; i++ )
	{
		for( j = 0; j < mapa[0].length; j++ )
		{
			if( tile_images )
			{
				var sx, sy;
				if( mapa[i][j] == 1 )
				{
					sx = 0;
					sy = tilepack * 16;
				}
				else if( mapa[i][j] == 0 )
				{
					sx = 16;
					sy = tilepack * 16;
				}
						ctx.drawImage(tileset, sx, sy, 16, 16, (j)*TILE_SIZE, (i) * TILE_SIZE, 16, 16 );
			}
			else
			{
				if( mapa[i][j] == 1 )
					ctx.fillStyle = "#990000";
				if( mapa[i][j] == 0 )
					ctx.fillStyle = "#339955";
					ctx.fillRect(j*TILE_SIZE,i*TILE_SIZE, TILE_SIZE, TILE_SIZE )
			}
		}
	}

	// dibujar ray en el line of sight
	ctx.fillStyle = "#000000";
	/*
	for( i = 0; i < ray.length; i++ )
	{
		// se repiten tiles, ya que se guardan puntos y no tiles, pero nos da igual
		var ttt = get_tile(ray[i].x, ray[i].y);
		ctx.fillRect(ttt.x * TILE_SIZE, ttt.y * TILE_SIZE,
				TILE_SIZE, TILE_SIZE);
	}
	*/
	for( i = 0; i < tile_mask.length; i++ )
	{
		for( j = 0; j < tile_mask[0].length; j++ )
		{
			if( tile_mask[i][j] != 0 )
			{
				ctx.globalAlpha = tile_mask[i][j];
				ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
			else
			{
				ctx.globalAlpha = 1;
				ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	// dibujar camara
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(campos.x, campos.y, CAM_SIZE, CAM_SIZE);

	// dibujar línea desde camara hasta ratón
	ctx.strokeStyle = "#FF00FF";
	ctx.beginPath();
    ctx.moveTo(campos.x, campos.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();

}


var getMousePos = function (canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	var ret;
	ret = {
		x: evt.clientX - rect.left -2,
		y: evt.clientY - rect.top - 2
	};
	return ret;
}

// dada una posición devuelve el tile al que pertenece
function get_tile( px, py )
{
	return { x: Math.floor(px / TILE_SIZE), y: Math.floor(py / TILE_SIZE) }
}


// la forma de actualizar los inputs da lugar a movimiento mierda, a joderse
function keydownhandler(event)
{
	var keypressed = String.fromCharCode(event.keyCode);
	switch( keypressed )
	{
		case "W": ver = -1; break;
		case "S": ver = 1; break;
		case "A": hor = -1; break;
		case "D": hor = 1; break;
	}
}

function keyuphandler(event)
{
	var keypressed = String.fromCharCode(event.keyCode);
	switch( keypressed )
	{
		case "W": case "S": ver = 0; break;
		case "A": case "D": hor = 0; break;
	}
}


function init(){
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	canvas.addEventListener('mousemove', function(e){
		mousePos = getMousePos( canvas, e );
		// si movemos el ratón, actualizamos el ray
		trace_ray = true;
	});
	setInterval(update, 30);
	document.addEventListener("keydown",keydownhandler, false);
	document.addEventListener("keyup",keyuphandler, false);
};
window.addEventListener( 'load', init, false );


// funciones residuales inútiles PAPORSI
function intersect_aabb( l1,t1,r1,b1,l2,t2,r2,b2 )
{
	return ! (l2 > r1) ||
			 (r2 < l1) ||
			 (t2 > b1) ||
			 (b2 < t1);
}

function intersect_segm( X1, Y1, X2, Y2, X3, Y3, X4, Y4 )
{
	if( Math.max(X1, X2) < Math.min(X3, X4) )
		return false;

	var A1 = (Y1 - Y2) / (X1 - X2);
	var A2 = (Y3 - Y4) / (X3 - X4);
	var b1 = Y1 - A1 * X1;
	var b2 = Y3 - A2 * X3;

	if( A1 == A2 )
		return false;

	var Xa = (b2 - b1) / (A1 - A2);
	if( (Xa < Math.max( Math.min( X1, X2 ), Math.min( X3, X4 )) )||
			(Xa  > Math.min( Math.max( X1, X2 ), Math.max( X3, X4 ))))
	{
		return false;
	}
	else
	{
		return true;
	}
}

// vector unidad del vector con origen p1 y destino p2
function get_unit_vec(p1, p2)
{
	var p = {
		x: Math.abs( p1.x - p2.x ),
		y: Math.abs( p1.x - p2.y )
	};

	var mod = Math.sqrt( p.x * p.x + p.y * p.y );

	return { x: p.x / mod, y: p.y / mod };
}

// distancia euclídea entre a y b
function dist_euclid(a,b)
{
	var f1, f2;
	f1 = a.x-b.x;
	f2 = a.y-b.y;
	return Math.sqrt(f1*f1+f2*f2);
}

// distancia manhattan entre a y b
function dist_manh( a, b )
{
	return Math.abs( a.x - b.x ) + Math.abs( a.y - b.y );
}

