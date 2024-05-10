"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

type OpenInterestData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

type TooltipData = {
  timestamp: Date;
  exchange: string;
  openInterest: string;
};


type AssetPriceData = {
  symbol: string;
  price: string;
}

type Props = {
  data: {
    id: number;
    timestamp: string;
    [key: string]: OpenInterestData | number | string;
  }[];
  isBase: boolean;
  currentAssetPrice: AssetPriceData[];
};

const Tooltip: React.FC<{ data: TooltipData | null; style: React.CSSProperties }> = ({ data, style }) => {
  if (!data) return null;

  return (
    <div className="absolute bg-black bg-opacity-80 text-white p-2 pointer-events-none rounded text-xs" style={style}>
      <div><strong>Exchange</strong> {data.exchange.slice(0, -5).toUpperCase()}</div>
      <div><strong>Timestamp:</strong> {data.timestamp.toLocaleString()}</div>
      <div><strong>Open Interest:</strong> {data.openInterest}</div>
    </div>
  );
};


const OpenInterestChart: React.FC<Props> = ({ data, isBase, currentAssetPrice }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef(null);

  useEffect(() => {

    if (!data || data.length === 0) return;

    const margin = { top: 0, right: 90, bottom: -20, left: 85 };
    const containerRect = containerRef.current?.getBoundingClientRect();
    const width = containerRect ? containerRect.width - margin.left - margin.right : 0;
    const chartMargin = 80;
    const height = 275 - margin.top - margin.bottom - chartMargin;

    const timestamps = data.map((d) => new Date(d.timestamp));
    const exchanges = Object.keys(data[0]).filter(
      (key) => key !== 'id' && key !== 'timestamp'
    );

    const assets = Array.from(
      new Set(
        exchanges.flatMap((exchange) => Object.keys(data[0][exchange] as OpenInterestData))
      )
    );

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
    .select(svgRef.current)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height * assets.length + margin.top + margin.bottom + (assets.length - 1) * chartMargin);
      
      const colorScale = d3.scaleOrdinal<string, string>().domain(exchanges).range(d3.schemeSet1);
      
      assets.forEach((asset, index) => {
        
        const assetData = data.map((d) => ({
          timestamp: new Date(d.timestamp),
          ...exchanges.reduce(
            (acc, exchange) => ({
              ...acc,
              [exchange]: parseFloat((d[exchange] as String)[asset]?.openInterest),
            }),
            {}
          ),
        }));

        const initialOpenInterest = exchanges.map(exchange => (data[0][exchange] as OpenInterestData)[asset]?.openInterest || '0');

        const sortedExchanges = exchanges
          .map((exchange, index) => ({ exchange, openInterest: parseFloat(initialOpenInterest[index]) }))
          .sort((a, b) => b.openInterest - a.openInterest)
          .map(({ exchange }) => exchange);
                
        let assetPrice = 1;
        if (!isBase) {
          const assetSymbol = asset.split('-')[0] + 'USDT';
          assetPrice = parseFloat(currentAssetPrice.find((item) => item.symbol === assetSymbol)?.price || '1');
        }

        const xScale = d3
          .scaleTime()
          .domain(d3.extent(timestamps) as [Date, Date])
          .range([0, width]);
      
        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(assetData, (d) => d3.sum(sortedExchanges, (exchange) => d[exchange])) as number])
          .range([height, 0]);
        
        const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
          const multipliedValue = (d as number) * (isBase ? 1 : assetPrice);
          return `${multipliedValue.toLocaleString()}${isBase ? " " + asset.split('-')[0] : '$'}`;
        });

        const stackedData = d3.stack<any>().keys(sortedExchanges)(assetData);      

        const area = d3
          .area<[number, number]>()
          .x((d) => xScale(d.data.timestamp))
          .y0((d) => yScale(d[0]))
          .y1((d) => yScale(d[1]));

        const svg = d3.select(svgRef.current)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height * assets.length + margin.top + margin.bottom + (assets.length - 1) * chartMargin);

        const defs = svg.append('defs');

        const filter = defs.append('filter')
          .attr('id', 'dropShadow')
          .attr('x', '-20%')
          .attr('y', '-20%')
          .attr('width', '200%')
          .attr('height', '200%');

        filter.append('feDropShadow')
          .attr('dx', '0')
          .attr('dy', '1.5')
          .attr('stdDeviation', '1')
          .attr('flood-color', '#ffffff')
          .attr('flood-opacity', '0.85');

        const chartGroup = svg
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top + index * (height + margin.bottom + chartMargin)})`);


        chartGroup
        .selectAll('path.line')
        .data(stackedData)
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', (d) => colorScale(d.key))
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.65)
        .attr('filter', 'url(#dropShadow)') 
        .attr('d', (d) => {
          const lineData: [number, number][] = d.map((point) => [
            xScale(point.data.timestamp),
            yScale(point[1]),
          ]);
          return d3.line()(lineData);
        });

        chartGroup
        .selectAll('path.area')
        .data(stackedData)
        .join('path')
        .attr('class', 'area')
        .attr('fill', (d) => colorScale(d.key))
        .attr('fill-opacity', 0.80)
        .attr('d', area)
        .on('mouseover', (event, d) => {
          const [x, y] = d3.pointer(event);
          const timestamp = xScale.invert(x);

          if (d) {
            const bisector = d3.bisector((d: { timestamp: Date }) => d.timestamp).left;
            const closestIndex = bisector(d, timestamp);
            const closestDataPoint = d[closestIndex];

            setTooltipData({
              timestamp: closestDataPoint.data.timestamp,
              exchange: d.key,
              openInterest: !isBase
              ? `$${closestDataPoint.data[d.key] * assetPrice}`
              : (closestDataPoint.data[d.key] * assetPrice).toFixed(2)
            });
            setTooltipPosition({ x: x + margin.left, y: y + margin.top + index * (height + margin.bottom + chartMargin) });
          }
        })
        .on('mousemove', (event, d) => {
          const [x, y] = d3.pointer(event);
          const timestamp = xScale.invert(x);
        
          if (d) {
            const closestDataPoint = d.reduce((closest, current) => {
              return Math.abs(current.data.timestamp - timestamp) < Math.abs(closest.data.timestamp - timestamp)
                ? current
                : closest;
            });
        
            setTooltipData({
              timestamp: closestDataPoint.data.timestamp,
              exchange: d.key,
              openInterest: !isBase
              ? `${(closestDataPoint.data[d.key] * assetPrice).toFixed(2)}$`
              : `${closestDataPoint.data[d.key].toFixed(2)}` + ` ${asset.split('-')[0]}`
            });
            
            setTooltipPosition({ x: x + margin.left, y: y + margin.top + index * (height + margin.bottom + chartMargin) });
          }
        })
        .on('mouseout', () => {
          setTooltipData(null);
          setTooltipPosition(null);
        });
        
        chartGroup
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
        
        chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left / 2 - 31)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(`${asset}`.slice(0, -4));

        chartGroup.select('.y-axis').selectAll('*').remove();
        chartGroup.select('.y-axis').remove();
        chartGroup.select('.yScale').selectAll('*').remove();
        chartGroup.select('.yScale').remove();

        chartGroup.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

      });

    const alphaSortedExchanges = exchanges.sort((a, b) => a.localeCompare(b));
    
    const legend = svg
    .append('g')
    .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

    legend
      .selectAll('rect')
      .data(alphaSortedExchanges)
      .join('rect')
      .attr('y', (d, i) => i * 40)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', (d) => colorScale(d));
  
    legend
      .selectAll('text')
      .data(alphaSortedExchanges)
      .join('text')
      .attr('x', 20)
      .attr('y', (d, i) => i * 40 + 11)
      .text((d) => d.replace(/_data/i, '').toUpperCase())
      .attr('font-size', '12px')
      .attr('fill', 'white');
  
  }, [data, isBase, currentAssetPrice]);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <svg ref={svgRef} />
      {tooltipData && tooltipPosition && (
        <Tooltip
          data={{
            ...tooltipData
          }}
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        />
      )}
    </div>
  );
};

export default OpenInterestChart;
