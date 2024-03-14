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
  data: FundingRateData[];
};

const FundingRateHeatMap: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 20, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const assets = Object.keys(data[0].aevo_data);

    const yScale = d3.scaleBand()
      .range([height, 0])
      .domain(assets)
      .padding(0.05);

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // TODO: Create x-axis scale and axis

  }, [data]);

  return <svg ref={svgRef} />;
};

export default FundingRateHeatMap;