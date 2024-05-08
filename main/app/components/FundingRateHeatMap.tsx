"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

type LegendProps = {
  width: number;
  height: number;
  colorScale: d3.ScaleSequential<string>;
  colourScalar: number;
  isAPR: boolean;
};

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
  isAPR: boolean;
};

type FundingRateData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

interface FundingRateHeatMapProps {
  data: FundingRateData[];
  isAPR: boolean;
}


const getTooltipPosition = (event: React.MouseEvent) => {
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  return {
    x: event.clientX + scrollLeft,
    y: event.clientY + scrollTop,
  };
};


// Define a simple Tooltip component
const Tooltip: React.FC<TooltipProps> = ({ show, content, position, isAPR }) => {
  if (!show) return null;

  return (
    <div
      className="absolute bg-black bg-opacity-60 text-white p-2 rounded text-xs pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div><strong>Exchange:</strong> {content.exchange.slice(0, -5).toUpperCase()}</div>
      <div><strong>Asset:</strong> {content.asset}</div>
      <div>
        <strong>Funding Rate:</strong>{' '}
        {isAPR ? (
          <>{(parseFloat(content.value) * 876000).toFixed(2)}%</>
        ) : (
          <>{content.value}</>
        )}
      </div>
      <div><strong>Time:</strong> {content.timestamp.slice(0, -8)}</div>
    </div>
  );
};

const Legend: React.FC<LegendProps> = ({ width, height, colorScale, colourScalar, isAPR }) => {
  const legendGroup = d3.select(document.createElementNS(d3.namespaces.svg, 'g'))
    .attr('transform', `translate(${width}, 0)`);

  const legendGradient = legendGroup
    .append('defs')
    .append('linearGradient')
    .attr('id', 'legendGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  legendGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', colorScale(colourScalar));

  legendGradient
    .append('stop')
    .attr('offset', '50%')
    .attr('stop-color', colorScale(0));

  legendGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', colorScale(-colourScalar));

  legendGroup
    .append('rect')
    .attr('x', 20)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', height)
    .style('fill', 'url(#legendGradient)');

  const legendScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([-colourScalar, colourScalar]);

  const legendAxis = d3
    .axisRight(legendScale)
    .tickValues([colourScalar, -colourScalar / 2, 0, colourScalar / 2, -colourScalar])
    .tickFormat((d) => {
      if (isAPR) {
        return `${((d as number) * 876000).toFixed(2)}%`;
      } else {
        return d3.format('.5f')(d as number);
      }
  });

  legendGroup
    .append('g')
    .attr('transform', 'translate(40, 0)')
    .call(legendAxis);

  return legendGroup.node();
};

const FundingRateHeatMap: React.FC<FundingRateHeatMapProps> = ({ data, isAPR }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const [tooltipData, setTooltipData] = useState({
    show: false,
    content: {},
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 10, right: 90, bottom: 20, left: 85 };
    const containerRect = containerRef.current?.getBoundingClientRect();
    const width = containerRect ? containerRect.width - margin.left - margin.right : 0;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

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
      .call(d3.axisLeft(yScale).tickFormat((d) => {
        return d.replace(/(\w+)-(\w+)-(\w+)_data/i, '$3 $1').toUpperCase();
      }))
      .selectAll('text')
      .attr('text-anchor', 'left')
      .attr('dy', '0.35em')
      .style('font-size', '10px');

      const timestamps = data.slice().reverse().map((d) => new Date(d.timestamp));

      const xScale = d3
        .scaleTime()
        .range([0, width])
        .domain(d3.extent(timestamps) as [Date, Date]);
      
      const cellWidth = width / data.length;
      const cellHeight = yScale.bandwidth();
      const cellWidthAdjustment = 0.5;

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
      .scaleSequential(d3.interpolateRgbBasis(["red", d3.rgb(213, 100, 247), "blue"]))
      .domain([-colourScalar!, colourScalar!]);


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
      .attr('width', cellWidth + cellWidthAdjustment)
      .attr('height', cellHeight)
      .attr('fill', (d) => colorScale(d.value))
      .attr('fill-opacity', 1)
      .on('mouseover', (event, d) => {
        setTooltipData({
          show: true,
          content: d,
          position: getTooltipPosition(event),
        });
      })
      .on('mousemove', (event) => {
        setTooltipData((prev) => ({
          ...prev,
          position: getTooltipPosition(event),
        }));
      })
      .on('mouseout', () =>
        setTooltipData({ show: false, content: {}, position: { x: 0, y: 0 } })
      );
      
      const legendNode = Legend({
        width,
        height,
        colorScale,
        colourScalar: colourScalar!,
        isAPR
      });

      svg.node()?.appendChild(legendNode!);

  }, [data, isAPR]);

  return (
  <div className="w-full" ref={containerRef}>
      <svg ref={svgRef} />
      <Tooltip
        show={tooltipData.show}
        content={tooltipData.content}
        position={tooltipData.position}
        isAPR={isAPR}
      />
    </div>
  );
};

export default FundingRateHeatMap;
