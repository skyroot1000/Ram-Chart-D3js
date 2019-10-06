/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions

*/

function renderChartRam(params) {

  // exposed variables
  var attrs = {
    svgWidth: 357,
    svgHeight: 288,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    container: 'body',
    fontFamily: 'Helvetica',
    backgroundColor: '#202235',
    titleTextColor: '#58678B',
    titleTextFontSize: 16,
    titleTextSpacing: 7,
    valueTextFontSize: 28,
    valueTextColor: '#FAFBFC',
    valueTextFontWeight: 200,
    restProgressColor: '#303564',
    activeProgressColor: '#00FFFF',
    bottomProgressStrokeWidth: 5,
    bottomProgressStrokeDasharray: '1,6',
    circleButtonRadius: 6,
    circleButtonColor: "#00FFFF",
    circleButtonStrokeWidth: 8,
    circleButtonStrokeOpacity: 0.3,
    data: null
  };

  /*############### IF EXISTS OVERWRITE ATTRIBUTES FROM PASSED PARAM  #######  */

  var attrKeys = Object.keys(attrs);
  attrKeys.forEach(function (key) {
    if (params && params[key]) {
      attrs[key] = params[key];
    }
  })

  //innerFunctions which will update visuals
  var updateData;

  //main chart object
  var main = function (selection) {
    selection.each(function scope() {

      //calculated properties
      var calc = {}
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
      calc.titleTextY = calc.chartHeight / 4;
      calc.titleTextX = calc.chartWidth / 2;
      calc.valueTextY = calc.chartHeight * 3 / 8;
      calc.valueTextX = calc.chartWidth / 2;


      calc.pieCenterX = calc.chartWidth * 0.5;
      calc.pieCenterY = -calc.chartHeight * 0.4;


      calc.progressProps = {
        top: [{
          value: 44,
          color: 'none',
        }, {
          value: 12,
          color: attrs.restProgressColor,
        }, {
          value: 44,
          color: 'none',
        }],
        topActive: [{
          value: 44,
          color: 'none',
        }, {
          value: 12 - 12 * attrs.data.value / attrs.data.max,
          color: attrs.restProgressColor,
        }, {
          value: 12 * attrs.data.value / attrs.data.max,
          color: attrs.activeProgressColor,
          mainNode: true,
        }, {
          value: 44,
          color: 'none',
        }],
        bottom: [{
          value: 44,
          color: 'none',
        }, {
          value: 12,
          color: attrs.restProgressColor,
        }, {
          value: 44,
          color: 'none',
        }],
        bottomActive: [{
          value: 44,
          color: 'none',
        }, {
          value: 12 - 12 * attrs.data.value / attrs.data.max,
          color: attrs.restProgressColor,
        }, {
          value: 12 * attrs.data.value / attrs.data.max,
          color: attrs.activeProgressColor,
        }, {
          value: 44,
          color: 'none',
        }]
      };

      //######################## LAYOUTS  ############################
      var layouts = {};
      layouts.pie = d3.pie().value(d => d.value).sort(null);

      //######################## ARCS  ############################
      var arcs = {};
      calc.progressRadius = 320;
      arcs.top = d3.arc()
        .innerRadius(calc.progressRadius - 5)
        .outerRadius(calc.progressRadius)
        .cornerRadius(5)


      arcs.bottom = d3.arc()
        .innerRadius(calc.progressRadius + 10)
        .outerRadius(calc.progressRadius + 10)


      //###########################################  BEHAVIORS  ################################
      var behaviors = {};
      behaviors.sliderDrag = d3.drag().on('drag', sliderDragged);



      //#####################################  SCALES  #################################
      var scales = {};
      scales.slider = d3.scaleLinear().domain([attrs.data.min, attrs.data.max]);

      //####################################  DRAWING  #################################

      //drawing containers
      var container = d3.select(this);

      //add svg
      var svg = patternify({ container: container, selector: 'svg-chart-container', elementTag: 'svg' })
      svg.attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)
        .style('background-color', attrs.backgroundColor)
        .style('font-family', attrs.fontFamily)
      // .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight)
      // .attr("preserveAspectRatio", "xMidYMid meet")




      //add background image
      var image = patternify({ container: svg, selector: 'svg-background-image', elementTag: 'svg:image' })
      image
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight)
        .attr("xlink:href", "assets/ram.png")
        .attr('opacity', attrs.imageOpacity)

      //add container g element
      var chart = patternify({ container: svg, selector: 'chart', elementTag: 'g' })
      chart.attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

      var defs = patternify({ container: chart, selector: 'svg-defs', elementTag: 'defs' })

      var clipPath = patternify({ container: svg, selector: 'svg-defs-clip-path', elementTag: 'clipPath' })
        .attr('id', 'my-clip')

      var clipPathRect = patternify({ container: clipPath, selector: 'svg-defs-clip-path-rect', elementTag: 'rect' })
      clipPathRect.attr('width', 240).attr('height', 500).attr('x', 130 - 248 * attrs.data.value / attrs.data.max).attr('y', 0).attr('fill', 'black')
      //-118
      //130
      //title texts
      var titleText = patternify({ container: chart, selector: 'title-text', elementTag: 'text' })
      titleText.text(attrs.data.title)
        .attr('fill', attrs.titleTextColor)
        .attr('y', calc.titleTextY)
        .attr('x', calc.titleTextX)
        .attr('text-anchor', 'middle')
        .style('text-transform', 'uppercase')
        .attr('font-size', attrs.titleTextFontSize)
        .style('letter-spacing', attrs.titleTextSpacing)

      //values 
      var valueText = patternify({ container: chart, selector: 'value-text', elementTag: 'text' })
      valueText.text(attrs.data.value + attrs.data.suffix)
        .attr('fill', attrs.valueTextColor)
        .attr('y', calc.valueTextY)
        .attr('x', calc.valueTextX)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', attrs.valueTextFontSize)
        .style("text-shadow", "0px 0px 40px " + attrs.valueTextColor)
        .attr('font-weight', attrs.valueTextFontWeight)

      //pieCenterPoint
      var pieCenterPoint = patternify({ container: chart, selector: 'pie-center-point', elementTag: 'g' })
      pieCenterPoint.attr('transform', 'translate(' + (calc.pieCenterX) + ',' + calc.pieCenterY + ')');

      //passive progress paths
      var piePaths = patternify({ container: pieCenterPoint, selector: 'pie-paths', elementTag: 'path', data: layouts.pie(calc.progressProps.top) })
      piePaths.attr('d', arcs.top)
        .attr('fill', d => d.data.color)

      var sliderButtonPosition;
      //active progress paths
      var piePaths = patternify({ container: pieCenterPoint, selector: 'active-pie-paths', elementTag: 'path', data: layouts.pie(calc.progressProps.topActive) })
      piePaths.attr('d', arcs.top)
        .attr('fill', d => d.data.color)
        .each(d => {
          if (d.data.mainNode) {
            calc.minX = arcs.top.centroid({ startAngle: d.endAngle, endAngle: d.endAngle })[0];
            calc.maxX = -calc.minX;
            scales.slider.range([calc.minX, calc.maxX]);
            sliderButtonPosition = arcs.top.centroid({ startAngle: d.startAngle, endAngle: d.startAngle })
          }
        })


      // slider circle button
      var sliderCircleButton = patternify({ container: pieCenterPoint, selector: 'slider-circle-button', elementTag: 'circle' })
      sliderCircleButton.attr('r', attrs.circleButtonRadius)
        .attr('fill', attrs.circleButtonColor)
        .attr('cx', sliderButtonPosition[0])
        .attr('cy', sliderButtonPosition[1])
        .attr('stroke', attrs.circleButtonColor)
        .attr('stroke-opacity', attrs.circleButtonStrokeOpacity)
        .attr('stroke-width', attrs.circleButtonStrokeWidth)
        .call(behaviors.sliderDrag)
        .attr('cursor', 'pointer')


      //bottom passive progress paths
      var bottomPasivePaths = patternify({ container: pieCenterPoint, selector: 'bottom-passive-paths', elementTag: 'path', data: layouts.pie(calc.progressProps.bottom) })
      bottomPasivePaths.attr('d', arcs.bottom)
        .attr('fill', 'none')
        .attr('stroke-width', attrs.bottomProgressStrokeWidth)
        .attr('stroke', d => d.data.color)
        .attr('stroke-dasharray', attrs.bottomProgressStrokeDasharray)

      var length = 250;
      //bottom active progress paths
      var bottomActivePaths = patternify({ container: pieCenterPoint, selector: 'dashs-paths', elementTag: 'path' })
      bottomActivePaths.attr('d', `M -118,309 q ${length / 2} 50 ${length} -5`)
        .attr('fill', 'none')
        .attr('clip-path', "url(#my-clip)")
        .attr('stroke-width', attrs.bottomProgressStrokeWidth)
        .attr('stroke', d => 'white')
        .attr('stroke-dasharray', attrs.bottomProgressStrokeDasharray)
        .attr('transform', `translate(0,-1) rotate(${45 * (attrs.data.max - attrs.data.value) / attrs.data.max})`)

      //       //bottom active progress paths
      // var bottomActivePaths = patternify({ container: pieCenterPoint, selector: 'bottom-active-paths', elementTag: 'path', data: layouts.pie(calc.progressProps.bottomActive) })
      // bottomActivePaths.attr('d', arcs.bottom)
      //   .attr('fill', 'none')
      //   .attr('stroke-width', attrs.bottomProgressStrokeWidth)
      //   .attr('stroke', d => d.data.color)
      //   .attr('stroke-dasharray', attrs.bottomProgressStrokeDasharray)


      //#############################  EVENT HANDLER FUNCTIONS ##########################
      function sliderDragged(d) {
        // console.log(d3.event.x);

        var value = scales.slider.invert(d3.event.x);
        value = Math.min(attrs.data.max, value);
        value = Math.max(attrs.data.min, value)
        attrs.data.value = Math.round(value);


        // if (d3.event.x < calc.progressBarX) {
        //   return;
        // }
        // if (d3.event.x > calc.progressBarX + calc.progressBarWidth) {
        //   return;
        // }

        // var currentWidth = d3.event.x - calc.progressBarX;
        // var currentValue = Math.round(scales.progress.invert(currentWidth));
        // attrs.data.value = currentValue;

        main.run();
      }




      // smoothly handle data updating
      updateData = function () {
        main.run();
      }
      //#########################################  UTIL FUNCS ##################################

      //enter exit update pattern principle
      function patternify(params) {
        var container = params.container;
        var selector = params.selector;
        var elementTag = params.elementTag;
        var data = params.data || [selector];

        // pattern in action
        var selection = container.selectAll('.' + selector).data(data)
        selection.exit().remove();
        selection = selection.enter().append(elementTag).merge(selection)
        selection.attr('class', selector);
        return selection;
      }


      function debug() {
        if (attrs.isDebug) {
          //stringify func
          var stringified = scope + "";

          // parse variable names
          var groupVariables = stringified
            //match var x-xx= {};
            .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
            //match xxx
            .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
            //get xxx
            .map(v => v[0].trim())

          //assign local variables to the scope
          groupVariables.forEach(v => {
            main['P_' + v] = eval(v)
          })
        }
      }

      debug();
    });
  };

  //dinamic functions
  Object.keys(attrs).forEach(key => {
    // Attach variables to main function
    return main[key] = function (_) {
      var string = `attrs['${key}'] = _`;
      if (!arguments.length) { return eval(` attrs['${key}'];`); }
      eval(string);
      return main;
    };
  });

  //set attrs as property
  main.attrs = attrs;

  //debugging visuals
  main.debug = function (isDebug) {
    attrs.isDebug = isDebug;
    if (isDebug) {
      if (!window.charts) window.charts = [];
      window.charts.push(main);
    }
    return main;
  }

  //exposed update functions
  main.data = function (value) {
    if (!arguments.length) return attrs.data;
    attrs.data = value;
    if (typeof updateData === 'function') {
      updateData();
    }
    return main;
  }

  // run  visual
  main.run = function () {
    d3.selectAll(attrs.container).call(main);
    return main;
  }

  return main;
}
