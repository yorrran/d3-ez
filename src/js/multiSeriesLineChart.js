/**
 * Multi Series Line Chart
 *
 * @example
 * var myChart = d3.ez.multiSeriesLineChart()
 *     .width(400)
 *     .height(300);
 * d3.select("#chartholder")
 *     .datum(data)
 *     .call(myChart);
 */
d3.ez.multiSeriesLineChart = function module() {
  // SVG and Chart containers (Populated by 'my' function)
  var svg;
  var chart;

  // Default Options (Configurable via setters)
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 40 };
  var classed = "multiSeriesLineChart";
  var colors = d3.ez.colors.categorical(3);
  var yAxisLabel = null;
  var groupType = "clustered";

  // Data Options (Populated by 'init' function)
  var chartW = 0;
  var chartH = 0;
  var maxValue = 0;
  var maxGroupTotal = undefined;
  var xScale = undefined;
  var yScale = undefined;
  var xAxis = undefined;
  var yAxis = undefined;
  var colorScale = undefined;

  // Dispatch (Custom events)
  var dispatch = d3.dispatch("customMouseOver", "customMouseOut", "customClick");

  // Other functions
  var line = undefined;
  var cities;

  function init(data) {
    chartW = width - margin.left - margin.right;
    chartH = height - margin.top - margin.bottom;

    // Group and Category Names
    seriesNames = data.map(function(d) {
      return d.key;
    });

    // Convert dates
    data.forEach(function(d, i) {
      d.values.forEach(function(b, j) {
        data[i].values[j].key = new Date(b.key * 1000);
      });
    });

    // X & Y Scales
    dateDomain = d3.extent(data[0].values, function(d) { return d.key; });
    xScale = d3.time.scale()
      .range([0, chartW])
      .domain(dateDomain);

    yScale = d3.scale.linear()
      .range([chartH, 0])
      .domain([0, 100]);

    // X & Y Axis
    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");
    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left");

    // Colour Scale
    colorScale = d3.scale.ordinal()
      .range(colors)
      .domain(seriesNames);
  }

  function my(selection) {
    selection.each(function(data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = (function(selection) {
          var el = selection[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        })(d3.select(this));

        svg.classed("d3ez", true)
          .attr({ width: width, height: height });

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("x-axis axis", true);
        chart.append("g").classed("y-axis axis", true)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -35)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          //.text(yAxisLabel);
          .text("Temperature (ºF)");
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true)
        .attr({ width: width, height: height })
        .attr({ transform: "translate(" + margin.left + "," + margin.top + ")" });

      // Add axis to chart
      chart.select(".x-axis")
        .attr("transform", "translate(0," + chartH + ")")
        .call(xAxis);

      chart.select(".y-axis")
        .call(yAxis);

      var series = chart.selectAll(".series")
        .data(data)
        .enter().append("g")
        .attr("class", "series");

      // Line Generator
      line = d3.svg.line()
        .x(function(d) { return xScale(d.key); })
        .y(function(d) { return yScale(d.value); });

      series.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return colorScale(d.key); });

      series.selectAll("circle")
        .data(function(d) { return d.values })
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return xScale(d.key); })
        .attr("cy", function(d) { return yScale(d.value); })
        .style("fill", function(d, i, j) { return colorScale(data[j].key); })
        .on("mouseover", dispatch.customMouseOver);

      //series.append("text")
      //  .datum(function(d) { return { name: d.name, value: d.values[d.values.length - 1] }; })
      //  .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.temperature) + ")"; })
      //  .attr("x", 3)
      //  .attr("dy", ".35em")
      //  .text(function(d) { return d.name; });

    });
  }

  // Configuration Getters & Setters
  my.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.yAxisLabel = function(_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.groupType = function(_) {
    if (!arguments.length) return groupType;
    groupType = _;
    return this;
  };

  my.transition = function(_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function(_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.dispatch = function(_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  d3.rebind(my, dispatch, "on");

  return my;
};
