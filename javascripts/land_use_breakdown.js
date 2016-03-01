function horBarGraph(selector,selectionKeys) {

    var landUseOrder = [
        "S110",
        "S131",
        "S120",
        "S130",
        "S135",
        "S410",
        "S200",
        "S230",
        "S235",
        "S400",
        "A500",
        "S300",
        "R100",
        "S420",
        "W400",
        "U100",
        "M300",
        "S600",
        "S650",
        "F100",
        "S700",
        "S500"
    ];
    var landUseKeys=landUseOrder.filter(function(key){return !selectionKeys || selectionKeys.indexOf(key)!=-1});

    var desMap = {
        "R100": "Recreation, Open Space, Natural Areas",
        "M300": "Industrial – Extractive",
        "S120": "Residential – Rural",
        "S130": "Residential - Low-rise Apartment",
        "A500": "Agriculture",
        "S100": "Residential - Mobile Home Park",
        "S235": "Mixed Use - High-rise Apartment",
        "S131": "Residential – Townhouse",
        "S700": "Rail, Rapid Transit, Transpo., Util. and Commu.",
        "S230": "Mixed Use - Low-rise Apartment",
        "S600": "Port Metro Vancouver",
        "S420": "Cemetery",
        "S400": "Institutional",
        "U100": "Undeveloped and Unclassified",
        "S410": "Res - Instit and Non-Market Housing",
        "R200": "Lakes, Large Rivers and Other Water",
        "S500": "Road Right-of-Way",
        "S300": "Industrial",
        "S200": "Commercial",
        "W400": "Protected Watershed",
        "S110": "Residential - Single Detached & Duplex",
        "S135": "Residential - High-rise Apartment",
        "S650": "Airport/Airstrip",
        "F100": "Harvesting and Research"
    };

    var colorMap = {
        "R100": "#006400",
        "M300": "#8B4513",
        "S120": "#FFDAB9",
        "S130": "#fffd0a",
        "A500": "#A0522D",
        "S100": "#FFA07A",
        "S235": "#800000",
        "S131": "#b4d600",
        "S700": "#4d0000",
        "S230": "#DC143C",
        "S600": "#4d004d",
        "S420": "#008000",
        "S400": "#00BFFF",
        "U100": "#505050",
        "S410": "#40E0D0",
        "R200": "#0000CD",
        "S500": "#b29966",//"#f5f5dc",
        "S300": "#DEB887",
        "S200": "#FF0000",
        "W400": "#00008B",
        "S110": "#d8ff0a",
        "S135": "#FFA500",
        "S650": "#670067",
        "F100": "#FF1493"
    };

    var muniMap = {
        "GVA": "Metro Vancouver",
        "VA": "City of Vancouver",
        "SU": "City of Surrey",
        "BU": "City of Burnaby",
        "RI": "City of Richmond",
        "CNV": "City of North Vancouver",
        "DNV": "District of North Vancouver",
        "WV": "District of West Vancouver",
        "QT": "City of Coquitlam",
        "BI": "Bowen Island Municipality",
        "AN": "Village of Anmore",
        "MR": "City of Maple Ridge",
        "EA": "Electoral Area A - Barnston Island",
        "LB": "Village of Lions Bay",
        "LC": "City of Langley",
        "PO": "City of Port Coquitlam",
        "PT": "City of Pitt Meadows",
        "WR": "City of White Rock",
        "NW": "City of New Westminster",
        "PM": "City of Port Moody",
        "LT": "Township of Langley",
        "DT": "Corporation of Delta",
        "BE": "Village of Belcarra"
    };


    var divWidth = $(selector).width();

    var margin = {top: 20, right: 10, bottom: 20, left: 200},
        width = divWidth - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1, .3);

    var x = d3.scale.linear()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(8, "%");

    x.domain([0, 0.5]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var selectWrapper = d3.select(selector).append("div").text("Select Municipality: ");
    var select = selectWrapper
        .append('select')
        .attr('class', 'muni-select');


    var svg = d3.select(selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("overflow", "visible")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xa = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
    var ya = svg.append("g")
        .attr("class", "y axis");

    xa.call(xAxis);

    var legend = d3.select(selector).append("div")
        .attr("class", "legend2");
    var link = legend.append("div").attr("class", "link").style("float", "left");
    var info = legend.append("div").attr("class", "info").style("float", "right");

    function tooltip(d) {
        info.text(d ? d3.format('.1%')(d.value) : '');
    }


    d3.json("/data/land_use_breakdown.json", function (error, json) {
        function updateData(key) {
            var muniData = json[key];
            //if (key == 'GVA')
            //    link.html('<a href="https://mountainmath.ca/land_use/map" target="_blank">View ' + muniMap[key] + ' on map</a>');
            //else
            //    link.html('<a href="https://mountainmath.ca/land_use/map/mu_filter=[%22' + key + '%22]" target="_blank">View ' + muniMap[key] + ' on map</a>');
            var total=0;
            landUseKeys.forEach(function(key){total +=  muniData[key]});
            var data = landUseKeys.map(function (key) {
                return {key: key, name: desMap[key], value: muniData[key] / total}
            });
            data = data.filter(function (hash) {
                return hash[key] != 'Total'
            });
            //x.domain([0, d3.max(data, function(d) { return d.value; })]);
            y.domain(data.map(function (d) {
                return d.name;
            }));
            ya.call(yAxis);
//    xa.call(xAxis);

            var barData = svg.selectAll(".bar.lu")
                .data(data);
            barData.exit().remove();

            barData.enter().append("rect")
                .attr("class", "bar lu")
                .attr("x", 0)
                .attr("y", function (d) {
                    return y(d.name);
                })
                .attr("height", y.rangeBand())
                .attr("width", 0)
                .on('click', tooltip)
                .on('mouseover', tooltip)
                .on('mouseout', function (d) {
                    tooltip()
                })
                .on('touch', tooltip)
                .style("fill", function (d) {
                    return colorMap[d.key]
                });

            barData
                .transition(1000)
                .attr("width", function (d) {
                    return x(d.value);
                });
        }

        var options = select
            .selectAll('option')
            .data(Object.keys(muniMap));

        var defaultOptionName = 'VA';

        function onchange() {
            var si = select.property('selectedIndex'),
                s = options.filter(function (d, i) {
                    return i === si
                }),
                data = s.datum();
            updateData(data);
        }

        select.on('change', onchange);

        options.enter()
            .append('option')
            .text(function (d) {
                return muniMap[d];
            })
            .property("selected", function (d) {
                return d === defaultOptionName;
            });
        options.exit().remove();

        updateData(defaultOptionName);
    });
}

horBarGraph('#land_use_breakdown');

var keyMap = {
    //"R100": "Recreation, Open Space, Natural Areas",
    //"M300": "Industrial – Extractive",
    "S120": "Residential – Rural",
    "S130": "Residential - Low-rise Apartment",
    //"A500": "Agriculture",
    "S100": "Residential - Mobile Home Park",
    "S235": "Mixed Use - High-rise Apartment",
    "S131": "Residential – Townhouse",
    "S700": "Rail, Rapid Transit, Transpo., Util. and Commu.",
    "S230": "Mixed Use - Low-rise Apartment",
    "S600": "Port Metro Vancouver",
    //"S420": "Cemetery",
    "S400": "Institutional",
    //"U100": "Undeveloped and Unclassified",
    "S410": "Res - Instit and Non-Market Housing",
    //"R200": "Lakes, Large Rivers and Other Water",
    "S500": "Road Right-of-Way",
    "S300": "Industrial",
    "S200": "Commercial",
    //"W400": "Protected Watershed",
    "S110": "Residential - Single Detached & Duplex",
    "S135": "Residential - High-rise Apartment",
    //"S650": "Airport/Airstrip",
    ///"F100": "Harvesting and Research"
};

horBarGraph('#land_use_breakdown2',Object.keys(keyMap));
