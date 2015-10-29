//Konfigueration um gegen anderen über Server zu spielen (PHP)
//	PHP/ Server Spiel ?
var global_game = false;
//	ID des Spiels für PHP
var global_spielid = '<<set by PHP>>';
//	Spieler ID
var global_spielerid = 0;

/******************************************************************************************/
//Beginn allgemeine Funktionen

//Zufallszahl
//	b => Beginn
//	e => Ende
function randomint( b, e ){
	return Math.floor((Math.random() * ((e + 1) - b)) + b);
}

//Medlung ausgeben
//	mess => HTML für die Medlung
function set_message( mess ){
	$( "div.outputs" ).html( ' '+mess );
	$( "div.outputs" ).typewriter({ 'speed': 50 });
	return true;
}

//HTMl an bestimmte Stelle
function show_html( html, place ){
	$( place ).html( html );	
	return true;
}

//Dialog hinzufügen
//	cont => Inhalt
//	tit => Titel
function new_dialog( cont, tit ){
	$( "#dialog" ).attr( 'title', tit );
	$( "#dialog" ).html( cont );
	$( "#dialog" ).css( 'display', 'block' );
	$( "#dialog" ).dialog();
}

//Dialog schließen
function close_dialog() {
	$( "#dialog" ).dialog( "close" );
	$( "#dialog" ).css( 'display', 'none' );
}

//Funktionen des Ablaufs hier auslösen
//	(diese Funktion wird von den Klassen gestartet)
//		done_event => Stelle des Aufrufs in Klasse
function reload_data( done_event ){

	//Events in der Konsole für Debugging zeigen
	console.log( done_event );

	if( done_event == 'shoot' ){
		//Nach einem Schuss wird das alles ausgeführt:
		
		// make_new_field_my_shoots();
	}
	else if( 'alle_versenkt' ){
		//Nach einem Schuss, wenn alle Schiffe eines Users versenkt
		
		// user_won();
	}
	else if ( 'versenkt') {
		//Nach einem Schuss, wenn ein Schiff versenkt
		
		// ein_schiff_weniger
	}

	return true;
}

//Ende allgemeine Funktionen
/******************************************************************************************/
//Beginn Klasse

//Klasse Spielfeld
//	Ausgabe des Spielfeld
//	Visualisierung von Schiffen und Schüssen
//	Schüsse mit Klick durchführen
function Feld(){

	//X und Y werden wie in der Matematik von unten links nach oben bzw. rechts verwendet
	//Die Y-Achse hat bei der Ausgabe Buchstaben
	//	Das erste Kästchen hat 0/A [im Programm 0/0], das maxmal diagonal entfernte 9/J [9,11]

	//Größe, als Indexe für Array
	this.max_x = 9; 
	this.max_y = 11;

	//Koordinate zu Buchstaben
	this.koordtoletter = { 0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "I", 9: "J", 10: "K", 11: "L" };

	//Leeres Feld erzeugen
	//	css_class => CSS Klasse für Spielfeld
	this.empty_field = function ( css_class ){
		//Spielfeld erzeugen
		
		//<div> für Spielfeld als Rahmen
		//	Klasse nach Parameter
		var splf = '<div class="splf ' + css_class + '">';
		//	die erste Reihe beginnen (einen nach unten class="y"")
		splf += '<div class="y">';
		//	erstes Kästchen leer (Ecke oben links) 
		splf += '<div class="x">&nbsp;</div>';
		//	erste Reihe soll Koordinaten enthalten
		
		//	Spalten in Schleife erstellen
		//		bei 0 beginnen
		//		nur bis Anzahl aller Spalten erreicht
		//		jedes Mal Index erhöhen
		for (var i = 0; i <= this.max_x; i++) {
			//Kästchen mit Index/ Koordinate erstellen
			//	(einen nach links class="x") 
			splf += '<div class="x x_'+i+'">' + i + '</div>';
		}
		//	erste Reihe beenden
		splf += '</div>';
		
		//alle weiteren Reihen mit Schleife erstellen
		//	bei 0 beginnen
		//	nur bis Anzahl aller Reihen
		//	jedes Mal Index erhöhen
		for (var i = 0; i <= this.max_y; i++) {
			
			//Reihe beginnen
			//	Klasse mit Index hinzufügen
			splf += '<div class="y y_'+i+'">';
			
			//	erstes Kästchen soll Koordinate als Buchstaben erhalten
			//		beim Überfahren auch Zahl zeigen
			splf += '<div class="x" title="' + i + '">'  + this.koordtoletter[i] +  '</div>';
			
			//	Spalten in Schleife erstellen
			//		bei 0 beginnen
			//		nur bis Anzahl aller Spalten erreicht
			//		jedes Mal Index erhöhen
			for (var ii = 0; ii <= this.max_x; ii++) {
				//Kästchen erstellen
				//	(einen nach links class="x", außdem Klasse mit Index von Y, X und zusammen)
				//	beim Überfahren auch Zahlen zeigen
				splf += '<div class="x y_'+i+' x_'+ii+' y_'+i+'x_'+ii+'" title="' + this.koordtoletter[i] + ' ' + i + ' | ' + ii + '">&nbsp;</div>';
			}
			
			//Reihe beenden
			splf += '</div>';
		}
	
		//Rahmen des Spielfelds schließen
		splf += '</div>';
		
		//Rückgabe
		return splf;
	}

	//Schüsse zu HTML Feld hinzufügen
	//	currshoots => Schiffe().shoots
	//	fieldclass => Klasse des Feldes
	//	Return: HTML Code für Schussübersicht
	this.show_field_shoots = function( currshoots, fieldclass ) {

		//alle Schüsse lesen
		$.each( currshoots, function ( key, val ) {
		
			//CSS Klasse
			var css_class;

			//Treffer auf Wasser
			if( val['art'] == 0 ){
				css_class = 'shoot_water';
			}
			//Treffer auf Schiff
			else if( val['art'] == 1 ){
				css_class = 'shoot_part';
			}
			//Treffer auf Schiff und versenkt
			else if( val['art'] == 2 ){
				css_class = 'shoot_all';
			}
		
			//HTML in Kästchen einfügen
			$( '.'+fieldclass+' div.y_'+ val['y'] +'x_'+ val['y'] ).html( '<span class="shoot '+css_class+'">&nbsp;</span>' );
		});

		return true;
	}
	
	//Schiffen zu HTML Feld hinzufügen
	//	currships => Schiffe().current
	//	fieldclass => Klasse des Feldes
	//	Return: HTML Code für Schiffübersicht
	this.show_field_ships = function( currships, fieldclass ) {

		//Keine Schiffe da
		var shipsadded = false;

		//alle Schiffsklassen für Feld durchgehen
		$.each( currships, function ( key, val ) {
			//Größe des Schiffes
			var size = val['size'];
			
			//Jedes Schiff durchgehen
			$.each( val['place'], function (k, v) {
				//X-Wert am Anfang des Schiffes
				var x = v['x'];
				//Y-Wert am Anfang des Schiffes
				var y = v['y'];
				//Richtung des Schiffes (h: horizontal[nach unten], v: vertikal[nach rechts])
				var d = v['d'];
				//Treffer auf das Schiff (Jede Stelle des Schiffes von Beginn an, ob getroffen[1] oder nicht[0])
				var t = v['t'];
				
				//Variablen für unten
				var this_x, this_y, this_class, this_color;
				
				//Stellen durchgehen und Bug und Heck (schwarz, rot und orange)
				//CSS Klassen, Size beachten
				
				//Je nach Schiffslänge so oft durchgehen
				for (var i = 0; i < size; i++) {

					//horizontal vom Startpunkt aus?
					if( d == 'h' ){
						//X-Werte erhöhen, Y-Werte gleich halten
						this_x = x + i;
						this_y = y;
					}
					//dann wohl vertikal
					else {
						//X-Werte halten, Y-Werte erhöhen
						this_x = x;
						this_y = y + i;
					}

					//Bug des Schiffes ?
					if( i == 0 ){
						this_class = 'ship_bug';
					}
					//Heck des Schiffes 
					else if ( i == size - 1) {
						this_class = 'ship_end';
					}
					//Mitte des Schiffes
					else {
						this_class = 'ship_all';
					}
					
					//Farbe für Treffer
					if( t[i] == 0 ){
						this_color = 'ship_black';
					}
					else{
						this_color = 'ship_red';
					}

					//HTML in Kästchen einfügen
					//	passende CSS Klassen
					//		Farbe für Treffer, horizontal & vertikal, Bug & Mitte & Heck
					$( '.'+fieldclass+' div.y_'+ this_y +'x_'+ this_x ).html( '<span class="ship '+this_class+'_'+d+' '+this_color+'">&nbsp;</span>' );

				}
				
				//Jetzt Schiffe da
				shipsadded = true;
			});
		});
		
		//Schiffe vorhanden oder noch nicht platziert.
		return shipsadded;
	}
	
	//Einem Feld die Listener für Schüsse anfügen
	//(üblicher Weise dem Feld "shoot_at")
	//	fieldclass => Klasse des Feldes
	//	spieler => Objekt des Spielers [Schiffe();] auf den geschossen werden soll
	this.make_shootable = function ( fieldclass, spieler ) {
	
		//bei einem Klick auf ein Kästchen
		$( '.'+fieldclass+' .x' ).click(function(){
			//CSS Klassen des Kästchens lesen (Array)
			var classes = $( this ).attr('class').split(/\s+/);
			
			//Koordinaten aus Klassen lesen
			// 2. Klasse "y_4", erst ab 3. Stelle lesen
			var y_koo = classes[1].substr(2);
			// 3. Klasse "x_8", erst ab 3. Stelle lesen
			var x_koo = classes[2].substr(2);
			
			//Schuss an Methode von Schiffe() übergeben
			spieler.shoot_ships( x_koo, y_koo );
		});
	
		return true;
	}

	return;

}

//Klasse Schiffe
//	Username und ID
//	Aktuelle Konfiguration der Schiffe eines Users
//	Allgemeine Konfiguration der Schiffe
//	Schüsse auf Gegner
//		Schüsse durchführen
//		Schiffe zufällig platzieren
//			Daten this.current und this.shoots per PHP abgleichen, evtl. Name

//	username => Name des Users
function Schiffe( username ) {

	//ID
	global_spielerid++;
	this.id = global_spielerid;

	//Username
	if( typeof username === "undefined" ){
		username = 'Max Muster '+ this.id;
	}
	this.username = username;  
	
	//allgemeine Konfiguration zum Beginn
	//	Flottengröße
	//		Objekt erstellen
	var ships = {};
	//		nach und nach alle definieren
	//			[<Schiffskennzeichen>]
	//				name => Name des Schiffs
	//				size => Anzahl der Kästchen pro Schiff
	//				anzahl => Anzhal der Schiffe pro User
	//				place => Array mit Objecten pro Schiff
	//					y => Y-Wert des Beginns
	//					x => X-Wert des Beginns
	//					d => Richtung des Schiffes (h: horizontal[nach unten], v: vertikal[nach rechts])
	//					t => Treffer Array [ 1: 0/1, 2: 0/1 ] (Jede Stelle des Schiffes von Beginn an, ob getroffen[1] oder nicht[0])
	ships['s'] = {
		"name": "Schlachtschiff",
		"size": 5,
		"anzahl": 1,
		"place": new Array()
	};
	ships['k'] = {
		"name": "Kreuzer",
		"size": 4,
		"anzahl": 2,
		"place": new Array()
	};
	ships['z'] = {
		"name": "Zerstörer",
		"size": 3,
		"anzahl": 3,
		"place": new Array()
	};
	ships['u'] = {
		"name": "U-Boote",
		"size": 2,
		"anzahl": 4,
		"place": new Array()
	};

	//als Klassenvariable
	this.all = ships;

	//aktueller Stand für Spieler
	//	zu Anfang Schiffe da, aber nirgendwo
	this.current = ships;
	
	//Liste aller Schüsse
	//	Objekte
	//		x => X-Wert
	//		y => Y-Wert
	//		art => 0[Wasser], 1[Treffer], 2[Versenkt]
	this.shoots = new Array();

	//Methoden

	//Schiffe zufällig platzieren
	this.place_random = function() { 
		
		//hier drin wird der Inhalt von this.current neu gebildet!
		//	immer von Standard ausgehen
		var this_current_new = this.all;
		
		//Feldgröße
		var feld = new Feld();
		var max_x = feld.max_x;
		var max_y = feld.max_y;
	
		//alle Schiffsklassen für Feld durchgehen
		$.each( this.all , function ( key, val ) {
			//Größe des Schiffes
			var size = val['size'];
			//Anzahl an Schiffen 
			var anzahl = val['anzahl'];
			
			//erstmal keine Schiffe
			this_current_new[key]["place"] = new Array();
			
			//Alle Schiffe haben keine Treffer, Array der Treffer vorbereiten
			var keine_treffer = new Array( );
			for (var ii = 0; ii < size; ii++) {
				keine_treffer.push( 0 );
			}
			
			//zum Erstellen der Schiffe
			var new_obj, new_arr = [];
			
			//entsprechend der Anzahl des Schiffes eines platzieren.
			for (var i = 0; i < anzahl; i++) {
				//leeres Array für Schiff
				new_obj = new Object();
				
				//horizontal oder vertikal
				if( randomint( 0, 1 ) == 1 ){
					//horizontal
					new_obj['d'] = 'h';
				}
				else{
					new_obj['d'] = 'v';
				}
				
				//Treffer auf Schiff, bisher keine
				new_obj['t'] = keine_treffer;
				
				//x und y Wert!!
				//	Überlagerung prüfen (Array aller vergebenen Koordinaten)
				
				/*****************************************/
				//ToDo
				/*****************************************/
				
				new_obj['x'] = randomint( 0, max_x );
				new_obj['y'] = randomint( 0, max_y );
			
			
				//Objekt dieses Schiffes mit den anderen zusammenfügen
				this_current_new[key]["place"].push( new_obj );
			}
		});  
	
		this.current = this_current_new;
	
		return true;   
	}

	//Schuss auf Flotte
	//	x => X-Wert des Schusses
	//	y => Y-Wert des Schusses
	//	Return: 0[Wasser], 1[Treffer], 2[Versenkt]
	this.shoot_ships = function( x, y ){

		//Int für Rückgabe
		var retval, number_of_ships = 0;
	
		//Alle Schiffsarten durchgehen
		$.each( this.current, function( key, val ){
		
			//Größe des Schiffes
			var size = val['size'];
			
			//Jedes Schiff durchgehen
			$.each( val["place"], function( k, v ){
				//horizontal prüfen
				if( v["d"] == 'h' ){
					//Y-Wert muss identisch sein
					if( v["y"] == y ){
						//alle Werte des Schiffes prüfen (x+0 bis x+size)
						//	Array mit Treffern anpassen, versenkt?
						
						/*****************************************/
						//ToDo
						/*****************************************/
					}
					//Y-Wert passt nicht und Schiff horizontal
					//	-> kein Treffer möglich
					else{
						retval = 0;
						return;
					}
				}
				//vertikal prüfen
				else{
					//X-Wert muss identisch sein
					if( v["x"] == x ){
						//alle Werte des Schiffes prüfen (y+0 bis y+size)
						//	Array mit Treffern anpassen, versenkt?
						
						/*****************************************/
						//ToDo
						/*****************************************/
						
					}
					//X-Wert passt nicht und Schiff horizontal
					//	-> kein Treffer möglich
					else{
						retval = 0;
						return;
					}
				}
				
				//Anzahl der Schiffe pro User zählen
				number_of_ships++;
			});
		});

		//this.shoots anpassen
		this.shoots.concat([ { "x": x, "y": y, "art": retval } ]);
		
		//Systemeigenes Eventhandling
		//	Schuss durchgeführt
		reload_data( 'shoot' );
		//	Schiff versenkt -> evtl. ein User gewonnen
		if( retval == 2 ){
			reload_data( 'versenkt' );
			if( number_of_ships == 1 ){
				reload_data( 'alle_versenkt' );
			}
		}
		return retval;
	}

	return;
}

//Ende Klassen
/******************************************************************************************/
//Beginn Ablauf

//beim Aufruf
$(function() {
	//Spiel beginnen wenn Seite geladen
	
	start_game();
	
	testing();
});

//Spiel beginnen
function start_game(){
	//alles für neues Spiel abfragen und los
	
	//Willkommen
	set_message( 'Herzlich Willkommen bei "Schiffe versenken" von KIMB-technologies' );
	
	
	/*****************************************/
	//ToDo
	/*****************************************/

}

var schiffe, feld;

//Tests während der Entwicklung
function testing() {
	schiffe = new Schiffe( 'Tester' );
	feld = new Feld();

	var html = feld.empty_field( 'my_ships' );
	html += feld.empty_field( 'shoot_at' );
	html += '<br /><span class="untertitel">Meine Schiffe</span><span class="untertitel">Schussfeld</span><br />';
	show_html( html, "div.area_one" );
	
	var twoover = schiffe.shoots;
		
	//var twoover = [{ "x":2, "y":4, "art":1}, { "x":4, "y":6, "art":0}, { "x":9, "y":9, "art":2}];
	
	schiffe.place_random();
	var oneover = schiffe.current;
	
	//oneover['u']['place'] = [{ 'y':2, 'x':2, 'd':'h', 't':[0,0] },{ 'y':8, 'x':8, 'd':'h', 't':[1,1] }];
	//oneover['k']['place'] = [{ 'y':4, 'x':2, 'd':'v', 't':[0,0,0,0] }, { 'y':0, 'x':9, 'd':'v', 't':[1,1,1,1] }];

	feld.show_field_shoots( twoover, 'shoot_at' );
	feld.show_field_ships( oneover, 'my_ships' );
	feld.make_shootable( "shoot_at", schiffe );

}

//Ende Ablauf
/******************************************************************************************/
//Beginn Design JS

//wenn Seite geladen
$(function() {
	
	//ganze aktuelle Spalte und Reihe markieren
	var HoverClassPraefix = 'div.shoot_at ';
	var HoverColor = '#5d7';
	var HoverColorlight = '#aeb';
	$( HoverClassPraefix+'.x' ).hover(function(){
		var classList = $( this ).attr('class').split(/\s+/);

		$( HoverClassPraefix+'.'+classList[1] ).css( 'background-color', HoverColorlight );
		$( HoverClassPraefix+'.'+classList[2] ).css( 'background-color', HoverColorlight );
		$( HoverClassPraefix+'.'+classList[3] ).css( 'background-color', HoverColor );
	}, function(){
		var classList = $( this ).attr('class').split(/\s+/);

		$( HoverClassPraefix+'.'+classList[1] ).css( 'background-color', 'white' );
		$( HoverClassPraefix+'.'+classList[2] ).css( 'background-color', 'white' );
		$( HoverClassPraefix+'.'+classList[3] ).css( 'background-color', 'white' );
	});
});
