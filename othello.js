var whitePlayer = 0;
var blackPlayer = 0;
var possible = [];
var whiteTurn = true;
var noMoves = false;

$(document).ready(function(){	
	//Funktion för att ändra färg på en bricka till vit
	function toWhite(cell){
		whitePlayer++;
		if($(cell).hasClass("blank")){
			$(cell).removeClass("blank");	
			$(cell).addClass("white");	
		}
		if($(cell).hasClass("black")){
			blackPlayer--;
			$(cell).removeClass("black");	
			$(cell).addClass("white");	
		}
		$("#scoreWhite").text(whitePlayer);
		$("#scoreBlack").text(blackPlayer);
	}
	
	//Funktion för att ändra färg på en bricka till svart
	function toBlack(cell){
		blackPlayer++;
		if($(cell).hasClass("blank")){
			$(cell).removeClass("blank");	
			$(cell).addClass("black");	
		}
		if($(cell).hasClass("white")){
			$(cell).removeClass("white");	
			$(cell).addClass("black");	
			whitePlayer--;
		}
		$("#scoreWhite").text(whitePlayer);
		$("#scoreBlack").text(blackPlayer);
	}
	
	
	function newGame(){
		//Återställer rester från tidigare spel
		noMoves = false;
		whitePlayer = 0;
		blackPlayer = 0;
		possible = [];
		whiteTurn = true;
		
		//Sätter id med nummer på alla celler  och klasser med rad och kolumn och gör dem blanka
		var n = 0;
		var column = 0;
		var row = 0;
		$('#game tr').each(function(){
			if(this.getAttribute('id')!=="players"){
				row++;
				var cells = $(this).children();
				$(cells).each(function(){
					if(column == 8){
						column = 1;
					}else{
						column++;
					}
					$(this).addClass("c" + column);
					n++;
					$(this).attr('id', n);
					$(this).addClass("r" + row);
					$(this).addClass("blank");
					
					if($(this).hasClass("black")){
						$(this).removeClass("black");	
					}
					if($(this).hasClass("white")){
						$(this).removeClass("white");	
					}
				});
			}
		});
		//Lägger ut startbrickor
		toWhite("#28");
		toWhite("#37");	
		toBlack("#29");
		toBlack("#36");
		//Startar spelet och hoppar till den vita spelarens tur
		changeTurn();
	};
	
	//Anropar startfuntionen vid klick på startknappen
	$("#newGame").click(newGame);

	//Ändrar vilken spelares tur det är
	function changeTurn(){
		if(whiteTurn){
			$("#player1").addClass("currentPlayer");	
			$("#player2").removeClass("currentPlayer");	
		}
		if(!whiteTurn){
			$("#player2").addClass("currentPlayer");	
			$("#player1").removeClass("currentPlayer");	
		}
		
		//Återställer efter förra rundan
		for(var cell in possible){
			var cellId = possible[cell];
			$(cellId).removeClass("possible");	
		}
		possible = [];
		
		//Kollar upp vilka celler som det är möjligt att lägga en bricka i och gör dem klickbara
		if(whiteTurn){
			getValid("black");
		}else{
			getValid("white");
		}
		for(var cell in possible){
			var cellId = possible[cell];
			$(cellId).addClass("possible");	
		}
		
		//Avslutar spelet om inga möjliga drag finns och skriver ut vem som vann
		if(possible.length == 0){
			if(noMoves){
			var winner;
			if (whitePlayer > blackPlayer)
				winner = "spelare 1"
			else if (whitePlayer < blackPlayer)
				winner = "spelare 2"
			else
				winner = "till båda, det blev oavgjort!";
			alert("Game over! Grattis " + winner + "!");
			}else{
				alert("Tyvärr, du har inga möjliga drag!");
				noMoves = true;
				changeTurn();
			}

		}
		if(possible.length != 0){
			noMoves = false;
		}
	}
	
	//Går igenom alla brickor av motståndarens färg och skickar vidare till checkValid
	function getValid(color){
		$('#game tr').each(function(){
			if(this.getAttribute('id')!=="players"){
				var cells = $(this).children();
				$(cells).each(function(){
					if($(this).hasClass(color)){ //om brickan har motståndarens färg
						checkValid(color, $(this).attr('id'));
					}
				});
			}
		});
	}
	
	//Kollar vilka celler som är tomma och går att lägga i
	function checkValid(color, id){ //Färgen är motspelarens färg och id är den bricka som ska kollas om den går att vända
		var colorOp = (color == 'white') ? 'black' :'white'; //Den motsatta färgen
		
		//Tar fram rad och kolumn för brickan som ska kollas
		var idClass = "#" + id;
		var thisClass = $(idClass).attr("class"); 
		var classes = thisClass.split(" ");
		var col = Number(classes[0].substring(1, 2));
		var row = Number(classes[1].substring(1, 2));

		//Loopar igenom platserna närmast brickan
		for(c=col-1; c<=col+1; c++){
			for(r=row-1; r<=row+1; r++){
				var sel = ".c" + c + ".r" + r;
				var current = "#" + $(sel).attr("id");
				if($(current).hasClass("blank")){//Om den kollade brickan är blank
					var nextId;
					var nextC = c;
					var nextR = r;
					//Kollar vilket håll som den blanka rutan är åt och hoppar åt motsatt håll
					do{
						if(c==col && r<row){
							nextR++;
						}
						if (c==col && r>row){
							nextR--;
						}
						if(r==row && c<col){
							nextC++;
						}
						if (r==row && c>col){
							nextC--;
						}
						if(c>col && r>row){
							nextR--;
							nextC--;
						}
						if(c<col && r<row){
							nextR++;
							nextC++;
						}
						if(c>col && r<row){
							nextR++;
							nextC--;
						}
						if(c<col && r>row){
							nextR--;
							nextC++;
						}
						var next = ".c" + nextC + ".r" + nextR;
						nextId = $(next).attr("id");
					}while(!($("#" + nextId).hasClass("blank")) && !($("#" + nextId).hasClass(colorOp)) && typeof nextId != 'undefined');
					
					//Lägger till den tomma rutan i listan av möjliga drag om rutan som hoppats till har samma färg som spelares vvars tur det är
					if($("#" + nextId).hasClass(colorOp)){
						possible.push(current);
					}
			}
			}
		}

	}

	//Kollar upp vilka brickor som ska vändas och vänder dem med hjälp av toWhite/toBlack
	function turnBricks(color, id){
		var colorOp = (color == 'white') ? 'black' :'white'; //Den motsatta färgen
		//Tar fram rad och kolumn för brickan som användaren klickat på
		var idClass = "#" + id;
		var thisClass = $(idClass).attr("class"); 
		var classes = thisClass.split(" ");
		var col = Number(classes[0].substring(1, 2));
		var row = Number(classes[1].substring(1, 2));

		//Loopar igenom platserna närmast brickan
		for(c=col-1; c<=col+1; c++){
			for(r=row-1; r<=row+1; r++){
				var sel = ".c" + c + ".r" + r;
				var current = "#" + $(sel).attr("id");
				if($(current).hasClass(color)){//Om den kollade brickan har motståndarens färg
					var toChange = [idClass];
					var nextId;
					var thisId;
					var nextC = c;
					var nextR = r;
					//Kollar vilket håll som den kollade rutan är åt och hoppar åt motsatt håll
					do{
						var thisC = ".c" + nextC + ".r" + nextR;
						thisId = $(thisC).attr("id");
						toChange.push("#" + thisId);
						if(c==col && r<row){
							nextR--;
						}
						if (c==col && r>row){
							nextR++;
						}
						if(r==row && c<col){
							nextC--;
						}
						if (r==row && c>col){
							nextC++;
						}
						if(c>col && r>row){
							nextR++;
							nextC++;
						}
						if(c<col && r<row){
							nextR--;
							nextC--;
						}
						if(c>col && r<row){
							nextR--;
							nextC++;
						}
						if(c<col && r>row){
							nextR++;
							nextC--;
						}
						var next = ".c" + nextC + ".r" + nextR;
						nextId = $(next).attr("id");
					}while(!($("#" + nextId).hasClass("blank")) && !($("#" + nextId).hasClass(colorOp)) && typeof nextId != 'undefined');
					
					//Vänder på brickorna
					if($("#" + nextId).hasClass(colorOp)){
						if(color == "white"){					
							for(var cell in toChange){
								var cellId = toChange[cell];
								toBlack(cellId);
							}
						}else{
							for(var cell in toChange){
								var cellId = toChange[cell];
								toWhite(cellId);
							}				
						}
					}
				}

			}
		}
		whiteTurn = !whiteTurn;
		changeTurn();
	}
	
	//Tar emot klick från användaren och skickar vidare till turnBricks
	$(document).on('click', '.possible', function(){
		if(whiteTurn){
			turnBricks("black", $(this).attr('id'));
		}else{
			turnBricks("white", $(this).attr('id'));
		}
	});
});