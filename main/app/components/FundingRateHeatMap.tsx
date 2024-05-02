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

  return (
    <div
      className="absolute bg-black bg-opacity-60 text-white p-2 rounded text-xs pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div><strong>Exchange:</strong> {content.exchange}</div>
      <div><strong>Asset:</strong> {content.asset}</div>
      <div><strong>Funding Rate:</strong> {content.value}</div>
      <div><strong>Time:</strong> {content.timestamp}</div>
    </div>
  );
};

const FundingRateHeatMap = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const [tooltipData, setTooltipData] = useState({
    show: false,
    content: {},
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 0, right: 20, bottom: 0, left: 120 };
    const containerRect = containerRef.current?.getBoundingClientRect();
    const width = containerRect ? containerRect.width - margin.left - margin.right : 0;
    const height = 300 - margin.top - margin.bottom;

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
      .padding(0);

    svg
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => d.split('-').join(' ')))
      .selectAll('text')
      .attr('text-anchor', 'left') // Center the text horizontally
      .attr('dy', '0.35em') // Adjust the vertical position of the text
      .style('font-size', '10px');

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
          assets.map((asset) => {
            const exchangeData = d[exchange] as FundingRateData;
            const assetData = exchangeData?.[asset];
            if (assetData && assetData.fundingRate) {
              //console.log(parseFloat(assetData.fundingRate));
              return parseFloat(assetData.fundingRate);
            } else {
              //console.log("funding rate error", assetData, assetData?.fundingRate, exchange, exchangeData);
              return 0;
            }
          })
        )
      );


      const colourScalar = d3.max(fundingRates, Math.abs);
      const colorScale = d3
        .scaleSequential(d3.interpolateRgbBasis(["red", d3.rgb(244, 203, 247), "blue"]))
        .domain([-colourScalar!, colourScalar!]);
            
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
        setTooltipData({
          show: true,
          content: d,
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      })
      .on('mousemove', (event) => {
        setTooltipData((prev) => ({
          ...prev,
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        }));
      })
      .on('mouseout', () =>
        setTooltipData({ show: false, content: {}, position: { x: 0, y: 0 } })
      );
  }, [data]);

  return (
  <div className="w-full" ref={containerRef}>
      <svg ref={svgRef} />
      <Tooltip
        show={tooltipData.show}
        content={tooltipData.content}
        position={tooltipData.position}
      />
    </div>
  );
};

export default FundingRateHeatMap;
