import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

type DataPoint = {
  timestamp: string;
  [exchangeKey: string]: number | string;
};

type TokenGraphProps = {
  data: DataPoint[];
  isLogarithmic: boolean;
  title: string;
  valueKey: string;
};

const TokenGraph: React.FC<TokenGraphProps> = ({ data, isLogarithmic, title, valueKey }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const containerRect = containerRef.current?.getBoundingClientRect();
    const margin = { top: 50, right: 90, bottom: 30, left: 85 };
    const width = containerRect ? containerRect.width - margin.left - margin.right : 0;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.timestamp)) as [Date, Date])
      .range([0, width]);

    let yScale: d3.ScaleLogarithmic<number, number> | d3.ScaleLinear<number, number>;
    let yAxis: d3.Axis<d3.NumberValue>;

    const allValues = data.flatMap(d => Object.entries(d)
      .filter(([key]) => key !== 'timestamp')
      .map(([, value]) => Number(value)));
    const minNonZeroValue = d3.min(allValues.filter(v => v > 0)) || 1;
    const maxValue = d3.max(allValues) || 1;

    const formatNumber = (value: number) => {
      return `$${new Intl.NumberFormat('en-US').format(value)}`;
    };

    if (isLogarithmic) {
      yScale = d3.scaleLog()
        .domain([minNonZeroValue, maxValue])
        .range([height, 0])
        .nice();
    
      const logBase = 10;
      const minExponent = Math.floor(Math.log10(minNonZeroValue));
      const maxExponent = Math.ceil(Math.log10(maxValue));
    
      let tickValues = [];
      for (let exp = minExponent; exp <= maxExponent; exp++) {
        tickValues.push(Math.pow(logBase, exp));
        if (exp < maxExponent) {
          tickValues.push(Math.pow(logBase, exp) * 2);
          tickValues.push(Math.pow(logBase, exp) * 5);
        }
      }

      yAxis = d3.axisLeft(yScale)
        .tickFormat(d => formatNumber(+d))
        .tickValues(tickValues);
    } else {
      yScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([height, 0])
        .nice();
  
      yAxis = d3.axisLeft(yScale)
        .tickFormat(d => formatNumber(+d));
    }      

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    const yGridLines = isLogarithmic 
      ? yScale.ticks().filter(tick => Number.isInteger(Math.log10(tick)))
      : yScale.ticks();
  
    svg.selectAll('grid-line')
      .data(yGridLines)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'white')
      .attr('stroke-opacity', 0.2);

    const line = d3
      .line<{ timestamp: string; value: number }>()
      .x((d) => xScale(new Date(d.timestamp)))
      .y((d) => yScale(d.value));

    const exchanges = Object.keys(data[0]).filter(key => key !== 'timestamp');
    const alphaSortedExchanges = exchanges.sort((a, b) => a.localeCompare(b));

    const colors = d3.scaleOrdinal(d3.schemeCategory10).domain(alphaSortedExchanges);
    
    const defs = svg.append('defs');
    
    const shadowFilter = defs.append('filter')
      .attr('id', 'shadow-filter')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('width', '300%')
      .attr('height', '300%')
      .attr('x', '-100%')
      .attr('y', '-100%');  
    
    shadowFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 6)
      .attr('result', 'blur');
    
    shadowFilter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 0)
      .attr('dy', 4)
      .attr('result', 'offsetBlur');
    
    shadowFilter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.5);
    
    const feMerge = shadowFilter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
    
    const area = d3.area<{ timestamp: string; value: number }>()
      .x((d) => xScale(new Date(d.timestamp)))
      .y0(height)
      .y1((d) => yScale(d.value));
      
    exchanges.forEach((exchange, i) => {
      const exchangeData = data.map((d) => ({
        timestamp: d.timestamp,
        value: Number(d[exchange]),
      }));
    
      if (!isLogarithmic) {
        const minY = d3.min(exchangeData, d => yScale(d.value)) || 0;
        const maxY = d3.max(exchangeData, d => yScale(d.value)) || height;
        
        const lineRange = Math.abs(maxY - minY);
        const offset = lineRange * 0.4;
    
        const gradient = defs.append('linearGradient')
          .attr('id', `line-gradient-${i}`)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0)
          .attr('y1', Math.max(maxY + offset, height))
          .attr('x2', 0)
          .attr('y2', Math.min(minY - offset, 0));
    
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', colors(exchange))
          .attr('stop-opacity', 0);
    
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', colors(exchange))
          .attr('stop-opacity', 0.65);
    
        // Draw gradient area only in linear mode
        svg
          .append('path')
          .datum(exchangeData)
          .attr('fill', `url(#line-gradient-${i})`)
          .attr('d', area)
          .attr('opacity', 1);
      }
    
      // Draw shadow line
      svg
        .append('path')
        .datum(exchangeData)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.35)
        .attr('filter', 'url(#shadow-filter)')
        .attr('d', line)
        .attr('transform', 'translate(0, 3.5)');
    
      // Draw main line
      svg
        .append('path')
        .datum(exchangeData)
        .attr('fill', 'none')
        .attr('stroke', colors(exchange))
        .attr('stroke-width', 2)
        .attr('d', line);
    });

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width + 20}, 0)`);

    legend
      .selectAll('rect')
      .data(alphaSortedExchanges)
      .join('rect')
      .attr('y', (d, i) => i * 40)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', (d) => colors(d));

    legend
      .selectAll('text')
      .data(alphaSortedExchanges)
      .join('text')
      .attr('x', 20)
      .attr('y', (d, i) => i * 40 + 11)
      .text((d) => d.replace(/-(exchange|protocol|chain|solana)/gi, '').toUpperCase())
      .attr('font-size', '12px')
      .attr('fill', 'white')
    
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'absolute bg-black bg-opacity-80 text-white p-2 pointer-events-none rounded text-xs')
      .style('display', 'none');

    const verticalLine = svg.append('line')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('y1', 0)
      .attr('y2', height)
      .style('display', 'none');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const hoveredDate = xScale.invert(mouseX);
        const closestDataPoint = data.reduce((prev, curr) => {
          return (Math.abs(new Date(curr.timestamp).getTime() - hoveredDate.getTime()) < Math.abs(new Date(prev.timestamp).getTime() - hoveredDate.getTime()) ? curr : prev);
        });

        verticalLine
          .attr('x1', mouseX)
          .attr('x2', mouseX)
          .style('display', 'block');

        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY}px`)
          .style('display', 'block')
          .html(() => {
            const sortedExchanges = exchanges.sort((a, b) => 
              Number(closestDataPoint[b]) - Number(closestDataPoint[a])
            );
            return `
              ${sortedExchanges.map(exchange => `
                <div><strong style="color: ${colors(exchange)}">${exchange.replace(/-(exchange|protocol|chain|solana)/gi, '').toUpperCase()}:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(closestDataPoint[exchange]))}</div>
              `).join('')}
              <div style="margin-top: 10px;">
                <strong>Timestamp:</strong> ${new Date(closestDataPoint.timestamp).toLocaleString()}
              </div>
            `;
          });
      })
      .on('mouseout', () => {
        verticalLine.style('display', 'none');
        tooltip.style('display', 'none');
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '32px')
      .style('fill', 'white')
      .text(title);

  }, [data, isLogarithmic, title, valueKey]);

  return (
    <div className="w-full" ref={containerRef}>
      <svg ref={svgRef} />
    </div>
  );
};

export default TokenGraph;
