<script>
  export let xCaption;
  export let yCaption;
  export let padding;
  let width = 500,
    height = 300;
</script>

<div bind:clientHeight={height} bind:clientWidth={width}>
  <svg>
    <g class="axis y-axis">
      <text dominant-baseline="hanging">{yCaption}</text>
      <line
        x1={padding.left}
        x2={padding.left}
        y1={padding.top}
        y2={height - padding.bottom} />
    </g>

    <!-- x axis -->
    <g class="axis x-axis">
      <line
        x1="0"
        x2={width - padding.left}
        y1={height - padding.bottom}
        y2={height - padding.bottom} />
      <text x="100%" y="98%" text-anchor="end">{xCaption}</text>
    </g>
  </svg>
</div>
