import * as d3 from "d3";
import { default as palette } from "../palette";
import { default as dataParse } from "../dataParse";
import { default as component } from "../component";

/**
 * Heat Map (also called: Heat Table; Density Table; Heat Map)
 * @see http://datavizproject.com/data-type/heat-map/
 */
export default function() {

	/**
	 * Default Properties
	 */
	let svg;
	let chart;
	let classed = "heatMapTable";
	let width = 400;
	let height = 300;
	let margin = { top: 50, right: 20, bottom: 20, left: 50 };
	let transition = { ease: d3.easeBounce, duration: 500 };
	let colors = [d3.rgb(214, 245, 0), d3.rgb(255, 166, 0), d3.rgb(255, 97, 0), d3.rgb(200, 65, 65)];
	let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

	/**
	 * Chart Dimensions
	 */
	let chartW;
	let chartH;

	/**
	 * Scales
	 */
	let xScale;
	let yScale;
	let colorScale;

	/**
	 * Other Customisation Options
	 */
	let thresholds;

	/**
	 * Initialise Data, Scales and Series
	 */
	function init(data) {
		chartW = width - margin.left - margin.right;
		chartH = height - margin.top - margin.bottom;

		// Slice Data, calculate totals, max etc.
		let slicedData = dataParse(data);
		let categoryNames = slicedData.categoryNames;
		let groupNames = slicedData.groupNames;

		// If thresholds values are not set attempt to auto-calculate the thresholds.
		if (!thresholds) {
			thresholds = slicedData.thresholds;
		}

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = (typeof colorScale === "undefined") ?
			d3.scaleThreshold().domain(thresholds).range(colors) :
			colorScale;

		// X & Y Scales
		xScale = d3.scaleBand()
			.domain(categoryNames)
			.range([0, chartW])
			.padding(0.1);

		yScale = d3.scaleBand()
			.domain(groupNames)
			.range([0, chartH])
			.padding(0.1);
	}

	/**
	 * Constructor
	 */
	function my(selection) {
		selection.each(function(data) {
			// Initialise Data
			init(data);

			// Create SVG and Chart containers (if they do not already exist)
			if (!svg) {
				svg = (function(selection) {
					let el = selection._groups[0][0];
					if (!!el.ownerSVGElement || el.tagName === "svg") {
						return selection;
					} else {
						return selection.append("svg");
					}
				})(d3.select(this));

				svg.classed("d3ez", true)
					.attr("width", width)
					.attr("height", height);

				chart = svg.append("g").classed("chart", true);
				chart.append("g").classed("xAxis axis", true);
				chart.append("g").classed("yAxis axis", true);
			} else {
				chart = selection.select(".chart");
			}

			// Update the chart dimensions
			chart.classed(classed, true)
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("width", chartW)
				.attr("height", chartH);

			let heatMapRow = component.heatMapRow()
				.width(chartW)
				.height(chartH)
				.colorScale(colorScale)
				.xScale(xScale)
				.yScale(yScale)
				.dispatch(dispatch)
				.thresholds(thresholds);

			let seriesGroup = chart.selectAll(".seriesGroup")
				.data(function(d) { return d; });

			seriesGroup.enter().append("g")
				.attr("class", "seriesGroup")
				.attr("transform", function(d) { return "translate(0, " + yScale(d.key) + ")"; })
				.merge(seriesGroup)
				.call(heatMapRow);

			seriesGroup.exit()
				.remove();

			// Add X Axis to chart
			let xAxis = d3.axisTop(xScale);
			chart.select(".xAxis")
				.call(xAxis)
				.selectAll("text")
				.attr("y", 0)
				.attr("x", -8)
				.attr("transform", "rotate(60)")
				.style("text-anchor", "end");

			// Add Y Axis to chart
			let yAxis = d3.axisLeft(yScale);
			chart.select(".yAxis")
				.call(yAxis);
		});
	}

	/**
	 * Configuration Getters & Setters
	 */
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

	my.thresholds = function(_) {
		if (!arguments.length) return thresholds;
		thresholds = _;
		return this;
	};

	my.dispatch = function(_) {
		if (!arguments.length) return dispatch();
		dispatch = _;
		return this;
	};

	my.on = function() {
		let value = dispatch.on.apply(dispatch, arguments);
		return value === dispatch ? my : value;
	};

	return my;
}
