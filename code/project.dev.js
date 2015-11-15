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
//	typed => leer lassen, damit getippt wird, sonst wird eingeblendet
function set_message( mess, typed ){
	//Tippen ?
	if( typeof typed === "undefined" ){
		//div für die Medlung erstellen (mit CSS ID nach message_id)
		$( "div.outputs" ).prepend( '<div id="m'+message_id+'"></div>' );
	}
	else{
		//einblenden
		$( "div.outputs" ).prepend( '<div id="m'+message_id+'">'+mess+'</div>' );
	}
	//schon mehr als 3 Medlungen vorhanden?
	if( message_id > 3 ){
		//älteste Medlung ausblenden
		$( "div.outputs div#m"+ ( message_id - 3 ) ).css( 'display', 'none' );
	}
	
	if( typeof typed === "undefined" ){
		//Typewriter der Medlung in erstellten Kasten
		$( "div.outputs div#m"+message_id ).typed({ typeSpeed: 0, strings: [ mess ] });
	}

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
//	close => leer lassen, damit kein X in der Ecke angezeigt wird
function new_dialog( cont, tit, close ){
	$( "#dialog" ).attr( 'title', tit );
	$( "#dialog" ).html( cont );
	$( "#dialog" ).css( 'display', 'block' );
	$( "#dialog" ).dialog( { width:600, modal:true } );
	$( "#dialog" ).dialog('option', 'title', tit );
	
	if( typeof close === "undefined" ){
		//nur über OK Button Dialog schließen
		$( ".ui-dialog-titlebar-close" ).css( 'display', 'none' );
	}
	else{
		$( ".ui-dialog-titlebar-close" ).css( 'display', 'block' );
	}
}

//Dialog schließen
function close_dialog() {
	$( "#dialog" ).dialog( "close" );
	$( "#dialog" ).css( 'display', 'none' );
}

//Array mit allen Events
var all_events = new Array();

//Funktionen des Ablaufs hier auslösen
//	(diese Funktion wird von den Klassen gestartet)
//		done_event => Stelle des Aufrufs in Klasse
function reload_data( done_event ){

	//Events in der Konsole für Debugging zeigen
	console.log( done_event );
	
	//Array mit den Events
	all_events.push( done_event );

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
			 new_dialog( 'Du hast gewonnen!', 'Herzlichen Glückwunsch', true );
			 set_message( 'Du hast gewonnen!' );
			 set_message( 'Herzlichen Glückwunsch &#128515;', false );
		}
		else{
			 new_dialog( 'Dein Gegner hat gewonnen!', 'Schade', true );
			 set_message( 'Dein Gegner hat gewonnen!' );
			 set_message( 'Schade &#128542;', false );					
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

		//Balken weg
		show_html( '', "div.ship_stat" );
	 
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

//Hover für das Schussfeld rechts anzeigen
//	muss nach Neustart des Games neu ausgeführt werden
function hover_shoot_at(){
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
				splf += '<div class="x y_'+i+' x_'+ii+' y_'+i+'x_'+ii+'" title="' + ii + ' | ' + this.koordtoletter[i] + ' ' + i + '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
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

	//Schiffe neu platzieren erlauben/ verbieten
	this.replace_ship_allow = true;

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
		
		//Platzierungsversuche
		var place_zu_viele;
	
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
				
				//noch keine Platzierungsversuche
				place_zu_viele = 0;
				
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
					
					//zu viele Platzierungsversuche
					//	Schiffe liegen wohl so ungünstig, dass diese Schleife nie verlassen wird 
					if( place_zu_viele > 500 ){
						//für Fehlermeldung bei erneutem Aufruf der Seite speichern
						//	zvv => zu viele Versuche
						sessionStorage.setItem('abbruch', 'zvv');
						//Seite neu laden
						location.reload();
						return;
					}
					
					//nächster Platzierungsversuch
					place_zu_viele++;
					
					//Schleife erst verlassen, wenn freie Stelle gefunden
				} while ( this_func.all_places_free(allplaces, bes_place) );
			
				//endgültige Werte setzen
				new_obj['x'] = end_x;
				new_obj['y'] = end_y;
				
				//einen Rand von einem Käschen um die Schiffe frei lassen
				//	jeweils oben/ unten am Schiff einen besetzten Platz abspeichern
				//		bei -1 anfangen und einen  weiter gehen (damit auch Kästchen schräg bei Schiff beachtet werden)
				for( var ii = -1; ii < ( size + 1 ) ; ii++){										
					if( new_obj['d'] == 'h' ){
						//horizontal, X-Werte erhöhen
						
						//Spielfeld nicht verlassen
						if( max_y - end_y >= 0 ){
							//oben einen Rand frei lassen
							bes_place.push( (end_x +ii ) + '-' + ( end_y + 1 ) );
						}
						//Spielfeld nicht verlassen
						if( end_y - 1 >= 0 ){
							//unten einen Rand frei lassen
							bes_place.push( (end_x +ii ) + '-' + ( end_y - 1 ) );
						}
					}
					else{		
						//Spielfeld nicht verlassen
						if( max_x - end_x >= 0 ){
							//rechts einen Rand frei lassen
							bes_place.push( ( end_x + 1 ) + '-' + ( end_y + ii ) );
						}
						if( end_x - 1 >= 0 ){
							//links einen Rand frei lassen
							bes_place.push( ( end_x -1 ) + '-' + ( end_y + ii ) );
						}
					}	
				}
				//Kästchen vor und nach dem Schiff anfügen
				//	vor
				if( new_obj['d'] == 'h' ){
					bes_place.push( ( end_x - 1 )+ '-' + end_y  );
				}
				else{
					bes_place.push( end_x + '-' + ( end_y - 1 ) );
				}
				//	nach
				if( new_obj['d'] == 'h' ){
					bes_place.push( ( end_x + size ) + '-' + end_y );
				}
				else{
					bes_place.push( end_x + '-' + ( end_y + size ) );
				}
				
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
	
	//Plätze der Schiffe manuell verändern
	//	Toolbar hinzufügen und auf clicks schauen
	//		cssclass => CSS Klasse des Feldes mit den Schiffen
	//		feld => Objekt des Feldes 
	this.replace_allow = function( cssclass, feld ){
		
		//this für Funktionen
		var this_func = this;
		
		//nur wenn erlaubt
		if( this.replace_ship_allow ){
			
			//HTML Code für die Leiste
			var html = '<hr /><div class="lagebar">';
			html += '<b>Lage anpassen<b/><br />';
			html += '<span class="ui-icon ui-icon-scissors" style="display:inline-block;" title="Schiffe verschieben aktivieren"></span>';
			html += '<span class="ui-icon ui-icon-arrowreturnthick-1-w" style="display:inline-block;" title="Ausrichtung des Schiffes ändern"></span>&nbsp;&nbsp;&nbsp;&nbsp;';
			html += '<span class="ui-icon ui-icon-info" style="display:inline-block;" title="Hier können Sie Ihre Schiffe verschieben. Aktivieren Sie zuerst die Funktion (Schere), anschließend können Sie ein Schiff mit einem Klick auf den Bug wählen. Die Ausrichtung dieses Schiffes können Sie mit dem Pfeil anpassen. Mit einem Klick auf einen freien Platz wird Ihr Schiff dorthin verschoben. Die Funktion wird automatisch mit dem ersten Schuss geblockt!"></span>';
			html += '</div><hr />';
			//Leiste anzeigen
			show_html( html, "div.replace_ship" );
			//Tooltips
			$( "div.lagebar" ).tooltip();
			//als Button
			$( "span.ui-icon-scissors" ).button();
			$( "span.ui-icon-arrowreturnthick-1-w" ).button();
			
			//Daten über gewähltes Schiff
			//	gew => aktives Schiff vorhanden true/ false
			//	x => X-Wert des Bugs
			//	y => Y-Wert des Bugs
			//	d => Ausrichtung 
			var akt_ship = { "gew": false, "x": 1, "y": 1, "d": "h" };
			
			//bei Klick auf die Schere aktivieren
			$( "div.lagebar span.ui-icon-scissors" ).unbind('click').click( function (){
				
				//Schiffe umfärben
				$( "span.ship_black.ship_bug_v" ).css( { "background-color": "green","border-bottom-color": "green", "border-right-color": "green" } );
				$( "span.ship_black.ship_bug_h" ).css( { "background-color": "green","border-bottom-color": "green", "border-right-color": "green" } );
				
				//horizontales Schiff zum Verschieben gewählt
				$( "span.ship_bug_h" ).unbind('click').click( function (){
					//CSS Klasse des Kästchens herausbekommen
					var classes = $( this ).parent().attr('class').split(/\s+/);
					
					//Werte für Schiff aus Klasse bestimmen
					akt_ship.gew = true;
					akt_ship.y = classes[1].substr(2);
					akt_ship.x = classes[2].substr(2);
					akt_ship.d = "h";
					
					//Meldung, dass Schiff gewählt
					set_message( 'Sie haben ein Schiff ausgewählt!' );
					
					//Bug blau machen
					$( this ).css( { "background-color": "blue","border-bottom-color": "blue", "border-right-color": "blue" } );

				});
				//vertiakles Schiff zum Verschieben gewählt
				$( "span.ship_bug_v" ).unbind('click').click( function (){
					//CSS Klasse des Kästchens herausbekommen
					var classes = $( this ).parent().attr('class').split(/\s+/);
					
					//Werte für Schiff aus Klasse bestimmen
					akt_ship.gew = true;
					akt_ship.y = classes[1].substr(2);
					akt_ship.x = classes[2].substr(2);
					akt_ship.d = "v";
					
					//Meldung, dass Schiff gewählt
					set_message( 'Sie haben ein Schiff ausgewählt!' );
					
					//Bug blau machen
					$( this ).css( { "background-color": "blue","border-bottom-color": "blue", "border-right-color": "blue" } );
					
				});
				
				//Schiff drehen
				$( "div.lagebar span.ui-icon-arrowreturnthick-1-w" ).unbind('click').click( function (){
					
					//nur wenn Schiff ausgewählt
					if( akt_ship.gew ){
						if( akt_ship.d == "h" ){
							//vertikal machen
							akt_ship.d = "v";
							
							//Meldung, dass Schiff gedreht
							set_message( 'Das Schiff steht nun vertikal!' );
						}
						else{
							//horizontal machen
							akt_ship.d = "h";
							
							//Meldung, dass Schiff gedreht
							set_message( 'Das Schiff steht nun horizontal!' );
						}
					}
				});
				
				//Hover für Schiff ablegen		
				$( 'div.my_ships .x' ).unbind('click').hover(function(){
					//nur wenn Schiff ausgewählt
					if( akt_ship.gew ){
						//CSS Klassen lesen
						var classes = $( this ).attr('class').split(/\s+/);
						
						//nur Kästchen in der Mitte wählen
						if( classes.length > 2 ){
							//Hintergrund ändern	
							$( this ).css( 'background-color', 'lightblue' );
						}
					}
				}, function () {
					//Hintergrund ändern	
					$( this ).css( 'background-color', 'white' );
				});
				
				
				//Schiff neu ablegen		
				$( 'div.my_ships .x' ).unbind('click').click(function(){
					//nur wenn Schiff ausgewählt
					if( akt_ship.gew ){
						//CSS Klassen lesen
						var classes = $( this ).attr('class').split(/\s+/);
						
						//nur Kästchen in der Mitte wählen
						if( classes.length > 2 ){
							
							//Werte für Funktion, die Schiff verschiebt, anpassen
							y_new = classes[1].substr(2);
							x_new = classes[2].substr(2);
							
							old_x = akt_ship.x;
							old_y = akt_ship.y;
							d = akt_ship.d;
							
							//nur wenn andere Stelle
							if( old_x != x_new || old_y != y_new ){
								//Schiff verschieben
								if( this_func.replace_ship( old_x, old_y, x_new, y_new, d, cssclass, feld ) ){
								
									//kein Schiff mehr gewählt
									akt_ship.gew = false;
									
									//Schiffe zurückfärben
									$( "span.ship_black" ).css( { "background-color": "black","border-bottom-color": "black", "border-right-color": "black" } );
								}
								else{
									//Meldung, dass Verschieben fehlgeschlagen ist
									set_message( 'Das Schiff konnte nicht verschoben werden. Wählen Sie ggf. eine andere Stelle!' );
								}
							}
						}
					}
				});
			});
		}
		
		return;
	}
	
	//Platz einen Schiffes ändern
	//	wird von this.replace_allow(); gestartet
	//		old_x => alter X-Wert (da wo Schiff gerade ist)
	//		old_y => alter Y-Wert
	//		new_x => neuer X-Wert
	//		new_y => neuer Y-Wert
	//		d => neue Ausrichtung h/ v
	//		cssclass => CSS Klasse des Feldes mit den Schiffen
	//		feld => Objekt des Feldes
	this.replace_ship = function( old_x, old_y, x_new, y_new, d, cssclass, feld ) {
		
		//zu Zahlen machen
		x_new = parseInt( x_new );
		y_new = parseInt( y_new );
		old_x = parseInt( old_x );
		old_y = parseInt( old_y );
		
		//nur wenn erlaubt
		if( this.replace_ship_allow ){
			
			//besetzte Plätze Array mit "x-y""
			var bes_place = []
			
			//Schiff welches verschoben werden soll: IDs 
			var foundship;
					
			//alle Schiffe durchgehen 
			$.each( this.current, function ( key, val ){
				//Größe der Schiffsklasse
				var size = val['size']
				
				//jedes Schiff der Klasse durchgehen
				$.each( val['place'], function( k, v ){
					
					//Schiff welches verschoben werden soll gefunden?
					if( v["x"] == old_x && v["y"] == old_y ){
						//Informationen über das Schiff für später ablegen
						foundship = { "klasse":key, "index": k, "size": size };	
					}
					
					//Plätze jedes Schiffes in Array
					for( var i = 0; i < size ; i++){										
						if( v['d'] == 'h' ){
							//horizontal, X-Werte erhöhen
							bes_place.push( ( v["x"] + i )  + '-' + v["y"] );
						}
						else{
							//vertikal, Y-Werte erhöhen
							bes_place.push( v["x"]  + '-' + ( v["y"] + i ) );
						}
					}
				});	
			});
			
			//Feldgröße
			var max_x = feld.max_x;
			var max_y = feld.max_y;
			
			//Werte des verschobenen Schiffes durchgehen
			//	Überlagerung?
			for( var i = 0; i < foundship.size; i++ ){
				if( d == 'h' ){
					//horizontal, X-Werte erhöhen
					
					//Stelle schon vergeben?
					if( $.inArray( ( x_new + i )  + '-' + y_new, bes_place ) != -1 ){
						return false;
					}
					
					//Spielfeld darf nicht verlassen werden
					if( ( x_new + i ) > max_x || y_new > max_y ){
						return false;
					}

				}
				else{
					//vertikal, Y-Werte erhöhen
					
					//Stelle schon vergeben?
					if( $.inArray( x_new  + '-' + ( y_new + i ), bes_place ) != -1 ){
						return false;
					}
					
					//Spielfeld darf nicht verlassen werden
					if( x_new > max_x || ( y_new + i ) > max_y ){
						return false;
					}
				}
			}
			
			//Werte des anzupassenden Schiffes gut ablegen
			var klasse = foundship["klasse"];
			var index = foundship["index"];
			
			//this.current anpassen			
			this.current[klasse]["place"][index]["x"] = x_new;
			this.current[klasse]["place"][index]["y"] = y_new;
			this.current[klasse]["place"][index]["d"] = d;
			
			//leeres Feld, damit alte Stelle des Schiffes verschwindet
			$( '.my_ships' ).replaceWith( feld.empty_field( 'my_ships' ) ); 
			//neue Schiffsaufstellung zeichenen
			feld.show_field_ships( this.current, cssclass );			
			
			return true;
		}
		
		return false;
	}
	
	//Änderungen an den Plätzen der Schiffe verbieten
	this.replace_disallow = function (){
		
		//Platzierung verbeiten
		this.replace_ship_allow = false;
		
		//Toolbar ausblenden
		$( 'div.replace_ship' ).css( 'display', 'none' );
		
		//Schiffe zurückfärben
		$( "span.ship_black" ).css( { "background-color": "black","border-bottom-color": "black", "border-right-color": "black" } );
	}
	
	//Änderungen an den Plätzen der Schiffe verbieten
	this.replace_reallow = function (){
		
		//Platzierung erlauben
		this.replace_ship_allow = true;
		
		//Toolbar einblenden
		$( 'div.replace_ship' ).css( 'display', 'block' );
		
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
		
		//jetzt dürfen die Plätze nicht mehr verändert werden
		this.replace_disallow();

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
			
			return retval;
		});

		if( retval == 0 ){
			//keine Schiffe getroffen
			return this.setretval_for_shoot_ships( retval, x, y );
		}
		
		return retval;
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
	//	4 => extrem => KI kann Schiffe des Gegners sehen
	
	//Wenn nicht gegeben, 1
	if( typeof level === "undefined" ){
		level = 1;
	}
	//setzen	
	this.level = level;
	
	//auf der anderen Seite des Schusses gucken sinnvoll?
	//	z.B. Schiff in der Mitte getroffen, dann nach links alles versenkt, rechts noch eine Kasten zu finden
	//	bei Level 2 und 3
	this.otherdir = false;

	//Plätze wo Schiff entdeckt wurde
	//	bei Level 2 und 3
	this.shipfound_place;

	//Werte für Schusspunkte nach Schachbrettmuster
	//	bei Level 2 und 3
	this.freilasskaestchen = 'unset';
	
	//schon beschossenen Stellen in Array
	//	jeweils mit Inhalt als Sting "x-y"
	this.done_shoots  = new Array();
	
	//Array mit den nächsten geplnten Schussstellen erstellen
	//	bei Level 2 und 3
	this.next = 'unset';
	
	//Schuss von außen auslösen
	this.shoot = function(){
		//Level 4?
		if( this.level == 4 ){
			//Level 4 ausführen
			this.allwissend();
		}
		//Level 2 oder 3?
		else if( this.level == 2 ||  this.level == 3){
			//Level 2 ausführen
			this.versenken();
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

	//Schuss zufällig, gefundene Schiffe aber versenken (Level 2 und 3)
	this.versenken= function(){
		
		//this.next ohne Werte?
		if( this.next == 'unset' ){
		
			if( this.level == 2 ){
				//zufällige Stelle finden (Level 2)
				var randxy =  this.get_xy();
			}
			else{
				//Stelle mit Vestand wählen (Level 3)
				var randxy = this.freilassen();
			}
			
			//Rückgabe lesen
			var sp_x = randxy.x, sp_y = randxy.y;
			
			//Schuss durchführen
			var retval = this.final_shoot( sp_x, sp_y );
			
			//Treffer?
			if( retval == 1){
				//alle vier Punkte um Treffer bestimmen
				
				//Reihenfolge der vier Kästchen drumherum zufällig bestimmen
				var randint = randomint( 0, 3 );
	
				//für nächste Punkte Array[ Objekte ]
				var next;
	
				//nächste Schüsse planen
				//	unter Index 0 den aktuellen Schuss ablegen!
				//	danach in zufälliger Reihenfolge alle vier Richtungen
				if( randint == 0 ){
					next = [
						{ 'x': sp_x, 'y': sp_y },
						{ 'x': ( sp_x + 1 ), 'y': sp_y },
						{ 'x': sp_x, 'y': ( sp_y + 1 ) },
						{ 'x': (sp_x - 1), 'y': sp_y },
						{ 'x': sp_x , 'y': ( sp_y - 1 ) }
					]; 
				}
				else if( randint == 1 ){
					next = [
						{ 'x': sp_x, 'y': sp_y },
						{ 'x': ( sp_x - 1 ), 'y': sp_y },
						{ 'x': sp_x, 'y': ( sp_y - 1 ) },
						{ 'x': (sp_x + 1), 'y': sp_y },
						{ 'x': sp_x , 'y': ( sp_y + 1 ) }
					]; 
				}
				else if( randint == 2 ){
					next = [
						{ 'x': sp_x, 'y': sp_y },
						{ 'x': sp_x, 'y': ( sp_y - 1 ) },
						{ 'x': ( sp_x - 1 ), 'y': sp_y },
						{ 'x': sp_x , 'y': ( sp_y + 1 ) },
						{ 'x': (sp_x + 1), 'y': sp_y }
					]; 
				}
				else if( randint == 3 ){
					next = [
						{ 'x': sp_x, 'y': sp_y },
						{ 'x': sp_x, 'y': ( sp_y + 1 ) },
						{ 'x': ( sp_x + 1 ), 'y': sp_y },
						{ 'x': sp_x , 'y': ( sp_y - 1 ) },
						{ 'x': (sp_x - 1), 'y': sp_y }
					]; 
				}
				
				//this in Funktion benutzen
				var this_func = this;
				
				//this.next leeren (wird gleich neu gefüllt)
				this.next = new Array();
				
				//evtl. Treffer am Rand und Schuss soll nicht außerhalb des Spielfelded laden!!
				$.each( next, function( key, val ) {
					
					if(
						val["x"] > feld.max_x ||
						val["x"] < 0 ||
						val["y"] > feld.max_y ||
						val["y"] < 0 
					){
						//dieses Kästchen nicht behalten
							
					}
					else{
						//das Kästchen speichern
						this_func.next.push( val );
					}
				});
				
				//Stelle an der Schiff gefunden speichern
				this.shipfound_place = { "x": sp_x, "y": sp_y };	
			}
			
		}
		else{
			//this.next verwenden
			
			//Schusspunkte
			 var sp_x = this.next[1]["x"];
			 var sp_y = this.next[1]["y"]
			
			//Schuss nach this.next ausführen		
			retval = this.final_shoot( sp_x , sp_y );
			
			//Treffer ins Wasser, aber Schiff gefunden, nur eine Richtung beendet
			//in andere Richtung gehen
			if( retval == 0 && this.otherdir == true ){
				
				//Stellen wo Schiff gefunden
				var f_x = this.shipfound_place["x"];
				var f_y = this.shipfound_place["y"];
				
				//vom Platz wo Schiff gefunden ausgehen
				//	vertikal
				if( f_x == sp_x ){
					//nach oben oder unten schon am Ende?
					//	andere Richtung probieren
					if( ( sp_y - f_y ) < 0 ){
						this.next = [
							{ 'x': f_x, 'y': f_y },
							{ 'x': f_x, 'y': ( f_y + 1 ) }
						];
					}
					else{
						this.next = [
							{ 'x': f_x, 'y': f_y },
							{ 'x': f_x, 'y': ( f_y - 1 ) }
						];
					}
					
				}
				//	horizontal
				else if( f_y == sp_y ){
					//nach rechts oder links schon am Ende?
					//	andere Richtung probieren
					if( ( sp_x - f_x ) < 0 ){
						this.next = [
							{ 'x': f_x, 'y': f_y },
							{ 'x': ( f_x + 1 ), 'y': f_y }
						];
					}
					else{
						this.next = [
							{ 'x': f_x, 'y': f_y },
							{ 'x': ( f_x - 1 ), 'y': f_y }
						];
					}
				}
				else{
					//Fehler
					//keine nächsten Schritte mehr
					this.next = 'unset';
					
					//Richtungswechsel fehlgeschlagen
					this.otherdir = false;
				}
			}
			//Treffer ins Wasser (this.next weiter durchgehen)
			//	noch ein this.next von ganz oben
			else if( retval == 0 ){
				
				//this.next anpassen
				//	Wert des aktuellen Schusses entfernen
				
				//Array um this.next neu zu bauen
				var newnext = new Array();

				//alle Werte durchgehen
				$.each( this.next, function( key, val ){
					//Index/ Key 1 ist immer der aktuelle Schuss, diesen weglassen
					if( key != 1 ){
						//alle anderen anfügen
						newnext.push( val );
					}
				});

				//neu gebautes Array für this.next nutzen
				this.next = newnext;

				//this.next leer?
				if ( typeof this.next[1] === "undefined" ){
					//keine nächsten Schritte mehr
					this.next = 'unset';
				}
				
				//Schiff konnte noch nicht gefunden werden, restliche Richtungen probieren 
				this.otherdir = false;
			}
			//Treffer
			//	nächste Stellen neu berechnen
			else if( retval == 1 ){

				//jetzt könnte es sinnvoll sein andere Richtungen zu probieren (im nächsten Schritt) 
				this.otherdir = true;

				//die Richtung herausfinden, in der ein weiterer Treffer gelandet werden konnte
				//	nächsten Schritt in diese Richtung feststellen
				//		unter Index 0 wieder die aktuelle Stelle ablegen
				
				//vertikal oder horizontal?
				if( sp_y == this.next[0]["y"] ){
					if( this.next[0]["x"] - sp_x == 1 ){
						this.next = [
							{ 'x': sp_x, 'y': sp_y },
							{ 'x': ( sp_x - 1 ), 'y': sp_y }
						];
					}
					else if( this.next[0]["x"] - sp_x == -1 ){
						this.next = [
							{ 'x': sp_x, 'y': sp_y },
							{ 'x': ( sp_x + 1 ), 'y': sp_y }
						];
					}
					else{
						//Fehler
						//keine nächsten Schritte mehr
						this.next = 'unset';
						
						//Finden neuer Stellen fehlgeschlagen
						this.otherdir = false;
					}
				}
				else if(  sp_x == this.next[0]["x"] ){
					if( this.next[0]["y"] - sp_y == 1 ){
						this.next = [
							{ 'x': sp_x, 'y': sp_y },
							{ 'x': sp_x, 'y': ( sp_y - 1 ) }
						];
						
					}
					else if( this.next[0]["y"] - sp_y == -1 ){
						this.next = [
							{ 'x': sp_x, 'y': sp_y },
							{ 'x': sp_x, 'y': ( sp_y + 1 ) }
						];
					}
					else{
						//Fehler
						//keine nächsten Schritte mehr
						this.next = 'unset';
						
						//Finden neuer Stellen fehlgeschlagen
						this.otherdir = false;
					}
				}
				else{
					//Fehler
					//keine nächsten Schritte mehr
					this.next = 'unset';
						
					//Finden neuer Stellen fehlgeschlagen
					this.otherdir = false;
				}
				
			}
			//Schiff versenkt
			else if( retval == 2 ){
				//also wieder eins suchen
				
				//keine nächsten Schritte mehr
				this.next = 'unset';
				
				//Schiff versenkt, also muss auch die Richtung nicht gewechselt werden
				this.otherdir = false;
			}		
		}
		
		return;
	}
	
	//Schuss zufällig, gefundene Schiffe aber versenken, einzelne Kästchen freilassen (Level 2)
	this.freilassen = function(){
		
		//erster Aufruf und diagonale Durchläufe (immer ein Kästchen frei) noch noch nicht bestimmt?
		if( this.freilasskaestchen == 'unset' ){
			//KI soll immer wie im Schachbrettmuster schießen, so 
			
			//leeres Array
			this.freilasskaestchen = new Array;
			
			//Indexe in den Schleifen
			//	algemeiner Index
			var x, y, i;
			
			//zufällig bestimmen wo erste Stelle liegt 
			i = randomint( 0, 1 );
			
			//X-Achse durchgehen
			for( x = 0; x < ( feld.max_x + 1 ); x++ ){

				//i immer um einen erhöhen, damit Stellen versetzt
				i++;

				for( y = 0; y < ( feld.max_y + 1); y++ ){
					//Y-Achse durchgehen

					//immer abwechselnd hinzufügen und nicht hinzufügen
					//	nur wenn Index gerade
					if ( i % 2 != 0) {
						//als Objekt dem Array anfügen
						this.freilasskaestchen.push( { "x": x, "y": y, "art":0 } );
					}
					
					//allg. Index erhöhen
					i++;
				}	
			}			
		}

		//Schussstellen
		var sp_x, sp_y, rand;
		
		//Anzahl der Stellen im Array bestimmen
		var count = this.freilasskaestchen.length;
		//	Index bei Arrays beginnt mit 0
		count = count - 1;
	
		//noch nicht beschossene Stelle finden
		do{
			//Schusspunkt aus Liste der Punkte zufällig wählen
			rand = randomint( 0, count );
			
			//X-/ Y-Werte extrahieren
			sp_x = this.freilasskaestchen[rand]["x"];
			sp_y = this.freilasskaestchen[rand]["y"];
	
			//Schleife erst verlassen, wenn freie Stelle gefunden
		} while ( $.inArray( sp_x+'-'+sp_y , this.done_shoots ) != -1 );

		//als Objekt zurückgeben
		return { "x": sp_x, "y": sp_y };

	}
	
	//Die KI listet alle Stellen mit den Schiffen des Gegners auf und arbeitet diese dann ab (Level 4)
	this.allwissend = function(){
		
		//erste Durchgang (Schiffe des lesen und Stellen merken)
		if( this.next == 'unset' ){
			
			//Variable für neues Next
			var newnext = new Array();
			
			//alle Schiffsklassen durchgehen
			$.each( gegner.current, function( key, val ){
				
				//Kästchen des Schiffes
				var size = val['size'];
				
				//jedes Schiff durchgehen
				$.each( val["place"], function( k, v ){
				
					//alle Stellen errechnen und dem Array anfügen
					//	OBJ. x und y
					for( var i = 0; i < size; i++){									
						if( v['d'] == 'h' ){
							//horizontal, X-Werte erhöhen
							newnext.push( { "x": (v["x"] +i ), "y": v["y"] } );
						}
						else{
							//vertikal, Y-Werte erhöhen
							newnext.push( { "x": v["x"], "y": ( v["y"] + i ) } );
						}
					}
					
				});		
			});
			
			//als next des Objekts setzen
			this.next = newnext;
			
			//Index der als nächstes zu beschießenden Stelle aus Next
			this.next_index = 0;
		}
		
		//alle Stellen von this.next beschießen (Plätze aller Schiffe)
		
		//Stellen mit aktuellem Index lesen
		var sp_x = this.next[this.next_index]["x"];
		var sp_y = this.next[this.next_index]["y"];
		
		//Schuss ausführen
		this.final_shoot( sp_x, sp_y );
		
		//Index für Schusspunkt erhöhen
		this.next_index++;
		
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

		//als Objekt zurückgeben
		return { "x": sp_x, "y": sp_y };
	}
	
	//Schuss am Objekt des Gegners ausführen
	//	sp_x => X-Wert des Schusses
	//	sp_y => Y-Wert des Schusses
	//	Return: 0[Wasser], 1[Treffer], 2[Versenkt]
	this.final_shoot = function( sp_x, sp_y ){
			
		//Schusspunkt merken
		this.done_shoots.push( sp_x+'-'+sp_y );
			
		//Schuss ausführen
		var retval = gegner.shoot_ships( sp_x, sp_y );
			
		//Wert zurückgeben
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
	
	//Hover der Reihen und Spalten rechts
	hover_shoot_at();
	
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
	cont +=  '<div id="radio">';
	cont +=  '<input type="radio" id="l1" name="l1" ><label for="l1"  title="Der Computer schießt einfach zufällig." >Schwach</label>';
	cont +=  '<input type="radio" id="l2" name="l2" ><label for="l2" title="Der Computer schießt zufällig, versenkt aber gefundene Schiffe." >Mittel</label>';
	cont +=  '<input type="radio" id="l3" name="l3" ><label for="l3" title="Der Computer schießt so, dass immer einzelne Kästchen frei bleiben (dort kann kein Schiff sein) und versenkt gefundene Schiffe." >Stark</label>';
	cont +=  '<input type="radio" id="l4" name="l4"><label for="l4" title="Der Computer schummelt und kennt die Schiffe des Gegners.">Extrem</label>';
	cont +=  '</div>';
	//	Dialog
	new_dialog( cont, 'KI Level' );
	//	Buttons auf Dialog
	$( "#radio" ).buttonset();
	//	Titel der Buttons im Dialog beim Überfahren anzeigen
	$( "#radio" ).tooltip();
	 
	 //Button Klicks auswerten
	$( "#radio input[type=radio]" ).click( function() {
		//Level 4
		if( $( this ).attr( 'name' )  == 'l4' ){
			ki_level = 4;
		}
		//Level 3
		else if( $( this ).attr( 'name' )  == 'l3' ){
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
		
		//KI Objekt
		ki = new KI( schiffe_one, feld, ki_level );
	  });
	 
	//Objekt der Klasse Schiffe für Spieler erstellen
	schiffe_one = new Schiffe( 'Spieler' );
	schiffe_two = new Schiffe( 'Computer' );
	//	Schiffe zufällig anordnen
	schiffe_one.place_random();
	schiffe_two.place_random();
	 
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
	 set_message( 'Sie können gerne Ihre Schiffe neu anordnen (Toolbar unten)!!' );
	 
	//Plätze der Schiffe manuell anpassbar machen
	schiffe_one.replace_reallow();
	//	wird nach erstem Schuss verboten
	schiffe_one.replace_allow( 'my_ships', feld );
	 
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
	
	//nur wenn Spiel nicht vorbei
	if( $.inArray( "alle_versenkt", all_events ) == -1 ){
		//	Balken mit Anzahlen der Schiffe
		feld.show_shipnumbers( 'ship_stat', schiffe_one, schiffe_two );
		
		//Feld des Gegners zeigen?
		if( show_enemy_field ){
			//	Schüsse des PC zeigen (der User führt die Liste)
			feld.show_field_shoots( schiffe_one.shoots , 'shoots' );
			//	Schiffe des PC zeigen
			feld.show_field_ships( schiffe_two.current , 'your_ships' );
		}
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
	
	//Fehlermeldungen ausgeben
	//	Seite musste neu geladen werden, aber sessionstorage ist gesetzt
	if( sessionStorage.getItem('abbruch') != null ){

		//Meldung
		//	HTML Code
		$( "body" ).append( '<div id="error-message">Die Seite wurde aufgrund eines Fehler neu geladen!<br /><br /><b>Informationen:</b><br /><i>'+sessionStorage.getItem('abbruch')+'</i></div>' );
		//	Dialog
		$( "#error-message" ).dialog({
			modal: true,
			title: "Fehler",
			resizable: false,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			}
 		});
		//nur über OK Button Dialog schließen
		$( ".ui-dialog-titlebar-close" ).css( 'display', 'none' );
		
		//Speicher leeren
		sessionStorage.removeItem( 'abbruch' );
	}
});
