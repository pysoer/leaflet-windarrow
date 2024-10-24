"use strict";

/*
 Generic  Canvas Layer for leaflet.
 copyright 2024 , pysoer.cn , license MIT.
 originally created.

 */


L.WindArrow = L.Layer.extend({
	options: {
		arrowSize: 20,
		lineColor: "#000",
		lineWidth: 2,
	},

	initialize: function (options, data) {
		this.options = options;
		L.Util.setOptions(this, options);
		this.windData = data;
	},
	onAdd: function () {
		if (!this._canvas) {
			this._initCanvas();
		}
		this._map._panes.overlayPane.appendChild(this._canvas);
		this._map.on("moveend", this._reset, this);
		this._map.on("resize", this._reset, this);
		this._map.on("zoomanim", this._animateZoom, this);

		this._reset();
		this._drawWind();
	},
	onRemove: function () {
		L.DomUtil.remove(this._canvas);
		this._map.off("moveend", this._reset, this);
		this._map.off("resize", this._reset, this);
		this._map.off("zoomanim", this._animateZoom, this);
	},
	_initCanvas: function () {
		this._canvas = L.DomUtil.create("canvas", "");

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._canvas, "leaflet-zoom-animated");
		} else {
			L.DomUtil.addClass(this._canvas, "leaflet-zoom-hide");
		}
	},
	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
			offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());
		L.DomUtil.setTransform(this._canvas, offset, scale);
	},

	_reset: function () {
		var canvas = this._canvas,
			size = this._map.getSize(),
			lt = this._map.containerPointToLayerPoint([0, 0]);

		L.DomUtil.setPosition(canvas, lt);

		canvas.width = size.x;
		canvas.height = size.y;
		canvas.style.width = size.x + "px";
		canvas.style.height = size.y + "px";
		this._drawWind();
	},

	UV2Wind: function (u, v) {
		let windSpeed = Math.sqrt(u * u + v * v);
		let theta = Math.atan2(u, v);
		let windDirection = (theta * (180 / Math.PI) + 360) % 360;
		return { windSpeed, windDirection };
	},

	_drawWind: function () {
		var ctx = this._canvas.getContext("2d");
		ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		if (!this.windData) {
			return;
		}
		var mm = this._map;
		var bounds = mm.getBounds();
		let arrowSize = this.options.arrowSize;
		let lineWidth = this.options.lineWidth;
		let lineColor = this.options.lineColor;
		let data = this.windData;
		let header = data[0]["header"];
		let lat1 = header["la1"];
		let lon1 = header["lo1"];
		let dx = header["dx"];
		let dy = header["dy"];
		let lat2 = header["la2"];
		let lon2 = header["lo2"];
		let nx = header["nx"];
		let ny = header["ny"];
		let U = data[0]["data"];
		let V = data[1]["data"];
		let winds = [];
		let row_index = 0;
		let col_index = 0;
		for (let i = 0; i < U.length; i++) {
			row_index = Math.floor(i / nx);
			col_index = i % nx;
			let u0 = U[i];
			let v0 = V[i];
			let wind = this.UV2Wind(u0, v0);
			let lat = lat1 - row_index * dy;
			let lng = lon1 + col_index * dx;
			winds.push({ lat: lat, lng: lng, wd: wind.windDirection, ws: wind.windSpeed });
		}
		winds = reshapeArray(winds, nx, ny);
		let _pointList = [];
		for (var i = 0; i < winds.length; i += 1) {
			for (var j = 0; j < winds[i].length; j += 1) {
				let wind = winds[i][j];
				var latLng = L.latLng(wind.lat, wind.lng);
				if (!bounds.contains(latLng)) {
					continue;
				}
				var projected = mm.latLngToContainerPoint(latLng);
				var xProjected = projected.x;
				var yProjected = projected.y;
				let boundsBox = L.bounds([xProjected - arrowSize, yProjected - arrowSize], [xProjected + arrowSize, yProjected + arrowSize]);
				_pointList.forEach(function (box, index) {
					if (box.intersects(boundsBox)) {
						return;
					}
				});
				_pointList.push(boundsBox);
				ctx.save();
				ctx.translate(xProjected, yProjected);
				ctx.rotate(((wind.wd - 90) * Math.PI) / 180);
				ctx.beginPath();
				ctx.moveTo(-arrowSize / 2, 0);
				ctx.lineTo(+arrowSize / 2, 0);
				ctx.moveTo(arrowSize * 0.25, -arrowSize * 0.25);
				ctx.lineTo(+arrowSize / 2, 0);
				ctx.lineTo(arrowSize * 0.25, arrowSize * 0.25);
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = lineColor;
				ctx.stroke();
				ctx.restore();
			}
		}
	},

	setWindData: function (data) {
		this.windData = data;
		this._drawWind();
	},
});

L.windArrow = function (options,windData) {
	return new L.WindArrow(options,windData);
};
