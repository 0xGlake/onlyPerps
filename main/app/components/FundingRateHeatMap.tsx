"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type FundingRateData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

type Props = {
  data: {
    id: number;
    timestamp: string;
    [key: string]: FundingRateData | number | string;
  }[];
};

const FundingRateHeatMap: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 20, left: 100 };
    const width = 800 - margin.left - margin.right;
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

    const timestamps = data.map((d) => new Date(d.timestamp));

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
        assets.map((asset) => parseFloat(d[exchange][asset].fundingRate ))
      )
    );

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.min(fundingRates)!, d3.max(fundingRates)!]);

    const cellWidth = width / data.length;
    const cellHeight = yScale.bandwidth();

    svg
      .selectAll('.cell')
      .data(data)
      .join('g')
      .attr('transform', (d, i) => `translate(${i * cellWidth}, 0)`)
      .selectAll('.cell-rect')
      .data((d) =>
        exchanges.flatMap((exchange) =>
          assets.map((asset) => ({
            exchange,
            asset,
            value: parseFloat(d[exchange][asset].fundingRate),
          }))
        )
      )
      .join('rect')
      .attr('x', 0)
      .attr('y', (d) => yScale(`${d.asset}-${d.exchange}`)!)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', (d) => colorScale(d.value));
  }, [data]);

  return <svg ref={svgRef} />;
};

export default FundingRateHeatMap;