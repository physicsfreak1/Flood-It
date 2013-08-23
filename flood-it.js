var colorList = ['#ff0000', '#00ff00', '#0000ff', '#fff800', '#880099', '#ffaa00', '#f800ff', '#00fff8'];

var colorPickers;
var numColors;
var size;

AUI().use(
	'aui-form-validator',
	function(A) {
		new A.FormValidator(
			{
				boundingBox: '#myForm',
				rules: {
					colors: {
						range: [3, 8],
						required: true
					},
					size: {
						range: [6, 26],
						required: true
					}
				}
			}
		);
	}
);

AUI().ready(
	'aui-color-picker',
	'aui-overlay-mask',
	function(A) {
		var overlayMask = new A.OverlayMask().render();

		var container = A.Node.create('<div id="container"><div>');

		var cancel = A.Node.create('<button>Cancel</button>');
		var colorPickerDiv = A.Node.create('<div id="colorPickers"></div>');
		var save = A.Node.create('<button>Save</button>');

		colorPickerDiv.appendTo(container);
		save.appendTo(container);
		cancel.appendTo(container);

		cancel.on(
			'click',
			function(event) {
				if (similarColors('buttons')) {
					alert('Please select colors that are less similar.');
				}
				else {
					overlayMask.hide();

					container.remove();
				}
			}
		);

		save.on(
			'click', 
			function(event) {
				if (similarColors('pickers')) {
					alert('Please select colors that are less similar.');
				}
				else {
					overlayMask.hide();

					container.remove();

					A.all('#main td').each(
						function() {
							for (var i = 0; i < numColors; i++) {
								var backgroundColor = this.getStyle('background-color');

								if (colorToHex(backgroundColor) === colorList[i]) {
									var currentRGB = colorPickers[i].get('rgb');

									this.setStyle('background-color', currentRGB.hex);
								}
							}
						}
					);

					for (var i = 0; i < numColors; i++) {
						var color = colorPickers[i].get('rgb').hex;

						var index = (i + 1).toString();

						var colorButton = A.one('#input td:nth-child(' + index + ')');

						if (colorButton) {
							colorButton.setStyle('background-color', color);
						}

						colorList[i] = color;
					}
				}
			}
		);

		createMask = function(elem) {
			overlayMask.set('target', elem);
			overlayMask.show();

			var game = A.one('#game');

			if (game) {
				container.appendTo(game);
			}

			var position = (16 * (size + 3)).toString();

			container.setStyle('top', '-' + position + 'px');

			colorPickers = new Array(numColors);

			colorPickerDiv.empty();

			for (i = 0; i < numColors; i++) {
				var htmlContent = '<div class="colorPicker" id="colorPicker' + i.toString() + '"></div>';

				var colorPickerNode = A.Node.create(htmlContent);

				colorPickerNode.setStyle('background-color', colorList[i]);
				colorPickerNode.appendTo(colorPickerDiv);

				colorPickers[i] = new A.ColorPicker().render(colorPickerNode);

				colorPickers[i].set('hex', colorList[i].slice(1));
				colorPickers[i].set('index', i);

				colorPickers[i].after(
					'colorChange',
					function(event) {
						var j = this.get('index');

						var color = colorPickers[j].get('rgb').hex;

						var colorPicker = A.one('#colorPicker' + j.toString());

						if (colorPicker) {
							colorPicker.setStyle('background-color', color);
						}
					}
				);
			}
		};
	}
);

function similarColors(type) {
	var similar = false;

	var chosenColors = new Array(numColors);

	for (var i = 0; i < numColors; i++) {
		if (type === 'pickers') {
			chosenColors[i] = colorPickers[i].get('rgb');
		}
	}

	for (var i = 0; i < numColors; i++) {
		for (var j = 0; j < i; j++) {
			if (type === 'pickers') {
				var diffB = Math.abs(chosenColors[i].b - chosenColors[j].b);
				var diffG = Math.abs(chosenColors[i].g - chosenColors[j].g);
				var diffR = Math.abs(chosenColors[i].r - chosenColors[j].r);
			}
			else if (type === 'buttons') {
				var diffB = Math.abs(parseInt(colorList[i].substring(5, 7), 16) - parseInt(colorList[j].substring(5, 7), 16));
				var diffG = Math.abs(parseInt(colorList[i].substring(3, 5), 16) - parseInt(colorList[j].substring(3, 5), 16));
				var diffR = Math.abs(parseInt(colorList[i].substring(1, 3), 16) - parseInt(colorList[j].substring(1, 3), 16));
			}

			if (diffR + diffG + diffB < 50) {
				similar = true;
			}
		}
	}

	return similar;
}

function newGame() {
	AUI().use(
		'aui-base',
		function(A) {
			var colorsInput = A.one('#colors');
			var sizeInput = A.one('#size');

			if (colorsInput && sizeInput) {
				numColors = parseInt(colorsInput.get('value'));
				size = parseInt(sizeInput.get('value'));

				createBoard(numColors, size);
			}

			for (i = 1; i <= size; i++) {
				for (j = 1; j <= size; j++) {
					num = Math.floor(Math.random()*numColors);

					getTableCell(i, j).setStyle('background-color', colorList[num]);
				}
			}

			moves = Math.floor(0.3 * size * numColors);

			var movesCount = A.one('#moves');

			if (movesCount) {
				movesCount.html(moves.toString());
			}

			if (similarColors('buttons')) {
				createMask('#game');
			}
		}
	);
}

function createBoard(numColors, size) {
	AUI().use(
		'aui-node',
		function(A) {
			var game = A.one('#game');

			if (game) {
				game.empty();
			}

			var gameInfo = A.Node.create('<div id="gameInfo"><p id="movesCount">moves remaining: <span id="moves"><span></p><button id="rules" type="button" onclick="rules()">Rules</button><button id="colorChange" onclick="createMask(\'#game\')" type="button">Change Colors</button><table id="input"><tr id="color-buttons"></tr></table></div>');

			gameInfo.appendTo(game);

			var colorButton = new Array(numColors);

			var colorButtons = A.one('#color-buttons');

			for (var i = 0; i < numColors; i++) {
				var index = i.toString();

				colorButton[i] = A.Node.create('<td id="colorButton' + index + '" onclick="flood(' + index + ')"></td>');

				colorButton[i].setStyle('background-color', colorList[i]);

				if (colorButtons) {
					colorButton[i].appendTo(colorButtons);
				}
			}

			var mainContent = A.Node.create('<div id="main"><table><tbody></tbody></table></div>');

			mainContent.appendTo(game);

			var table = A.one('#main tbody');

			for (var i = 0; i < size; i++) {
				tdString = '';
				for (var j = 0; j < size; j++) {
					tdString += '<td></td>';
				}

				var tableRow = A.Node.create('<tr>'+tdString+'</tr>');

				if (table) {
					A.Node.create('<tr>'+tdString+'</tr>').appendTo(table);
				}
			}
		}
	);
}

function rules() {
	alert('Click a colored circle to change the color of the upper-left square and all connected squares of the same color. The object of the game is to fill the entire board with a single color.');
}

function flood(i) {
	var firstCell = getTableCell(1, 1);

	var firstColor = colorToHex(firstCell.getStyle('background-color'));

	if (moves > 0 && !win() && colorList[i] !== firstColor) {
		expand(colorList[i], firstColor, 1, 1);

		moves--;

		var movesCount = AUI().one('#moves');

		if (movesCount) {
			movesCount.html(moves.toString());
		}

		if (win()) {
			alert('You win!');
		}
		else if (moves === 0) {
			alert('You lose!');
		}
	}
}

function expand(newColor, oldColor, row, col) {
	var currentCell = getTableCell(row, col);

	var currentColor = colorToHex(currentCell.getStyle('background-color'));

	if (row >= 1 && col >= 1 && row <= size && col <= size && currentColor === oldColor) {
		currentCell.setStyle('background-color', newColor);

		expand(newColor, oldColor, row+1, col);
		expand(newColor, oldColor, row-1, col);
		expand(newColor, oldColor, row, col+1);
		expand(newColor, oldColor, row, col-1);
	}
}

function win() {
	var firstColor = getTableCell(1, 1).getStyle('background-color');
	var win = true;

	AUI().all('#main td').each(
		function () {
			if (this.getStyle('background-color') !== firstColor) {
				win = false;
			}
		}
	);

	return win;
}

function getTableCell(i, j) {
	var selector = '#main tr:nth-child(' + i.toString() + ') td:nth-child(' + j.toString() + ')';

	return AUI().one(selector);
}

function colorToHex(color) {
	if (color[0] === '#') {
		return color;
	}

	var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

	var blue = parseInt(digits[4]);
	var green = parseInt(digits[3]);
	var red = parseInt(digits[2]);

	var hexNum = 16777216 | blue | (green << 8) | (red << 16);

	return '#' + hexNum.toString(16).slice(1);
}