"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

type TooltipProps = {
  show: boolean;
  content: {
    exchange: string;
    asset: string;
    value: number;
    timestamp: string;
  };
  position: {
    x: number;
    y: number;
  };
};

type FundingRateData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

// Define a simple Tooltip component
const Tooltip: React.FC<TooltipProps> = ({ show, content, position }) => {
  if (!show) return null;

  const style = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    pointerEvents: 'none',
  };

  return (
    <div style={style}>
      <div><strong>Exchange:</strong> {content.exchange}</div>
      <div><strong>Asset:</strong> {content.asset}</div>
      <div><strong>Funding Rate:</strong> {content.value}</div>
      <div><strong>Time:</strong> {content.timestamp}</div>
    </div>
  );
};

const FundingRateHeatMap = ({ data }) => {
  const svgRef = useRef(null);
  const [tooltipData, setTooltipData] = useState({
    show: false,
    content: {},
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 20, left: 130 };
    const width = 1200 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const exchanges = Object.keys(data[0]).filter(
      (key) => key !== 'id' && key !== 'timestamp'
    );
    const assets = Object.keys(data[0][exchanges[0]]);

    const yDomain = assets.flatMap((asset) =>
      exchanges.map((exchange) => `${asset}-${exchange}`)
    );

    const yScale = d3
      .scaleBand()
      .range([height, 0])
      .domain(yDomain)
      .padding(0.05);

    svg
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => d.split('-').join(' ')));

      const timestamps = data.slice().reverse().map((d) => new Date(d.timestamp));

      const xScale = d3
        .scaleTime()
        .range([0, width])
        .domain(d3.extent(timestamps) as [Date, Date]);
      
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    const fundingRates = data.flatMap((d) =>
      exchanges.flatMap((exchange) =>
        assets.map((asset) =>
          parseFloat((d[exchange] as FundingRateData)[asset].fundingRate)
        )
      )
    );

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.min(fundingRates)!, d3.max(fundingRates)!]);

    const cellWidth = width / data.length;
    const cellHeight = yScale.bandwidth();

    svg
      .selectAll('.cell')
      .data(data.slice().reverse())
      .join('g')
      .attr('transform', (d, i) => `translate(${i * cellWidth}, 0)`)
      .selectAll('.cell-rect')
      .data((d) =>
        exchanges.flatMap((exchange) =>
          assets.map((asset) => ({
            exchange,
            asset,
            value: parseFloat((d[exchange] as FundingRateData)[asset].fundingRate),
            timestamp: d.timestamp,
          }))
        )
      )
      .join('rect')
      .attr('x', 0)
      .attr('y', (d) => yScale(`${d.asset}-${d.exchange}`)!)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', (d) => colorScale(d.value))
      .on('mouseover', (event, d) => {
        const svgRect = svg.node().getBoundingClientRect();
        setTooltipData({
          show: true,
          content: d,
          position: {
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
          },
        });
      })
      .on('mousemove', (event) => {
        const svgRect = svg.node().getBoundingClientRect();
        setTooltipData((prev) => ({
          ...prev,
          position: {
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
          },
        }));
      })
      .on('mouseout', () =>
        setTooltipData({ show: false, content: {}, position: { x: 0, y: 0 } })
      );
  }, [data]);

  return (
    <>
      <svg ref={svgRef} />
      <Tooltip
        show={tooltipData.show}
        content={tooltipData.content}
        position={tooltipData.position}
      />
    </>
  );
};

export default FundingRateHeatMap;
