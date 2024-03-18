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
  openInterest: number;
};

type Props = {
  data: {
    id: number;
    timestamp: string;
    [key: string]: OpenInterestData | number | string;
  }[];
};

const Tooltip: React.FC<{ data: TooltipData | null }> = ({ data }) => {
  if (!data) return null;

  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '8px',
        pointerEvents: 'none',
      }}
    >
      <div>Timestamp: {data.timestamp.toISOString()}</div>
      <div>Exchange: {data.exchange}</div>
      <div>Open Interest: {data.openInterest}</div>
    </div>
  );
};

const OpenInterestChart: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 130 };
    const width = 1200 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const timestamps = data.map((d) => new Date(d.timestamp));
    const exchanges = Object.keys(data[0]).filter(
      (key) => key !== 'id' && key !== 'timestamp'
    );

    const assets = Array.from(
      new Set(
        exchanges.flatMap((exchange) => Object.keys(data[0][exchange] as OpenInterestData))
      )
    );

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height * assets.length + margin.top + margin.bottom);

    assets.forEach((asset, index) => {
      const assetData = data.map((d) => ({
        timestamp: new Date(d.timestamp),
        ...exchanges.reduce(
          (acc, exchange) => ({
            ...acc,
            [exchange]: parseFloat((d[exchange] as OpenInterestData)[asset]?.openInterest || '0'),
          }),
          {}
        ),
      }));

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(timestamps) as [Date, Date])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(assetData, (d) => d3.sum(exchanges, (exchange) => d[exchange])) as number])
        .range([height, 0]);

      const colorScale = d3.scaleOrdinal<string, string>().domain(exchanges).range(d3.schemeCategory10);

      const stackedData = d3.stack<any>().keys(exchanges)(assetData);

      const area = d3
        .area<[number, number]>()
        .x((d) => xScale(d.data.timestamp))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

      const chartGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top + index * (height + margin.bottom)})`);

      chartGroup
        .selectAll('path')
        .data(stackedData)
        .join('path')
        .attr('fill', (d) => colorScale(d.key))
        .attr('d', area)
        .on('mouseover', (event, d) => {
          const [x, y] = d3.pointer(event);
          const timestamp = xScale.invert(x);
          
          if (d.data) {
            const closestIndex = d3.bisectLeft(
              d.data.map((d: { timestamp: Date; [key: string]: number }) => d.timestamp),
              timestamp
            );
            const closestDataPoint: { timestamp: Date; [key: string]: number } = d.data[closestIndex];
            
            setTooltipData({
              timestamp: closestDataPoint.timestamp,
              exchange: d.key,
              openInterest: closestDataPoint[d.key],
            });
            
            setTooltipPosition({ x: x + margin.left, y: y + margin.top + index * (height + margin.bottom) });
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

      chartGroup.append('g').call(d3.axisLeft(yScale));

      chartGroup
        .append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .text(`Open Interest - ${asset}`);
    });
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} />
      {tooltipData && tooltipPosition && (
        <Tooltip data={tooltipData} style={{ left: tooltipPosition.x, top: tooltipPosition.y }} />
      )}
    </div>
  );
};

export default OpenInterestChart;