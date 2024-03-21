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
  cumulativeOpenInterest: number;
};

type Props = {
  data: {
    id: number;
    timestamp: string;
    [key: string]: OpenInterestData | number | string;
  }[];
};

const Tooltip: React.FC<{ data: TooltipData | null; style: React.CSSProperties }> = ({ data, style }) => {
  if (!data) return null;

  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '8px',
        pointerEvents: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        ...style, // Apply the provided style prop
      }}
    >
      {/* <div>Timestamp: {data.timestamp.toDateString()}</div> */}
      <div>Exchange: {data.exchange}</div>
      <div>Cumulative OI: {data.cumulativeOpenInterest}</div>
    </div>
  );
};


const OpenInterestChart: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [cumulativeOpenInterest, setCumulativeOpenInterest] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 30, right: 20, bottom: 40, left: 130 };
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

      const cumulativeOpenInterestData = data.reduce((acc, d) => {
        Object.entries(d).forEach(([exchange, value]) => {
          if (exchange !== 'id' && exchange !== 'timestamp') {
            Object.entries(value as OpenInterestData).forEach(([asset, data]) => {
              acc[exchange] = (acc[exchange] || 0) + parseFloat(data.openInterest);
            });
          }
        });
        return acc;
      }, {} as { [key: string]: number });
  
      setCumulativeOpenInterest(cumulativeOpenInterestData);
  


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
      
          if (d) {
            const bisector = d3.bisector((d: { timestamp: Date }) => d.timestamp).left;
            const closestIndex = bisector(d, timestamp);
            const closestDataPoint = d[closestIndex];
      
            setTooltipData({
              timestamp: closestDataPoint.data.timestamp,
              exchange: d.key,
              openInterest: closestDataPoint.data[d.key],
              cumulativeOpenInterest: cumulativeOpenInterest[d.key],
            });
      
            setTooltipPosition({ x: x + margin.left, y: y + margin.top + index * (height + margin.bottom) });
          }
        })
        .on('mousemove', (event) => {
          const [x, y] = d3.pointer(event);
          setTooltipPosition({ x: x + margin.left, y: y + margin.top + index * (height + margin.bottom) });
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
        <Tooltip
          data={{
            ...tooltipData,
            cumulativeOpenInterest: cumulativeOpenInterest[tooltipData.exchange], // Get the cumulative open interest for the current exchange
          }}
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        />
      )}
    </div>
  );
};


export default OpenInterestChart;
