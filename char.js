function TelegramGerraCharts(initialData, type){

	var stacked = false
	var percentage = false
	var y_scaled = false

	var wrapper = document.createElement('div'); 

	wrapper.classList.add('wrapper')

	document.body.appendChild(wrapper)

	var canvas = document.createElement('canvas');
	var labelsContainer = document.createElement('div');
	labelsContainer.classList.add('labelsContainer')

	wrapper.appendChild(canvas)
	wrapper.appendChild(labelsContainer)

	var ctx = canvas.getContext('2d');
	var dpx = window.devicePixelRatio;

	var FONT = 10 * dpx + 'px Arial'

	var HEIGHT = 0 
	var WIDTH = 0
	var PREVIEW_PT = 30 * dpx
	var PREVIEW_BW = 1 * dpx
	var PREVIEW_CW = 12 * dpx
	var X_TEXT_PT = 15 * dpx
	var Y_LABELS_OFFSET = 80 * dpx
	var Y_LABELS_BP = 6 * dpx
	var Y_LABELS_RP = 30 * dpx
	var CHART_LW = 2 * dpx
	var MAP_LW = 1 * dpx

	var canvasBounds = {}

	var xAxis = null
	var yAxis = null

	var appTime = 0

	var chartHeight = 1 * dpx
	var previewHeight = 40 * dpx
	var yLablesOffset = 1 * dpx

	var pointer = 30 * dpx

	var didUpdate = true

	var mouseY = 0
	var mouseX = 0
	var mouseEvent = 'NONE'

    var MODAL_ML = -25;
    var MODAL_MT = !('ontouchstart' in window) ? 8 : 40;


	setInitialData()

	function onMouseMove(e){

		var newMouseX = (e.clientX - canvasBounds.left) * dpx

		if(mouseX > 0 && mouseX < canvasBounds.width && mouseY > 0 && mouseY < canvasBounds.height - previewHeight){
			xAxis.setHovered(mouseX)
		}
		else{
			xAxis.setHovered(null)
			didUpdate = true
		}

		if(mouseEvent === 'DRAG'){
			xAxis.onDrag(xAxis.currentLeftPositionPx - mouseX + newMouseX)
		}

		if(mouseEvent === 'ZOOM_LEFT'){
			xAxis.zoomLeft(newMouseX)
		}

		if(mouseEvent === 'ZOOM_RIGHT'){
			xAxis.zoomRight(newMouseX)
		}

		if(mouseEvent !== 'NONE'){
			yAxis.updateLimits(xAxis)
			didUpdate = true
		}

		mouseX = (e.clientX - canvasBounds.left) * dpx
		mouseY = (e.clientY - canvasBounds.top) * dpx
	}

	function onMouseDown(e){

        newMouseX = mouseX = (e.clientX - canvasBounds.left) * dpx;
        newMouseY = mouseY = (e.clientY - canvasBounds.top) * dpx;

		if(mouseY > HEIGHT - previewHeight && mouseY < HEIGHT){
			if(mouseX > xAxis.currentLeftPositionPx + pointer / 2 && mouseX < xAxis.currentRightPositionPx - pointer / 2) {
				mouseEvent = 'DRAG';
			}
			if(mouseX > xAxis.currentLeftPositionPx - pointer  && mouseX < xAxis.currentLeftPositionPx + pointer / 2) {
				mouseEvent = 'ZOOM_LEFT';
			}
			if(mouseX > xAxis.currentRightPositionPx - pointer / 2  && mouseX < xAxis.currentRightPositionPx + pointer) {
				mouseEvent = 'ZOOM_RIGHT';
			}
		}
	}

	function onMouseUp(){
		mouseEvent = 'NONE'
	}

	document.addEventListener('mousemove', onMouseMove)

	document.addEventListener('mousedown', onMouseDown)


	document.addEventListener('touchstart', function(e){
		onMouseDown(e.touches[0])
	})
    
    document.addEventListener('touchmove', function(e){ 
    	return onMouseMove(e.touches[0]) 
    })

    document.addEventListener('mouseup', onMouseUp)

    document.addEventListener('touchend', onMouseUp)
    document.addEventListener('touchcancel', onMouseUp)

	function setInitialData(){

		var c = canvas.getBoundingClientRect()

		WIDTH = c.width * dpx
		HEIGHT = c.height * dpx

		canvasBounds = c

		canvas.setAttribute('width', WIDTH);
		canvas.setAttribute('height', HEIGHT);

		chartHeight = HEIGHT - previewHeight - PREVIEW_PT
		yLablesOffset = chartHeight / Y_LABELS_OFFSET

		if(yLablesOffset < 1){
			yLablesOffset = 1
		}

		var names = initialData.names
		var types = initialData.types
		var colors = initialData.colors
		
		stacked = initialData.stacked
		percentage = initialData.percentage
		y_scaled = initialData.y_scaled

		var data = {
			yColumns: [],
			axisX: []
		}

		for(var i = 0; i < initialData.columns.length; i++){

			var columns = initialData.columns[i]

			var name = names[columns[0]]
			var type = types[columns[0]]
			var color = colors[columns[0]]

			var colls = []

			for(var q = 0; q < columns.length; q++){
				if(q !== 0){
					colls.push(columns[q])
				}
			}

			if(type === 'x'){
				data.axisX = colls
			}
			else{
				data.yColumns.push({ visible: true, name: name, type: type, columns: colls, color: color })
			}
		}

		xAxis = new AxisX()

		xAxis.setDifference(data.axisX)

		yAxis = new AxisY()

		yAxis.setInitialData(data.yColumns)
	}

	function renderPrewie(){

		ctx.globalAlpha = 0.6

		ctx.fillStyle = '#E2EEF9'

		ctx.fillRect(0, HEIGHT - previewHeight, xAxis.currentLeftPositionPx + PREVIEW_CW, previewHeight);
		ctx.fillRect(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight, WIDTH - xAxis.currentRightPositionPx + PREVIEW_CW, previewHeight);

		ctx.fillStyle = '#C0D1E1'

		ctx.globalAlpha = 1

		ctx.fillRect(xAxis.currentLeftPositionPx + PREVIEW_CW - 4 * dpx, HEIGHT - previewHeight, xAxis.currentRightPositionPx - xAxis.currentLeftPositionPx - PREVIEW_CW * 1.5, PREVIEW_BW);
		ctx.fillRect(xAxis.currentLeftPositionPx + PREVIEW_CW - 4 * dpx, HEIGHT - PREVIEW_BW, xAxis.currentRightPositionPx - xAxis.currentLeftPositionPx - PREVIEW_CW * 1.5, PREVIEW_BW);


		ctx.beginPath();

		ctx.moveTo(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight)
		ctx.lineTo(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT)


		ctx.arcTo(xAxis.currentRightPositionPx, HEIGHT, xAxis.currentRightPositionPx, HEIGHT - previewHeight, 10 * dpx)
		ctx.arcTo(xAxis.currentRightPositionPx, HEIGHT - previewHeight, xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight, 10 * dpx)

		ctx.closePath()
		ctx.fill()



		ctx.beginPath();


		ctx.moveTo(xAxis.currentLeftPositionPx + PREVIEW_CW, HEIGHT - previewHeight)
		ctx.lineTo(xAxis.currentLeftPositionPx + PREVIEW_CW, HEIGHT)

		ctx.arcTo(xAxis.currentLeftPositionPx, HEIGHT, xAxis.currentLeftPositionPx, HEIGHT - previewHeight, 10 * dpx)

		ctx.arcTo(xAxis.currentLeftPositionPx, HEIGHT - previewHeight, xAxis.currentLeftPositionPx + PREVIEW_CW, HEIGHT - previewHeight, 10 * dpx)

		ctx.closePath()

		ctx.fill()

		ctx.fillStyle = '#fff'

		ctx.fillRect(xAxis.currentLeftPositionPx + PREVIEW_CW / 2.2, HEIGHT - previewHeight + previewHeight / 4, 2, previewHeight / 2)

		ctx.fillRect(xAxis.currentRightPositionPx - PREVIEW_CW / 1.8, HEIGHT - previewHeight + previewHeight / 4, 2, previewHeight / 2)

		ctx.beginPath();

		ctx.globalAlpha = 1
		ctx.strokeStyle = '#fff'

		ctx.lineWidth = 4 * dpx

		var BD_FIX = 2 * dpx
		var BD_FIX_R = 12 * dpx

		ctx.moveTo(20 * dpx, HEIGHT - previewHeight - BD_FIX)

		ctx.arcTo(WIDTH + BD_FIX, HEIGHT - previewHeight - BD_FIX, WIDTH + BD_FIX, HEIGHT + BD_FIX, BD_FIX_R);

		ctx.arcTo(WIDTH + BD_FIX, HEIGHT + BD_FIX, -BD_FIX, HEIGHT + BD_FIX, BD_FIX_R);

		ctx.arcTo(-BD_FIX, HEIGHT + BD_FIX, -BD_FIX, HEIGHT - previewHeight - BD_FIX, BD_FIX_R);

		ctx.arcTo(-BD_FIX, HEIGHT - previewHeight - BD_FIX, WIDTH, HEIGHT - previewHeight - BD_FIX, BD_FIX_R);
		ctx.closePath()

		ctx.stroke()

	}

	function renderMapPathes(){
		if(type === 'area'){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawAreaChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
			}
		}
		else if(type === 'bar' && stacked === true){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				if(!yAxis.columns[clmn].visible){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarStackedChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
			}
		}
		else if(type === 'bar'){
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){

				if(!yAxis.columns[clmn].visible){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarChart(labels, color, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
		    }
		}
		else{
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){

				if(!yAxis.columns[clmn].visible){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawLineChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, yAxis.mapScale, yAxis.mapOffset, MAP_LW, true)
			}
		}
	}

	function renderMain() {

		if(type === 'area'){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				if(!yAxis.columns[clmn].visible){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawAreaChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset)
			}
		}
		else if(type === 'bar' && stacked === true){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				if(!yAxis.columns[clmn].visible){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarStackedChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset, true)
			}
		}
		else if(type === 'bar'){
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){

				if(!yAxis.columns[clmn].visible){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarChart(labels, color, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset, true)
		    }
		}
		else{
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){

				if(yAxis.columns[clmn].visible === false){
					continue
				}

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawLineChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, yAxis.scale, yAxis.offset, CHART_LW, false)
			}
		}
	}

	function render(time){

		var c = canvas.getBoundingClientRect();

		canvasBounds = c

		ctx.font = FONT

		if(WIDTH !== c.width * dpx || HEIGHT !== c.height * dpx){

			WIDTH = c.width * dpx
			HEIGHT = c.height * dpx

			chartHeight = HEIGHT - previewHeight - PREVIEW_PT

			canvas.setAttribute('width', WIDTH)
			canvas.setAttribute('height', HEIGHT)
				
			ctx.font = FONT

			xAxis.resize()

			didUpdate = true
		}

		appTime = time

		if(didUpdate){	
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			didUpdate = false

			renderMapPathes()
			renderPrewie()
			renderMain()
			xAxis.render()
			yAxis.render()
			
		}

		requestAnimationFrame(render)
	}

	render()


	function drawLineChart(labels, color, index, start, end, xScaleRatio, xOffset, yScaleRatio, yOffset, lineWidth, isMap){

		ctx.beginPath()
		ctx.lineJoin = 'bevel';
		ctx.lineCap = 'butt';
		ctx.lineWidth = lineWidth
		ctx.globalAlpha = 1

		var yScale = yScaleRatio
		var yOffset = yOffset

		if(y_scaled){
			var ownScale = yAxis.ownScales[index]
			if(isMap){
				yScale = ownScale.previewScale
				yOffset = ownScale.previewOffset
			}
			else{
				yScale = ownScale.scale
				yOffset = ownScale.offset
			}

		}

		for(var i = start; i < end; i++){
			var x = xAxis.labels[i];
			var y = labels[i];

			ctx.lineTo(timeStampToPX(x, xScaleRatio, xOffset), timeStampToPX(y, yScale, yOffset))
		}

		ctx.strokeStyle = color

		ctx.stroke()
	}

	function drawBarChart(labels, color, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset, isMain){

		ctx.globalAlpha = 1
		ctx.beginPath()

		if(isMain && xAxis.hovered){
			ctx.globalAlpha = 0.4
		}

		for(var i = start; i < end; i++){

			var x = xAxis.labels[i];
			var y = labels[i];

			var _x = timeStampToPX(x, xScaleRatio, xOffset)
			var _v = timeStampToPX(y, yScaleRatio, yOffset)

			if(i === start){
				ctx.moveTo(0, bottom)
				ctx.lineTo(0, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
			else if(i === end - 1){
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, bottom)
			}
			else{
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
		}

		ctx.fillStyle = color
		ctx.fill()
	}


	function drawBarStackedChart(labels, color, index, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset, isMain){
		ctx.globalAlpha = 1
		ctx.fillStyle = color

		ctx.beginPath()

		if(isMain && xAxis.hovered){
			ctx.globalAlpha = 0.4
		}
		for(var i = start; i < end; i++){

			var x = xAxis.labels[i]
			var y = 0;

			for(var z = index; 0 <= z; z--){
				y += yAxis._stacked[i][z]
			}

			var _v = timeStampToPX(y, yScaleRatio, yOffset)
			var _x = timeStampToPX(x, xScaleRatio, xOffset)

			if(i === start){
				ctx.moveTo(0, bottom)
				ctx.lineTo(0, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
			else if(i === end - 1){
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, bottom)
			}
			else{
				ctx.lineTo(_x, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
		}

		ctx.fill()
	}

	function drawAreaChart(labels, color, index, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset){

		ctx.globalAlpha = 1
		ctx.fillStyle = color

		ctx.beginPath()

		for(var i = start; i < end; i++){

			var x = xAxis.labels[i]
			var y = 0

			for(var z = index; 0 <= z; z--){
				y += yAxis._stacked[i][z].value
			}	


			var _v = timeStampToPX(y, yScaleRatio, yOffset)
			var _x = timeStampToPX(x, xScaleRatio, xOffset)

			if(i === start){
				ctx.moveTo(0, bottom)
				ctx.lineTo(0, _v)
			}
			else if(i === end - 1){
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, bottom)
			}
			else{
				ctx.lineTo(_x + xAxis.stepTsDiff * xScaleRatio, _v)
			}
		}

		ctx.fill()
	}

	function AxisY(){

		this.columns = []
		this.hiddenColumns = []

		this._stacked = []
		this.ownScales = []

		this.low = 0
		this.top = 1
		this.itemsDiff = 1

		this.scale = 1
		this.offset = 1
		this.totalMaxLimit = 0
		this.totalMinLimit = 0

		this.mapScale = 1
		this.mapOffset = 1
		this.mapDiff = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 300
		}

		this.holdedDiff = 1
		this.textOpacity = 1
		this.prevTextOpacity = 0

		this.holdedNextDiff = 1

		this.toggleColumn = function(e){
			var index = e.target.getAttribute('data-index');

			var current = this.columns[index]

			current.visible = !current.visible

			this.setTotalLimit()
			this.updateLimits()


			didUpdate = true
		}

		this.setInitialData = function(columns){

			this.columns = columns

			if(columns.length > 1){
				for(var i = 0; i < columns.length; i++){
					var current = columns[i]

					var inputWrap = document.createElement('div')
					inputWrap.classList.add('input-wrapp')
					

					labelsContainer.appendChild(inputWrap)

					var mask = document.createElement('div')
					mask.classList.add('input-mask')
					mask.style.backgroundColor = current.color

					var text = document.createElement('span')

					var tick = document.createElement('i')

					text.innerHTML = current.name

					mask.appendChild(tick)
					mask.appendChild(text)

				 	var input = document.createElement('input')
				 	input.type = "checkbox"
				 	input.setAttribute('data-index', i);
				 	input.checked = true
					input.addEventListener('click', this.toggleColumn.bind(this))

				 	inputWrap.appendChild(input)
				 	inputWrap.appendChild(mask)

				}
			}

			this.setTotalLimit()
			this.updateLimits()
		}

		this.setTotalLimit = function(){
			
			var columns = this.columns

			if(percentage){
				this.totalMaxLimit = 100
				this.totalMinLimit = 0

				for(var i = 0; i < 365; i++){

					var qr = 0

					var temp = []
					var _temp = []

					for(var c = 0; c < columns.length; c++){

						var curColl = columns[c]

						if(curColl.visible){
							qr += curColl.columns[i]
							temp.push(curColl.columns[i])
						}
						else{
							qr += 0
							temp.push(0)
						}
					}

					for(var v = 0; v < temp.length; v ++){

						var t = temp[v] / qr * 100

						if(this._stacked[i]){
							var prevValue = this._stacked[i][v].value

							if(prevValue !== t){
								_temp[v] = { value: prevValue, toValue: t, fromValue: prevValue, duration: 300, needAnimate: true }
							}
							else{
								_temp[v] = { value: t }
							}
						}
						else{
							_temp[v] = { value: t }
						}


					}

					this._stacked[i] = _temp
				}
			}
			else if(stacked){

				this.totalMaxLimit = 0

				for(var i = 0; i < 365; i++){

					var temp = []

					var top = 0 

					for(var c = 0; c < columns.length; c++){

						var curColl = columns[c]

						if(curColl.visible){
							top += curColl.columns[i]
							temp.push(curColl.columns[i])
						}
						else{
							top += 0
							temp.push(0)
						}
					}

					if(top > this.totalMaxLimit){
						this.totalMaxLimit = top
					}

					this._stacked[i] = temp
				}
			}
			else{
				var visibleItems = []

				for(var i = 0; i < columns.length; i++){
					var column = columns[i]

					if(column.visible === false){
						continue
					}

					visibleItems = visibleItems.concat(column.columns)
				}

				this.totalMaxLimit = Math.max.apply(null, visibleItems)
				this.totalMinLimit = Math.min.apply(null, visibleItems)
			}

		}

		this.updateLimits = function(){

			this.low = 0
			this.top = -Infinity

			if(type === 'line'){
				this.low = Infinity
			}

			if(percentage){
				this.top = 100
			}
			else if(stacked){
				for (var c = xAxis.currentDiffLeftPositionIndex; c < xAxis.currentDiffRightPositionIndex; c++) {
					var currentMax = 0

					for(var z = 0; z < this._stacked[c].length; z++){
						currentMax += this._stacked[c][z]
					}

					if (currentMax > this.top){
						this.top = currentMax
					}
				}
			}
			else if(y_scaled){
				for(var c = 0; c < this.columns.length; c++){

					var column = this.columns[c].columns;

					var ownOffset = {
						low: Infinity,
						top: -Infinity,
						scale: 0,
						offset: 0,
						previewScale: Infinity,
						previewOffset: -Infinity,
						itemsDiff: 1,
						prevTextOpacity: 0,
						textOpacity: 1,
						holdedDiff: 1,
						holdedNextDiff: 1,
						visible: this.columns[c].visible
					}

					if(this.ownScales[c]){
						ownOffset = this.ownScales[c]
						ownOffset.low = Infinity
						ownOffset.top = -Infinity
						ownOffset.visible = this.columns[c].visible
					}

					for (var i = xAxis.currentDiffLeftPositionIndex; i < xAxis.currentDiffRightPositionIndex; i++) {
						var y = column[i];

						if(y < ownOffset.low){
							ownOffset.low = y
						}

						if(y > ownOffset.top){
							ownOffset.top = y
						} 
					}

					var itemsDiff = ownOffset.top - ownOffset.low

					if(itemsDiff !== ownOffset.itemsDiff){
						updateDiff(ownOffset, ownOffset.top, ownOffset.low, itemsDiff)
					}

					ownOffset.fontColor = this.columns[c].color

					var previewDiff = Math.max.apply(null, column) - Math.min.apply(null, column)
					ownOffset.previewScale = -previewHeight / previewDiff
					ownOffset.previewOffset = HEIGHT - Math.min.apply(null, column) * ownOffset.previewScale


					this.ownScales[c] = ownOffset
				}
			}
			else{

				for (var c = 0; c < this.columns.length; c++) {
					if(!this.columns[c].visible){
						continue
					}

					var column = this.columns[c].columns;

					for (var i = xAxis.currentDiffLeftPositionIndex; i < xAxis.currentDiffRightPositionIndex; i++) {
						var y = column[i];

						if (y < this.low) this.low = y;
						if (y > this.top) this.top = y;
					}
				}
			}

			var itemsDiff = this.top - this.low

			if(!this.itemsDiff){
				this.itemsDiff = itemsDiff
			}

			if(itemsDiff < 0){
				itemsDiff = 1
			}

			if(itemsDiff !== this.itemsDiff){
				updateDiff(this, this.top, this.low, itemsDiff)
			}

			var mapDiff = this.totalMaxLimit - this.totalMinLimit

			if(mapDiff !== this.mapDiff.value){
				this.mapDiff = { value: this.mapDiff.value, fromValue: this.mapDiff.value, toValue: mapDiff, needAnimate: true, duration: 300 }
			}
			
		}

		function updateDiff(obj, top, low, diff){
			var animation = new Animation(obj.itemsDiff, diff, 300, appTime)

			obj.textFadeOut = new Animation(1, 0, 400, appTime)
			obj.textFadeIn = new Animation(0, 1, 400, appTime)

			if(!obj.textAnimation){

				obj.holdedNextDiff = diff
				obj.holdedLow = obj.low
				obj.holdedDiff = obj.itemsDiff

				if(diff > obj.itemsDiff){
					obj.textAnimation = new Animation(0, 60 * dpx, 300, appTime)
				}else{
					obj.textAnimation = new Animation(0, -60 * dpx, 300, appTime)
				}
			}

			obj.animation = animation
		}

		this.render = function(){
			ctx.fillStyle = "#8E8E93"

			for(var i = 0; i < this._stacked.length; i++){
				var current = this._stacked[i]

				for(var c = 0; c < current.length; c++){
					var item = current[c]

					if(item.needAnimate){
						if(!item.animationStart){
							item.animationStart = appTime
						}
						var q = this.animate(item)
						if(q === false){
							this._stacked[i][c].needAnimate = false
						}else{
							this._stacked[i][c].value = q
						}

						didUpdate = true
					}	
				}
			}

			if(this.mapDiff.needAnimate){
				if(!this.mapDiff.animationStart){
					this.mapDiff.animationStart = appTime
				}
				var q = this.animate(this.mapDiff)
				if(q === false){
					this.mapDiff.needAnimate = false
				}else{
					this.mapDiff.value = q
				}

				didUpdate = true
			}

			if(this.textAnimation){
				var d = this.textAnimation.animate(appTime)

				if(d === false){
					this.textAnimation = null
				}

				didUpdate = true
			}

			if(this.textFadeOut){
				var d = this.textFadeOut.animate(appTime)

				if(d === false){
					this.textFadeOut = null
				}
				else{
					this.prevTextOpacity = d
				}

				didUpdate = true
			}

			if(this.textFadeIn){
				var d = this.textFadeIn.animate(appTime)

				if(d === false){
					this.textFadeIn = null
				}
				else{
					this.textOpacity = d
				}
				didUpdate = true
			}

			if(this.animation){

				var d = this.animation.animate(appTime)

				if(d === false){
					this.animation = null
				}else{
					this.itemsDiff = d
				}
				
				didUpdate = true
			}


			if(y_scaled){
				if(this.ownScales){
					for(var i = 0; i < this.ownScales.length; i++){
						var current = this.ownScales[i]

						if(current.textAnimation){
							var d = current.textAnimation.animate(appTime)

							if(d === false){
								current.textAnimation = null
							}

							didUpdate = true
						}

						if(current.textFadeOut){
							var d = current.textFadeOut.animate(appTime)

							if(d === false){
								current.textFadeOut = null
							}
							else{
								current.prevTextOpacity = d
							}

							didUpdate = true
						}

						if(current.textFadeIn){
							var d = current.textFadeIn.animate(appTime)

							if(d === false){
								current.textFadeIn = null
							}
							else{
								current.textOpacity = d
							}
							didUpdate = true
						}

						if(current.animation){

							var d = current.animation.animate(appTime)

							if(d === false){
								current.animation = null
							}else{
								current.itemsDiff = d
							}

							didUpdate = true
						}

						current.scale = -(chartHeight - PREVIEW_PT) / current.itemsDiff;
						current.offset = chartHeight - current.low * current.scale;

					}
				}
			}
			
			this.mapScale = -previewHeight / this.mapDiff.value
			this.mapOffset = HEIGHT - this.totalMinLimit * this.mapScale


			this.scale = -(chartHeight - PREVIEW_PT) / this.itemsDiff;
			this.offset = chartHeight - this.low * this.scale;

			var textDelta = Math.floor(this.holdedDiff / Math.ceil(yLablesOffset));
			var textScale = -(chartHeight - PREVIEW_PT) / this.holdedDiff;
			var textOffset = chartHeight - this.holdedLow * textScale;

			var nextTextDelta =  Math.floor(this.holdedNextDiff / Math.ceil(yLablesOffset));
			var nextTextScale = -(chartHeight - PREVIEW_PT) / this.holdedNextDiff; 
			var nextTextOffset = chartHeight - this.low * nextTextScale;

			if(y_scaled){

				var left = this.ownScales[0]
				var right = this.ownScales[1]

				if(left && left.visible){

					var textDelta = Math.floor(left.holdedDiff / Math.ceil(yLablesOffset));
					var textScale = -(chartHeight - PREVIEW_PT) / left.holdedDiff;
					var textOffset = chartHeight - left.holdedLow * textScale;

					var nextTextDelta =  Math.floor(left.holdedNextDiff / Math.ceil(yLablesOffset));
					var nextTextScale = -(chartHeight - PREVIEW_PT) / left.holdedNextDiff; 
					var nextTextOffset = chartHeight - left.low * nextTextScale;


					for (var i = 0; i < yLablesOffset + 1; i++) {

						var val = left.low + nextTextDelta * i
						var newY = timeStampToPX(val, nextTextScale, nextTextOffset);

						if(val === 0){
							ctx.fillText(formatNumber(val, true), 0, 0 - Y_LABELS_BP);
							continue
						}

						ctx.globalAlpha = left.textOpacity / 10
						drawLine(i, newY)

						ctx.fillStyle = left.fontColor
						ctx.globalAlpha = left.textOpacity
						ctx.fillText(formatNumber(val, true), 0, newY - Y_LABELS_BP);

						if(left.prevTextOpacity === 0){
							continue
						}

						var value = left.holdedLow + textDelta * i
						var y = timeStampToPX(value, textScale, textOffset);

						if(left.textAnimation){
							y += left.textAnimation.value
							if(y > chartHeight){
								continue
							}
						}


						ctx.globalAlpha = left.prevTextOpacity / 10
						drawLine(i, y)

						ctx.globalAlpha = left.prevTextOpacity
						ctx.fillText(formatNumber(value, true), 0, y - Y_LABELS_BP);
					}
				}
				if(right && right.visible){

					for (var i = 0; i < yLablesOffset + 1; i++) {

						var textDelta = Math.floor(right.holdedDiff / Math.ceil(yLablesOffset));
						var textScale = -(chartHeight - PREVIEW_PT) / right.holdedDiff;
						var textOffset = chartHeight - right.holdedLow * textScale;

						var nextTextDelta =  Math.floor(right.holdedNextDiff / Math.ceil(yLablesOffset));
						var nextTextScale = -(chartHeight - PREVIEW_PT) / right.holdedNextDiff; 
						var nextTextOffset = chartHeight - right.low * nextTextScale;

						var val = right.low + nextTextDelta * i
						var newY = timeStampToPX(val, nextTextScale, nextTextOffset);

						ctx.fillStyle = right.fontColor

						ctx.globalAlpha = right.textOpacity
						ctx.fillText(formatNumber(val, true), WIDTH - Y_LABELS_RP, newY - Y_LABELS_BP);

						var value = right.holdedLow + textDelta * i
						var y = timeStampToPX(value, textScale, textOffset);

						if(right.textAnimation){
							y += right.textAnimation.value
							if(y > chartHeight){
								continue
							}
						}

						ctx.globalAlpha = right.prevTextOpacity
						ctx.fillText(formatNumber(value, true), WIDTH - Y_LABELS_RP, y - Y_LABELS_BP);

					}
				}
			}

			else{

				for (var i = 0; i < yLablesOffset + 1; i++) {

					var val = this.low + nextTextDelta * i
					var newY = timeStampToPX(val, nextTextScale, nextTextOffset);

					if(val === 0){
						ctx.fillText(formatNumber(val, true), 0, newY - Y_LABELS_BP);
						continue
					}

					ctx.globalAlpha = this.textOpacity / 10
					drawLine(i, newY)

					ctx.globalAlpha = this.textOpacity
					ctx.fillText(formatNumber(val, true), 0, newY - Y_LABELS_BP);

					if(this.prevTextOpacity === 0){
						continue
					}

					var value = this.holdedLow + textDelta * i
					var y = timeStampToPX(value, textScale, textOffset);


					if(this.textAnimation){
						y += this.textAnimation.value
						if(y > chartHeight){
							continue
						}
					}

					ctx.globalAlpha = this.prevTextOpacity / 10
					drawLine(i, y)

					ctx.globalAlpha = this.prevTextOpacity
					ctx.fillText(formatNumber(value, true), 0, y - Y_LABELS_BP);
				}
			}
		}

		this.animate = function(item){

			if(item.toValue === item.value){
				return false
			}

	        var progress = (appTime - item.animationStart) / item.duration;
	        if (progress < 0) progress = 0;
	        if (progress > 1) progress = 1;

	        var ease = -progress * (progress - 2);

	        return item.fromValue + (item.toValue - item.fromValue) * ease;
		}

		function drawLine(index, y){
			ctx.lineWidth = 1
			ctx.strokeStyle = '#182D3B'

			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(WIDTH, y);
			ctx.stroke();
		}

		function formatNumber(n, short) {
			var abs = Math.abs(n);
			if (abs > 1000000000 && short) return (n / 1000000000).toFixed(2) + 'B';
			if (abs > 1000000 && short) return (n / 1000000).toFixed(2) + 'M';
			if (abs > 1000 && short) return (n / 1000).toFixed(1) + 'K';

			if (abs > 1) {
				var s = abs.toFixed(0);
				var formatted = n < 0 ? '-' : '';
				for (var i = 0; i < s.length; i++) {
					formatted += s.charAt(i);
					if ((s.length - 1 - i) % 3 === 0) formatted += ' ';
				}
				return formatted;
			}

			return n.toString()
		}
	}

	function AxisX(){

		this.labels = []
		this.fontColor = "#8E8E93"
		this.opacity = 0

		this.textWidth = 34 * dpx
		this.textSidesOffset = 1

		this.textStep = 1
		this.prevTextStep = 1

		this.textFadeOut = null
		this.textFadeIn = null

		this.leftAbsoluteTsLimit = 1
		this.rightAbsoluteTsLimit = Infinity
		this.tsAbsoluteDifference = Infinity
		this.stepTsDiff = 1
		this.scaleRatio = 1
		this.offset = 1

		this.currentLeftPositionPx = 1
		this.currentRightPositionPx = Infinity

		this.currentDiff = 1
		this.currentDiffScale = 1
		this.currentDiffOffset = 1
		this.currentDiffLeftPositionIndex = 1
		this.currentDiffRightPositionIndex = Infinity

		this.hovered = null
		this.hoveredInPX = null

		this.setCurrentDiff = function(left, right){

			left = Math.ceil(pxToTs(left, this.scaleRatio, this.offset))
			right = Math.floor(pxToTs(right, this.scaleRatio, this.offset))

			this.currentDiff = right - left

			if(type === 'line'){
				this.currentDiffScale = WIDTH / this.currentDiff
			}
			else{
				this.currentDiffScale = WIDTH / (this.currentDiff + this.stepTsDiff)
			}

			var textStep = Math.round(this.currentDiff / this.stepTsDiff / this.textSidesOffset)

			var step = 1

			while (step <= textStep){
				step *= 2
			}

			textStep = step

			if(textStep !== this.textStep){

				if(this.textStep !== 1){
					if(textStep > this.textStep){
						this.textFade = new Animation(1, 0, 300, appTime)
					}
					else{
						this.textFade = new Animation(0, 1, 300, appTime)
						
					}
				}

				this.prevTextStep = this.textStep
				this.textStep = textStep

			}
			
			this.currentDiffOffset = -left * this.currentDiffScale
			this.currentDiffLeftPositionIndex = Math.floor((left - this.leftAbsoluteTsLimit) / this.stepTsDiff)

			this.currentDiffRightPositionIndex = Math.ceil((right - this.leftAbsoluteTsLimit) / this.stepTsDiff) + 1

		}

		this.setScaleRatio = function(){

			this.scaleRatio = WIDTH / this.tsAbsoluteDifference

			this.setOffset()
		}

		this.onDrag = function(newLeftPositionInPx){

			var currentRange = this.currentRightPositionPx - this.currentLeftPositionPx

			if(newLeftPositionInPx <= 0){
				this.currentLeftPositionPx = 0
				this.currentRightPositionPx = currentRange
			}
			else if(newLeftPositionInPx + currentRange >= WIDTH){
				this.currentLeftPositionPx = WIDTH - currentRange
				this.currentRightPositionPx = WIDTH
			}
			else{
				this.currentLeftPositionPx = newLeftPositionInPx
				this.currentRightPositionPx = newLeftPositionInPx + currentRange
			}


			this.setCurrentDiff(this.currentLeftPositionPx, this.currentRightPositionPx)
		}

		this.zoomLeft = function(newLeftPositionInPx){
			if(newLeftPositionInPx <= 0){
				this.currentLeftPositionPx = 0	
			}
			else if(newLeftPositionInPx > this.currentRightPositionPx - 40){
				this.currentLeftPositionPx = this.currentRightPositionPx - 40
			}
			else{
				this.currentLeftPositionPx = newLeftPositionInPx
			}

			this.setCurrentDiff(this.currentLeftPositionPx, this.currentRightPositionPx)
		}

		this.zoomRight = function(newLeftPositionInPx){
			if(newLeftPositionInPx >= WIDTH){
				this.currentRightPositionPx = WIDTH
			}
			else if(newLeftPositionInPx < this.currentLeftPositionPx + 40){
				this.currentRightPositionPx = this.currentLeftPositionPx + 40
			}
			else{
				this.currentRightPositionPx = newLeftPositionInPx
			}

			this.setCurrentDiff(this.currentLeftPositionPx, this.currentRightPositionPx)
		}

		this.setCurrentPositionsWithTs = function(left, right){

			var __left = timeStampToPX(left, this.scaleRatio, this.offset)
			var __right = timeStampToPX(right, this.scaleRatio, this.offset)

			this.currentLeftPositionPx = __left

			this.currentRightPositionPx = __right

			return { left: __left, right: __right }
		}

		this.setOffset = function(scale){
			this.offset = -this.leftAbsoluteTsLimit * this.scaleRatio
		}

		this.resize = function(){
			this.setDifference()
		}

		this.setDifference = function(labels){

			labels = labels || this.labels

			this.labels = labels
			
			this.textSidesOffset = WIDTH / (this.textWidth * 2)
			this.leftAbsoluteTsLimit = labels[0]
			this.rightAbsoluteTsLimit = labels[labels.length - 1]
			this.tsAbsoluteDifference = labels[labels.length - 1] - labels[0]
			this.stepTsDiff = labels[1] - labels[0]

			this.setScaleRatio()

			var currentPosition = this.setCurrentPositionsWithTs(this.rightAbsoluteTsLimit - this.tsAbsoluteDifference / 3, this.rightAbsoluteTsLimit)

			this.setCurrentDiff(currentPosition.left, currentPosition.right)
		}

		this.setHovered = function(currentInPx){

			if(!currentInPx){
				this.hovered = null
				this.hoveredInPX = null

				return
			}

			this.hoveredInPX = currentInPx
			this.hovered = Math.floor(pxToTs(currentInPx, this.currentDiffScale, this.currentDiffOffset))


			didUpdate = true
		}

		this.render = function(){


			if(this.hovered && this.hovered !== null){

				var columns = yAxis.columns

				var xIndex = Math.round((this.hovered - this.leftAbsoluteTsLimit) / this.stepTsDiff)

				if(percentage){

					xIndex = Math.round((this.hovered - this.leftAbsoluteTsLimit - this.stepTsDiff) / this.stepTsDiff) 

					ctx.lineWidth = 1
					ctx.strokeStyle = '#182D3B'
					ctx.globalAlpha = 0.1
					ctx.beginPath()
					ctx.moveTo(this.hoveredInPX, 0)
					ctx.lineTo(this.hoveredInPX, chartHeight)
					ctx.stroke();

					for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){
						var y = 0
						var x = 0

						var column = columns[clmn]

						if(xIndex === -1){
							for(var z = clmn; 0 <= z; z--){
								y += yAxis._stacked[0][z].value
							}

							x = this.labels[0] * this.currentDiffScale + this.currentDiffOffset
						}
						else{
							for(var z = clmn; 0 <= z; z--){
								y += yAxis._stacked[xIndex][z].value
							}

							x = (this.labels[xIndex] * this.currentDiffScale + this.currentDiffOffset) + this.stepTsDiff * this.currentDiffScale
						}

						var color = column.color
						var name = column.name
					}
				}
				else if(type === 'bar' && stacked){

					xIndex = Math.round((this.hovered - this.leftAbsoluteTsLimit - this.stepTsDiff) / this.stepTsDiff) 

					for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){
						var y = 0
						var x = 0

						var column = columns[clmn]

						if(xIndex === -1){
							for(var z = clmn; 0 <= z; z--){
								y += yAxis._stacked[0][z]
							}

							x = this.labels[0] * this.currentDiffScale + this.currentDiffOffset
						}
						else{
							for(var z = clmn; 0 <= z; z--){
								y += yAxis._stacked[xIndex][z]
							}

							x = (this.labels[xIndex] * this.currentDiffScale + this.currentDiffOffset)
						}

						var color = column.color

						var name = column.name

						ctx.beginPath()

						ctx.globalAlpha = 1
						ctx.fillStyle = color

						ctx.moveTo(x, chartHeight)
						ctx.lineTo(x, y * yAxis.scale + yAxis.offset)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, y * yAxis.scale + yAxis.offset)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, chartHeight)

						ctx.fill()
					}
				}
				else if(type === 'bar'){

					xIndex = Math.round((this.hovered - this.leftAbsoluteTsLimit - this.stepTsDiff) / this.stepTsDiff) 

					for(var c = 0; c < columns.length; c++){

						var column = columns[c]

						ctx.globalAlpha = 1
						ctx.beginPath()

						var y = column.columns[xIndex] * yAxis.scale + yAxis.offset
						var x = this.labels[xIndex] * this.currentDiffScale + this.currentDiffOffset


						ctx.moveTo(x, chartHeight)
						ctx.lineTo(x, y)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, y)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, chartHeight)
			
						ctx.fillStyle = color
						ctx.fill()

					}
				}
				else if(y_scaled){
					ctx.lineWidth = 1 * dpx
					ctx.strokeStyle = '#182D3B'
					ctx.globalAlpha = 0.1
					ctx.beginPath()
					ctx.moveTo(this.hoveredInPX, 0)
					ctx.lineTo(this.hoveredInPX, chartHeight)
					ctx.stroke();

					for(var c = 0; c < columns.length; c++){

						var column = columns[c]

						if(column.visible === false){
							continue
						}

						var yOffset = yAxis.ownScales[c].offset
						var yScale = yAxis.ownScales[c].scale

						var color = column.color
						var name = column.name
						var y = column.columns[xIndex];
						var x = this.labels[xIndex]

						ctx.globalAlpha = 1
						ctx.strokeStyle = color
						ctx.fillStyle = '#FFF';
						ctx.lineWidth = 2;
						ctx.beginPath();
						ctx.arc(x * this.currentDiffScale + this.currentDiffOffset, y * yScale + yOffset, 4 * dpx, 0, Math.PI * 2);
						ctx.stroke();
						ctx.fill();

					}
				}
				else{


					ctx.lineWidth = 1
					ctx.strokeStyle = '#182D3B'
					ctx.globalAlpha = 0.1
					ctx.beginPath()
					ctx.moveTo(this.hoveredInPX, 0)
					ctx.lineTo(this.hoveredInPX, chartHeight)
					ctx.stroke();

					for(var c = 0; c < columns.length; c++){
						var column = columns[c]
						if(column.visible === false){
							continue
						}
						var color = column.color
						var name = column.name
						var y = column.columns[xIndex];
						var x = this.labels[xIndex]

						ctx.globalAlpha = 1
						ctx.strokeStyle = color
						ctx.fillStyle = '#FFF';
						ctx.lineWidth = 2;
						ctx.beginPath();
						ctx.arc(x * this.currentDiffScale + this.currentDiffOffset, y * yAxis.scale + yAxis.offset, 4 * dpx, 0, Math.PI * 2);
						ctx.stroke();
						ctx.fill();

					}
				}
			}


			ctx.fillStyle = "#8E8E93"
			ctx.globalAlpha = 1

			if(this.textFade){
				var d = this.textFade.animate(appTime)

				if(d === false){
					this.textFade = null
				}

				didUpdate = true
			}

			if(this.textFade){
				for (var i = this.labels.length; i >= 0; i -= this.prevTextStep) {

					if(this.prevTextStep < this.textStep){
						ctx.globalAlpha = this.textFade.value
					}
					else{
						ctx.globalAlpha = 1
					}

					var item = this.labels[i]

					var leftOffset = timeStampToPX(item, this.currentDiffScale, this.currentDiffOffset)

					ctx.fillText(formatDate(this.labels[i], true), leftOffset, chartHeight + X_TEXT_PT);
				}
			}

			for (var i = this.labels.length; i >= 0; i -= this.textStep) {

				if(this.prevTextStep > this.textStep && this.textFade){
					ctx.globalAlpha = this.textFade.value
				}
				else{
					ctx.globalAlpha = 1
				}

				var item = this.labels[i]

				var leftOffset = timeStampToPX(item, this.currentDiffScale, this.currentDiffOffset)

				ctx.fillText(formatDate(this.labels[i], true), leftOffset, chartHeight + X_TEXT_PT);
			}
		}

		var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		function formatDate(time, short) {
			var date = new Date(time);
			var s = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate();
			if (short) return s;
			return DAY_NAMES[date.getDay()] + ', ' + s;
		}

	}

	function Animation(value, toValue, duration, startTime){

		this.value = value
		this.duration = duration
		this.start = startTime
		this.fromValue = value
		this.toValue = toValue

		this.animate = function(appTime){

			if(this.toValue === this.value){
				return false
			}

	        var progress = (appTime - this.start) / this.duration;
	        if (progress < 0) progress = 0;
	        if (progress > 1) progress = 1;

	        var ease = -progress * (progress - 2);

	        this.value = this.fromValue + (this.toValue - this.fromValue) * ease;

	        return this.value
		}

		this.update = function(toValue){
			this.toValue = toValue
		}
	}

	function timeStampToPX(ts, scale, offset) {
		return ts * scale + offset
	}

	function pxToTs(px, scale, offset) {
		return (px - offset) / scale
	}
}
