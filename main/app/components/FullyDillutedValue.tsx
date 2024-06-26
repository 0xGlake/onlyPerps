"use client";
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

type TokenData = {
  id: number;
  timestamp: string;
  data: {
    [exchangeKey: string]: {
      fully_diluted_valuation : number;
      current_price : number;
      market_cap : number;
    };
  };
}[];

type FullyDillutedValueProps = {
  data: TokenData;
  isLogarithmic: boolean;
};

const FullyDillutedValue: React.FC<FullyDillutedValueProps> = ({ data, isLogarithmic } ) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();


    const containerRect = containerRef.current?.getBoundingClientRect();
    const margin = { top: 10, right: 90, bottom: 20, left: 85 };
    const width = containerRect ? containerRect.width - margin.left - margin.right : 0;
    const height = 650 - margin.top - margin.bottom;

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

    const allValues = data.flatMap(d => Object.values(d.data).map(exchange => exchange.fully_diluted_valuation));
    const minNonZeroValue = d3.min(allValues.filter(v => v > 0)) || 1;
    const maxValue = d3.max(allValues) || 1;

    if (isLogarithmic) {
      yScale = d3
        .scaleLog()
        .domain([minNonZeroValue, maxValue])
        .range([height, 0])
        .nice();

      yAxis = d3.axisLeft(yScale)
        .tickFormat((d) => {
          const log10 = Math.log10(+d);
          if (Math.abs(Math.round(log10) - log10) < 1e-6) {
            return d3.format(".0s")(+d);
          }
          return "";
        })
        .ticks(10);
    } else {
      yScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([height, 0])
        .nice();

      yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".2s"))
        .ticks(10);
    }
      
    // Add y-axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(g => g.select(".domain").remove());

    // Add grid lines
    const yGridLines = isLogarithmic 
      ? yScale.ticks(10).filter(tick => Number.isInteger(Math.log10(tick)))
      : yScale.ticks(10);

    svg.selectAll('grid-line')
      .data(yGridLines)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'white')
      .attr('stroke-opacity', 0.1);  

    const line = d3
      .line<{ timestamp: string; fully_diluted_valuation: number }>()
      .x((d) => xScale(new Date(d.timestamp)))
      .y((d) => yScale(d.fully_diluted_valuation));

    const exchanges = Object.keys(data[0].data);
    const alphaSortedExchanges = exchanges.sort((a, b) => a.localeCompare(b));

    const colors = d3.scaleOrdinal(d3.schemeCategory10).domain(alphaSortedExchanges);


    exchanges.forEach((exchange, i) => {
      const exchangeData = data.map((d) => ({
        timestamp: d.timestamp,
        fully_diluted_valuation: d.data[exchange].fully_diluted_valuation,
      }));

      svg
        .append('path')
        .datum(exchangeData)
        .attr('fill', 'none')
        .attr('stroke', colors(exchange))
        .attr('stroke-width', 1.5)
        .attr('d', line);
    });

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g').call(d3.axisLeft(yScale));
    
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
              closestDataPoint.data[b].fully_diluted_valuation - closestDataPoint.data[a].fully_diluted_valuation
            );
            return `
              ${sortedExchanges.map(exchange => `
                <div><strong style="color: ${colors(exchange)}">${exchange.replace(/-(exchange|protocol|chain|solana)/gi, '').toUpperCase()}:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(closestDataPoint.data[exchange].fully_diluted_valuation)}</div>
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

  }, [data, isLogarithmic]);

  return (
    <div className="w-full" ref={containerRef}>
      <svg ref={svgRef} />
    </div>
  );
};

export default FullyDillutedValue;
