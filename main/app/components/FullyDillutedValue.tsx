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
};

const FullyDillutedValue: React.FC<FullyDillutedValueProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    const margin = { top: 10, right: 90, bottom: 20, left: 85 };
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

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(...Object.values(d.data).map((exchange) => exchange.fully_diluted_valuation))) as number])
      .range([height, 0]);

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
                <div><strong>${exchange.replace(/-(exchange|protocol|chain|solana)/gi, '').toUpperCase()}:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(closestDataPoint.data[exchange].fully_diluted_valuation)}</div>
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

  }, [data]);

  return (
    <div className="w-full" ref={containerRef}>
      <svg ref={svgRef} />
    </div>
  );
};

export default FullyDillutedValue;
