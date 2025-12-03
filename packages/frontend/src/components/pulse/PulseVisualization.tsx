'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { DataPoint } from '@/lib/pulse/types'

interface Props {
  growthData: DataPoint[]
  flowData: DataPoint[]
  harmony: number
  isPlaying: boolean
}

export function PulseVisualization({ growthData, flowData, harmony, isPlaying }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Clear previous content
    svg.selectAll('*').remove()

    // Create main group
    const g = svg.append('g')

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(growthData, d => d.timestamp) || 10000])
      .range([40, width - 40])

    const yScale = d3.scaleLinear().domain([0, 1]).range([height - 40, 40])

    // Create organic path generator - smooth curves
    const line = d3
      .line<DataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5)) // Smooth, organic curves

    // Area generator for filled regions (like mountains)
    const area = d3
      .area<DataPoint>()
      .x(d => xScale(d.timestamp))
      .y0(height - 40)
      .y1(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5))

    // Growth - mountains rising from earth
    g.append('path')
      .datum(growthData)
      .attr('class', 'growth-area')
      .attr('d', area)
      .attr('fill', 'url(#growth-gradient)')
      .attr('opacity', 0.6)

    g.append('path')
      .datum(growthData)
      .attr('class', 'growth-line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#16a34a') // growth-600
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)

    // Flow - rivers flowing through
    g.append('path')
      .datum(flowData)
      .attr('class', 'flow-area')
      .attr('d', area)
      .attr('fill', 'url(#flow-gradient)')
      .attr('opacity', 0.4)

    g.append('path')
      .datum(flowData)
      .attr('class', 'flow-line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#0284c7') // water-600
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .attr('stroke-dasharray', '5,3')

    // Gradients for organic feel
    const defs = svg.append('defs')

    const growthGradient = defs
      .append('linearGradient')
      .attr('id', 'growth-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    growthGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#22c55e') // growth-500
      .attr('stop-opacity', 0.6)

    growthGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#86efac') // growth-300
      .attr('stop-opacity', 0.1)

    const flowGradient = defs
      .append('linearGradient')
      .attr('id', 'flow-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    flowGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0ba5e9') // water-500
      .attr('stop-opacity', 0.5)

    flowGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#7cd4fd') // water-300
      .attr('stop-opacity', 0.1)

    // Animate when playing - gentle pulsing
    if (isPlaying) {
      let phase = 0

      const animate = () => {
        phase += 0.02

        // Gentle pulsing of growth
        g.select('.growth-line')
          .attr('stroke-width', 2 + Math.sin(phase) * 0.5)
          .attr('opacity', 0.7 + Math.sin(phase) * 0.1)

        // Gentle pulsing of flow
        g.select('.flow-line')
          .attr('stroke-width', 2 + Math.cos(phase * 1.3) * 0.5)
          .attr('opacity', 0.7 + Math.cos(phase * 1.3) * 0.1)

        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [growthData, flowData, harmony, isPlaying])

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-earth-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-growth-600 rounded-full" />
              <span className="text-xs text-earth-600 font-mono">Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-water-600 rounded-full" style={{ borderStyle: 'dashed' }} />
              <span className="text-xs text-earth-600 font-mono">Flow</span>
            </div>
          </div>
          <span className="text-xs text-earth-500 font-mono">
            {isPlaying ? 'Breathing...' : 'Resting...'}
          </span>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: '400px' }}
        aria-label="Visualization of growth and flow patterns"
      />

      <div className="mt-4 text-center">
        <p className="text-xs text-earth-500 italic">
          Mountains rise. Rivers flow. Patterns converge.
        </p>
      </div>
    </div>
  )
}
