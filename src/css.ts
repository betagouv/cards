export const getCss = ({ animate = false }) => `
text {
  font: 300 14px 'Segoe UI', Ubuntu, Sans-Serif;
  fill: #777;
}
.header {
    font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #000091;
    ${animate && `animation: fadeInAnimation 0.8s ease-in-out forwards;`}
}
.baseline {
    font: 300 14px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #777;
    ${animate && `animation: fadeInAnimation 0.8s ease-in-out forwards;`}
}
@supports(-moz-appearance: auto) {
    /* Selector detects Firefox */
    .header { font-size: 15.5px; }
}
        
@keyframes slideInAnimation {
    from {
        width: 0;
    }
    to {
        width: calc(100%-100px);
    }
}
@keyframes growWidthAnimation {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}
.stat {
    font: 600 12px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #434d58;
}
@supports(-moz-appearance: auto) {
    /* Selector detects Firefox */
    .stat { font-size:12px; }
}
.bold { font-weight: 700 }
.lang-name {
    font: 400 11px "Segoe UI", Ubuntu, Sans-Serif;
    fill: #434d58;
}
.stagger {
    opacity: ${animate ? 0 : 1};
    animation-delay:200ms;
    ${animate && `animation: fadeInAnimation 0.3s ease-in-out forwards;`}
}
#rect-mask rect{
    ${animate && `animation: slideInAnimation 1s ease-in-out forwards;`}
}
.lang-progress{
    ${animate && `animation: growWidthAnimation 0.6s ease-in-out forwards;`}
}

.anim-popin {
  transform-delay:200ms;
  transform: translate(0, -25px) scale(${animate ? 0 : 1});
  transform-origin: 30px 20px;
  ${animate && `animation: popInAnimation 0.3s ease-in-out forwards;`}
}

/* Animations */
@keyframes scaleInAnimation {
    from {
        transform: translate(-5px, 5px) scale(0);
    }
    to {
        transform: translate(-5px, 5px) scale(1);
    }
}
@keyframes fadeInAnimation {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@keyframes popInAnimation {
    from {
      transform: translate(0, -25px) scale(0);
    }
    to {
      transform: translate(0, -25px) scale(1);
    }
}
`;
