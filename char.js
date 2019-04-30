function TelegramGerraCharts(initialData, type, title){

	var stacked = false
	var percentage = false
	var y_scaled = false

	var colorScheme = {
		mainColor: '#fff',
		scrollBackground: '#E2EEF9',
		scrollSelect: '#C0D1E1',
		linesColor: '#182D3B',
		yTextColor: '#8E8E93',
		xTextColor: '#8E8E93',
		yTextAlpha: 1,
		xTextAlpha: 1
	}

	if(type === 'bar' || type === 'area'){
		colorScheme.yTextColor = '#757575'
	}

	var wrapper = document.createElement('div'); 
	wrapper.classList.add('wrapper')

	var chartsContainer = document.getElementById('charts--container')

	

	chartsContainer.appendChild(wrapper)

	var modal = document.createElement('div')
	modal.classList.add('modal--contaniner')

	var modalTopline = document.createElement('div')
	modalTopline.classList.add('modal--topline')

	var modalDate = document.createElement('span')
	modalTopline.appendChild(modalDate)

	var modalContent = document.createElement('div')
	modalContent.classList.add('modal--content')

	var modalValues = document.createElement('div')
	modalValues.classList.add('modal--values')

	modalContent.appendChild(modalValues)

	modal.appendChild(modalTopline)
	modal.appendChild(modalContent)

	var canvas = document.createElement('canvas');
	var labelsContainer = document.createElement('div');
	labelsContainer.classList.add('labelsContainer')

	var topLineContainer = document.createElement('div');
	topLineContainer.classList.add('topline-container')

	var dateRangeLeft = document.createElement('span');
	var dateRangeMiddle = document.createElement('span');
	dateRangeMiddle.innerHTML = '-'
	var dateRangeRight = document.createElement('span');

	var dateRangeContainer = document.createElement('div')
	dateRangeContainer.classList.add('date--range-container')

	

	dateRangeContainer.appendChild(dateRangeLeft)
	dateRangeContainer.appendChild(dateRangeMiddle)
	dateRangeContainer.appendChild(dateRangeRight)

	var chartTitle = document.createElement('h2');
	chartTitle.innerHTML = title

	
	topLineContainer.appendChild(chartTitle)
	topLineContainer.appendChild(dateRangeContainer)

	wrapper.appendChild(topLineContainer)
	wrapper.appendChild(canvas)
	wrapper.appendChild(labelsContainer)

	wrapper.appendChild(modal)


	var ctx = canvas.getContext('2d');
	var dpx = window.devicePixelRatio;

	var FONT = 10 * dpx + 'px Arial'

	var HEIGHT = 0 
	var WIDTH = 0
	var PREVIEW_PT = 30 * dpx
	var PREVIEW_BW = 1 * dpx
	var PREVIEW_CW = 12 * dpx
	var X_TEXT_PT = 15 * dpx
	var Y_LABELS_OFFSET = 48 * dpx
	var Y_LABELS_TP = 20 * dpx
	var Y_LABELS_BP = 6 * dpx
	var Y_LABELS_RP = 30 * dpx
	var CHART_LW = 2 * dpx
	var MAP_LW = 1 * dpx

	var canvasBounds = {}

	var xAxis = null
	var yAxis = null

	var appTime = 0

	var chartHeight = 0 * dpx
	var previewHeight = 40 * dpx
	var yLegendLabelsCount = 1 * dpx

	var pointer = 30 * dpx

	var didUpdate = true

	var mouseY = 0
	var mouseX = 0
	var mouseEvent = 'NONE'

    var MODAL_ML = -50;
    var MODAL_MT = !('ontouchstart' in window) ? 8 : 40;


	setInitialData()

	this.changeTheme = function(theme){
		if(theme === 'light'){
			colorScheme = {
				mainColor: '#fff',
				scrollBackground: '#E2EEF9',
				scrollSelect: '#C0D1E1',
				linesColor: '#182D3B',
				yTextColor: '#8E8E93',
				xTextColor: '#8E8E93',
				yTextAlpha: 1,
				xTextAlpha: 1
			}
			if(type === 'bar' || type === 'area'){
				colorScheme.yTextColor = '#757575'
			}
		}
		else{
			colorScheme = {
				mainColor: '#242F3E',
				scrollBackground: '#304259',
				scrollSelect: '#56626D',
				linesColor: '#FFFFFF',
				yTextColor: '#A3B1C2',
				xTextColor: '#A3B1C2',
				yTextAlpha: 1,
				xTextAlpha: 1
			}
			if(type === 'bar' || type === 'area'){
				colorScheme.yTextColor = '#ECF2F8'
			}
		}

		didUpdate = true
	}


	function onMouseMove(e){

		var newMouseX = (e.clientX - canvasBounds.left) * dpx

		if(newMouseX > 0 && newMouseX < canvasBounds.width * dpx && mouseY > 0 && mouseY < chartHeight + X_TEXT_PT){
			xAxis.setHovered(newMouseX)
		}
		else{
			if(xAxis.hovered){
				xAxis.setHovered(null)
			}
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
			yAxis.setLowAndTop()
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
		if(xAxis.hovered){
			xAxis.setHovered(null)
		}
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
		yLegendLabelsCount = chartHeight / Y_LABELS_OFFSET

		if(yLegendLabelsCount < 1){
			yLegendLabelsCount = 1
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

		if(type === 'area'){
			yAxis = new AreaAxisY()
			yAxis.setInitialData(data.yColumns)
		}
		else if(type === 'bar' && stacked){
			yAxis = new StackedBarAxisY()
			yAxis.setInitialData(data.yColumns)
		}
		else{
			yAxis = new AxisY()
			yAxis.setInitialData(data.yColumns)
		}
	}

	function renderPrewie(){

		ctx.globalAlpha = 0.6

		ctx.fillStyle = colorScheme.scrollBackground

		ctx.fillRect(0, HEIGHT - previewHeight, xAxis.currentLeftPositionPx + PREVIEW_CW, previewHeight);
		ctx.fillRect(xAxis.currentRightPositionPx - PREVIEW_CW, HEIGHT - previewHeight, WIDTH - xAxis.currentRightPositionPx + PREVIEW_CW, previewHeight);

		ctx.fillStyle = colorScheme.scrollSelect

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
		ctx.strokeStyle = colorScheme.mainColor

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

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarStackedChart(labels, yAxis._stacked, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
			}
		}
		else if(type === 'bar'){
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawBarChart(labels, color, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, HEIGHT, yAxis.mapScale, yAxis.mapOffset)
		    }
		}
		else{
			for(var clmn = 0; clmn < yAxis.columns.length; clmn++){

				if(yAxis.columns[clmn].opacity.value === 0){
					continue
				}

				ctx.globalAlpha = yAxis.columns[clmn].opacity.value

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawLineChart(labels, color, clmn, 0, xAxis.labels.length, xAxis.scaleRatio, xAxis.offset, yAxis.mapScale, yAxis.mapOffset, MAP_LW, true)
			}
		}
	}

	function renderMain() {

		if(type === 'area'){
			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color

				drawAreaChart(labels, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset)
			}
		}
		else if(type === 'bar' && stacked === true){

			for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){

				var labels = yAxis.columns[clmn].columns
				var color = yAxis.columns[clmn].color


				drawBarStackedChart(labels, yAxis._stacked, color, clmn, xAxis.currentDiffLeftPositionIndex, xAxis.currentDiffRightPositionIndex, xAxis.currentDiffScale, xAxis.currentDiffOffset, chartHeight, yAxis.scale, yAxis.offset, true)
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

				if(yAxis.columns[clmn].opacity.value === 0){
					continue
				}

				ctx.globalAlpha = yAxis.columns[clmn].opacity.value

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

		appTime = time

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

		if(!yAxis.didFirstRender){
			yAxis.handleLabels()
			yAxis.setTotalLimit(true)
			yAxis.setLowAndTop(true)
			yAxis.setScaleRatio()

			yAxis.didFirstRender = true
		}

		if(didUpdate){	
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			didUpdate = false

			
			yAxis.preRender()

			renderMain()
			yAxis.render()

			ctx.clearRect(0, chartHeight, WIDTH, HEIGHT);


			xAxis.render()

			renderMapPathes()
			renderPrewie()
		}

		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)


	function drawLineChart(labels, color, index, start, end, xScaleRatio, xOffset, yScaleRatio, yOffset, lineWidth, isMap){

		ctx.beginPath()
		ctx.lineJoin = 'bevel';
		ctx.lineCap = 'butt';
		ctx.lineWidth = lineWidth

		var yScale = yScaleRatio
		var yOffset = yOffset

		if(y_scaled){
			var ownScale = yAxis.ownScales[index]
			if(isMap){
				yScale = ownScale.mapScale
				yOffset = ownScale.mapOffset
			}
			else{
				yScale = ownScale.scale
				yOffset = ownScale.offset
			}
		}

		for(var i = start; i < end; i++){
			var x = xAxis.labels[i];
			var y = timeStampToPX(labels[i], yScale, yOffset)

			ctx.lineTo(timeStampToPX(x, xScaleRatio, xOffset), y)
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


	function drawBarStackedChart(labels, yLabels, color, index, start, end, xScaleRatio, xOffset, bottom, yScaleRatio, yOffset, isMain){
		ctx.globalAlpha = 1
		ctx.fillStyle = color

		ctx.beginPath()

		if(isMain && xAxis.hovered){
			ctx.globalAlpha = 0.4
		}
		for(var i = start; i < end; i++){

			var x = xAxis.labels[i]
			var y = yLabels[index][i].value;

			var _v = timeStampToPX(y, yScaleRatio, yOffset)
			var _x = timeStampToPX(x, xScaleRatio, xOffset)

			if(!isMain && _v < HEIGHT - previewHeight){
				_v = HEIGHT - previewHeight
			}

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

		this.didFirstRender = false

		this.columns = []

		this._stacked = []

		this.ownScales = []

		this.labelsAnimated = false

		this.top = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.low = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.scale = 1
		this.offset = 1

		this.totalMaxLimit = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.totalMinLimit = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.mapScale = 1
		this.mapOffset = 1

		this.currentTextLow = 1
		this.currentTextTop = 2

		this.currentTextOpacity = {
			value: 1,
			toValue: 1,
			fromValue: 1,
			duration: 0,
			shouldUpdate: false
		}

		this.prevTextOpacity = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.animatatedTextDelta = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.animatatedCurrentTextDelta = {
			value: 0,
			toValue: 0,
			fromValue: 0,
			duration: 0,
			shouldUpdate: false
		}

		this.mapShouldUpdate = false
		this.chartSholdUpdate = false

		this.toggleColumn = function(e){
			var index = e.target.getAttribute('data-index');

			var current = this.columns[index]

			current.visible = !current.visible

			if(type === 'line'){
				if(current.visible){
					this.columns[index].opacity = { value: this.columns[index].opacity.value, fromValue: this.columns[index].opacity.value, toValue: 1, shouldUpdate: true, duration: 300, animationStart: appTime }
				}
				else{
					this.columns[index].opacity = { value: this.columns[index].opacity.value, fromValue: this.columns[index].opacity.value, toValue: 0, shouldUpdate: true, duration: 300, animationStart: appTime }
				}
			}

			this.handleLabels()
			this.setTotalLimit()
			this.setLowAndTop()
			this.setScaleRatio()

			didUpdate = true
		}

		this.setInitialData = function(columns){

			this.columns = columns

			
			for(var i = 0; i < columns.length; i++){
				var current = columns[i]

				if(columns.length > 1){
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

				var mRow = document.createElement('div')

				var mKey = document.createElement('span')
				mKey.innerHTML = current.name

				var mValue = document.createElement('span')
				mValue.style.color = current.color
				mValue.innerHTML = '1'

				mRow.appendChild(mKey)
				mRow.appendChild(mValue)
				modalValues.appendChild(mRow)

				console.log()

				if(type == 'bar' && stacked && i == columns.length - 1){

					var mRow = document.createElement('div')
					var mKey = document.createElement('span')
					mKey.innerHTML = 'All'

					var mValue = document.createElement('span')
					mValue.style.color = '#000'
					mValue.innerHTML = '1'

					mRow.appendChild(mKey)
					mRow.appendChild(mValue)
					modalValues.appendChild(mRow)
				}


				if(type === 'line'){
					columns[i].opacity = { value: 1 }
				}
				if(y_scaled){
					for(var c = 0; c < this.columns.length; c++){
						var column = this.columns[c];

						var ownOffset = {
							low: { value: 0 },
							top: { value: 1 },
							totalMinLimit: { value: 0 },
							totalMaxLimit: { value: 1 },
							scale: 0,
							offset: 0,
							mapScale: 0,
							mapOffset: 0,
							currentTextLow: 1,
							currentTextTop: 2,
							currentTextOpacity: {
								value: 1,
								toValue: 1,
								fromValue: 1,
								duration: 0,
								shouldUpdate: false
							},
							prevTextOpacity: {
								value: 0,
								toValue: 0,
								fromValue: 0,
								duration: 0,
								shouldUpdate: false
							},
							animatatedTextDelta: {
								value: 0,
								toValue: 0,
								fromValue: 0,
								duration: 0,
								shouldUpdate: false
							},
							animatatedCurrentTextDelta: {
								value: 0,
								toValue: 0,
								fromValue: 0,
								duration: 0,
								shouldUpdate: false
							},
							visible: true,
							color: this.columns[c].color,
							didFirstRender: false
						}


						this.ownScales[c] = ownOffset
					}
				}
			}
		}

		this.setTotalLimit = function(withoutAnimation){

			var columns = this.columns

			if(y_scaled){

				for(var c = 0; c < this.columns.length; c++){
					var column = columns[c];

					ownOffset = this.ownScales[c]
					ownOffset.visible = column.visible

					if(ownOffset.visible === false){
						continue
					}

					var lowTop = this.calculateLowTop(ownOffset, [column], true, true)
					ownOffset = lowTop.obj

					if(!ownOffset.didFirstRender){
						ownOffset = this.setScaleRatio(ownOffset)
					}

					this.ownScales[c] = ownOffset
				}
			}
			else{
				this.calculateLowTop(this, columns, withoutAnimation, true)
			}
		}

		this.setLowAndTop = function(withoutAnimation){

			var columns = this.columns

			var newTopValue = -Infinity
			var newLowValue = Infinity

			if(y_scaled){
				for(var c = 0; c < this.columns.length; c++){

					var column = columns[c];

					ownOffset = this.ownScales[c]
					ownOffset.visible = column.visible

					if(ownOffset.visible === false){
						continue
					}

					var lowTop = this.calculateLowTop(ownOffset, [column], withoutAnimation)
					ownOffset = lowTop.obj

					if(!ownOffset.didFirstRender){
						ownOffset = this.setScaleRatio(ownOffset)
						ownOffset.didFirstRender = true
					}

					ownOffset = this.handleLegendLabelsPosition(lowTop.newTopValue, lowTop.newLowValue, ownOffset)

					this.ownScales[c] = ownOffset
				}
			}
			else{
				var lowTop = this.calculateLowTop(this, this.columns, withoutAnimation)
				this.handleLegendLabelsPosition(lowTop.newTopValue, lowTop.newLowValue, this)
			}
		}

		this.handleLegendLabelsPosition = function(newTopValue, newLowValue, obj){

			var newDiff = newTopValue - newLowValue
			var oldDiff = obj.currentTextTop - obj.currentTextLow

			if(oldDiff !== newDiff || newLowValue !== obj.currentTextLow || newTopValue !== obj.currentTextTop){

				obj.currentTextLow = newLowValue
				obj.currentTextTop = newTopValue

				if(!obj.animatatedTextDelta.shouldUpdate || !obj.animatatedCurrentTextDelta.shouldUpdate){
					if(newDiff > oldDiff){

						obj.animatatedTextDelta = { value: 0, fromValue: 0, toValue: (Y_LABELS_OFFSET + Y_LABELS_BP + Y_LABELS_TP) * 2, shouldUpdate: true, duration: 300, animationStart: appTime }

						obj.animatatedCurrentTextDelta = { value: -Y_LABELS_OFFSET - Y_LABELS_BP, fromValue: -Y_LABELS_OFFSET - Y_LABELS_BP - Y_LABELS_TP, toValue: 0, shouldUpdate: true, duration: 300, animationStart: appTime }

					}
					else{
						obj.animatatedTextDelta = { value: 0, fromValue: 0, toValue: (-Y_LABELS_OFFSET - Y_LABELS_BP - Y_LABELS_TP) * 2, shouldUpdate: true, duration: 300, animationStart: appTime }
						
						obj.animatatedCurrentTextDelta = { value: Y_LABELS_OFFSET + Y_LABELS_BP, fromValue: Y_LABELS_TP + Y_LABELS_OFFSET + Y_LABELS_BP, toValue: 0, shouldUpdate: true, duration: 300, animationStart: appTime }
					}

					obj.prevTextOpacity = { value: colorScheme.yTextAlpha, fromValue: colorScheme.yTextAlpha, toValue: 0, shouldUpdate: true, duration: 200, animationStart: appTime }
					obj.currentTextOpacity = { value: 0, fromValue: 0, toValue: colorScheme.yTextAlpha, shouldUpdate: true, duration: 300, animationStart: appTime }
				}
			}

			return obj
		}

		this.calculateLowTop = function(obj, columns, withoutAnimation, isMap){

			if(!obj) obj = this

			var _low = 'low'
			var _top = 'top'
			var leftLimit = xAxis.currentDiffLeftPositionIndex
			var rightLimit =  xAxis.currentDiffRightPositionIndex

			if(isMap){
				_low = 'totalMinLimit'
				_top = 'totalMaxLimit'
				leftLimit = 0
				rightLimit = xAxis.labels.length
			}

			var newTopValue = -Infinity
			var newLowValue = Infinity

			if(type === 'bar'){
				newLowValue = 0
			}

			for (var c = 0; c < columns.length; c++) {
				if(!columns[c].visible){
					continue
				}

				var column = columns[c].columns;

				for (var i = leftLimit; i < rightLimit; i++) {
					var y = column[i];

					if (y < newLowValue) newLowValue = y;
					if (y > newTopValue) newTopValue = y;
				}
			}
			if(withoutAnimation){
				obj[_low].value = newLowValue
				obj[_top].value = newTopValue
				obj[_low].fromValue = newLowValue
				obj[_top].fromValue = newTopValue
			}
			else{
				if(newLowValue !== obj[_low].value){
					obj[_low] = { value: obj[_low].value, fromValue: obj[_low].value, toValue: newLowValue, shouldUpdate: true, duration: 300, animationStart: appTime }
				}

				if(newTopValue !== obj[_top].value){
					obj[_top] = { value: obj[_top].value, fromValue: obj[_top].value, toValue: newTopValue, shouldUpdate: true, duration: 300, animationStart: appTime }
				}
			}

			return { obj: obj, newLowValue: newLowValue, newTopValue: newTopValue }
		}

		this.setScaleRatio = function(obj){

			if(!obj) obj = this

			var labelsDiff = obj.top.value - obj.low.value
			var mapLabelsDiff = obj.totalMaxLimit.value - obj.totalMinLimit.value

			obj.scale = -(chartHeight - Y_LABELS_TP) / labelsDiff
			obj.offset = chartHeight - obj.low.value * obj.scale

			obj.mapScale = -previewHeight / mapLabelsDiff
			obj.mapOffset = HEIGHT - obj.totalMinLimit.value * obj.mapScale

			return obj
		}

		this.handleLabels = function(){
			return null
		}

		this.preRender = function(){

			if(type === 'line'){
				for(var i = 0; i < this.columns.length; i++){
					if(this.columns[i].opacity.shouldUpdate){
						var a = this.animate(this.columns[i].opacity)
						a === 'didEnd' ? this.columns[i].opacity.shouldUpdate = false : this.columns[i].opacity.value = a

						didUpdate = true
					}
				}
			}

			if(y_scaled){
				var left = this.ownScales[0]
				var right = this.ownScales[1]

				this.animateLowAndTop(left)
				this.animateLowAndTop(right)
				this.animateText(left)
				this.animateText(right)
			}
			else{
				this.animateLowAndTop(this)
				this.animateText(this)
			}
		}

		this.animateLowAndTop = function(obj){
			if(obj.low.shouldUpdate){
				var a = this.animate(obj.low)
				a === 'didEnd' ? obj.low.shouldUpdate = false : obj.low.value = a
				this.setScaleRatio(obj)
				didUpdate = true
			}

			if(obj.top.shouldUpdate){
				var a = this.animate(obj.top)
				a === 'didEnd' ? obj.top.shouldUpdate = false : obj.top.value = a
				this.setScaleRatio(obj)
				didUpdate = true
			}

			if(obj.totalMinLimit.shouldUpdate){
				var a = this.animate(obj.totalMinLimit)
				a === 'didEnd' ? obj.totalMinLimit.shouldUpdate = false : obj.totalMinLimit.value = a
				this.setScaleRatio(obj)
				didUpdate = true
			}

			if(obj.totalMaxLimit.shouldUpdate){
				var a = this.animate(obj.totalMaxLimit)
				a === 'didEnd' ? obj.totalMaxLimit.shouldUpdate = false : obj.totalMaxLimit.value = a
				this.setScaleRatio(obj)
				didUpdate = true
			}
		}


		this.animateText = function(obj){
			if(obj.animatatedTextDelta.shouldUpdate){
				var a = this.animate(obj.animatatedTextDelta)

				if(a === 'didEnd') obj.animatatedTextDelta.shouldUpdate = false
				else obj.animatatedTextDelta.value = a

				didUpdate = true
			}

			if(obj.animatatedCurrentTextDelta.shouldUpdate){
				var a = this.animate(obj.animatatedCurrentTextDelta)

				if(a === 'didEnd') obj.animatatedCurrentTextDelta.shouldUpdate = false
				else obj.animatatedCurrentTextDelta.value = a

				didUpdate = true
			}

			if(obj.currentTextOpacity.shouldUpdate){
				var a = this.animate(obj.currentTextOpacity)

				if(a === 'didEnd') obj.currentTextOpacity.shouldUpdate = false
				else obj.currentTextOpacity.value = a

				didUpdate = true
			}

			if(obj.prevTextOpacity.shouldUpdate){
				var a = this.animate(obj.prevTextOpacity)

				if(a === 'didEnd') obj.prevTextOpacity.shouldUpdate = false
				else obj.prevTextOpacity.value = a

				didUpdate = true
			}
		}

		this.render = function(){

			if(y_scaled){

				var left = this.ownScales[0]
				var right = this.ownScales[1]

				if(left && left.visible){
					this.renderYLegend(left, 'left', true, left.color)
				}
				if(right && right.visible){

					var withLines = false
					if(!left.visible){
						withLines = true
					}

					this.renderYLegend(right, 'right', withLines, right.color)
				}
			}
			else{
				this.renderYLegend(this, 'left', true, colorScheme.yTextColor)
			}	
		}

		this.renderYLegend = function(obj, side, withLines, textColor){

			if(!side){
				side = 'left'
			}

			var oldLabelsDiff = obj.top.fromValue - obj.low.fromValue
			var textDelta = Math.floor(oldLabelsDiff / Math.floor(yLegendLabelsCount));
			var oldTextScale = -(chartHeight - Y_LABELS_TP) / oldLabelsDiff
			var oldTextOffset = chartHeight - obj.low.fromValue * oldTextScale

			var newLabelsDiff = obj.currentTextTop - obj.currentTextLow
			var newTextDelta = Math.floor(newLabelsDiff / Math.floor(yLegendLabelsCount));

			var xOffset = 0

			if(side === 'right'){
				xOffset = WIDTH - 30 * dpx
			}

			for (var i = 0; i < yLegendLabelsCount; i++) {

				var newLabelValue = obj.currentTextLow + newTextDelta * i 
				var newY = obj.low.fromValue + textDelta * i
				var newYInPx = timeStampToPX(newY, oldTextScale, oldTextOffset)
				newYInPx += obj.animatatedCurrentTextDelta.value 
				var newFormatedLabel = this.formatNumber(newLabelValue, true)

				ctx.fillStyle = textColor

				ctx.globalAlpha = obj.currentTextOpacity.value
				ctx.fillText(newFormatedLabel, xOffset, newYInPx - Y_LABELS_BP);

				if(withLines){
					ctx.globalAlpha = ctx.globalAlpha / 10
					this.drawLine(i, newYInPx)
				}


				if(obj.prevTextOpacity.value === 0){
					continue
				}

				var oldLabelValue = obj.low.fromValue + textDelta * i
				var oldY = obj.low.fromValue + textDelta * i
				var oldYInPx = timeStampToPX(oldY, oldTextScale, oldTextOffset)
				oldYInPx += obj.animatatedTextDelta.value
				var oldFormatedLabel = this.formatNumber(oldLabelValue, true)

				ctx.globalAlpha = obj.prevTextOpacity.value
				ctx.fillText(oldFormatedLabel, xOffset, oldYInPx - Y_LABELS_BP);

				if(withLines){
					ctx.globalAlpha = ctx.globalAlpha / 10
					this.drawLine(i, oldYInPx)
				}
			}
		}

		this.animate = function(item){
			if(item.toValue === item.value){
				return 'didEnd'
			}

			var timeDiff = appTime - item.animationStart

			if(item.delay) timeDiff -= item.delay

	        var progress = timeDiff / item.duration;
	        if (progress < 0) progress = 0;
	        if (progress > 1) progress = 1;

	        var ease = -progress * (progress - 2);

	        return item.fromValue + (item.toValue - item.fromValue) * ease;
		}

		this.drawLine = function(index, y){
			ctx.lineWidth = 1
			ctx.strokeStyle = colorScheme.linesColor

			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(WIDTH, y);
			ctx.stroke();
		}

		this.formatNumber = function(n, short) {
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

	function AreaAxisY(){
		AxisY.call(this)

		this.low = 0
		this.top = 100

		this.scale = -(chartHeight - Y_LABELS_TP) / 100
		this.offset = chartHeight

		this.mapScale = -previewHeight / 100
		this.mapOffset = HEIGHT

		this.calculatePercentage = function(labelIndex){

			var columns = this.columns

			var arr2 = []

			var percent = 0

			for(var c = 0; c < columns.length; c++){

				var curColl = columns[c]

				if(curColl.visible){
					percent += curColl.columns[labelIndex]
					arr2.push(curColl.columns[labelIndex])
				}
				else{
					percent += 0
					arr2.push(0)
				}
			}

			return { labels: arr2, percent: percent }			
		}


		this.handleLabels = function(){
			for(var i = 0; i < xAxis.labels.length; i++){

				var calculatatedLabels = this.calculatePercentage(i)

				var percent = calculatatedLabels.percent
				var labels = calculatatedLabels.labels
				var result = []

				for(var v = 0; v < labels.length; v ++){

					var t = labels[v] / percent * 100

					if(this._stacked[i]){
						var prevValue = this._stacked[i][v].value

						if(prevValue !== t){
							if(!this.labelsAnimated) this.labelsAnimated = true
								result[v] = { animationStart: appTime, value: prevValue, toValue: t, fromValue: prevValue, duration: 300, shouldUpdate: true }
						}
						else{
							result[v] = { value: t }
						}
					}
					else{
						result[v] = { value: t }
					}
				}

				this._stacked[i] = result
			}
		}

		this.setLowAndTop = function(){
			return null
		}

		this.setTotalLimit = function(){
			return null
		}

		this.setScaleRatio = function(){
			return null
		}

		this.preRender = function(){
			if(this.labelsAnimated){

				var _i = null

				for(var i = 0; i < this._stacked.length; i++){
					var current = this._stacked[i]

					for(var c = 0; c < current.length; c++){
						var item = current[c]

						if(!item){
							continue
						}

						if(item.shouldUpdate){
							_c = c
							var a = this.animate(item)
							if(a === 'didEnd'){
								this._stacked[i][c].shouldUpdate = false

								if(i + 1 === this._stacked.length && c === _c){
									this.labelsAnimated = false
								}
							}else{
								this._stacked[i][c].value = a
							}
						}	
					}
				}

				didUpdate = true
			}
		}


		this.render = function(){
			var textDelta = Math.floor(100 / Math.floor(yLegendLabelsCount));

			for (var i = 0; i < yLegendLabelsCount; i++) {

				var value = textDelta * i 
				var y = textDelta * i
				var yInPx = timeStampToPX(y, this.scale, this.offset)

				ctx.fillStyle = colorScheme.yTextColor
				ctx.globalAlpha = colorScheme.yTextAlpha
				ctx.fillText(this.formatNumber(value, true), 0, yInPx - Y_LABELS_BP);

				ctx.globalAlpha = ctx.globalAlpha / 10
				this.drawLine(i, yInPx)
			}
		}
	}


	function StackedBarAxisY(){
		AxisY.call(this)

		this.stackedWithoutAnim = []

		this.setTotalLimit = function(){
			var currentMax = -Infinity

			for (var c = 0; c < xAxis.labels.length; c++) {
				for(var z = 0; z < this._stacked.length; z++){
					if(this._stacked[z][c].value > currentMax) currentMax = this._stacked[z][c].value
				}
			}

			if(currentMax !== this.totalMaxLimit.value){
				this.totalMaxLimit.value = currentMax
			}
		}

		this.setLowAndTop = function(withoutAnimation){
			var currentMax = 0
			var nextMax = 0

			for (var c = xAxis.currentDiffLeftPositionIndex; c < xAxis.currentDiffRightPositionIndex; c++) {
				for(var z = 0; z < this._stacked.length; z++){
					if(this._stacked[z][c].value > currentMax) currentMax = this._stacked[z][c].value
					if(this.stackedWithoutAnim[z][c] > nextMax) nextMax = this.stackedWithoutAnim[z][c]
				}
			}

			if(currentMax !== this.top.value){
				if(withoutAnimation){
					this.top.value = currentMax
					this.low.value = 0
					this.low.fromValue = 0
					this.top.fromValue = currentMax
				}
				else{
					this.top = { value: this.top.value, fromValue: this.top.value, toValue: currentMax, shouldUpdate: true, duration: 300, animationStart: appTime }
				}
			}

			this.handleLegendLabelsPosition(nextMax, 0, this)
		}

		this.handleLabels = function(){

			var columns = this.columns

			for (var i = 0; i < xAxis.labels.length; i++) {
				for(var c = columns.length - 1; c >= 0; c--){

					var newValue = 0

					for(var z = c; z >= 0; z--){

						var zCol = columns[z]

						if(!zCol.visible){
							continue
						}
						else{
							newValue += columns[z].columns[i]
						}
					}

					if(!this._stacked[c]) this._stacked[c] = []
					if(!this._stacked[c][i]) this._stacked[c][i] = { value: newValue }

					if(!this.stackedWithoutAnim[c]) this.stackedWithoutAnim[c] = []
					this.stackedWithoutAnim[c][i] = newValue

					var prevValue = this._stacked[c][i].value

					if(newValue !== prevValue){

						if(!this.labelsAnimated) this.labelsAnimated = true
						this._stacked[c][i] = { value: prevValue, toValue: newValue, fromValue: prevValue, duration: 300, shouldUpdate: true, animationStart: appTime }
					}
					else{
						this._stacked[c][i] = { value: newValue }
					}
				}
			}
		}

		this.preRender = function(){ 
			if(this.top.shouldUpdate){
				var a = this.animate(this.top)
				a === 'didEnd' ? this.top.shouldUpdate = false : this.top.value = a
				this.setScaleRatio()
				didUpdate = true
			}

			if(this.labelsAnimated){
				for(var i = 0; i < this._stacked.length; i++){
					var current = this._stacked[i]
					for(var c = 0; c < current.length; c++){
						var item = current[c]

						if(!item) continue
						
						if(item.shouldUpdate){
							_c = c
							var a = this.animate(item)
							if(a === 'didEnd'){
								this._stacked[i][c].shouldUpdate = false
								if(i + 1 === this._stacked.length && c === _c) this.labelsAnimated = false
							}else{
								this._stacked[i][c].value = a
							}
						}	
					}
				}

				this.setTotalLimit()
				this.setLowAndTop(true)
				this.setScaleRatio()

				didUpdate = true
			}

			this.animateText(this)
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

			dateRangeLeft.innerHTML = formatDate(left, 'topline')
			dateRangeRight.innerHTML = formatDate(right, 'topline')

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
						this.textFade = new Animation(colorScheme.xTextAlpha, 0, 300, appTime)
					}
					else{
						this.textFade = new Animation(0, colorScheme.xTextAlpha, 300, appTime)
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

				modal.style.display = 'none'
				didUpdate = true

				return
			}

			this.hoveredInPX = currentInPx
			this.hovered = Math.floor(pxToTs(currentInPx, this.currentDiffScale, this.currentDiffOffset))

			var modalBounds = modal.getBoundingClientRect()
			var modalX = (currentInPx / dpx) + MODAL_ML
			if (modalX < 0) modalX = 0

			if (modalX + modalBounds.width > canvasBounds.width) modalX = canvasBounds.width - modalBounds.width + 10
			modal.style.display = 'block'
			modal.style.left = modalX + 'px';

			var modalY = mouseY / dpx + 20 - modalBounds.height - MODAL_MT
			if(modalY < 0) modalY = mouseY / dpx + 20 + MODAL_MT
			modal.style.top = modalY + 'px'

			didUpdate = true
		}

		this.render = function(){

			if(this.hovered && this.hovered !== null){

				var columns = yAxis.columns

				if(percentage){

					var xIndex = Math.floor((this.hovered - this.leftAbsoluteTsLimit - this.stepTsDiff) / this.stepTsDiff) + 1

					modalDate.innerHTML = formatDate(this.labels[xIndex], 'modal')

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

						modalValues.children[clmn].children[0].innerHTML = Math.round(yAxis._stacked[xIndex][clmn].value) + '% ' + column.name

						modalValues.children[clmn].children[1].innerHTML = column.columns[xIndex]

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

					var xIndex = Math.floor((this.hovered - this.leftAbsoluteTsLimit - this.stepTsDiff) / this.stepTsDiff) + 1

					modalDate.innerHTML = formatDate(this.labels[xIndex], 'modal')

					for(var clmn = yAxis.columns.length - 1; clmn >= 0; clmn--){
						var y = 0
						var x = 0

						var column = columns[clmn]

						modalValues.children[clmn].children[1].innerHTML = column.columns[xIndex]

						if(clmn == yAxis.columns.length - 1){
							modalValues.children[clmn + 1].children[1].innerHTML = yAxis._stacked[clmn][xIndex].value
						}

						if(xIndex === -1){
							xIndex = 0
							x = this.labels[0] * this.currentDiffScale + this.currentDiffOffset
						}
						else{
							x = (this.labels[xIndex] * this.currentDiffScale + this.currentDiffOffset)
						}

						y += yAxis._stacked[clmn][xIndex].value * yAxis.scale + yAxis.offset

						var color = column.color

						var name = column.name

						ctx.beginPath()

						ctx.globalAlpha = 1
						ctx.fillStyle = color

						ctx.moveTo(x, chartHeight)
						ctx.lineTo(x, y)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, y)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, chartHeight)

						ctx.fill()
					}
				}
				else if(type === 'bar'){

					var xIndex = Math.floor((this.hovered - this.leftAbsoluteTsLimit - this.stepTsDiff) / this.stepTsDiff) + 1

					modalDate.innerHTML = formatDate(this.labels[xIndex], 'modal')

					for(var c = 0; c < columns.length; c++){

						var column = columns[c]

						modalValues.children[c].children[1].innerHTML = column.columns[xIndex]

						ctx.globalAlpha = 1
						ctx.beginPath()

						var y = column.columns[xIndex] * yAxis.scale + yAxis.offset
						var x = this.labels[xIndex] * this.currentDiffScale + this.currentDiffOffset


						ctx.moveTo(x, chartHeight)
						ctx.lineTo(x, y)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, y)
						ctx.lineTo(x + this.stepTsDiff * this.currentDiffScale, chartHeight)
			
						ctx.fillStyle = '#558DED'
						ctx.fill()

					}
				}
				else if(y_scaled){

					var xIndex = Math.round((this.hovered - this.leftAbsoluteTsLimit) / this.stepTsDiff)

					modalDate.innerHTML = formatDate(this.labels[xIndex], 'modal')

					ctx.lineWidth = 1 * dpx
					ctx.strokeStyle = '#182D3B'
					ctx.globalAlpha = 0.1
					ctx.beginPath()
					ctx.moveTo(this.hoveredInPX, 0)
					ctx.lineTo(this.hoveredInPX, chartHeight)
					ctx.stroke();

					for(var c = 0; c < columns.length; c++){

						var column = columns[c]

						modalValues.children[c].children[1].innerHTML = column.columns[xIndex]

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

					var xIndex = Math.round((this.hovered - this.leftAbsoluteTsLimit) / this.stepTsDiff)

					modalDate.innerHTML = formatDate(this.labels[xIndex], 'modal')

					ctx.lineWidth = 1
					ctx.strokeStyle = '#182D3B'
					ctx.globalAlpha = 0.1
					ctx.beginPath()
					ctx.moveTo(this.hoveredInPX, 0)
					ctx.lineTo(this.hoveredInPX, chartHeight)
					ctx.stroke();

					for(var c = 0; c < columns.length; c++){
						var column = columns[c]

						modalValues.children[c].children[1].innerHTML = column.columns[xIndex]

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


			ctx.fillStyle = colorScheme.xTextColor

			if(this.textFade){
				var d = this.textFade.animate(appTime)

				if(d === false){
					this.textFade = null
				}

				didUpdate = true
			}

			ctx.globalAlpha = colorScheme.xTextAlpha

			if(this.textFade){
				for (var i = this.labels.length; i >= 0; i -= this.prevTextStep) {

					if(this.prevTextStep < this.textStep){
						ctx.globalAlpha = this.textFade.value
					}
					else{
						ctx.globalAlpha = colorScheme.xTextAlpha
					}

					var item = this.labels[i]

					var leftOffset = timeStampToPX(item, this.currentDiffScale, this.currentDiffOffset)

					ctx.fillText(formatDate(this.labels[i], 'xLegend'), leftOffset, chartHeight + X_TEXT_PT);
				}
			}

			for (var i = this.labels.length; i >= 0; i -= this.textStep) {

				if(this.prevTextStep > this.textStep && this.textFade){
					ctx.globalAlpha = this.textFade.value
				}
				else{
					ctx.globalAlpha = colorScheme.xTextAlpha
				}

				var item = this.labels[i]

				var leftOffset = timeStampToPX(item, this.currentDiffScale, this.currentDiffOffset)

				ctx.fillText(formatDate(this.labels[i], 'xLegend'), leftOffset, chartHeight + X_TEXT_PT);
			}
		}

		var SHORT_MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var FULL_MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		function formatDate(time, type) {
			var date = new Date(time);
			var month = ''

			if(type === 'topline') month = FULL_MN[date.getMonth()]
			else month = SHORT_MN[date.getMonth()]
			
			var s = month + ' ' + date.getDate();

			if(type === 'topline'){
				s = date.getDate() + ' ' + month + ' ' + date.getFullYear()
			}
			else if(type === 'xLegend'){
				s = s
			}
			else if(type === 'modal'){
				s = DAY_NAMES[date.getDay()] + ', ' + s;
			}

			return s
		}

	}

	function Animation(value, toValue, duration, startTime){

		this.value = value
		this.duration = duration
		this.start = startTime || 0
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