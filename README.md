# leaflet-windarrow
draw grid wind arrows Layer for Leaflet

[China] 基于leaflet-velocity格式数据，绘制风场箭头图层


## what's leaflet-velocity

`leaflet-velocity` is here : https://github.com/onaci/leaflet-velocity

---

A plugin for Leaflet (v1.0.3, and v0.7.7) to create a canvas visualisation layer for direction and intensity of arbitrary velocities (e.g. wind, ocean current).

![Screenshot](https://github.com/pysoer/leaflet-windarrow/blob/master/windarrow.png?raw=true)


## example
```html
<script type="text/javascript" src="leaflet-windarrow.js"></script>
```

```javascript
<script>
var windArrowLayer = L.windArrow({ arrowSize: 20, lineWidth: 2, lineColor: "red" }).addTo(map);
fetch("velocityWind.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        windArrowLayer.setWindData(data);
    });

</script>
```
