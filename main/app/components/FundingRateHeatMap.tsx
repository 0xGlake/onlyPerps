"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

// Types
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

interface TooltipProps {
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
}

// Utility functions
const getTooltipPosition = (event: React.MouseEvent) => ({
  x: event.clientX + window.scrollX,
  y: event.clientY + window.scrollY,
});

const formatFundingRate = (value: number, isAPR: boolean) =>
  isAPR ? `${(value * 876000).toFixed(2)}%` : d3.format('.5f')(value);

// Components
const Tooltip: React.FC<TooltipProps> = ({ show, content, position, isAPR }) => {
  if (!show) return null;

  return (
    <div
      className="absolute bg-black bg-opacity-60 text-white p-2 rounded text-xs pointer-events-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div><strong>Exchange:</strong> {content.exchange.slice(0, -5).toUpperCase()}</div>
      <div><strong>Asset:</strong> {content.asset}</div>
      <div>
        <strong>Funding Rate:</strong> {formatFundingRate(content.value, isAPR)}
      </div>
      <div><strong>Time:</strong> {content.timestamp.slice(0, -8)}</div>
    </div>
  );
};

const createLegend = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  colorScale: d3.ScaleSequential<string>,
  colourScalar: number,
  isAPR: boolean
) => {
  const legendGroup = svg.append('g')
    .attr('transform', `translate(${width}, 0)`);

  // Create gradient
  const legendGradient = legendGroup.append('defs')
    .append('linearGradient')
    .attr('id', 'legendGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  legendGradient.selectAll('stop')
    .data([
      { offset: '0%', color: colorScale(colourScalar) },
      { offset: '50%', color: colorScale(0) },
      { offset: '100%', color: colorScale(-colourScalar) }
    ])
    .enter().append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);

  // Add rectangle
  legendGroup.append('rect')
    .attr('x', 20)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', height)
    .style('fill', 'url(#legendGradient)');

  // Add axis
  const legendScale = d3.scaleLinear()
    .range([height, 0])
    .domain([-colourScalar, colourScalar]);

  const legendAxis = d3.axisRight(legendScale)
    .tickValues([-colourScalar, -colourScalar / 2, 0, colourScalar / 2, colourScalar])
    .tickFormat(d => formatFundingRate(d as number, isAPR));

  legendGroup.append('g')
    .attr('transform', 'translate(40, 0)')
    .call(legendAxis);
};

const FundingRateHeatMap: React.FC<FundingRateHeatMapProps> = ({ data, isAPR }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipProps>({
    show: false,
    content: { exchange: '', asset: '', value: 0, timestamp: '' },
    position: { x: 0, y: 0 },
    isAPR
  });

  const { exchanges, assets, timestamps, fundingRates } = useMemo(() => {
    if (!data || data.length === 0) return { exchanges: [], assets: [], timestamps: [], fundingRates: [] };

    const exchanges = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'timestamp');
    const assets = Object.keys(data[0][exchanges[0]]);
    const timestamps = data.map(d => new Date(d.timestamp.toString())).reverse();
    const fundingRates = data.flatMap(d =>
      exchanges.flatMap(exchange =>
        assets.map(asset => {
          const assetData = d[exchange]?.[asset];
          return assetData && assetData.fundingRate ? parseFloat(assetData.fundingRate.toString()) : 0;
        })
      )
    );

    return { exchanges, assets, timestamps, fundingRates };
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerRect = containerRef.current.getBoundingClientRect();
    const margin = { top: 10, right: 90, bottom: 20, left: 85 };
    const width = containerRect.width - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const yDomain = assets.flatMap(asset => exchanges.map(exchange => `${asset}-${exchange}`));
    const yScale = d3.scaleBand().range([height, 0]).domain(yDomain).padding(0);
    const xScale = d3.scaleTime().range([0, width]).domain(d3.extent(timestamps) as [Date, Date]);

    // Axes
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d.replace(/(\w+)-(\w+)-(\w+)_data/i, '$3 $1').toUpperCase()))
      .selectAll('text')
      .attr('text-anchor', 'left')
      .attr('dy', '0.35em')
      .style('font-size', '10px');

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Color scale
    const colourScalar = d3.max(fundingRates, Math.abs)!;
    const colorScale = d3.scaleSequential(d3.interpolateRgbBasis(["red", d3.rgb(213, 100, 247), "blue"]))
      .domain([-colourScalar, colourScalar]);

    // Cells
    const cellWidth = width / data.length;
    const cellHeight = yScale.bandwidth();

    g.selectAll('.cell')
      .data(data.slice().reverse())
      .join('g')
      .attr('transform', (_, i) => `translate(${i * cellWidth}, 0)`)
      .selectAll('.cell-rect')
      .data(d => exchanges.flatMap(exchange =>
        assets.map(asset => ({
          exchange,
          asset,
          value: parseFloat(d[exchange][asset].fundingRate),
          timestamp: d.timestamp,
        }))
      ))
      .join('rect')
      .attr('x', 0)
      .attr('y', d => yScale(`${d.asset}-${d.exchange}`)!)
      .attr('width', cellWidth + 0.5)
      .attr('height', cellHeight)
      .attr('fill', d => colorScale(d.value))
      .attr('fill-opacity', 1)
      .on('mouseover', (event, d) => {
        setTooltipData({
          show: true,
          content: d,
          position: getTooltipPosition(event),
          isAPR
        });
      })
      .on('mousemove', (event) => {
        setTooltipData(prev => ({
          ...prev,
          position: getTooltipPosition(event),
        }));
      })
      .on('mouseout', () => setTooltipData(prev => ({ ...prev, show: false })));

    // Legend
    createLegend(g, width, height, colorScale, colourScalar, isAPR);

    // Set SVG size
    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

  }, [data, isAPR, exchanges, assets, timestamps, fundingRates]);

  return (
    <div className="w-full" ref={containerRef}>
      <svg ref={svgRef} />
      <Tooltip {...tooltipData} />
    </div>
  );
};

export default FundingRateHeatMap;