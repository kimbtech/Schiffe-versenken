//Konfigueration um gegen anderen über Server zu spielen (PHP)
//	PHP/ Server Spiel ?
var global_game = false;
//	ID des Spiels für PHP
//		per Ajax holen
var global_spielid = 0;

/******************************************************************************************/
//Beginn allgemeine Funktionen

//Zufallszahl
//	b => Beginn
//	e => Ende
function randomint( b, e ){
	return Math.floor((Math.random() * ((e + 1) - b)) + b);
}

//IDs für Meldungen
//	los geht's mit 1
var message_id = 1;

//Medlung ausgeben
//	mess => HTML für die Medlung
function set_message( mess ){
	//div für die Medlung erstellen (mit CSS ID nach message_id)
	$( "div.outputs" ).prepend( '<div id="m'+message_id+'"></div>' );
	//schon mehr als 3 Medlungen vorhanden?
	if( message_id > 3 ){
		//älteste Medlung ausblenden
		$( "div.outputs div#m"+ ( message_id - 3 ) ).css( 'display', 'none' );
	}
	
	//Typewriter der Medlung in erstellten Kasten
	$( "div.outputs div#m"+message_id ).typed({ typeSpeed: 0, strings: [ mess ] });

	//die ID der Meldungen für den nächsten Durchgang erhöhen	
	message_id++;	
	
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
	$( "#dialog" ).dialog( { width:600 } );
	$( "#dialog" ).dialog('option', 'title', tit );
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
		
		if( global_game ){
			//PHP-Spiel
		}
		else{
			//nur wenn User geschossen hat, PC schießen lassen
			//	sonst Endlosschleife
			if( aktuser == schiffe_one.username ){
				//PC-Spiel
				pc_shoot_and_refresh();
			}
		}

	}
	else if( done_event == 'alle_versenkt' ){
		//Nach einem Schuss, wenn alle Schiffe eines Users versenkt
		
		set_message( 'Das Spiel ist aus!' );
		
		//je nachdem wer gerade geschossen hat, hat er gewonnen 
		if( aktuser == schiffe_one.username ){
			 new_dialog( 'Du hast gewonnen!', 'Herzlichen Glückwunsch' );
		}
		else{
			 new_dialog( 'Dein Gegner hat gewonnen!', 'Schade' );						
		}
		
		//Spielfelder weg
		//Button für neues Spiel
		show_html( '<div style="height:334px;"><br /><br /><br /><center><div id="button_new">Neues Spiel</div></center></a></div>', "div.area_one" );
		//	Button auf Dialog
		$( "#button_new" ).button(); 
		//	Button Klicks auswerten
		$( "#button_new" ).click( function() {
			//neues Spiel beginnen
			start_game();
		});
	 
	 	//Felder des Gegners weg
		show_html( '', "div.area_two" );
	}
	else if ( done_event == 'versenkt' ) {
		//Nach einem Schuss, wenn ein Schiff versenkt
		
		//je nachdem wer gerade geschossen hat, hat er ein Schiff versenkt
		if( aktuser == schiffe_one.username ){
			set_message( 'Du hast ein Schiff versenkt! (Gegner hat noch '+schiffe_two.number_of_ships+'/10)' );	
		}
		else{
			set_message( 'Eines deiner Schiff wurde versenkt! (Du hast noch '+schiffe_one.number_of_ships+'/10)' );	
		}
		
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
				splf += '<div class="x y_'+i+' x_'+ii+' y_'+i+'x_'+ii+'" title="' + ii + ' | ' + this.koordtoletter[i] + ' ' + i + '">&nbsp;</div>';
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
			$( '.'+fieldclass+' div.y_'+ val['y'] +'x_'+ val['x'] ).html( '<span class="shoot '+css_class+'">&nbsp;</span>' );
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

	//Anzahlen der noch nicht versenken Schiffe anzeigen
	//	css_class => CSS Klasse eines div, wo die Statistik angezeigt wird
	//	one, two => Objekte von Schiffe() des Users [one] und des Gegners [two]
	this.show_shipnumbers = function( css_class, one, two ){
		
		//HTML Gerüst für Balken
		var html = '<b>Schiffe</b><br />'; 
		html += '<div id="one"><div class="label"></div></div>';
		html += '<div id="two"><div class="label"></div></div>';
		
		//HTML der Seite hinzufügen
		show_html( html, 'div.'+css_class );
		
		//Balken anzeigen
		//	Balken setzen
		$( 'div.'+css_class+' #one' ).progressbar( { value: one.number_of_ships, max:10 } );
		//	Beschiftung anpassen
		$( 'div.'+css_class+' #one .label' ).text( 'Spieler: '+one.number_of_ships+'/10' );
		//	Balken setzen
		$( 'div.'+css_class+' #two' ).progressbar( { value: two.number_of_ships, max:10 } );
		//	Beschiftung anpassen
		$( 'div.'+css_class+' #two .label' ).text( 'Gegner: '+two.number_of_ships+'/10' );
		
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

	//Username
	if( typeof username === "undefined" ){
		username = 'Max Muster';
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
	
	//Anzahl der Schiffe des Users
	//	erstmal zehn
	this.number_of_ships = 10;
	
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
		
		//this für Funktion unten
		var this_func = this;
		
		//Feldgröße
		var feld = new Feld();
		var max_x = feld.max_x;
		var max_y = feld.max_y;
		
		//Besetzte Stellen merken (nicht doppelt zählen)
		//	jeweils mit Inhalt als Sting "x-y"
		var bes_place = [];
	
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
			
			//für maximale X-/ Y-Werte
			var hier_max_y, hier_max_x;
			
			//entgültige X-/ Y-Werte
			var end_x, end_y;
			
			//alle Stellen eines Schiffes
			var allplaces;
			
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
				//	
				
				//Maximale X-/ Y-Werte berechnen
				if( new_obj['d'] == 'h' ){
					//horizontal
					//	nur X-Werte, bis Größe ab der Schiff über den Rand geht
					hier_max_x = max_x - size;
					//	alle Y-Werte
					hier_max_y = max_y;
				}
				else{
					//vertikal
					//	alle X-Werte
					hier_max_x = max_x;
					//	nur Y-Werte, bis Größe ab der Schiff über den Rand geht
					hier_max_y = max_y - size;
				}
				
				//noch nicht besetzte Stelle finden
				do{
					//Stelle (Startpunkt) zufällig wählen
					end_x = randomint( 0, hier_max_x );
					end_y = randomint( 0, hier_max_y );
					
					//alle Stellen erstellen
					allplaces = new Array;
					//	Startpunkt
					allplaces.push( end_x + '-' + end_y );
					//	alle anderen Stellen
					//		ii auf 1, da erste Stelle schon gesetzt
					for( var ii = 0; ii < size; ii++){										
						if( new_obj['d'] == 'h' ){
							//horizontal, X-Werte erhöhen
							allplaces.push( (end_x +ii ) + '-' + end_y );
						}
						else{
							//vertikal, Y-Werte erhöhen
							allplaces.push( end_x + '-' + ( end_y + ii ) );
						}	
					}
					
					//Schleife erst verlassen, wenn freie Stelle gefunden
				} while ( this_func.all_places_free(allplaces, bes_place) );
			
				//endgültige Werte setzen
				new_obj['x'] = end_x;
				new_obj['y'] = end_y;
				
				//endgültige Werte als besetzt speichern
				//	Array von oben
				bes_place = bes_place.concat( allplaces );
		
				//Objekt dieses Schiffes mit den anderen zusammenfügen
				this_current_new[key]["place"].push( new_obj );
			}
		});  
	
		this.current = this_current_new;
	
		return true;   
	}
	
	//Prüft ob in zwei Arrays die gleichen Inhalt aufzufinden sind.
	//	allplaces => Array mit den Inhalten, nach denen gesucht werden soll
	//	bes_places => Array in dem gesucht wird
	//	Return => true(Fund)/ false(kein Fund)
	this.all_places_free = function(allplaces, bes_place){
	
		//für Rückgabewert
		var retval = false;
	
		//alle Stellen prüfen (allplaces durchgehen)	
		$.each( allplaces, function( key, val ) {
			
			//aktueller Wert aus allplaces in bes_places?
			//	-1 => not found		
			if( $.inArray( val, bes_place ) != -1 ){
				//wurde gefunden
				retval = true;
				return;
			}
		});
		
		//nicht gefunden
		return retval;	
	}

	//Schuss auf Flotte
	//	x => X-Wert des Schusses
	//	y => Y-Wert des Schusses
	//	Return: 0[Wasser], 1[Treffer], 2[Versenkt]
	this.shoot_ships = function( x, y ){

		//Int für Rückgabe
		//	bisher im Wasser gelandet
		//	keine Schiffe vorhanden
		var retval = 0, number_of_ships = 0;
		
		//this für Funktion unten
		var this_func = this;
	
		//Alle Schiffsarten durchgehen
		$.each( this.current, function( key, val ){
		
			//Größe des Schiffes
			var size = val['size'];
			
			//Jedes Schiff durchgehen
			$.each( val["place"], function( k, v ){
				
				//Variablen für Prüfung ob getroffen
				var sum, i;
				
				//Variablen für Anpassung der 
				var newarr = new Array(), ii; 
				
				//horizontal prüfen
				if( v["d"] == 'h' ){
					//Y-Wert muss identisch sein
					if( v["y"] == y ){
						//alle Werte des Schiffes prüfen (x+0 bis x+size)
						//	Array mit Treffern anpassen, versenkt?
						for( i = 0; i < size; i++ ){
							
							//X-Wert berechnen
							sum = v["x"] + i;
							//	für den Vergleich Datentyp anpassen
							sum = sum.toString();
							
							//Vergleich
							if( sum == x ){
								
								//Treffer
								retval = 1;
								
								///Das Schiff als getroffen markieren
								//	Array mit Treffern neu machen
								for( ii = 0; ii < size; ii++){
									//aktuelle Trefferstelle?
									if( ii == i ){
										//getroffen
										newarr.push( 1 );
									}
									else{
										//alte Werte verwenden
										newarr.push( v["t"][ii] );	
									}
								}
								//	Array mit Treffern für Schiff neu scheiben
								v["t"] = newarr;
								
								//Schiff versenkt?
								//	keine unversehrten Stellen im Array mehr?
								if( $.inArray( 0, v["t"] ) == -1 ){
									retval = 2;
								}								
								
								//Rückgabe
								return this_func.setretval_for_shoot_ships( retval, x, y );
							}
						}
					}
				}
				//vertikal prüfen
				else{
					//X-Wert muss identisch sein
					if( v["x"] == x ){
						//alle Werte des Schiffes prüfen (y+0 bis y+size)
						//	Array mit Treffern anpassen, versenkt?
						for( i = 0; i < size; i++ ){
							
							//Y-Wert berechnen
							sum = v["y"] + i;
							//	für den Vergleich Datentyp anpassen
							sum = sum.toString();
							
							//Vergleich
							if( sum == y ){
								
								//Treffer
								retval = 1;
								
								//Das Schiff als getroffen markieren
								//	Array mit Treffern neu machen
								for( ii = 0; ii < size; ii++){
									//aktuelle Trefferstelle?
									if( ii == i ){
										//getroffen
										newarr.push( 1 );
									}
									else{
										//alte Werte verwenden
										newarr.push( v["t"][ii] );	
									}
								}
								//	Array mit Treffern für Schiff neu scheiben
								v["t"] = newarr;
								
								//Schiff versenkt?
								//	keine unversehrten Stellen im Array mehr?
								if( $.inArray( 0, v["t"] ) == -1 ){
									retval = 2;
								}

								//Rückgabe
								return this_func.setretval_for_shoot_ships( retval, x, y );
							}
						}
					}
				}
			});
		});

		if( retval == 0 ){
			//keine Schiffe getroffen
			return this.setretval_for_shoot_ships( retval, x, y );
		}
	}

	//Rückgabe für this.shoot_ships
	//	Eventhandling
	//		retval => 0[Wasser], 1[Treffer], 2[Versenkt]
	//		x => X-Werte
	//		y => Y-Werte
	//		Return: 0[Wasser], 1[Treffer], 2[Versenkt]
	this.setretval_for_shoot_ships = function( retval, x , y ){
		//this.shoots anpassen
		this.shoots.push( { "x": x, "y": y, "art": retval } );
		
		//nicht alle versenkt
		//Array mit true/false für jedes Schiff
		var allvers, versarray = new Array();
		
		//mit null Schiffen anfangen zu zählen
		this.number_of_ships = 0
		
		//this in each Funktion
		var this_func = this;
		
		//alle versenkt??
		//	alle Schiffsarten durchgehen
		$.each( this.current, function( key, val ){
		
			//Jedes Schiff durchgehen
			$.each( val["place"], function( k, v ){
			
				//Schiff ohne Treffer ??	
				if( $.inArray( 0, v["t"] ) == -1 ){
					//dieses Schiff ist versenkt
					versarray.push( false );
				}
				else{
					//Schiff nicht versenkt
					versarray.push( true );
					//Anzhal der Schiffe mitzählen
					this_func.number_of_ships++;
				}
			});
		});
		
		//alle versenkt?
		if( $.inArray( true, versarray ) == -1 ){
			//ja
			allvers = true;
		}
		else{
			//nein
			 allvers = false;
		}
		
		//Systemeigenes Eventhandling
		//	Schuss durchgeführt
		reload_data( 'shoot' );
		//	Schiff versenkt -> evtl. ein User gewonnen
		if( retval == 2 ){
			reload_data( 'versenkt' );
			if( allvers  ){
				reload_data( 'alle_versenkt' );
			}
		}
		return retval;
	}

	return;
}

//Klasse KI des Gegners Computer
//	gegner => Objekt der Klasse Schiffe();, auf das geschossen wird
//	feld => Objekt von Feld(); (für Breich der X- & Y-Werte)
//	level => (siehe unten)
function KI( gegner, feld, level ){
	
	//Leistung der KI
	//	1 => leicht => zufall
	//	2 => mittel => zufall, wenn ein Schiff gefunden versenken
	//	3 => schwer => zufall, wenn ein Schiff gefunden versenken, ein Kästchen frei halten
	
	//Wenn nicht gegeben, 1
	if( typeof level === "undefined" ){
		level = 1;
	}
	//setzen	
	this.level = level;
	
	//schon beschossenen Stellen in Array
	//	jeweils mit Inhalt als Sting "x-y"
	this.done_shoots  = new Array();
	
	//Schuss von außen auslösen
	this.shoot = function(){
		//Level 3?
		if( this.level == 3){
			//Level 3 ausführen
			this.random_versenken_freilassen();
		}
		//Level 2?
		else if( this.level == 2 ){
			//Level 2 ausführen
			this.random_versenken();
		}
		else{
			//Level wohl 1
			this.random();
		}
		
		return;
	}
	
	//Schuss zufällig ausführen (Level 1)
	this.random = function(){

		//zufällige Stelle finden
		var randxy =  this.get_xy();

		//Schuss durchführen
		this.final_shoot( randxy.x, randxy.y );
		
		return;
	}

	//Schuss zufällig, gefundene Schiffe aber versenken (Level 2)
	this.random_versenken= function(){
		
		/*******************************************************/
		/*	ToDo						*/
		/*******************************************************/
		
		//zufällige Stelle finden
		var randxy =  this.get_xy();
		
		/*******************************************************/
		/*	ToDo						*/
		/*******************************************************/
		
		//Schuss durchführen
		this.final_shoot( sp_x, sp_y );
		
		return;
	}
	
	//Schuss zufällig, gefundene Schiffe aber versenken, einzelne Kästchen freilassen (Level 2)
	this.random_versenken_freilassen = function(){
		
		/*******************************************************/
		/*	ToDo						*/
		/*******************************************************/
		
		//zufällige Stelle finden
		var randxy =  this.get_xy();
		
		/*******************************************************/
		/*	ToDo						*/
		/*******************************************************/

		
		//Schuss durchführen
		this.final_shoot( sp_x, sp_y );
		
		return;
	}
	
	//Zufällig noch nicht beschossene Stelle finden
	this.get_xy = function (){
		
		//Schussstellen
		var sp_x, sp_y;
	
		//noch nicht beschossene Stelle finden
		do{
			//Schusspunkt zufällig wählen
			sp_x = randomint( 0, feld.max_x );
			sp_y = randomint( 0, feld.max_y );
	
			//Schleife erst verlassen, wenn freie Stelle gefunden
		} while ( $.inArray( sp_x+'-'+sp_y , this.done_shoots ) != -1 );
		
		//Schusspunkt merken
		this.done_shoots.push( sp_x+'-'+sp_y );
		
		//als Objekt zurückgeben
		return { "x": sp_x, "y": sp_y };
	}
	
	//Schuss am Objekt des Gegners ausführen
	//	sp_x => X-Wert des Schusses
	//	sp_y => Y-Wert des Schusses
	this.final_shoot = function( sp_x, sp_y ){
		//Schuss ausführen
		gegner.shoot_ships( sp_x, sp_y );
		
		return true;
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
});

//Das Objekt für Schiffe und User global machen 
var schiffe_one, schiffe_two, feld, ki;

//Level für KI
var ki_level;

//Spiel beginnen
function start_game(){
	//alles für neues Spiel abfragen und los
	
	//erstmal gegen den PC
	global_game = false;
	
	//Willkommen
	set_message( 'Herzlich Willkommen bei "Schiffe-versenken" von KIMB-technologies!' );
	
	//Felder anzeigen
	//	Feldobjekt
	feld = new Feld();
	//	Überschrift
	var html = '<br /><span class="untertitel">Meine Schiffe</span><span class="untertitel">Schussfeld</span><br />';
	//	Übersicht der Schiffe des Users
	html += feld.empty_field( 'my_ships' );
	//	Übesicht der Schüsse
	html += feld.empty_field( 'shoot_at' );
	//		alles ausgeben
	show_html( html, "div.area_one" );
	
	//Usernamen und Spielart fragen
	//	Inhalt
	var cont = ' Willkommen bei "Schiffe-versenken" von KIMB-technologies!<br />';
	cont += 'Bitte wählen Sie einen Gegner:<br /><br />';
	cont += '<div id="radio"> <input type="radio" id="pc" name="pc"><label for="pc" >Computer</label><input type="radio" id="www" name="www" ><label for="www">Anderer Spieler</label></div>';
	//	Dialog
	new_dialog( cont, 'Spielbeginn' );
	//	Buttons auf Dialog
	$( "#radio" ).buttonset();
	 
	 //Button Klicks auswerten
	$( "#radio input[type=radio]" ).click( function() {
		if( $( this ).attr( 'name' )  == 'pc' ){
			game_contra_pc();
		}
		else{
			game_contra_www();
		}
		
	  });

}

//Spiel gegen den Computer führen
function game_contra_pc(){
	
	
	//Stärke des Computers/ KI wählen
	//	Inhalt
	var cont = 'Bitte wählen Sie die Stärke des Computers:<br /><br />';
	cont +=  '<div id="radio"> <input type="radio" id="l1" name="l1" checked="checked"><label for="l1" >Schwach</label><input type="radio" id="l2" name="l2" ><label for="l2">Mittel</label><input type="radio" id="l3" name="l3" ><label for="l3">Stark</label></div>';
	//	Dialog
	new_dialog( cont, 'KI Level' );
	//	Buttons auf Dialog
	$( "#radio" ).buttonset();
	 
	 //Button Klicks auswerten
	$( "#radio input[type=radio]" ).click( function() {
		//Level 3
		if( $( this ).attr( 'name' )  == 'l3' ){
			ki_level = 3;
		}
		//Level 2
		else if( $( this ).attr( 'name' )  == 'l2' ){
			ki_level = 2;
		}
		//Level 1
		else{
			ki_level = 1;
		}
		
		//Auswahldialog schließen
		close_dialog();
	  });
	 
	//Objekt der Klasse Schiffe für Spieler erstellen
	schiffe_one = new Schiffe( 'Spieler' );
	schiffe_two = new Schiffe( 'Computer' );
	//	Schiffe zufällig anordnen
	schiffe_one.place_random();
	schiffe_two.place_random();
	
	//KI Objekt
	ki = new KI( schiffe_one, feld, ki_level );
	 
	//Feld erweitern
	//	Schüsse des Users zeigen (der PC führt die Liste)
	feld.show_field_shoots(  schiffe_two.shoots, 'shoot_at' );
	//	Schiffe des Users zeichen
	feld.show_field_ships( schiffe_one.current, 'my_ships' );
	//	Schüsse möglich machen
	//		User schießt auf Feld des PC
	feld.make_shootable( "shoot_at", schiffe_two );
	//	Balken mit Anzahlen der Schiffe
	feld.show_shipnumbers( 'ship_stat', schiffe_one, schiffe_two );
	 
	 //Medlungen für User
	 set_message( 'Die Schiffe wurden gesetzt!' );
	 set_message( 'Führen Sie den ersten Schuss im Feld rechts aus!!' );
	 
	 //User ist dran
	 aktuser = schiffe_one.username;
	
}

//Spiel über das Internet gegen einen anderen spielen
function game_contra_www(){
	
	//Spiel gegen einen anderen Spieler (per PHP)
	global_game = true;
	
	//Fehlerdialog
	new_dialog( 'Leider ist diese Funktion noch nicht verfügbar!<br /><br /><center><div id="button" >OK</div></center>' , 'Fehler' );
	
	//Button auf Dialog
	$( "#button" ).button(); 
	 //Button Klicks auswerten
	$( "#button" ).click( function() {
		//neues Spiel beginnen
		start_game();
	});
	 
	 //Ajax, PHP
	 
	//	var global_spielid 
	
}

//aktueller User, der dran ist
var aktuser;

//Nach einem Schuss den PC schießen lassen und Spielfeld aktualisieren 
function pc_shoot_and_refresh(){
	
	//PC schießt
	//	ist aber doof (schießt zufällig)
	
	//PC ist dran
	aktuser = schiffe_two.username;
	
	//KI schießt für PC
	ki.shoot();
	
	//User ist wieder dran
	aktuser = schiffe_one.username;
	
	//Feld des Users aktualisieren
	//	Schüsse des Users zeigen (der PC führt die Liste)
	feld.show_field_shoots(  schiffe_two.shoots, 'shoot_at' );
	//	Schiffe des Users zeichen
	feld.show_field_ships( schiffe_one.current, 'my_ships' );
	//	Balken mit Anzahlen der Schiffe
	feld.show_shipnumbers( 'ship_stat', schiffe_one, schiffe_two );
	
	//Feld des Gegners zeigen?
	if( show_enemy_field ){
		//	Schüsse des PC zeigen (der User führt die Liste)
		feld.show_field_shoots( schiffe_one.shoots , 'shoots' );
		//	Schiffe des PC zeigen
		feld.show_field_ships( schiffe_two.current , 'your_ships' );
	}
	
	return;
}

//Feld des Gegeners zeigen?
var show_enemy_field = false;
//Feld des Gegners soll angezeigt werden
//	oo => nicht gegeben -> Feld zeigen, gegeben -> Feld ausblenden
//	Rückgabe: true
function show_enemy( oo ){

	//Feld zeigen?
	if( typeof oo === "undefined" ){
		//Übersicht der Schiffe des Users
		var html = feld.empty_field( 'your_ships' );
		//Übesicht der Schüsse
		html += feld.empty_field( 'shoots' );
		//	alles ausgeben
		show_html( html, "div.area_two" );
		
		//auch immer aktualisieren usw.
		show_enemy_field = true;
		
		//Felder füllen
		//	Schüsse des PC zeigen (der User führt die Liste)
		feld.show_field_shoots( schiffe_one.shoots , 'shoots' );
		//	Schiffe des PC zeigen
		feld.show_field_ships( schiffe_two.current , 'your_ships' );
	}
	else{
		//Feld nicht zeigen
		
		//Feld leeren
		show_html( '', "div.area_two" );
		
		//auch nicht mehr aktualisieren usw.
		show_enemy_field = false;
	}
	
	return true;
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
		
		if( classList.length > 2 ){
			$( HoverClassPraefix+'.'+classList[1] ).css( 'background-color', HoverColorlight );
			$( HoverClassPraefix+'.'+classList[2] ).css( 'background-color', HoverColorlight );
			$( HoverClassPraefix+'.'+classList[3] ).css( 'background-color', HoverColor );
		}
	}, function(){
		var classList = $( this ).attr('class').split(/\s+/);

		$( HoverClassPraefix+'.'+classList[1] ).css( 'background-color', 'white' );
		$( HoverClassPraefix+'.'+classList[2] ).css( 'background-color', 'white' );
		$( HoverClassPraefix+'.'+classList[3] ).css( 'background-color', 'white' );
	});
});