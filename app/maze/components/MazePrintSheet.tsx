'use client'

import { getPrintableMazeGeometry } from '../printMaze'
import type { MazeCell } from '../store'

interface MazePrintSheetProps {
  maze: MazeCell[][]
}

export default function MazePrintSheet({ maze }: MazePrintSheetProps) {
  if (maze.length === 0) {
    return null
  }

  const geometry = getPrintableMazeGeometry(maze)
  const pad = geometry.labelSize
  const viewWidth = geometry.cols + pad * 2
  const viewHeight = geometry.rows + pad * 2
  const fillsPaper = geometry.rows > geometry.cols

  return (
    <section
      data-testid="maze-print-sheet"
      className="hidden print:fixed print:inset-0 print:z-[1000] print:flex print:flex-col print:items-center print:justify-center print:gap-3 print:bg-white print:p-[8mm] print:text-black"
    >
      <h1 className="text-xl font-bold">
        迷宫 {geometry.cols} × {geometry.rows}
      </h1>
      <p className="text-sm">用笔从「起」走到「终」，不要穿过黑线。</p>
      <svg
        viewBox={`${-pad} ${-pad} ${viewWidth} ${viewHeight}`}
        className={
          fillsPaper
            ? 'h-[calc(100vh-36mm)] w-auto max-w-full'
            : 'max-h-[calc(100vh-36mm)] w-full max-w-[180mm]'
        }
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`可打印迷宫 ${geometry.cols}乘${geometry.rows}`}
      >
        <rect x={-pad} y={-pad} width={viewWidth} height={viewHeight} fill="#ffffff" />
        <circle
          cx={geometry.start.x}
          cy={geometry.start.y}
          r={0.28}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={geometry.strokeWidth}
        />
        <rect
          x={geometry.end.x - 0.28}
          y={geometry.end.y - 0.28}
          width={0.56}
          height={0.56}
          fill="#000000"
        />
        {geometry.lines.map(line => (
          <line
            key={`${line.x1},${line.y1},${line.x2},${line.y2}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#000000"
            strokeWidth={geometry.strokeWidth}
            strokeLinecap="square"
          />
        ))}
        <text
          x={-pad * 0.12}
          y={geometry.start.y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={geometry.labelSize * 0.7}
          fill="#000000"
          fontFamily="sans-serif"
        >
          {geometry.start.label}
        </text>
        <text
          x={geometry.cols + pad * 0.12}
          y={geometry.end.y}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={geometry.labelSize * 0.7}
          fill="#000000"
          fontFamily="sans-serif"
        >
          {geometry.end.label}
        </text>
      </svg>
      <p className="text-xs">起点：左上角白圈　终点：右下角黑块</p>
    </section>
  )
}
